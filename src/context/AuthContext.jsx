import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';
import LogoutAnimation from '../components/LogoutAnimation';
import { AuthContext } from './contexts';

let globalProfilePromise = null;
let globalProfileUserId = null;
// Flag that is ONLY set to true when the user explicitly clicks the Logout button.
// This lets us distinguish a real logout from a false SIGNED_OUT caused by
// a failed token refresh (e.g., ERR_NAME_NOT_RESOLVED on page refresh).
let intentionalLogout = false;

const syncProfileEmail = async (profile, authUser) => {
    if (profile && !profile.email && authUser.email) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: authUser.email })
            .eq('id', authUser.id);
        if (!updateError) profile.email = authUser.email;
    }
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({ user: null, loading: true });
    const { user, loading } = authState;

    const fetchProfile = async (authUser) => {
        try {
            // DETACH FROM SUPABASE AUTH EVENT LOOP (CRITICAL FIX FOR MUTEX DEADLOCK)
            // Supabase-js v2 implicitly calls getSession() before every .from() query.
            // If fired immediately inside onAuthStateChange, it hangs forever waiting for the internal lock.
            await new Promise(resolve => setTimeout(resolve, 150));

            if (import.meta.env.DEV) console.log('[Auth v4] Fetching profile for UID:', authUser.id);
            if (import.meta.env.DEV) console.log('[Auth v4] >>> Executing database query...');
            
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (import.meta.env.DEV) console.log('[Auth v4] <<< Query returned! Data:', !!profile, 'Error:', !!error);

            if (error && error.code !== 'PGRST116') {
                if (import.meta.env.DEV) console.error('[Auth v4] DB Error fetching profile:', error);
            }

            if (!profile) {
                if (import.meta.env.DEV) console.warn('[Auth v4] No profile row found! RLS could be blocking or profile is missing.');
            }

            await syncProfileEmail(profile, authUser);

            // Fallback role to 'volunteer' just in case the profile fetch failed
            const baseUser = { role: 'volunteer', ...authUser };
            const activeUser = { ...baseUser, ...profile };

            if (import.meta.env.DEV) console.log('[Auth v4] Active user assembled, role:', activeUser.role);
            return activeUser;
        } catch (error) {
            if (import.meta.env.DEV) console.error('[Auth v4] Profile fetch exception:', error);
            const fallbackUser = { role: 'volunteer', ...authUser };
            return fallbackUser;
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (import.meta.env.DEV) console.log('[AuthContext] 🟢 Mounting AuthContext');

        const handleSignInEvent = async (session) => {
            if (!session?.user) {
                if (isMounted) setAuthState({ user: null, loading: false });
                return;
            }
            try {
                const activeUser = await fetchProfile(session.user);
                if (isMounted) setAuthState({ user: activeUser, loading: false });
            } catch (err) {
                if (import.meta.env.DEV) console.error('[AuthContext] Profile fetch error:', err);
                if (isMounted) setAuthState({
                    user: { role: 'volunteer', ...session.user },
                    loading: false
                });
            }
        };

        const handleSignOutEvent = () => {
            if (!intentionalLogout) {
                if (import.meta.env.DEV) console.warn('[AuthContext] 🚫 Ignoring unexpected SIGNED_OUT (token refresh network failure). User stays logged in.');
                return;
            }
            if (import.meta.env.DEV) console.log('[AuthContext] 🔒 Intentional logout confirmed — clearing auth state.');
            intentionalLogout = false;
            globalProfilePromise = null;
            globalProfileUserId = null;
            if (isMounted) setAuthState({ user: null, loading: false });
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            if (import.meta.env.DEV) console.log('[AuthContext] 🔔 Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id ?? 'none' });

            const isSignInEvent = ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event);
            if (isSignInEvent) {
                await handleSignInEvent(session);
            } else if (event === 'SIGNED_OUT') {
                handleSignOutEvent();
            }
        });

            // Fail-safe to ensure loading completes even if Supabase triggers silently fail
            // Increased to 15000ms to gracefully handle Supabase free-tier cold starts (10-15s pauses)
            const timeout = setTimeout(() => {
                if (isMounted) {
                    setAuthState(prev => {
                        if (prev.loading) {
                            if (import.meta.env.DEV) console.warn('[AuthContext] ⚠️ Auth resolution timed out! Forcing loading: false to unblock app.');
                            
                            // SEVERE ERROR HANDLING: Supabase client is deadlocked or network severely stalled.
                            // Wipe the corrupted tokens from localStorage safely so the browser isn't permanently poisoned.
                            // This ensures the next immediate refresh will cleanly bypass Auth and render as a Public user,
                            // rather than hanging forever behind a ghost session.
                            try {
                                Object.keys(localStorage).forEach(key => {
                                    if (key.startsWith('sb-') || key.includes('auth-token')) {
                                        localStorage.removeItem(key);
                                    }
                                });
                            } catch (e) {
                                // Silently catch DOMException if localStorage is restricted
                            }
                            
                            return { ...prev, user: null, loading: false };
                        }
                        return prev;
                    });
                }
            }, 15000);

            return () => {
                if (import.meta.env.DEV) console.log('[AuthContext] 🔴 Unmounting AuthContext');
                isMounted = false;
                clearTimeout(timeout);
                subscription.unsubscribe();
            };
        }, []);

        const login = async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            const activeUser = await fetchProfile(data.user);
            setAuthState({ user: activeUser, loading: false });
            return activeUser;
        };

        const [isLoggingOut, setIsLoggingOut] = useState(false);

        const logout = async () => {
            setIsLoggingOut(true);

            // Let the 2-second progress bar animation play fully
            await new Promise(resolve => setTimeout(resolve, 1800));

            globalProfilePromise = null;
            globalProfileUserId = null;
            intentionalLogout = true;

            try {
                // ✅ BYPASS supabase.auth.signOut() — it uses an internal async mutex that
                // can get stuck if a previous token-refresh operation failed (ERR_NAME_NOT_RESOLVED).
                // Instead, directly clear the session key from localStorage (guaranteed instant).
                localStorage.removeItem('association-ab-auth-token');

                // Also clear any other sb- prefixed keys Supabase may have written
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-')) localStorage.removeItem(key);
                });
            } catch (e) {
                if (import.meta.env.DEV) console.warn('[Auth] localStorage clear error:', e.message);
            }

            setAuthState({ user: null, loading: false });
            setIsLoggingOut(false);

            // Best-effort server-side token invalidation AFTER we've already navigated away.
            // If network is down this fails silently — the token will expire naturally.
            setTimeout(() => {
                supabase.auth.signOut({ scope: 'global' }).catch(() => { });
            }, 100);

            globalThis.location.href = '/';
        };

        const getURL = () => {
            let url = globalThis.location.origin;
            // Ensures the URL is correct for both local and production environments
            return url;
        };


        const loginWithGoogle = async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getURL()
                }
            });
            if (error) throw error;
        };

        const refreshProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                globalProfilePromise = null; // Force fresh fetch
                const activeUser = await fetchProfile(session.user);
                setAuthState(prev => ({ ...prev, user: activeUser }));
            }
        };

        const upgradeToMember = async (userId) => {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        membership_status: 'pending',
                        payment_status: 'unpaid',
                        commitment_signed: true,
                        internal_law_read: true
                    })
                    .eq('id', userId);

                if (error) throw error;
                await refreshProfile();
                return { success: true };
            } catch (error) {
                console.error("Error upgrading to member:", error);
                return { success: false, error };
            }
        };

        const hasPermission = (permission) => {
            if (!user) return false;
            // Super Admin Override
            if (user.email === 'oussousselhadji@gmail.com') return true;
            // Check permissions array
            return user.permissions?.includes(permission);
        };

        const contextValue = useMemo(() => ({
            user, login, logout, loginWithGoogle, loading, refreshProfile, upgradeToMember, hasPermission, isLoggingOut, setIsLoggingOut
        }), [user, login, logout, loginWithGoogle, loading, refreshProfile, upgradeToMember, hasPermission, isLoggingOut, setIsLoggingOut]);

        return (
            <AuthContext.Provider value={contextValue}>
                {/* Logout animation overlay — shown on top of everything */}
                <LogoutAnimation isVisible={isLoggingOut} />
                {/* Always render children immediately. Public pages are never blocked.
                Protected pages are guarded by <ProtectedRoute> which checks loading. */}
                {children}
            </AuthContext.Provider>
        );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
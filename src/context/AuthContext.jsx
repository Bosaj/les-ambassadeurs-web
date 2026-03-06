import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LogoutAnimation from '../components/LogoutAnimation';
import { AuthContext } from './contexts';

let globalInitPromise = null;
let globalProfilePromise = null;
let globalProfileUserId = null;
// Flag that is ONLY set to true when the user explicitly clicks the Logout button.
// This lets us distinguish a real logout from a false SIGNED_OUT caused by
// a failed token refresh (e.g., ERR_NAME_NOT_RESOLVED on page refresh).
let intentionalLogout = false;

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({ user: null, loading: true });
    const { user, loading } = authState;

    const fetchProfile = async (authUser) => {
        // Deduplicate simultaneous identical fetch requests during Strict Mode mounts
        if (globalProfilePromise && globalProfileUserId === authUser.id) {
            return globalProfilePromise;
        }

        const executeFetch = async () => {
            try {
                if (import.meta.env.DEV) console.log('[Auth v4] Fetching profile for UID:', authUser.id);
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    if (import.meta.env.DEV) console.error('[Auth v4] DB Error fetching profile:', error);
                }

                if (!profile) {
                    if (import.meta.env.DEV) console.warn('[Auth v4] No profile row found! RLS could be blocking or profile is missing.');
                }

                if (profile && !profile.email && authUser.email) {
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ email: authUser.email })
                        .eq('id', authUser.id);
                    if (!updateError) profile.email = authUser.email;
                }

                // Fallback role to 'volunteer' just in case the profile fetch failed
                const baseUser = { role: 'volunteer', ...authUser };
                const activeUser = { ...baseUser, ...(profile || {}) };

                if (import.meta.env.DEV) console.log('[Auth v4] Active user assembled, role:', activeUser.role);
                return activeUser;
            } catch (error) {
                if (import.meta.env.DEV) console.error('[Auth v4] Profile fetch exception:', error);
                const fallbackUser = { role: 'volunteer', ...authUser };
                return fallbackUser;
            }
        };

        globalProfileUserId = authUser.id;
        globalProfilePromise = executeFetch();
        return globalProfilePromise;
    };

    useEffect(() => {
        let isMounted = true;
        if (import.meta.env.DEV) console.log('[AuthContext] 🟢 Mounting AuthContext');

        // Manually fetch session instead of relying on INITIAL_SESSION.
        // This solves the race condition where a lagging token refresh causes INITIAL_SESSION
        // to return no session momentarily, causing a premature redirect to /login.
        const initializeAuth = async () => {
            try {
                if (import.meta.env.DEV) console.log('[AuthContext] 🔵 Manually fetching getSession()...');
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (!isMounted) return;

                if (session?.user) {
                    if (import.meta.env.DEV) console.log('[AuthContext] ✅ Session found — fetching profile...');
                    const activeUser = await fetchProfile(session.user);
                    if (isMounted) {
                        if (import.meta.env.DEV) console.log('[AuthContext] ✅ User ready, role:', activeUser?.role);
                        setAuthState({ user: activeUser, loading: false });
                    }
                } else {
                    if (import.meta.env.DEV) console.log('[AuthContext] ℹ️ No session found — user is logged out.');
                    if (isMounted) setAuthState({ user: null, loading: false });
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('[AuthContext] Init error:', err);
                if (isMounted) setAuthState({ user: null, loading: false });
            }
        };

        if (!globalInitPromise) {
            globalInitPromise = initializeAuth();
        } else {
            // Wait for existing initialization to finish, then sync our mount's state
            globalInitPromise.then(() => {
                if (!isMounted) return;
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (!isMounted) return;
                    if (session?.user) {
                        fetchProfile(session.user).then(activeUser => {
                            if (isMounted) setAuthState({ user: activeUser, loading: false });
                        });
                    } else {
                        if (isMounted) setAuthState({ user: null, loading: false });
                    }
                });
            });
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (import.meta.env.DEV) console.log('[AuthContext] 🔔 Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id ?? 'none' });

            if (!isMounted) return;

            // Ignore INITIAL_SESSION as we handle it manually and reliably above
            if (event === 'INITIAL_SESSION') {
                return;
            }

            if (event === 'TOKEN_REFRESHED' || event === 'MFA_CHALLENGE_VERIFIED') {
                if (import.meta.env.DEV) console.log('[AuthContext] ⏭️ Skipping event:', event);
                return;
            }

            if (session?.user) {
                if (event === 'SIGNED_IN') {
                    const { data: existing } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
                    if (!existing) {
                        await supabase.from('profiles').insert({
                            id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name || 'User',
                            role: 'volunteer'
                        });
                    }
                }
                if (isMounted && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
                    globalProfilePromise = null;
                    const activeUser = await fetchProfile(session.user);
                    if (isMounted) {
                        setAuthState(prev => ({ ...prev, user: activeUser, loading: false }));
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                // Only clear state on intentional logout — ignore SIGNED_OUT from
                // failed token refresh (the user is still authenticated in storage).
                if (!intentionalLogout) {
                    if (import.meta.env.DEV) console.warn('[AuthContext] 🚫 Ignoring unexpected SIGNED_OUT (token refresh network failure). User stays logged in.');
                    return;
                }
                if (import.meta.env.DEV) console.log('[AuthContext] 🔒 Intentional logout confirmed — clearing auth state.');
                intentionalLogout = false;
                globalProfilePromise = null;
                globalProfileUserId = null;
                if (isMounted) setAuthState({ user: null, loading: false });
            }
        });

        return () => {
            if (import.meta.env.DEV) console.log('[AuthContext] 🔴 Unmounting AuthContext');
            isMounted = false;
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

        globalInitPromise = null;
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

        window.location.href = '/';
    };

    const getURL = () => {
        let url = window.location.origin;
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

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithGoogle, loading, refreshProfile, upgradeToMember, hasPermission, isLoggingOut, setIsLoggingOut }}>
            {/* Logout animation overlay — shown on top of everything */}
            <LogoutAnimation isVisible={isLoggingOut} />
            {/* Always render children immediately. Public pages are never blocked.
                Protected pages are guarded by <ProtectedRoute> which checks loading. */}
            {children}
        </AuthContext.Provider>
    );
};


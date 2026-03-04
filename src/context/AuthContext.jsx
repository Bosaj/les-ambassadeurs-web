import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LogoutAnimation from '../components/LogoutAnimation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (authUser) => {
        try {
            console.log('[Auth v4] Fetching profile for UID:', authUser.id);
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('[Auth v4] DB Error fetching profile:', error);
            }

            if (!profile) {
                console.warn('[Auth v4] No profile row found! RLS could be blocking or profile is missing.');
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

            console.log('[Auth v4] Active user assembled, role:', activeUser.role);
            setUser(activeUser);
            return activeUser;
        } catch (error) {
            console.error('[Auth v4] Profile fetch exception:', error);
            const fallbackUser = { role: 'volunteer', ...authUser };
            setUser(fallbackUser);
            return fallbackUser;
        }
    };

    let globalInitPromise = null;

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                if (!globalInitPromise) {
                    globalInitPromise = supabase.auth.getSession();
                }

                const { data: { session }, error } = await globalInitPromise;

                if (error) {
                    console.error('[Auth v7] getSession Error:', error.message);
                    await supabase.auth.signOut({ scope: 'local' });
                    if (isMounted) { setUser(null); setLoading(false); }
                    return;
                }

                if (session?.user) {
                    await fetchProfile(session.user);
                } else {
                    if (isMounted) setUser(null);
                }
            } catch (err) {
                console.error('[Auth v7] Unexpected init error:', err);
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'TOKEN_REFRESHED' || event === 'MFA_CHALLENGE_VERIFIED' || event === 'INITIAL_SESSION') {
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
                    await fetchProfile(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
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
        return await fetchProfile(data.user);
    };

    const signup = async (name, email, password, phone, city) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: 'volunteer',
                    phone: phone,
                    city: city
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            // Explicitly update profile to ensure data persistence for admin dashboard
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: name,
                        phone_number: phone,
                        city: city,
                        role: 'volunteer'
                    })
                    .eq('id', data.user.id);

                if (profileError) {
                    console.error("Error updating profile details:", profileError);
                }
            } catch (err) {
                console.error("Profile update exception:", err);
            }

            return await fetchProfile(data.user);
        }
    };

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logout = async () => {
        setIsLoggingOut(true);
        // Wait for animation (reduced to 800ms for snappier feel)
        await new Promise(resolve => setTimeout(resolve, 800));

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
        }

        setUser(null);
        setIsLoggingOut(false);
        // Force redirect to home to clear state and ensure clean slate
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
            await fetchProfile(session.user);
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
        <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, loading, refreshProfile, upgradeToMember, hasPermission, isLoggingOut, setIsLoggingOut }}>
            {/* Logout animation overlay — shown on top of everything */}
            <LogoutAnimation isVisible={isLoggingOut} />
            {/* Always render children immediately. Public pages are never blocked.
                Protected pages are guarded by <ProtectedRoute> which checks loading. */}
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Prevent Vite HMR from partially replacing this module.
// A full page reload is safer and prevents useAuth() returning null
// due to a stale AuthContext object reference in consuming components.
if (import.meta.hot) {
    import.meta.hot.decline();
}

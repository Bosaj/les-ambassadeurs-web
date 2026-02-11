import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LogoutAnimation from '../components/LogoutAnimation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (authUser) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            }

            if (profile && !profile.email && authUser.email) {
                // Lazy sync: If profile exists but has no email, update it
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ email: authUser.email })
                    .eq('id', authUser.id);

                if (!updateError) {
                    profile.email = authUser.email; // Update local object
                }
            }

            const activeUser = { ...authUser, ...profile };
            setUser(activeUser);
            return activeUser; // Return for direct usage in login/signup
        } catch (error) {
            console.error('Profile fetch error:', error);
            setUser(authUser);
            return authUser;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                // Only fetch if we don't have the user or it's a different user
                setUser(prev => {
                    if (prev?.id === session.user.id) return prev;
                    fetchProfile(session.user);
                    return prev;
                });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
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
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            // Even if error, we probably want to reset state or force partial logout
        }

        setUser(null);
        setIsLoggingOut(false);
        // Optional: Redirect specifically if needed, but usually App handles user null
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
        <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, loading, refreshProfile, upgradeToMember, hasPermission }}>
            {/* Show animation overlay when logging out */}
            <LogoutAnimation isVisible={isLoggingOut} />
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

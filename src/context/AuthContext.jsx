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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Handle new OAuth sign-in (SIGNED_IN event from Google/OAuth)
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    // Check if profile exists
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', session.user.id)
                        .single();

                    // If no profile exists, create one from auth metadata
                    if (!existingProfile) {
                        const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

                        await supabase
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                email: session.user.email,
                                full_name: fullName,
                                role: 'volunteer',
                                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
                            });
                    }
                }

                // Fetch profile (will now exist)
                await fetchProfile(session.user);
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
            {/* Show animation overlay when logging out */}
            <LogoutAnimation isVisible={isLoggingOut} />
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

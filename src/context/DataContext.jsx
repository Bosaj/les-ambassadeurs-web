import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getLocalizedContent } from '../utils/languageUtils';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [news, setNews] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [events, setEvents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // Added to store user data

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const verifyMember = async (userId, action) => {
        try {
            const updates = action === 'approve'
                ? { membership_status: 'active', role: 'member', payment_status: 'paid' }
                : { membership_status: 'rejected' };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            fetchUsers(); // Refresh list
            return { success: true };
        } catch (error) {
            console.error("Error verifying member:", error);
            return { success: false, error };
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fire ALL queries in parallel — much faster than sequential awaits
            const [
                { data: newsData, error: newsError },
                eventsResult,
                { data: testimonialsData, error: testimonialsError },
                { data: partnersData, error: partnersError },
            ] = await Promise.all([
                // 1. News
                supabase
                    .from('news')
                    .select('*')
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false }),

                // 2. Events (try with attendees join, fall back if it fails)
                supabase
                    .from('events')
                    .select('*, attendees:event_attendees(id, name, email, status, user_id)')
                    .order('is_pinned', { ascending: false })
                    .order('date', { ascending: false })
                    .then(result => {
                        if (result.error) {
                            console.warn('Retrying events fetch without join:', result.error.message);
                            return supabase
                                .from('events')
                                .select('*')
                                .order('is_pinned', { ascending: false })
                                .order('date', { ascending: false });
                        }
                        return result;
                    }),

                // 3. Testimonials
                supabase
                    .from('testimonials')
                    .select('*')
                    .order('rating', { ascending: false })
                    .order('created_at', { ascending: false }),

                // 4. Partners
                supabase
                    .from('partners')
                    .select('*')
                    .order('created_at', { ascending: false }),
            ]);

            // --- Process results ---

            if (newsError) throw newsError;
            setNews(newsData || []);

            const { data: allEventsData, error: eventsError } = eventsResult;
            if (eventsError) throw eventsError;

            const p = [], e = [], proj = [];
            (allEventsData || []).forEach(item => {
                if (!item.attendees) item.attendees = [];
                const cat = item.category || 'program';
                if (cat === 'program') p.push(item);
                else if (cat === 'event') e.push(item);
                else if (cat === 'project') proj.push(item);
            });
            setPrograms(p);
            setEvents(e);
            setProjects(proj);

            if (testimonialsError) throw testimonialsError;
            setTestimonials(testimonialsData || []);

            if (partnersError) throw partnersError;
            setPartners(partnersData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                toast.error("Network connection error. Working offline?");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            try {
                await Promise.all([fetchData(), fetchUsers()]);
            } catch (err) {
                if (err?.name !== 'AbortError') console.error('Init fetch error:', err);
            }
        };

        run();

        return () => controller.abort();
    }, []);

    // Helper to get localized string is now imported from utils



    const safeISOString = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const addPost = async (type, postData) => {
        try {
            let table = '';
            let insertData = {};

            if (type === 'news') {
                table = 'news';
                insertData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location || {}
                };
            } else if (['programs', 'events', 'projects'].includes(type)) {
                table = 'events';
                const categoryMap = { 'programs': 'program', 'events': 'event', 'projects': 'project' };
                insertData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    end_date: safeISOString(postData.end_date),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location || {},
                    category: categoryMap[type] || 'program',
                    is_pinned: false
                };
            } else if (type === 'testimonials') {
                table = 'testimonials';
                insertData = {
                    name: postData.name,
                    role: postData.role,
                    content: postData.content,
                    image_url: postData.image,
                    rating: postData.rating || 5,
                    is_approved: postData.is_approved !== undefined ? postData.is_approved : true
                };
            } else if (type === 'partners') {
                table = 'partners';
                insertData = {
                    name: postData.name,
                    image_url: postData.image_url,
                    website_url: postData.website_url
                };
            }

            const { data, error } = await supabase
                .from(table)
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;

            // Optimistic update — prepend new item to local state instantly (no full refetch)
            const newItem = { ...data, attendees: [] };
            if (type === 'news') setNews(prev => [newItem, ...prev]);
            else if (type === 'programs') setPrograms(prev => [newItem, ...prev]);
            else if (type === 'events') setEvents(prev => [newItem, ...prev]);
            else if (type === 'projects') setProjects(prev => [newItem, ...prev]);
            else if (type === 'testimonials') setTestimonials(prev => [newItem, ...prev]);
            else if (type === 'partners') setPartners(prev => [newItem, ...prev]);

            return data;
        } catch (error) {
            console.error(`Error adding ${type}:`, error);
            throw error;
        }
    };

    const updatePost = async (type, id, postData) => {
        try {
            let table = '';
            let updateData = {};

            if (type === 'news') {
                table = 'news';
                updateData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location || {}
                };
            } else if (['programs', 'events', 'projects'].includes(type)) {
                table = 'events';
                updateData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    end_date: safeISOString(postData.end_date),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location || {},
                };
            } else if (type === 'testimonials') {
                table = 'testimonials';
                updateData = {
                    name: postData.name,
                    role: postData.role,
                    content: postData.content,
                    image_url: postData.image,
                    rating: postData.rating || 5,
                    is_approved: postData.is_approved
                };
            } else if (type === 'partners') {
                table = 'partners';
                updateData = {
                    name: postData.name,
                    image_url: postData.image_url,
                    website_url: postData.website_url
                };
            }

            const { data, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Optimistic update — replace the item in local state instantly
            const applyUpdate = (list) => list.map(item => item.id === id ? { ...item, ...data } : item);
            if (type === 'news') setNews(prev => applyUpdate(prev));
            else if (type === 'programs') setPrograms(prev => applyUpdate(prev));
            else if (type === 'events') setEvents(prev => applyUpdate(prev));
            else if (type === 'projects') setProjects(prev => applyUpdate(prev));
            else if (type === 'testimonials') setTestimonials(prev => applyUpdate(prev));
            else if (type === 'partners') setPartners(prev => applyUpdate(prev));

            return data;
        } catch (error) {
            console.error(`Error updating ${type}:`, error);
            throw error;
        }
    };


    const deletePost = async (type, id) => {
        try {
            let table = '';
            if (type === 'news') table = 'news';
            else if (['programs', 'events', 'projects'].includes(type.toLowerCase())) table = 'events';
            else if (type === 'testimonials') table = 'testimonials';
            else if (type === 'partners') table = 'partners';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic updates
            if (type === 'news') setNews(prev => prev.filter(item => item.id !== id));
            else if (type === 'testimonials') setTestimonials(prev => prev.filter(item => item.id !== id));
            else if (type === 'partners') setPartners(prev => prev.filter(item => item.id !== id));
            else {
                setPrograms(prev => prev.filter(item => item.id !== id));
                setEvents(prev => prev.filter(item => item.id !== id));
                setProjects(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            throw error;
        }
    };

    const togglePin = async (type, id, currentStatus) => {
        try {
            let table = '';
            if (type === 'news') table = 'news';
            else if (['programs', 'events', 'projects'].includes(type.toLowerCase())) table = 'events';

            if (!table) return;

            const { error } = await supabase
                .from(table)
                .update({ is_pinned: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update — flip pin status locally, no refetch
            const applyPin = (list) => list.map(item => item.id === id ? { ...item, is_pinned: !currentStatus } : item);
            if (type === 'news') setNews(prev => applyPin(prev));
            else if (type === 'programs') setPrograms(prev => applyPin(prev));
            else if (type === 'events') setEvents(prev => applyPin(prev));
            else if (type === 'projects') setProjects(prev => applyPin(prev));
        } catch (error) {
            console.error("Error toggling pin:", error);
            toast.error("Failed to update pin status");
        }
    };

    const registerForEvent = async (type, eventId, userDetails) => {
        try {


            // 1. Database Insert/Upsert
            const safeName = userDetails.name || userDetails.email || 'Anonymous';
            const { error, data } = await supabase
                .from('event_attendees')
                .upsert([{
                    event_id: eventId,
                    name: safeName,
                    email: userDetails.email,
                    user_id: userDetails.id || null, // Save user_id if available
                    status: 'pending' // Reset status to pending on re-registration
                }], { onConflict: 'event_id, email' })
                .select();

            if (error) {
                console.error("Supabase connect error:", error);
                throw error;
            }

            // 2. Optimistic Update
            const updateList = (list) => {
                return list.map(item => {
                    if (item.id === eventId) {
                        const newAttendee = {
                            id: data?.[0]?.id || Date.now(),
                            name: safeName,
                            email: userDetails.email,
                            status: 'pending'
                        };
                        const updatedItem = {
                            ...item,
                            attendees: [...(item.attendees || []), newAttendee]
                        };
                        return updatedItem;
                    }
                    return item;
                });
            };

            setPrograms(prev => updateList(prev));
            setEvents(prev => updateList(prev));
            setProjects(prev => updateList(prev));

            return true;

        } catch (error) {
            console.error("Error registering:", error);
            throw error;
        }
    };

    const cancelRegistration = async (type, eventId, email) => {
        try {


            // 1. Database Delete
            const { error } = await supabase
                .from('event_attendees')
                .delete()
                .match({ event_id: eventId, email: email });

            if (error) throw error;

            // 2. Optimistic Update
            const updateList = (list) => {
                return list.map(item => {
                    if (item.id === eventId) {
                        const updatedItem = {
                            ...item,
                            attendees: (item.attendees || []).filter(a => a.email !== email)
                        };
                        return updatedItem;
                    }
                    return item;
                });
            };

            setPrograms(prev => updateList(prev));
            setEvents(prev => updateList(prev));
            setProjects(prev => updateList(prev));

            return true;
        } catch (error) {
            console.error("Error cancelling registration:", error);
            throw error;
        }
    };

    const updateAttendanceStatus = async (attendeeId, status) => {
        try {
            const { data, error } = await supabase
                .from('event_attendees')
                .update({ status })
                .eq('id', attendeeId)
                .select();

            if (error) throw error;

            // Optimistic Update for global state
            const updateList = (list) => {
                return list.map(item => {
                    if (item.attendees && item.attendees.some(a => a.id === attendeeId)) {
                        return {
                            ...item,
                            attendees: item.attendees.map(a => a.id === attendeeId ? { ...a, status } : a)
                        };
                    }
                    return item;
                });
            };

            setPrograms(prev => updateList(prev));
            setEvents(prev => updateList(prev));
            setProjects(prev => updateList(prev));

            return data;
        } catch (error) {
            console.error("Error updating attendance status:", error);
            throw error;
        }
    };

    const addDonation = async (donationData) => {
        try {
            const { error } = await supabase
                .from('donations')
                .insert([{
                    donor_name: donationData.name,
                    amount: donationData.amount,
                    method: donationData.method,
                    email: donationData.email,
                    proof_url: donationData.proof_url, // Save proof URL
                    status: 'pending'
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error adding donation:", error);
            throw error;
        }
    };

    // --- New Dashboard Features ---

    const fetchUserActivities = React.useCallback(async (email) => {
        if (!email) return [];
        try {
            const { data, error } = await supabase
                .from('event_attendees')
                .select(`
                    id, 
                    status, 
                    created_at,
                    events ( id, title, date, image_url, category )
                `)
                .eq('email', email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching activities:", err);
            return [];
        }
    }, []);

    const fetchUserDonations = React.useCallback(async (email, userId = null) => {
        if (!email && !userId) return [];
        try {
            let query = supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (userId) {
                // Fetch by ID OR email to be comprehensive
                query = query.or(`email.eq.${email},user_id.eq.${userId}`);
            } else {
                query = query.eq('email', email);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching donations:", err);
            return [];
        }
    }, []);

    const fetchAllDonations = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching all donations:", err);
            return [];
        }
    }, []);

    const updateDonationStatus = React.useCallback(async (id, status) => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .update({ status })
                .eq('id', id)
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error updating donation status:", err);
            return false;
        }
    }, []);

    const deleteDonation = React.useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('donations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error("Error deleting donation:", err);
            return false;
        }
    }, []);


    const submitSuggestion = async (suggestionData) => {
        try {
            const { data, error } = await supabase
                .from('event_suggestions')
                .insert([suggestionData])
                .select();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error("Error submitting suggestion:", err);
            return { data: null, error: err };
        }
    };

    const fetchUserSuggestions = async (userId) => {
        if (!userId) return [];
        try {
            const { data, error } = await supabase
                .from('event_suggestions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            return [];
        }
    };

    const fetchMembershipHistory = async (userId) => {
        if (!userId) return [];
        try {
            const { data, error } = await supabase
                .from('annual_memberships')
                .select('*')
                .eq('user_id', userId)
                .order('year', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching membership history:", err);
            return [];
        }
    };

    return (
        <DataContext.Provider value={{
            news, programs, events, projects, testimonials, users, partners,
            addPost, updatePost, deletePost, registerForEvent, addDonation, togglePin,
            getLocalizedContent, loading,
            fetchUserActivities, fetchUserDonations, submitSuggestion, fetchUserSuggestions,
            verifyMember, updateAttendanceStatus, cancelRegistration, fetchAllDonations, updateDonationStatus, deleteDonation, fetchMembershipHistory
        }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

// Prevent Vite HMR from partially reloading this context module.
if (import.meta.hot) {
    import.meta.hot.decline();
}

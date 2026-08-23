import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getLocalizedContent } from '../utils/languageUtils';
import { DataContext } from './contexts';
import { useAuth } from '../hooks/useAuth';

export const DataProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [news, setNews] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [events, setEvents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [partners, setPartners] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // Added to store user data

    const fetchUsers = React.useCallback(async () => {
        if (!isAdmin) {
            setUsers([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            if (import.meta.env.DEV) console.error("Error fetching users:", error);
        }
    }, [isAdmin]);

    const verifyMember = async (userId, action) => {
        if (!isAdmin) return { success: false, error: new Error('Not authorized') };

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
            if (import.meta.env.DEV) console.error("Error verifying member:", error);
            return { success: false, error };
        }
    };

    const fetchData = React.useCallback(async () => {
        try {
            // Public data — news, events, programs, testimonials, partners are visible to everyone.
            // Do NOT guard with a session check here: these tables have public RLS policies,
            // and blocking on session presence causes permanent "Loading..." for everyone
            // when a token refresh fails on page load.
            if (import.meta.env.DEV) console.log('[DataContext] 🟢 fetchData starting (public content fetch)...');
            setLoading(true);

            // Fire ALL queries in parallel — much faster than sequential awaits
            const [
                { data: newsData, error: newsError },
                eventsResult,
                { data: testimonialsData, error: testimonialsError },
                { data: partnersData, error: partnersError },
                { data: supportersData, error: supportersError },
                attendanceResult
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
                    .select('*, attendees:event_attendees(id, name, status)')
                    .order('is_pinned', { ascending: false })
                    .order('date', { ascending: false })
                    .then(result => {
                        if (result.error) {
                            if (import.meta.env.DEV) console.warn('Retrying events fetch without join:', result.error.message);
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

                // 5. Public Supporters
                supabase.rpc('get_public_supporters'),

                // 6. The current user's registrations only. Never expose attendee email/user IDs publicly.
                user?.id
                    ? supabase
                        .from('event_attendees')
                        .select('event_id, status')
                        .eq('user_id', user.id)
                    : Promise.resolve({ data: [], error: null })
            ]);

            // --- Process results ---

            if (newsError) throw newsError;
            setNews(newsData || []);

            const { data: allEventsData, error: eventsError } = eventsResult;
            if (eventsError) throw eventsError;

            const { data: ownAttendanceData, error: ownAttendanceError } = attendanceResult;
            if (ownAttendanceError && import.meta.env.DEV) {
                console.warn('Unable to load current-user registrations:', ownAttendanceError.message);
            }
            const ownAttendanceIds = new Set(
                (ownAttendanceData || [])
                    .filter(attendee => attendee.status !== 'rejected')
                    .map(attendee => attendee.event_id)
            );

            if (supportersError && import.meta.env.DEV) {
                console.error("Error fetching supporters:", supportersError);
            }
            const supportersList = supportersData || [];

            const p = [], e = [], proj = [];
            (allEventsData || []).forEach(item => {
                if (!item.attendees) item.attendees = [];
                item.supporters = supportersList.filter(s => s.related_item_id === item.id);
                item.is_registered_by_current_user = ownAttendanceIds.has(item.id);

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
            if (import.meta.env.DEV) console.error("Error fetching data:", error);
            if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                toast.error("Network connection error. Working offline?");
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!authLoading) {
            if (import.meta.env.DEV) console.log('[DataContext] Auth initialization settled. Fetching public data securely...');
            fetchData().catch(err => {
                if (import.meta.env.DEV) console.error('[DataContext] Initial fetchData error:', err);
            });
        }
    }, [authLoading, fetchData]);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                if (import.meta.env.DEV) console.log('[DataContext] User identified — syncing private user data...');
                fetchUsers();
            } else {
                if (import.meta.env.DEV) console.log('[DataContext] User is logged out — clearing private user data only.');
                setUsers([]);
            }
        }
    }, [user, authLoading, fetchUsers]);

    // Helper to get localized string is now imported from utils



    const safeISOString = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const addPost = async (type, postData) => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            if (import.meta.env.DEV) console.debug(`[DataContext] Starting addPost for type: ${type}`, postData);
            let table = '';
            let insertData = {};

            if (type === 'news') {
                table = 'news';
                insertData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location?.en !== undefined ? postData.location : { en: '', fr: '', ar: '' }
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
                    location: postData.location?.en !== undefined ? postData.location : { en: '', fr: '', ar: '' },
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

            if (import.meta.env.DEV) console.debug(`[DataContext] table configured: ${table}, insertData payload:`, insertData);

            // Adding a 15-second timeout in case Supabase fetch is completely frozen
            const fetchPromise = supabase.from(table).insert([insertData]).select().single();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase insert request timed out after 15 seconds")), 15000));
            
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (import.meta.env.DEV) console.debug(`[DataContext] DB insert returned – data:`, data, `, error:`, error);
            if (error) throw error;

            if (import.meta.env.DEV) console.debug(`[DataContext] Optimistically updating local state for ${type}`);
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
            if (import.meta.env.DEV) console.error(`Error adding ${type}:`, error);
            throw error;
        }
    };

    const updatePost = async (type, id, postData) => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            if (import.meta.env.DEV) console.debug(`[DataContext] Starting updatePost for type: ${type}, id: ${id}`, postData);
            let table = '';
            let updateData = {};

            if (type === 'news') {
                table = 'news';
                updateData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location?.en !== undefined ? postData.location : { en: '', fr: '', ar: '' },
                };
            } else if (['programs', 'events', 'projects'].includes(type)) {
                table = 'events';
                updateData = {
                    title: postData.title,
                    date: safeISOString(postData.date) || new Date().toISOString(),
                    end_date: safeISOString(postData.end_date),
                    image_url: postData.image,
                    description: postData.description,
                    location: postData.location?.en !== undefined ? postData.location : { en: '', fr: '', ar: '' },
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

            if (import.meta.env.DEV) console.debug(`[DataContext] table configured: ${table}, updateData payload:`, updateData);

            // Adding a 15-second timeout in case Supabase fetch is completely frozen
            const fetchPromise = supabase.from(table).update(updateData).eq('id', id).select().single();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase update request timed out after 15 seconds")), 15000));
            
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (import.meta.env.DEV) console.debug(`[DataContext] DB update returned – data:`, data, `, error:`, error);
            if (error) throw error;

            if (import.meta.env.DEV) console.debug(`[DataContext] Optimistically updating local state for ${type}`);
            // Optimistic update
            const updateState = (setter) => setter(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
            
            if (type === 'news') updateState(setNews);
            else if (type === 'programs') updateState(setPrograms);
            else if (type === 'events') updateState(setEvents);
            else if (type === 'projects') updateState(setProjects);
            else if (type === 'testimonials') updateState(setTestimonials);
            else if (type === 'partners') updateState(setPartners);

            return data;
        } catch (error) {
            if (import.meta.env.DEV) console.error(`Error updating ${type}:`, error);
            throw error;
        }
    };


    const deletePost = async (type, id) => {
        if (!isAdmin) throw new Error('Not authorized');

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
            if (import.meta.env.DEV) console.error(`Error deleting ${type}:`, error);
            throw error;
        }
    };

    const togglePin = async (type, id, currentStatus) => {
        if (!isAdmin) throw new Error('Not authorized');

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
            if (import.meta.env.DEV) console.error("Error toggling pin:", error);
            toast.error("Failed to update pin status");
        }
    };

    const registerForEvent = async (type, eventId, userDetails = {}) => {
        try {
            const authenticatedUserId = user?.id || null;
            const attendeeEmail = authenticatedUserId ? user.email : userDetails.email;
            if (!attendeeEmail) throw new Error('An email address is required to register');

            // 1. Database Insert/Upsert. Never trust a submitted user ID for an authenticated session.
            const safeName = authenticatedUserId
                ? (user.full_name || user.user_metadata?.full_name || attendeeEmail)
                : (userDetails.name || attendeeEmail || 'Anonymous');
            const { error, data } = await supabase
                .from('event_attendees')
                .upsert([{
                    event_id: eventId,
                    name: safeName,
                    email: attendeeEmail,
                    user_id: authenticatedUserId,
                    status: 'pending' // Reset status to pending on re-registration
                }], { onConflict: 'event_id, email' })
                .select();

            if (error) {
                if (import.meta.env.DEV) console.error("Supabase connect error:", error);
                throw error;
            }

            // 2. Optimistic Update
            const updateList = (list) => {
                return list.map(item => {
                    if (item.id === eventId) {
                        const newAttendee = {
                            id: data?.[0]?.id || Date.now(),
                            name: safeName,
                            email: authenticatedUserId ? undefined : attendeeEmail,
                            user_id: authenticatedUserId,
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
            if (import.meta.env.DEV) console.error("Error registering:", error);
            throw error;
        }
    };

    const cancelRegistration = async (type, eventId, userId) => {
        if (!userId || userId !== user?.id) throw new Error('Not authorized');

        try {
            // 1. Database Delete. RLS must also enforce ownership server-side.
            const { error } = await supabase
                .from('event_attendees')
                .delete()
                .match({ event_id: eventId, user_id: userId });

            if (error) throw error;

            // 2. Optimistic Update
            const updateList = (list) => {
                return list.map(item => {
                    if (item.id === eventId) {
                        const updatedItem = {
                            ...item,
                            is_registered_by_current_user: false,
                            attendees: (item.attendees || []).filter(a => !a.user_id || a.user_id !== userId)
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
            if (import.meta.env.DEV) console.error("Error cancelling registration:", error);
            throw error;
        }
    };

    const updateAttendanceStatus = async (attendeeId, status) => {
        if (!isAdmin) throw new Error('Not authorized');

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
            if (import.meta.env.DEV) console.error("Error updating attendance status:", error);
            throw error;
        }
    };

    const addDonation = async (donationData) => {
        if (!donationData?.name || !donationData?.method) throw new Error('Donation details are incomplete');

        try {
            const { error } = await supabase
                .from('donations')
                .insert([{
                    donor_name: donationData.name,
                    amount: donationData.amount,
                    method: donationData.method,
                    email: donationData.email,
                    user_id: user?.id || null,
                    proof_url: donationData.proof_url,
                    status: 'pending',
                    donation_type: donationData.donation_type || 'general',
                    related_item_id: donationData.related_item_id || null,
                    related_item_title: donationData.related_item_title || null
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            if (import.meta.env.DEV) console.error("Error adding donation:", error);
            throw error;
        }
    };

    // --- New Dashboard Features ---

    const fetchUserActivities = React.useCallback(async (userId) => {
        if (!userId || (userId !== user?.id && !isAdmin)) return [];
        try {
            const { data, error } = await supabase
                .from('event_attendees')
                .select(`
                    id, 
                    status, 
                    created_at,
                    events ( id, title, date, image_url, category )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching activities:", err);
            return [];
        }
    }, [user?.id, isAdmin]);

    const fetchUserDonations = React.useCallback(async (userId) => {
        if (!userId || (userId !== user?.id && !isAdmin)) return [];
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching donations:", err);
            return [];
        }
    }, [user?.id, isAdmin]);

    const fetchAllDonations = React.useCallback(async () => {
        if (!isAdmin) return [];

        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching all donations:", err);
            return [];
        }
    }, [isAdmin]);

    const updateDonationStatus = React.useCallback(async (id, status) => {
        if (!isAdmin) return false;

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
            if (import.meta.env.DEV) console.error("Error updating donation status:", err);
            return false;
        }
    }, [isAdmin]);

    const deleteDonation = React.useCallback(async (id) => {
        if (!isAdmin) return false;

        try {
            const { error } = await supabase
                .from('donations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error deleting donation:", err);
            return false;
        }
    }, [isAdmin]);


    const submitSuggestion = async (suggestionData) => {
        if (!user?.id) return { data: null, error: new Error('Authentication required') };

        try {
            const { data, error } = await supabase
                .from('event_suggestions')
                .insert([{ ...suggestionData, user_id: user.id }])
                .select();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error submitting suggestion:", err);
            return { data: null, error: err };
        }
    };

    const fetchUserSuggestions = async (userId) => {
        if (!userId || (userId !== user?.id && !isAdmin)) return [];
        try {
            const { data, error } = await supabase
                .from('event_suggestions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching suggestions:", err);
            return [];
        }
    };

    const fetchMembershipHistory = async (userId) => {
        if (!userId || (userId !== user?.id && !isAdmin)) return [];
        try {
            const { data, error } = await supabase
                .from('annual_memberships')
                .select('*')
                .eq('user_id', userId)
                .order('year', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching membership history:", err);
            return [];
        }
    };

    // ─── Gallery CRUD ───────────────────────────────────────────────────────────

    const fetchGalleryImages = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setGalleryImages(data || []);
            return data || [];
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching gallery:', err);
            return [];
        }
    }, []);

    const addGalleryImage = async (imageData) => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .insert([{
                    image_url: imageData.image_url,
                    caption: imageData.caption || { en: '', fr: '', ar: '' },
                    related_type: imageData.related_type || 'general',
                    related_item_id: imageData.related_item_id || null,
                    is_featured: imageData.is_featured || false
                }])
                .select()
                .single();
            if (error) throw error;
            setGalleryImages(prev => [data, ...prev]);
            return data;
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error adding gallery image:', err);
            throw err;
        }
    };

    const updateGalleryImage = async (id, imageData) => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .update({
                    image_url: imageData.image_url,
                    caption: imageData.caption || { en: '', fr: '', ar: '' },
                    related_type: imageData.related_type || 'general',
                    related_item_id: imageData.related_item_id || null,
                    is_featured: imageData.is_featured || false
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            setGalleryImages(prev => prev.map(img => img.id === id ? data : img));
            return data;
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error updating gallery image:', err);
            throw err;
        }
    };

    const deleteGalleryImage = async (id) => {
        if (!isAdmin) throw new Error('Not authorized');

        try {
            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setGalleryImages(prev => prev.filter(img => img.id !== id));
            return true;
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error deleting gallery image:', err);
            throw err;
        }
    };

    return (
        <DataContext.Provider value={{
            news, programs, events, projects, testimonials, users, partners, galleryImages,
            addPost, updatePost, deletePost, registerForEvent, addDonation, togglePin, fetchData,
            getLocalizedContent, loading,
            fetchUserActivities, fetchUserDonations, submitSuggestion, fetchUserSuggestions,
            verifyMember, updateAttendanceStatus, cancelRegistration, fetchAllDonations, updateDonationStatus, deleteDonation, fetchMembershipHistory,
            fetchGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage
        }}>
            {children}
        </DataContext.Provider>
    );
};


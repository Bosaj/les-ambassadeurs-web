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
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch News (with pinning)
            const { data: newsData, error: newsError } = await supabase
                .from('news')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (newsError) throw newsError;
            setNews(newsData || []);

            // Fetch All Events/Programs/Projects (with pinning)
            const { data: allEventsData, error: eventsError } = await supabase
                .from('events')
                .select('*, attendees:event_attendees(id, name, email)')
                .order('is_pinned', { ascending: false })
                .order('date', { ascending: false });

            if (eventsError) throw eventsError;

            // Debug log
            console.log("Fetched Events with Attendees:", allEventsData);

            // Filter into categories
            const p = [];
            const e = [];
            const proj = [];

            (allEventsData || []).forEach(item => {
                // Ensure attendees is an array
                if (!item.attendees) item.attendees = [];

                const cat = item.category || 'program';
                if (cat === 'program') p.push(item);
                else if (cat === 'event') e.push(item);
                else if (cat === 'project') proj.push(item);
            });

            setPrograms(p);
            setEvents(e);
            setProjects(proj);

            // Fetch Testimonials
            const { data: testimonialsData, error: testimonialsError } = await supabase
                .from('testimonials')
                .select('*')
                // Note: This filters for approved only. Admin might need a separate fetch or all data.
                .eq('is_approved', true)
                .order('rating', { ascending: false })
                .order('created_at', { ascending: false });

            if (testimonialsError) throw testimonialsError;
            setTestimonials(testimonialsData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                toast.error("Network connection error. working offline?");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to get localized string is now imported from utils

    const addPost = async (type, postData) => {
        try {
            let table = '';
            let insertData = {};

            if (type === 'news') {
                table = 'news';
                insertData = {
                    title: postData.title,
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description
                };
            } else if (['programs', 'events', 'projects'].includes(type)) {
                table = 'events';
                const categoryMap = { 'programs': 'program', 'events': 'event', 'projects': 'project' };
                insertData = {
                    title: postData.title,
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description,
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
            }

            const { data, error } = await supabase
                .from(table)
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;

            fetchData();
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
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description
                };
            } else if (['programs', 'events', 'projects'].includes(type)) {
                table = 'events';
                updateData = {
                    title: postData.title,
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description,
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
            }

            const { data, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            fetchData();
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

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic updates
            if (type === 'news') setNews(prev => prev.filter(item => item.id !== id));
            else if (type === 'testimonials') setTestimonials(prev => prev.filter(item => item.id !== id));
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
            fetchData();
        } catch (error) {
            console.error("Error toggling pin:", error);
            toast.error("Failed to update pin status");
        }
    };

    const registerForEvent = async (type, eventId, userDetails) => {
        try {
            console.log(`Registering for event ${eventId}`, userDetails);

            // 1. Database Insert
            const safeName = userDetails.name || userDetails.email || 'Anonymous';
            console.log("DEBUG: Inserting attendee (safeguarded):", {
                event_id: eventId,
                name: safeName,
                email: userDetails.email,
            });
            const { error, data } = await supabase
                .from('event_attendees')
                .insert([{
                    event_id: eventId,
                    name: safeName,
                    email: userDetails.email,
                }])
                .select();

            if (error) {
                console.error("Supabase connect error:", error);
                throw error;
            }

            console.log("Registration successful:", data);

            // 2. Optimistic Update
            const updateList = (list) => {
                return list.map(item => {
                    if (item.id === eventId) {
                        const newAttendee = {
                            id: data?.[0]?.id || Date.now(),
                            name: userDetails.name,
                            email: userDetails.email
                        };
                        const updatedItem = {
                            ...item,
                            attendees: [...(item.attendees || []), newAttendee]
                        };
                        console.log("Updated local item:", updatedItem);
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

    const addDonation = async (donationData) => {
        try {
            const { error } = await supabase
                .from('donations')
                .insert([{
                    donor_name: donationData.name,
                    amount: donationData.amount,
                    method: donationData.method,
                    email: donationData.email, // Ensure email is saved
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

    const fetchUserActivities = async (email) => {
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
    };

    const fetchUserDonations = async (email) => {
        if (!email) return [];
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .eq('email', email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching donations:", err);
            return [];
        }
    };

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

    return (
        <DataContext.Provider value={{
            news, programs, events, projects, testimonials,
            addPost, updatePost, deletePost, registerForEvent, addDonation, togglePin,
            getLocalizedContent, loading,
            // New exports
            fetchUserActivities, fetchUserDonations, submitSuggestion, fetchUserSuggestions
        }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

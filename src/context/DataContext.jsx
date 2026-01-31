import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

// Initial data removed - now fetching from Supabase


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
                .order('date', { ascending: false }); // Order by event date

            if (eventsError) throw eventsError;

            // Filter into categories
            const p = [];
            const e = [];
            const proj = [];

            (allEventsData || []).forEach(item => {
                const cat = item.category || 'program'; // Default to program for legacy
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
                .eq('is_approved', true)
                .order('rating', { ascending: false }) // Show highest rated first? Or pinned?
                .order('created_at', { ascending: false });

            if (testimonialsError) throw testimonialsError;
            setTestimonials(testimonialsData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to get localized string
    const getLocalizedContent = (contentObj, lang = 'en') => {
        if (!contentObj) return '';
        if (typeof contentObj === 'string') return contentObj; // Backwards compatibility
        return contentObj[lang] || contentObj['en'] || Object.values(contentObj)[0] || '';
    };

    const addPost = async (type, postData) => {
        try {
            let table = '';
            let insertData = {};

            // Helper to create trilingual object from single input (for simplified admin input)
            // Ideally Admin Dashboard should implement trilingual inputs.
            // For now, we replicate the input to all languages avoiding empty fields issues.
            const createTrilingual = (text) => ({ en: text, fr: text, ar: text });

            if (type === 'news') {
                table = 'news';
                insertData = {
                    title: postData.title, // Expecting object: {en: "", fr: "", ar: ""}
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description // Expecting object
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
                    role: postData.role, // Now JSONB
                    content: postData.content, // Now JSONB
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

            // Re-fetch to ensure category sorting is correct (easiest) or manually push
            fetchData();
            return data;
        } catch (error) {
            console.error(`Error adding ${type}:`, error);
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

    const deletePost = async (type, id) => {
        try {
            let table = '';
            if (type === 'news') table = 'news';
            else if (['programs', 'events', 'projects'].includes(type.toLowerCase())) table = 'events'; // covers all categories
            else if (type === 'testimonials') table = 'testimonials';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            if (type === 'news') setNews(prev => prev.filter(item => item.id !== id));
            else if (type === 'testimonials') setTestimonials(prev => prev.filter(item => item.id !== id));
            else {
                // For events table, we might not know which specific state list it was in without id lookup, 
                // but checking all 3 is safe and fast.
                setPrograms(prev => prev.filter(item => item.id !== id));
                setEvents(prev => prev.filter(item => item.id !== id));
                setProjects(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            throw error;
        }
    };

    const registerForEvent = async (type, eventId, userDetails) => {
        // Can register for any event type technically
        try {
            const { error } = await supabase
                .from('event_attendees')
                .insert([{
                    event_id: eventId,
                    name: userDetails.name,
                    email: userDetails.email,
                }]);

            if (error) throw error;

            // Optimistic Update helper
            const updateAttendee = (list) => list.map(p => {
                if (p.id === eventId) return { ...p, attendees: [...(p.attendees || []), userDetails] };
                return p;
            });

            setPrograms(prev => updateAttendee(prev));
            setEvents(prev => updateAttendee(prev));
            setProjects(prev => updateAttendee(prev));

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
                    status: 'pending'
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error adding donation:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{
            news, programs, events, projects, testimonials,
            addPost, deletePost, registerForEvent, addDonation, togglePin,
            getLocalizedContent, loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

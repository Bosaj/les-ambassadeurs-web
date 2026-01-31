import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

const initialNews = [
    {
        id: 1,
        title: "Ramadan Basket Campaign",
        date: "2024-03-15",
        image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Our annual Ramadan campaign targeting 500 families in need. Join us in packaging and distributing food baskets.",
        attendees: []
    },
    {
        id: 2,
        title: "Medical Caravan",
        date: "2024-05-20",
        image: "https://images.pexels.com/photos/6325984/pexels-photo-6325984.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Providing free medical checkups and medicine to rural areas. Doctors and nurses are welcome to join.",
        attendees: []
    }
];

const initialPrograms = [
    {
        id: 1,
        title: "Youth Mentorship",
        date: "Ongoing",
        image: "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Connecting experienced professionals with young students for career guidance and personal development.",
        attendees: []
    },
    {
        id: 2,
        title: "Environmental Awareness",
        date: "Monthly",
        image: "https://images.pexels.com/photos/7656721/pexels-photo-7656721.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Workshops and cleanup drives to promote a cleaner and greener community.",
        attendees: []
    }
];

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

            // Fetch News
            const { data: newsData, error: newsError } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (newsError) throw newsError;
            setNews(newsData || []);

            // Fetch All Events/Programs/Projects
            const { data: allEventsData, error: eventsError } = await supabase
                .from('events')
                .select('*, attendees:event_attendees(id, name, email)')
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
                    category: categoryMap[type] || 'program'
                };
            } else if (type === 'testimonials') {
                table = 'testimonials';
                insertData = {
                    name: postData.name,
                    role: postData.role,
                    content: postData.content,
                    image_url: postData.image,
                    is_approved: true
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
            addPost, deletePost, registerForEvent, addDonation,
            getLocalizedContent, loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

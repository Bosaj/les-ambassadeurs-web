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
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: newsData, error: newsError } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (newsError) throw newsError;
            setNews(newsData || []);

            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*, attendees:event_attendees(id, name, email)')
                .order('created_at', { ascending: false });

            if (eventsError) throw eventsError;
            setPrograms(eventsData || []);

            const { data: testimonialsData, error: testimonialsError } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_approved', true) // Only show approved by default? Or all for admin.
                // Assuming DataContext is general, maybe fetch all and filter in UI, or fetch approved. 
                // Let's fetch all for now, UI can filter.
                .order('created_at', { ascending: false });

            if (testimonialsError) throw testimonialsError;
            setTestimonials(testimonialsData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            // Fallback to empty or handled error state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Optional: Realtime subscriptions could go here
    }, []);

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
            } else if (type === 'programs') {
                table = 'events';
                insertData = {
                    title: postData.title,
                    date: new Date(postData.date).toISOString(),
                    image_url: postData.image,
                    description: postData.description
                };
            } else if (type === 'testimonials') {
                table = 'testimonials';
                insertData = {
                    name: postData.name,
                    role: postData.role,
                    content: postData.content,
                    image_url: postData.image,
                    is_approved: true // Auto approve for admin added
                };
            }

            const { data, error } = await supabase
                .from(table)
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;

            if (type === 'news') {
                setNews(prev => [data, ...prev]);
            } else if (type === 'programs') {
                setPrograms(prev => [{ ...data, attendees: [] }, ...prev]);
            } else if (type === 'testimonials') {
                setTestimonials(prev => [data, ...prev]);
            }
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
            else if (type === 'programs') table = 'events';
            else if (type === 'testimonials') table = 'testimonials';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            if (type === 'news') {
                setNews(prev => prev.filter(item => item.id !== id));
            } else if (type === 'programs') {
                setPrograms(prev => prev.filter(item => item.id !== id));
            } else if (type === 'testimonials') {
                setTestimonials(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            throw error;
        }
    };

    const registerForEvent = async (type, eventId, userDetails) => {
        // Only supports programs (events) currently as News doesn't have attendees
        if (type !== 'programs') return;

        try {
            const { error } = await supabase
                .from('event_attendees')
                .insert([{
                    event_id: eventId,
                    name: userDetails.name,
                    email: userDetails.email,
                    // user_id is automatically handled if authenticated? 
                    // No, explicitly set if we have auth context here, but keeping it simple for guests 
                    // RLS allows public insert, so user_id might be null for guests
                }]);

            if (error) throw error;

            // Optimistic update or refetch
            // Optimistic:
            setPrograms(prev => prev.map(p => {
                if (p.id === eventId) {
                    return {
                        ...p,
                        attendees: [...(p.attendees || []), userDetails]
                    };
                }
                return p;
            }));
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
                    status: 'pending' // Default status
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error adding donation:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{ news, programs, testimonials, addPost, deletePost, registerForEvent, addDonation, loading }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

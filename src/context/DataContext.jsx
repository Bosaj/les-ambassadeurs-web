import React, { createContext, useState, useContext, useEffect } from 'react';

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
    const [news, setNews] = useState(() => {
        const storedNews = localStorage.getItem('news_data');
        return storedNews ? JSON.parse(storedNews) : initialNews;
    });
    const [programs, setPrograms] = useState(() => {
        const storedPrograms = localStorage.getItem('programs_data');
        return storedPrograms ? JSON.parse(storedPrograms) : initialPrograms;
    });
    const [loading] = useState(false);

    // Save changes to local storage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('news_data', JSON.stringify(news));
            localStorage.setItem('programs_data', JSON.stringify(programs));
        }
    }, [news, programs, loading]);

    const addPost = (type, postData) => {
        const newPost = { ...postData, id: Date.now(), attendees: [] };
        if (type === 'news') {
            setNews(prev => [newPost, ...prev]);
        } else {
            setPrograms(prev => [newPost, ...prev]);
        }
    };

    const deletePost = (type, id) => {
        if (type === 'news') {
            setNews(prev => prev.filter(item => item.id !== id));
        } else {
            setPrograms(prev => prev.filter(item => item.id !== id));
        }
    };

    const registerForEvent = (type, id, userDetails) => {
        const updateList = (list) => {
            return list.map(item => {
                if (item.id === id) {
                    return { ...item, attendees: [...item.attendees, userDetails] };
                }
                return item;
            });
        };

        if (type === 'news') {
            setNews(prev => updateList(prev));
        } else {
            setPrograms(prev => updateList(prev));
        }
    };

    return (
        <DataContext.Provider value={{ news, programs, addPost, deletePost, registerForEvent, loading }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

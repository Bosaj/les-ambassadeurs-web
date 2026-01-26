import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading] = useState(false);

    // Mock Login
    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Admin Hardcoded Check
                if (email === 'admin@abv.ma' && password === 'admin123') {
                    const adminUser = { id: 'admin_1', name: 'Admin User', email, role: 'admin' };
                    setUser(adminUser);
                    localStorage.setItem('user', JSON.stringify(adminUser));
                    resolve(adminUser);
                    return;
                }

                // Check stored volunteers
                const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
                const foundUser = volunteers.find(u => u.email === email && u.password === password);

                if (foundUser) {
                    const { password: _password, ...userWithoutPass } = foundUser;
                    setUser(userWithoutPass);
                    localStorage.setItem('user', JSON.stringify(userWithoutPass));
                    resolve(userWithoutPass);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 800); // Simulate network delay
        });
    };

    // Mock Signup (Volunteers only)
    const signup = (name, email, password, phone) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');

                if (volunteers.some(u => u.email === email)) {
                    reject(new Error('Email already exists'));
                    return;
                }

                const newUser = { id: Date.now().toString(), name, email, phone, role: 'volunteer', password };
                volunteers.push(newUser);
                localStorage.setItem('volunteers', JSON.stringify(volunteers));

                // Auto login after signup
                const { password: _password, ...userWithoutPass } = newUser;
                setUser(userWithoutPass);
                localStorage.setItem('user', JSON.stringify(userWithoutPass));
                resolve(userWithoutPass);
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

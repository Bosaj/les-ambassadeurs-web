import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Login from '../../pages/Login';
import { AuthProvider } from '../../context/AuthContext';
// LanguageProvider import removed as it is now in a separate file and unused here

// Mock context providers if complex
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            login: vi.fn(),
            user: null
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
    };
});

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            login_title: 'Login',
            email_placeholder: 'Email',
            password_placeholder: 'Password',
            sign_in_btn: 'Sign In'
        },
        language: 'en'
    }),
}));

describe('Login Page', () => {
    it('renders login form elements', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
});

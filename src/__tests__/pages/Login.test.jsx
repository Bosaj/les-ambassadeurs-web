import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Login from '../../pages/Login';

// Mock hooks and context providers
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        user: null,
        loading: false
    })
}));

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

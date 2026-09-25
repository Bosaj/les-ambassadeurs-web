import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

let auth;
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ t: {}, language: 'en' }) }));

const renderAt = (requiredRole) => render(
    <MemoryRouter initialEntries={['/private']}>
        <Routes>
            <Route path="/private" element={<ProtectedRoute requiredRole={requiredRole}><p>secret</p></ProtectedRoute>} />
            <Route path="/login" element={<p>login page</p>} />
            <Route path="/dashboard/admin" element={<p>admin home</p>} />
            <Route path="/dashboard/volunteer" element={<p>volunteer home</p>} />
        </Routes>
    </MemoryRouter>
);

describe('ProtectedRoute', () => {
    beforeEach(() => { auth = { user: null, loading: false }; });

    it('redirects anonymous visitors to /login', () => {
        renderAt('volunteer');
        expect(screen.getByText('login page')).toBeInTheDocument();
    });

    it('lets admins open volunteer pages without warnings', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        auth = { user: { role: 'admin' }, loading: false };
        renderAt('volunteer');
        expect(screen.getByText('secret')).toBeInTheDocument();
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it('keeps volunteers out of admin pages', () => {
        auth = { user: { role: 'volunteer' }, loading: false };
        renderAt('admin');
        expect(screen.queryByText('secret')).not.toBeInTheDocument();
    });
});

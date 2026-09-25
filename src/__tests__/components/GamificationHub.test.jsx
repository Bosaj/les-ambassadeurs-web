import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GamificationHub from '../../components/GamificationHub';

const rpc = vi.fn();
const badgeRows = [
    { id: 'first_event', name: 'First Step', name_i18n: { en: 'First Step' }, description_i18n: { en: 'First event' }, icon: 'FaCalendarCheck', criteria_type: 'events', threshold: 1, sort_order: 10 },
    { id: 'regular_volunteer', name: 'Regular Volunteer', name_i18n: { en: 'Regular Volunteer' }, description_i18n: { en: '5 events' }, icon: 'FaUsers', criteria_type: 'events', threshold: 5, sort_order: 20 },
];

vi.mock('../../lib/supabase', () => ({
    supabase: {
        rpc: (...args) => rpc(...args),
        from: () => ({ select: () => ({ not: () => ({ order: () => Promise.resolve({ data: badgeRows, error: null }) }) }) }),
    },
}));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'me', role: 'volunteer' } }) }));
vi.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ t: {}, language: 'en' }) }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const progress = {
    points: 120, events: 2, donations: 1, membership_years: 1, rank: 2,
    badges: [{ id: 'first_event', claimed_at: '2026-09-01T10:00:00Z' }],
    history: [{ amount: 20, action_type: 'event', description: 'Event participation', source_type: 'event', source_id: 'e1', event_title: { en: 'Beach cleanup', ar: 'تنظيف الشاطئ' }, created_at: '2026-09-01T10:00:00Z' }],
};
const allTime = [
    { rank: 1, user_id: 'a', display_name: 'Sara A.', points: 300, badge_count: 3, is_me: false },
    { rank: 2, user_id: 'me', display_name: 'Me Myself', points: 120, badge_count: 1, is_me: true },
];

beforeEach(() => {
    rpc.mockReset();
    rpc.mockImplementation((name, args) => {
        if (name === 'get_my_progress') return Promise.resolve({ data: progress, error: null });
        if (name === 'get_leaderboard') return Promise.resolve({ data: args.p_period === 'month' ? [] : allTime, error: null });
        return Promise.resolve({ data: null, error: null });
    });
});

const renderHub = () => render(<MemoryRouter><GamificationHub /></MemoryRouter>);

describe('GamificationHub', () => {
    it('shows level, points, rank and next-level progress', async () => {
        renderHub();
        expect(await screen.findByText(/Level: Volunteer/)).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText(/80 points to Active Volunteer/)).toBeInTheDocument();
    });

    it('explains how to earn points with round values', async () => {
        renderHub();
        expect(await screen.findByText('How to earn points')).toBeInTheDocument();
        expect(screen.getByText('+20 pts')).toBeInTheDocument();
        expect(screen.getByText('+10 pts')).toBeInTheDocument();
        expect(screen.getByText('+50 pts')).toBeInTheDocument();
        expect(screen.getByText('up to 100 pts')).toBeInTheDocument();
    });

    it('marks earned badges and shows progress on locked ones', async () => {
        renderHub();
        expect(await screen.findByTestId('badge-first_event')).toHaveTextContent('Earned on');
        expect(screen.getByTestId('badge-regular_volunteer')).toHaveTextContent('2 / 5');
    });

    it('highlights me on the leaderboard and switches to this month', async () => {
        renderHub();
        expect(await screen.findByText('Sara A.')).toBeInTheDocument();
        expect(screen.getByText('(You)')).toBeInTheDocument();

        fireEvent.click(screen.getByText('This month'));
        await waitFor(() => expect(rpc).toHaveBeenCalledWith('get_leaderboard', { p_period: 'month', p_limit: 10 }));
        expect(await screen.findByText(/be the first/)).toBeInTheDocument();
    });

    it('lists recent point history', async () => {
        renderHub();
        expect(await screen.findByText('Event participation: Beach cleanup')).toBeInTheDocument();
    });
});

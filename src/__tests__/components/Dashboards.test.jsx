import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardOverview from '../../components/admin/DashboardOverview';
import InboxManagement from '../../components/admin/InboxManagement';
import ProgressCard from '../../components/ProgressCard';
import Team from '../../components/Team';

const rpc = vi.fn();
const tables = {};
const updates = [];
const inserts = [];

const query = (table) => {
    const chain = {
        select: () => chain,
        not: () => chain,
        order: () => Promise.resolve({ data: tables[table] || [], error: null }),
        update: (values) => ({ eq: (col, id) => { updates.push({ table, values, id }); return Promise.resolve({ error: null }); } }),
        insert: (row) => { inserts.push({ table, row }); return Promise.resolve({ error: null }); },
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    };
    return chain;
};

vi.mock('../../lib/supabase', () => ({
    supabase: { rpc: (...a) => rpc(...a), from: (table) => query(table) },
}));
vi.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ t: {}, language: 'en' }) }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const overview = {
    members: { total: 39, new_30d: 3, volunteers: 35, members: 2, admins: 2, paid_this_year: 1 },
    money: { memberships_this_year: 100, donations_verified: 250, donations_verified_this_year: 250 },
    events: { upcoming: 1, past: 3, registrations: 7, confirmed: 0 },
    todo: { attendance_to_confirm: 7, registrations_pending: 7, membership_requests: 6, membership_payments: 0, admin_requests: 3, donations: 0, testimonials: 0, suggestions: 2, reports: 0 },
    gamification: { points_awarded: 1250, badges_earned: 5 },
};

beforeEach(() => {
    rpc.mockReset();
    updates.length = 0;
    inserts.length = 0;
    Object.keys(tables).forEach(k => delete tables[k]);
});

describe('Admin DashboardOverview', () => {
    beforeEach(() => {
        rpc.mockImplementation((name) => Promise.resolve({
            data: name === 'get_admin_overview' ? overview
                : [{ rank: 1, user_id: 'u1', display_name: 'Oussama', points: 1120, role: 'admin' }],
            error: null,
        }));
    });

    it('shows real KPIs from the overview RPC', async () => {
        render(<DashboardOverview t={{}} news={[]} events={[]} projects={[]} onNavigate={vi.fn()} onAdd={vi.fn()} language="en" />);
        const kpis = await screen.findByTestId('admin-kpis');
        await waitFor(() => expect(kpis).toHaveTextContent('39'));
        expect(kpis).toHaveTextContent('250 DH');
        expect(kpis).toHaveTextContent('0/7 participations confirmed');
    });

    it('lists only pending work and opens the right panel', async () => {
        const onNavigate = vi.fn();
        render(<DashboardOverview t={{}} news={[]} events={[]} projects={[]} onNavigate={onNavigate} onAdd={vi.fn()} language="en" />);
        const attendance = await screen.findByTestId('todo-attendance_to_confirm');
        expect(attendance).toHaveTextContent('7');
        expect(screen.queryByTestId('todo-donations')).not.toBeInTheDocument();

        fireEvent.click(attendance);
        expect(onNavigate).toHaveBeenCalledWith('users', 'attendance');
        fireEvent.click(screen.getByTestId('todo-suggestions'));
        expect(onNavigate).toHaveBeenCalledWith('inbox', undefined);
    });

    it('tags admins on the leaderboard', async () => {
        render(<DashboardOverview t={{}} news={[]} events={[]} projects={[]} onNavigate={vi.fn()} onAdd={vi.fn()} language="en" />);
        expect(await screen.findByText('Oussama')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });
});

describe('InboxManagement', () => {
    it('shows reports and lets an admin approve a suggestion (and notifies the author)', async () => {
        tables.problem_reports = [{ id: 'r1', subject: 'Login broken', description: 'Cannot sign in', email: 'a@b.ma', status: 'open', created_at: '2026-09-01' }];
        tables.event_suggestions = [{ id: 's1', user_id: 'u9', title: 'Beach cleanup', description: 'Saidia', status: 'pending', created_at: '2026-09-02' }];

        render(<InboxManagement t={{}} language="en" />);
        expect(await screen.findByText('Login broken')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Event suggestions'));
        expect(await screen.findByText('Beach cleanup')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Approve'));

        await waitFor(() => expect(updates).toContainEqual({ table: 'event_suggestions', values: { status: 'approved' }, id: 's1' }));
        await waitFor(() => expect(inserts[0]).toMatchObject({ table: 'notifications', row: { user_id: 'u9', type: 'success' } }));
    });
});

describe('ProgressCard', () => {
    it('shows level, rank and the closest next badge', async () => {
        tables.badge_definitions = [
            { id: 'first_event', name: 'First Step', name_i18n: { en: 'First Step' }, criteria_type: 'events', threshold: 1 },
            { id: 'regular_volunteer', name: 'Regular Volunteer', name_i18n: { en: 'Regular Volunteer' }, criteria_type: 'events', threshold: 5 },
            { id: 'rising_star', name: 'Rising Star', name_i18n: { en: 'Rising Star' }, criteria_type: 'points', threshold: 200 },
        ];
        rpc.mockResolvedValue({ data: { points: 110, events: 1, donations: 0, membership_years: 2, rank: 1, badges: [{ id: 'first_event' }] }, error: null });

        render(<MemoryRouter><ProgressCard /></MemoryRouter>);
        const card = await screen.findByTestId('progress-card');
        expect(card).toHaveTextContent('Volunteer');
        expect(card).toHaveTextContent('#1');
        expect(card).toHaveTextContent('1/3');
        expect(card).toHaveTextContent('Rising Star');
        expect(card).toHaveTextContent('(110/200)');
    });
});

describe('Team', () => {
    it('shows the 9-member 2026 team by default', () => {
        render(<Team />);
        const grid = screen.getByTestId('team-2026');
        expect(grid.querySelectorAll('figure')).toHaveLength(9);
        expect(grid).toHaveTextContent('Marouane');
        expect(grid).toHaveTextContent('AI / Web Engineer');
    });
});

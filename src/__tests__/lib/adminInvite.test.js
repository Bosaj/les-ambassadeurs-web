import { describe, it, expect, vi } from 'vitest';
import { inviteAdmin } from '../../lib/adminInvite';

const makeClient = (rpcResult) => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    return {
        rpc: vi.fn().mockResolvedValue(rpcResult),
        from: vi.fn(() => ({ insert })),
        insert
    };
};

describe('inviteAdmin', () => {
    it('promotes via RPC with a trimmed email and notifies the user', async () => {
        const client = makeClient({ data: { success: true, user_id: 'u1' }, error: null });
        const res = await inviteAdmin(client, '  a@b.ma ', { title: 'T', message: 'M' });

        expect(client.rpc).toHaveBeenCalledWith('make_admin_by_email', { target_email: 'a@b.ma' });
        expect(client.from).toHaveBeenCalledWith('notifications');
        expect(client.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'u1', title: 'T', is_read: false }));
        expect(res).toEqual({ ok: true, userId: 'u1' });
    });

    it('reports not_found without sending a notification', async () => {
        const client = makeClient({ data: { success: false }, error: null });
        const res = await inviteAdmin(client, 'nobody@b.ma', {});

        expect(res).toEqual({ ok: false, reason: 'not_found' });
        expect(client.from).not.toHaveBeenCalled();
    });

    it('throws when the caller is not authorized', async () => {
        const client = makeClient({ data: null, error: new Error('Not authorized') });
        await expect(inviteAdmin(client, 'x@b.ma', {})).rejects.toThrow('Not authorized');
    });
});

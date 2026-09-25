// Promotes an existing account to admin through the make_admin_by_email RPC.
// The RPC itself enforces that the caller holds the manage_admins permission.
export async function inviteAdmin(client, email, notification) {
    const { data, error } = await client.rpc('make_admin_by_email', { target_email: email.trim() });
    if (error) throw error;
    if (!data?.success) return { ok: false, reason: 'not_found' };

    await client.from('notifications').insert({
        user_id: data.user_id,
        type: 'info',
        is_read: false,
        ...notification
    });
    return { ok: true, userId: data.user_id };
}

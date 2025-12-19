import { query } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');

export async function PATCH(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return Response.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const updates = [];
        const values = [];

        if (body.name !== undefined) {
            updates.push('name = ?');
            values.push(body.name);
        }
        if (body.description !== undefined) {
            updates.push('description = ?');
            values.push(body.description);
        }
        if (body.price !== undefined) {
            updates.push('price = ?');
            values.push(body.price);
        }
        if (body.category_id !== undefined) {
            updates.push('category_id = ?');
            values.push(body.category_id);
        }
        if (body.preparation_time !== undefined) {
            updates.push('preparation_time = ?');
            values.push(body.preparation_time);
        }
        if (body.is_vegetarian !== undefined) {
            updates.push('is_vegetarian = ?');
            values.push(body.is_vegetarian ? 1 : 0);
        }
        if (body.is_available !== undefined) {
            updates.push('is_available = ?');
            values.push(body.is_available ? 1 : 0);
        }

        if (updates.length === 0) {
            return Response.json({ success: false, message: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        await query(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`, values);

        return Response.json({ success: true, message: 'Dish updated' });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return Response.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        await query('DELETE FROM menu_items WHERE id = ?', [id]);

        return Response.json({ success: true, message: 'Dish deleted' });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

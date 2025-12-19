import { query } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');

export async function PATCH(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'admin' && user.role !== 'staff') {
            return Response.json({ success: false, message: 'Only staff can update order status' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['pending', 'confirmed', 'in_making', 'ready', 'picked_up'];
        if (!validStatuses.includes(status)) {
            return Response.json({
                success: false,
                message: 'Invalid status. Must be: ' + validStatuses.join(', ')
            }, { status: 400 });
        }

        const orders = await query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return Response.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        return Response.json({
            success: true,
            message: `Order status updated to ${status}`
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const orders = await query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
             ts.slot_date, ts.start_time, ts.end_time
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN time_slots ts ON o.slot_id = ts.id
      WHERE o.id = ?
    `, [id]);

        if (orders.length === 0) {
            return Response.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        const order = orders[0];

        if (order.user_id !== user.id && user.role !== 'admin' && user.role !== 'staff') {
            return Response.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const items = await query(`
      SELECT oi.*, mi.name as item_name
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `, [id]);
        order.items = items;

        return Response.json({ success: true, data: order });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to get order',
            error: error.message
        }, { status: 500 });
    }
}

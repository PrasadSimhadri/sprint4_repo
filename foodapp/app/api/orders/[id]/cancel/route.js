import { query, getConnection } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');

export async function POST(request, { params }) {
    const connection = await getConnection();

    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            connection.release();
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await connection.beginTransaction();

        const [orders] = await connection.execute(
            'SELECT * FROM orders WHERE id = ? FOR UPDATE',
            [id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            connection.release();
            return Response.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        const order = orders[0];

        if (order.user_id !== user.id && user.role !== 'admin') {
            await connection.rollback();
            connection.release();
            return Response.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        if (order.status === 'cancelled') {
            await connection.rollback();
            connection.release();
            return Response.json({ success: false, message: 'Order already cancelled' }, { status: 400 });
        }

        if (['ready', 'picked_up'].includes(order.status)) {
            await connection.rollback();
            connection.release();
            return Response.json({
                success: false,
                message: 'Cannot cancel order that is ready or picked up'
            }, { status: 400 });
        }

        const now = new Date();
        const cancellationDeadline = new Date(order.cancellation_deadline);

        if (now > cancellationDeadline && user.role !== 'admin') {
            await connection.rollback();
            connection.release();

            const minutesPassed = Math.floor((now - new Date(order.created_at)) / 60000);
            return Response.json({
                success: false,
                message: `Cancellation window expired! You can only cancel within 5 minutes of booking. ${minutesPassed} minutes have passed.`
            }, { status: 400 });
        }

        await connection.execute(
            'UPDATE orders SET status = ?, cancelled_at = NOW() WHERE id = ?',
            ['cancelled', id]
        );

        await connection.execute(
            'UPDATE time_slots SET current_orders = current_orders - 1 WHERE id = ?',
            [order.slot_id]
        );

        const [updatedSlot] = await connection.execute(
            'SELECT current_orders, max_orders FROM time_slots WHERE id = ?',
            [order.slot_id]
        );

        let newStatus = 'available';
        if (updatedSlot[0].current_orders >= updatedSlot[0].max_orders) {
            newStatus = 'full';
        } else if (updatedSlot[0].current_orders >= updatedSlot[0].max_orders * 0.7) {
            newStatus = 'almost_full';
        }

        await connection.execute(
            'UPDATE time_slots SET status = ? WHERE id = ?',
            [newStatus, order.slot_id]
        );

        await connection.commit();
        connection.release();

        return Response.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        return Response.json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        }, { status: 500 });
    }
}

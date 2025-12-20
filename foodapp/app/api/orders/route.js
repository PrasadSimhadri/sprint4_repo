import { getConnection, query } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');
const { sendOrderConfirmationEmail } = require('@/lib/email');

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        let orders;
        if (user.role === 'admin' || user.role === 'staff') {
            orders = await query(`
                SELECT o.*, u.name as user_name, u.email as user_email,
                       ts.slot_date, ts.start_time, ts.end_time
                FROM orders o
                JOIN users u ON o.user_id = u.id
                JOIN time_slots ts ON o.slot_id = ts.id
                ORDER BY o.created_at DESC
            `);
        } else {
            orders = await query(`
                SELECT o.*, ts.slot_date, ts.start_time, ts.end_time
                FROM orders o
                JOIN time_slots ts ON o.slot_id = ts.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `, [user.id]);
        }

        for (let order of orders) {
            const items = await query(`
                SELECT oi.*, mi.name as item_name
                FROM order_items oi
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        return Response.json({ success: true, data: orders });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const connection = await getConnection();

    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            connection.release();
            return Response.json({ success: false, message: 'Please login to place order' }, { status: 401 });
        }

        const body = await request.json();
        const { slotId, items, specialInstructions } = body;

        if (!slotId || !items || items.length === 0) {
            connection.release();
            return Response.json({
                success: false,
                message: 'Slot and items are required'
            }, { status: 400 });
        }

        await connection.beginTransaction();

        const [slots] = await connection.execute(
            'SELECT * FROM time_slots WHERE id = ? FOR UPDATE',
            [slotId]
        );

        if (slots.length === 0) {
            await connection.rollback();
            connection.release();
            return Response.json({ success: false, message: 'Slot not found' }, { status: 404 });
        }

        const slot = slots[0];

        if (slot.current_orders >= slot.max_orders) {
            await connection.rollback();
            connection.release();
            return Response.json({
                success: false,
                message: 'Sorry, this slot is now full. Please select another slot.'
            }, { status: 400 });
        }

        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];

        if (slot.start_time <= currentTime) {
            await connection.rollback();
            connection.release();
            return Response.json({
                success: false,
                message: 'This slot has already passed'
            }, { status: 400 });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const [menuItems] = await connection.execute(
                'SELECT * FROM menu_items WHERE id = ? AND is_available = TRUE',
                [item.menuItemId]
            );

            if (menuItems.length === 0) {
                await connection.rollback();
                connection.release();
                return Response.json({
                    success: false,
                    message: `Item not available: ${item.menuItemId}`
                }, { status: 400 });
            }

            const menuItem = menuItems[0];
            const subtotal = menuItem.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                menuItemId: item.menuItemId,
                name: menuItem.name,
                quantity: item.quantity,
                unitPrice: menuItem.price,
                subtotal: subtotal,
                notes: item.notes || null
            });
        }

        const orderNumber = generateOrderNumber();
        const cancellationDeadline = new Date(slotDate.getTime() - 15 * 60 * 1000);

        const [orderResult] = await connection.execute(
            `INSERT INTO orders (order_number, user_id, slot_id, total_amount, status, payment_status, special_instructions, cancellation_deadline)
             VALUES (?, ?, ?, ?, 'confirmed', 'paid', ?, ?)`,
            [orderNumber, user.id, slotId, totalAmount, specialInstructions || null, cancellationDeadline]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await connection.execute(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.menuItemId, item.quantity, item.unitPrice, item.subtotal, item.notes]
            );
        }

        await connection.execute(
            'UPDATE time_slots SET current_orders = current_orders + 1 WHERE id = ?',
            [slotId]
        );

        const [updatedSlot] = await connection.execute(
            'SELECT current_orders, max_orders FROM time_slots WHERE id = ?',
            [slotId]
        );

        let newStatus = 'available';
        if (updatedSlot[0].current_orders >= updatedSlot[0].max_orders) {
            newStatus = 'full';
        } else if (updatedSlot[0].current_orders >= updatedSlot[0].max_orders * 0.7) {
            newStatus = 'almost_full';
        }

        await connection.execute(
            'UPDATE time_slots SET status = ? WHERE id = ?',
            [newStatus, slotId]
        );

        await connection.commit();
        connection.release();

        try {
            const userData = await query('SELECT name, email FROM users WHERE id = ?', [user.id]);
            if (userData && userData.length > 0) {
                sendOrderConfirmationEmail(userData[0].email, userData[0].name, {
                    orderNumber,
                    orderId,
                    slotTime: formatTime(slot.start_time),
                    slotDate: slot.slot_date,
                    total: totalAmount,
                    items: orderItems
                });
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        return Response.json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId,
                orderNumber,
                totalAmount,
                slotTime: formatTime(slot.start_time),
                cancellationDeadline
            }
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch (e) { }
        connection.release();
        return Response.json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        }, { status: 500 });
    }
}

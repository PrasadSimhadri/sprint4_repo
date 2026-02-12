import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const now = new Date();
        const updatedOrders = [];

        const orders = await query(`
      SELECT o.id, o.order_number, o.status, o.slot_id,
             ts.slot_date, ts.start_time
      FROM orders o
      JOIN time_slots ts ON o.slot_id = ts.id
      WHERE o.status IN ('confirmed', 'in_making')
        AND ts.slot_date = CURRENT_DATE
    `);

        for (const order of orders) {
            const slotDate = new Date(order.slot_date);
            const [hours, minutes] = order.start_time.split(':');
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const minsToPickup = Math.floor((slotDate - now) / 60000);

            let newStatus = null;

            if (minsToPickup <= 2 && order.status !== 'ready') {
                newStatus = 'ready';
            } else if (minsToPickup <= 15 && minsToPickup > 2 && order.status === 'confirmed') {
                newStatus = 'in_making';
            }

            if (newStatus) {
                await query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, order.id]);
                updatedOrders.push({
                    orderId: order.id,
                    orderNumber: order.order_number,
                    oldStatus: order.status,
                    newStatus: newStatus,
                    minsToPickup
                });
            }
        }

        return Response.json({
            success: true,
            message: `Updated ${updatedOrders.length} orders`,
            data: updatedOrders
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to update order statuses',
            error: error.message
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const now = new Date();

        const orders = await query(`
      SELECT o.id, o.order_number, o.status, o.user_id,
             ts.slot_date, ts.start_time,
             u.name as user_name
      FROM orders o
      JOIN time_slots ts ON o.slot_id = ts.id
      JOIN users u ON o.user_id = u.id
      WHERE o.status IN ('confirmed', 'in_making')
        AND ts.slot_date = CURDATE()
      ORDER BY ts.start_time
    `);

        const ordersWithTiming = orders.map(order => {
            const slotDate = new Date(order.slot_date);
            const [hours, minutes] = order.start_time.split(':');
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const minsToPickup = Math.floor((slotDate - now) / 60000);

            let suggestedStatus = order.status;
            let urgency = 'normal';

            if (minsToPickup <= 2) {
                suggestedStatus = 'ready';
                urgency = 'critical';
            } else if (minsToPickup <= 15) {
                suggestedStatus = 'in_making';
                urgency = 'high';
            }

            return {
                ...order,
                minsToPickup,
                suggestedStatus,
                urgency,
                needsAction: suggestedStatus !== order.status
            };
        });

        return Response.json({
            success: true,
            data: ordersWithTiming
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

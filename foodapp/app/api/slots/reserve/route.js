import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { slotId, action } = body;

        if (!slotId) {
            return Response.json({ success: false, message: 'Slot ID required' }, { status: 400 });
        }

        if (action === 'reserve') {
            await query(
                'UPDATE time_slots SET current_orders = current_orders + 1 WHERE id = ? AND current_orders < max_orders',
                [slotId]
            );

            return Response.json({
                success: true,
                message: 'Slot reserved temporarily',
                reservationExpiry: Date.now() + 5 * 60 * 1000
            });
        }

        if (action === 'release') {
            await query(
                'UPDATE time_slots SET current_orders = GREATEST(current_orders - 1, 0) WHERE id = ?',
                [slotId]
            );

            return Response.json({ success: true, message: 'Slot released' });
        }

        return Response.json({ success: false, message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

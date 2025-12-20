import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];

    const slots = await query(`
      SELECT 
        id,
        slot_date,
        start_time,
        end_time,
        max_orders,
        current_orders,
        status,
        CASE 
          WHEN current_orders >= max_orders THEN 'full'
          WHEN current_orders >= (max_orders * 0.7) THEN 'almost_full'
          ELSE 'available'
        END as computed_status,
        CASE 
          WHEN start_time <= ? THEN TRUE
          ELSE FALSE
        END as is_past
      FROM time_slots
      ORDER BY start_time
    `, [currentTime]);

    const formattedSlots = slots.map(slot => {
      const isPast = slot.is_past === 1;
      const isFull = slot.current_orders >= slot.max_orders;

      let displayStatus = slot.computed_status;
      if (isPast) displayStatus = 'disabled';
      if (isFull) displayStatus = 'full';

      let color = '#22c55e';
      if (displayStatus === 'almost_full') color = '#eab308';
      if (displayStatus === 'full' || displayStatus === 'disabled') color = '#ef4444';

      return {
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        maxOrders: slot.max_orders,
        currentOrders: slot.current_orders,
        available: slot.max_orders - slot.current_orders,
        status: displayStatus,
        color: color,
        isDisabled: isPast || isFull
      };
    });

    return Response.json({
      success: true,
      data: formattedSlots
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: 'Failed to fetch slots',
      error: error.message
    }, { status: 500 });
  }
}

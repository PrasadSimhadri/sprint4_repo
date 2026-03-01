import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Get slots: 
    // - Future dates: show all slots
    // - Today: only show slots where start_time > current time
    // - Past dates: don't show at all
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
        END as computed_status
      FROM time_slots
      WHERE (slot_date > ? OR (slot_date = ? AND start_time > ?))
      ORDER BY slot_date, start_time
    `, [today, today, currentTime]);

    const formattedSlots = slots.map(slot => {
      const isFull = slot.current_orders >= slot.max_orders;

      let displayStatus = slot.computed_status;
      if (isFull) displayStatus = 'full';

      let color = '#22c55e';
      if (displayStatus === 'almost_full') color = '#eab308';
      if (displayStatus === 'full') color = '#ef4444';

      return {
        id: slot.id,
        date: slot.slot_date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        maxOrders: slot.max_orders,
        currentOrders: slot.current_orders,
        available: slot.max_orders - slot.current_orders,
        status: displayStatus,
        color: color,
        isDisabled: isFull
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
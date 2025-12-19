import { query } from '@/lib/db';

export async function GET() {
    try {
        const categories = await query(`
      SELECT id, name, description 
      FROM menu_categories 
      WHERE is_active = TRUE 
      ORDER BY display_order
    `);

        const items = await query(`
      SELECT 
        mi.id,
        mi.category_id,
        mi.name,
        mi.description,
        mi.price,
        mi.is_vegetarian,
        mi.is_available,
        mi.preparation_time
      FROM menu_items mi
      WHERE mi.is_available = TRUE
      ORDER BY mi.category_id, mi.name
    `);

        const menu = categories.map(category => ({
            ...category,
            items: items.filter(item => item.category_id === category.id)
        }));

        return Response.json({
            success: true,
            data: menu
        });
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to fetch menu',
            error: error.message
        }, { status: 500 });
    }
}

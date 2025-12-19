import { query } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');

export async function GET() {
    try {
        const categories = await query(
            `SELECT id, name, description FROM menu_categories WHERE is_active = TRUE ORDER BY display_order`
        );

        const items = await query(
            `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price, 
              mi.preparation_time, mi.is_vegetarian, mi.is_available
       FROM menu_items mi
       ORDER BY mi.category_id, mi.name`
        );

        const menu = categories.map(category => ({
            ...category,
            items: items.filter(item => item.category_id === category.id)
        }));

        return Response.json({ success: true, data: menu });
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to fetch menu',
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return Response.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, price, category_id, preparation_time, is_vegetarian, is_available } = body;

        if (!name || !price) {
            return Response.json({ success: false, message: 'Name and price required' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO menu_items (category_id, name, description, price, preparation_time, is_vegetarian, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [category_id || 1, name, description || '', price, preparation_time || 15, is_vegetarian ? 1 : 0, is_available ? 1 : 0]
        );

        return Response.json({
            success: true,
            message: 'Dish added',
            data: { id: result.insertId }
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

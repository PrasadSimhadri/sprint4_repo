-- Supabase PostgreSQL Schema for Food App
-- Run this in Supabase SQL Editor

-- Drop existing tables (if re-running)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS slot_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create custom ENUM types (PostgreSQL way)
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
CREATE TYPE slot_status AS ENUM ('available', 'almost_full', 'full', 'disabled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_making', 'ready', 'picked_up', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories table
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- Time Slots table
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INT DEFAULT 10,
    current_orders INT DEFAULT 0,
    status slot_status DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slot_date, start_time)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    special_instructions TEXT,
    cancellation_deadline TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
);

-- Create index for orders
CREATE INDEX idx_slot_orders ON orders(slot_id, status);

-- Order Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- SEED DATA
-- =====================

INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@foodapp.com', '$2b$10$hashedpassword1', '9876543210', 'admin'),
('Kitchen Staff 1', 'staff1@foodapp.com', '$2b$10$hashedpassword2', '9876543211', 'staff'),
('Kitchen Staff 2', 'staff2@foodapp.com', '$2b$10$hashedpassword3', '9876543212', 'staff'),
('Rahul Sharma', 'rahul@gmail.com', '$2b$10$hashedpassword4', '9876543213', 'customer'),
('Priya Patel', 'priya@gmail.com', '$2b$10$hashedpassword5', '9876543214', 'customer'),
('Amit Kumar', 'amit@gmail.com', '$2b$10$hashedpassword6', '9876543215', 'customer'),
('Sneha Reddy', 'sneha@gmail.com', '$2b$10$hashedpassword7', '9876543216', 'customer'),
('Vikram Singh', 'vikram@gmail.com', '$2b$10$hashedpassword8', '9876543217', 'customer'),
('Ananya Gupta', 'ananya@gmail.com', '$2b$10$hashedpassword9', '9876543218', 'customer'),
('Karthik Nair', 'karthik@gmail.com', '$2b$10$hashedpassword10', '9876543219', 'customer');

INSERT INTO menu_categories (name, description, display_order) VALUES
('Starters', 'Delicious appetizers to start your meal', 1),
('Main Course', 'Hearty main dishes', 2),
('Biryani & Rice', 'Aromatic rice dishes', 3),
('Beverages', 'Refreshing drinks', 4),
('Desserts', 'Sweet treats to end your meal', 5);

INSERT INTO menu_items (category_id, name, description, price, is_vegetarian, preparation_time) VALUES
(1, 'Paneer Tikka', 'Marinated cottage cheese grilled to perfection', 180.00, TRUE, 15),
(1, 'Chicken 65', 'Spicy deep fried chicken', 220.00, FALSE, 12),
(1, 'Veg Spring Rolls', 'Crispy rolls with vegetable filling', 150.00, TRUE, 10),
(2, 'Butter Chicken', 'Creamy tomato based chicken curry', 280.00, FALSE, 20),
(2, 'Paneer Butter Masala', 'Rich and creamy paneer curry', 240.00, TRUE, 18),
(2, 'Dal Makhani', 'Slow cooked black lentils', 180.00, TRUE, 25),
(2, 'Chicken Curry', 'Traditional home style chicken curry', 250.00, FALSE, 20),
(3, 'Chicken Biryani', 'Fragrant basmati rice with spiced chicken', 300.00, FALSE, 25),
(3, 'Veg Biryani', 'Aromatic vegetable biryani', 220.00, TRUE, 22),
(3, 'Egg Fried Rice', 'Tossed rice with eggs and veggies', 180.00, FALSE, 12),
(4, 'Masala Chai', 'Spiced Indian tea', 40.00, TRUE, 5),
(4, 'Fresh Lime Soda', 'Refreshing lime drink', 60.00, TRUE, 3),
(4, 'Mango Lassi', 'Sweet mango yogurt drink', 80.00, TRUE, 5),
(5, 'Gulab Jamun', 'Deep fried milk dumplings in sugar syrup', 100.00, TRUE, 5),
(5, 'Ice Cream', 'Choice of vanilla, chocolate or strawberry', 80.00, TRUE, 2);

INSERT INTO time_slots (slot_date, start_time, end_time, max_orders, current_orders, status) VALUES
(CURRENT_DATE, '11:00:00', '11:20:00', 10, 10, 'full'),
(CURRENT_DATE, '11:20:00', '11:40:00', 10, 8, 'almost_full'),
(CURRENT_DATE, '11:40:00', '12:00:00', 10, 5, 'available'),
(CURRENT_DATE, '12:00:00', '12:20:00', 10, 3, 'available'),
(CURRENT_DATE, '12:20:00', '12:40:00', 10, 0, 'available'),
(CURRENT_DATE, '12:40:00', '13:00:00', 10, 0, 'available'),
(CURRENT_DATE, '18:00:00', '18:20:00', 10, 9, 'almost_full'),
(CURRENT_DATE, '18:20:00', '18:40:00', 10, 4, 'available'),
(CURRENT_DATE, '18:40:00', '19:00:00', 10, 0, 'available'),
(CURRENT_DATE, '19:00:00', '19:20:00', 10, 0, 'available'),
(CURRENT_DATE + INTERVAL '1 day', '11:00:00', '11:20:00', 10, 0, 'available'),
(CURRENT_DATE + INTERVAL '1 day', '11:20:00', '11:40:00', 10, 0, 'available');

INSERT INTO orders (order_number, user_id, slot_id, total_amount, status, payment_status, cancellation_deadline, email_sent) VALUES
('ORD-2024-001', 4, 1, 520.00, 'picked_up', 'paid', NULL, TRUE),
('ORD-2024-002', 5, 1, 360.00, 'picked_up', 'paid', NULL, TRUE),
('ORD-2024-003', 6, 2, 480.00, 'ready', 'paid', NULL, TRUE),
('ORD-2024-004', 7, 2, 300.00, 'in_making', 'paid', NULL, TRUE),
('ORD-2024-005', 8, 3, 580.00, 'confirmed', 'paid', NOW() + INTERVAL '5 minutes', TRUE),
('ORD-2024-006', 9, 3, 400.00, 'pending', 'pending', NOW() + INTERVAL '5 minutes', FALSE),
('ORD-2024-007', 10, 7, 620.00, 'confirmed', 'paid', NOW() + INTERVAL '5 minutes', TRUE),
('ORD-2024-008', 4, 4, 280.00, 'cancelled', 'refunded', NULL, TRUE);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) VALUES
(1, 4, 1, 280.00, 280.00, NULL),
(1, 8, 1, 300.00, 300.00, 'Extra spicy'),
(1, 11, 2, 40.00, 80.00, NULL),
(2, 1, 2, 180.00, 360.00, NULL),
(3, 5, 1, 240.00, 240.00, 'Less oil'),
(3, 9, 1, 220.00, 220.00, NULL),
(4, 8, 1, 300.00, 300.00, NULL),
(5, 4, 1, 280.00, 280.00, NULL),
(5, 8, 1, 300.00, 300.00, NULL),
(6, 2, 1, 220.00, 220.00, NULL),
(6, 5, 1, 240.00, 240.00, NULL),
(7, 8, 2, 300.00, 600.00, 'One less spicy'),
(7, 13, 1, 80.00, 80.00, NULL),
(8, 4, 1, 280.00, 280.00, NULL);

SELECT 'Supabase schema created successfully!' as message;

# FoodApp - Food Ordering Application

A full stack food ordering application built with Next.js and MySQL.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Next.js |
| Backend | Next.js API Routes |
| Database | MySQL |
| Auth | JWT and bcryptjs |
| Email | Nodemailer  |
| Styling | Tailwind and Inline CSS |

## Features

- **User Authentication** - Register, Login, Forgot Password with OTP
- **Menu Display** - Categories, Veg/Non veg indicators, Prices
- **Time Slot Booking** - Color coded availability (Green/Orange/Red)
- **Order Management** - Place orders, View order history
- **Order Cancellation** - Cancel within 15 mins of pickup
- **Admin Dashboard** - Manage orders, Update status, Edit menu
- **Email Notifications** - Welcome email, Order confirmation
- **Race Condition Handling** - MySQL transactions with row locking

## Prerequisites

- Node.js 18+
- MySQL 8.x
- Gmail account (for email notifications)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd foodapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database**

Create MySQL database:
```sql
CREATE DATABASE food_app;
```

Update credentials in `lib/db.js` if needed.

4. **Run database schema**
```bash
node run-schema.js
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

## Project Structure

```
foodapp/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Login, Register, Password reset
│   │   ├── menu/         # Menu CRUD
│   │   ├── orders/       # Orders CRUD
│   │   └── slots/        # Time slots
│   ├── admin/            # Admin dashboard
│   ├── orders/           # User orders page
│   └── page.tsx          # Home page
├── components/
│   ├── AuthModal.jsx     # Login/Register modal
│   ├── Header.jsx        # Navigation
│   ├── Menu.jsx          # Menu display
│   └── SlotPicker.jsx    # Time slot selection
├── context/
│   └── AuthContext.jsx   # Authentication state
├── lib/
│   ├── auth.js           # JWT utilities
│   ├── db.js             # MySQL connection
│   └── email.js          # Nodemailer setup
└── database/
    └── schema.sql        # Database schema
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | leodawson123456789@gmail.com| leod1234 |


## Business Rules

- **Slot Availability**: Max 10 orders per slot
- **Cancellation Window**: 15 minutes before pickup
- **Auto Status Update**: 
  - 15 mins before → "In Making"
  - 2 mins before → "Ready"

## Environment Variables (Optional)

Create `.env.local`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_app
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `node run-schema.js` | Initialize database |
| `node test-db.js` | Test database connection |

# FoodApp - Food Ordering Application

A full stack food ordering application built with Next.js and Supabase (PostgreSQL).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Next.js |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
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
- **Race Condition Handling** - PostgreSQL transactions with row locking

## Prerequisites

- Node.js 18+
- Supabase account
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

3. **Configure Supabase**

- Create a new project at [supabase.com](https://supabase.com)
- Go to **Settings > Database > Connection string (URI)**
- Copy the connection string and add it to `.env.local`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

4. **Run database schema**

- Go to **SQL Editor** in Supabase Dashboard
- Copy and run the contents of `database/supabase-schema.sql`

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
│   ├── db.js             # Supabase PostgreSQL connection
│   └── email.js          # Nodemailer setup
└── database/
    └── supabase-schema.sql  # PostgreSQL schema for Supabase
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

## Environment Variables

Create `.env.local`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `node test-supabase.js` | Test Supabase connection |

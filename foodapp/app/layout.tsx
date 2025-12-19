import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodApp - Order Your Favorite Meals",
  description: "Book your meal slot and order delicious food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header style={{
          background: '#1a1a1a',
          borderBottom: '1px solid #2a2a2a',
          padding: '16px 0'
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              FoodApp
            </h1>
            <nav style={{ display: 'flex', gap: '16px' }}>
              <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Menu</a>
              <a href="/orders" style={{ color: '#888', textDecoration: 'none' }}>My Orders</a>
              <a href="/admin" style={{ color: '#888', textDecoration: 'none' }}>Admin</a>
            </nav>
          </div>
        </header>
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

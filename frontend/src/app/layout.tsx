import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IS212-G8T4 Project',
  description: 'Task Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Header />
          <div className="pt-16"> {/* Add padding for fixed header */}
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
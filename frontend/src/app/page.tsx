'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from './utils/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!checkAuth().isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Welcome to IS212-G8T4</h1>
      <p>Task Management System</p>
    </main>
  );
}
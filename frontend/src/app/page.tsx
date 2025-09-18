'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/utils/storage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in storage
    const token = storage.getToken();
    if (!token) {
      // If no token, redirect to login immediately
      router.push('/login');
    } else {
      // If token exists, redirect to home
      router.push('/home');
    }
  }, [router]);

  // Show loading only briefly while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
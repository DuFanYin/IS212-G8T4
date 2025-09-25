'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      router.push('/login');
    } else {
      router.push('/tasks');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
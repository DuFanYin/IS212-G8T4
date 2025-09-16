'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          IS212-G8T4 Project
        </h1>
        <p className="text-lg mb-8">
          Task Management System
        </p>
      </div>

      <Link 
        href="/test" 
        className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center max-w-sm w-full"
      >
        <h2 className="text-xl font-semibold mb-2">Test Connection</h2>
      </Link>

      <footer className="mt-16 text-center text-gray-500">
        <p>© 2024 IS212-G8T4</p>
      </footer>
    </main>
  );
}
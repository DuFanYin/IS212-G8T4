'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/test/hello');
        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError('Failed to connect to backend');
        console.error('Error:', err);
      }
    };

    fetchHello();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

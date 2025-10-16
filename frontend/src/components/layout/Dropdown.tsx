'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownProps {
  label: string;
  options: string[];
}

export default function Dropdown({ label, options }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center px-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
      >
        {label}
        <svg className="ml-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
          <ul>
            {options.map((option) => (
              <li key={option}>
                <Link
                  href={`/report/${option.toLowerCase()}`}
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-blue-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {option}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
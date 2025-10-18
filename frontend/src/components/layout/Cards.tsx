'use client';

import React, { Children } from 'react';

interface CardsProps {
  children: React.ReactNode;
  className?: string;
}

export default function Cards({ children, className }: CardsProps) {
  const items = Children.toArray(children).slice(0, 3);
  return (
    <div className={`w-full max-w-7xl mx-auto mb-8 flex justify-center py-2 ${className ?? ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full px-4">
        {items.map((child, i) => (
          <div
            key={(child as any)?.key ?? i}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[260px]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

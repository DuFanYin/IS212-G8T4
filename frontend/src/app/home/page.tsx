'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { TimelineView } from '@/components/features/timeline/TimelineView';

export default function HomePage() {
  const { user }: { user: User | null } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <TimelineView />;
}



import { User } from '@/lib/types/user';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white p-6 rounded shadow-sm space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Name:</span> {user.name}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Role:</span> {user.role}
        </p>
      </div>
      
      <div className="text-sm text-gray-500 pt-4 border-t">
        Task Management System
      </div>
    </div>
  );
}

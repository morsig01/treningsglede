'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  return (
    <div>
      <h1>Welcome, {session?.user?.email}</h1>
      {/* Your protected content */}
    </div>
  );
}
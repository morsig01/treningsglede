'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define our custom user type
interface CustomUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

// Type assertion for session
type CustomSession = {
  user?: CustomUser;
} | null;

export default function AdminPage() {
  const { data: session, status } = useSession() as { data: CustomSession, status: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for session to be loaded
    if (status === 'loading') return;
    
    // If no session after loading, redirect to login
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin from session data
    const isAdmin = session?.user?.role === 'admin';
    if (!isAdmin) {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  // Show loading state while session is being loaded
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">Laster...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin
  if (session?.user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            Administrasjon
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Velg hva du vil administrere
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/sessions"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Økter
              </h2>
              <p className="text-neutral-600">
                Administrer gruppetreningsøkter, legg til nye økter og håndter påmeldinger
              </p>
            </div>
          </Link>

          <Link
            href="/admin/ansatte"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Ansatte
              </h2>
              <p className="text-neutral-600">
                Administrer ansatte, legg til nye medarbeidere og oppdater profiler
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 
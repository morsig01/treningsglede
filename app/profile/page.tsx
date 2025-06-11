"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sessionTypes = [
  {
    id: 1,
    title: "Styrke & Kondisjon",
    instructor: "Maria Hansen",
    weekday: 2, // Tuesday
  },
  {
    id: 2,
    title: "Yoga for alle",
    instructor: "Lars Olsen",
    weekday: 3, // Wednesday
  },
  {
    id: 3,
    title: "HIIT Intervall",
    instructor: "Emma Berg",
    weekday: 5, // Friday
  },
];

type TabType = 'profile' | 'gruppetimer';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{ 
    id: string;
    session_id: number; 
    session_date: string 
  }[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user?.id) return;
      setLoadingRegistrations(true);
      try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
        const to = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);
        const res = await fetch(`/api/registrations/user?user_id=${session.user.id}&from=${from}&to=${to}`);
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.registrations || []);
        }
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
      } finally {
        setLoadingRegistrations(false);
      }
    };
    fetchRegistrations();
  }, [session?.user?.id]);

  if (!session) return null;

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) setError(error.message);
      else {
        setSuccess("Profile updated successfully");
        await update({ name });
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) setError(updateError.message);
      else setSuccess("Password updated successfully");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSessionInfo = (sessionId: number) => {
    return sessionTypes.find(s => s.id === sessionId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const upcomingSessions = registrations
    .filter(r => new Date(r.session_date) >= new Date())
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  const pastSessions = registrations
    .filter(r => new Date(r.session_date) < new Date())
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Profilinnstillinger</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Oppdater din profilinformasjon og passord.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Profile Info */}
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={session.user.email || ""}
            disabled
            className="mt-1 block w-full px-3 py-2 border rounded-md bg-neutral-50 text-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={session.user.name || ""}
            className="mt-1 block w-full px-3 py-2 border text-black rounded-md focus:ring-violet-900 focus:border-violet-900 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-violet-900 text-white rounded-md hover:bg-violet-900 focus:ring-2 focus:ring-violet-900 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* Password Change */}
      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            id="currentPassword"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md text-black focus:ring-violet-900 focus:border-violet-900 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border rounded-md text-black focus:ring-violet-900 focus:border-violet-900 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-violet-900 text-white rounded-md hover:bg-violet-900 focus:ring-2 focus:ring-violet-900 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );

  const renderGruppetimerTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Mine gruppetimer</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Oversikt over dine påmeldte gruppetimer.
        </p>
      </div>

      {loadingRegistrations ? (
        <div className="text-center py-4">Laster inn påmeldinger...</div>
      ) : (
        <>
          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Kommende timer</h3>
            {upcomingSessions.length === 0 ? (
              <p className="text-neutral-600">Ingen kommende timer</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((reg) => {
                  const session = getSessionInfo(reg.session_id);
                  return (
                    <div key={reg.id} 
                         className="bg-violet-50 p-4 rounded-lg border border-violet-100">
                      <div className="font-medium text-violet-900">{session?.title}</div>
                      <div className="text-sm text-violet-900">{formatDate(reg.session_date)}</div>
                      <div className="text-sm text-violet-900">Instruktør: {session?.instructor}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Tidligere timer</h3>
            {pastSessions.length === 0 ? (
              <p className="text-neutral-600">Ingen tidligere timer</p>
            ) : (
              <div className="space-y-3">
                {pastSessions.slice(0, 5).map((reg) => {
                  const session = getSessionInfo(reg.session_id);
                  return (
                    <div key={reg.id} 
                         className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                      <div className="font-medium text-neutral-900">{session?.title}</div>
                      <div className="text-sm text-neutral-700">{formatDate(reg.session_date)}</div>
                      <div className="text-sm text-neutral-600">Instruktør: {session?.instructor}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-violet-50 text-violet-900 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Profilinnstillinger
              </button>
              <button
                onClick={() => setActiveTab('gruppetimer')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'gruppetimer'
                    ? 'bg-violet-50 text-violet-900 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Gruppetimer
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'profile' ? renderProfileTab() : renderGruppetimerTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

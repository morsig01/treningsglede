"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Session {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  max_participants: number;
  current_participants: number;
  description?: string;
}

type TabType = 'profile' | 'registrations';

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
    session_date: string;
    session?: Session;
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
        
        // First get registrations
        const res = await fetch(`/api/registrations/user?user_id=${session.user.id}&from=${from}&to=${to}`);
        if (res.ok) {
          const data = await res.json();
          const registrations = data.registrations || [];
          
          // Then fetch session details for each registration
          const sessionsRes = await fetch('/api/sessions');
          if (sessionsRes.ok) {
            const sessionsData = await sessionsRes.json();
            const sessions: Session[] = sessionsData.sessions || [];
            
            // Merge session details with registrations
            const registrationsWithSessions = registrations.map((reg: { id: string; session_id: number; session_date: string }) => ({
              ...reg,
              session: sessions.find((s: Session) => s.id === reg.session_id)
            }));
            
            setRegistrations(registrationsWithSessions);
          }
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

  const handleUnregister = async (session_id: number, session_date: string) => {
    try {
      setError(null);
      setSuccess(null);

      const res = await fetch("/api/sessions/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, session_date }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(data.message);
        // Remove the registration from the local state and update the session count
        setRegistrations(prev =>
          prev.filter(
            reg =>
              !(reg.session_id === session_id && reg.session_date === session_date)
          )
        );
      }
    } catch (err) {
      setError("En feil oppstod under avmelding");
    }
  };

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
            Navn
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
          className="w-full py-2 px-4 bg-violet-900 text-white rounded-md hover:bg-violet-800 focus:ring-2 focus:ring-violet-900 disabled:opacity-50"
        >
          {loading ? "Oppdaterer..." : "Oppdater Profil"}
        </button>
      </form>

      {/* Password Change */}
      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700">
            Nåværende Passord
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
            Nytt Passord
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
          className="w-full py-2 px-4 bg-violet-900 text-white rounded-md hover:bg-violet-800 focus:ring-2 focus:ring-violet-900 disabled:opacity-50"
        >
          {loading ? "Oppdaterer..." : "Endre Passord"}
        </button>
      </form>
    </div>
  );

  const renderRegistrationsTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Mine påmeldinger</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Oversikt over dine kommende og tidligere økter.
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

      {loadingRegistrations ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">Laster påmeldinger...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming sessions */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Kommende økter
            </h3>
            {upcomingSessions.length === 0 ? (
              <p className="text-neutral-600">Ingen kommende påmeldinger</p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          {registration.session?.title}
                        </h4>
                        <p className="text-neutral-600">
                          {registration.session?.instructor}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {new Date(registration.session_date).toLocaleDateString(
                            "no-NO",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}{" "}
                          kl. {registration.session?.time.slice(0, 5)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleUnregister(
                            registration.session_id,
                            registration.session_date
                          )
                        }
                        className="px-3 py-1.5 bg-red-100 text-red-900 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Meld av
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past sessions */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Tidligere økter
            </h3>
            {pastSessions.length === 0 ? (
              <p className="text-neutral-600">Ingen tidligere påmeldinger</p>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-neutral-50 rounded-lg p-4 border border-neutral-200"
                  >
                    <h4 className="font-semibold text-neutral-900">
                      {registration.session?.title}
                    </h4>
                    <p className="text-neutral-600">
                      {registration.session?.instructor}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {new Date(registration.session_date).toLocaleDateString(
                        "no-NO",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}{" "}
                      kl. {registration.session?.time.slice(0, 5)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Side Navigation */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeTab === "profile"
                    ? "bg-violet-50 text-violet-900"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-3 h-5 w-5 ${
                    activeTab === "profile"
                      ? "text-violet-900"
                      : "text-neutral-400"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profil
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeTab === "registrations"
                    ? "bg-violet-50 text-violet-900"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-3 h-5 w-5 ${
                    activeTab === "registrations"
                      ? "text-violet-900"
                      : "text-neutral-400"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Påmeldinger
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {activeTab === "profile" ? renderProfileTab() : renderRegistrationsTab()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


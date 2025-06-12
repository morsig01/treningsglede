"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

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

interface Trainer {
  id: number;
  name: string;
}

export default function GrupptreningPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<{ session_id: number; session_date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showNewTrainer, setShowNewTrainer] = useState(false);
  const [formData, setFormData] = useState<Partial<Session>>({
    title: "",
    instructor: "",
    date: "",
    time: "",
    max_participants: 20,
    description: "",
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/check-admin?user_id=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      }
    };
    checkAdminStatus();
  }, [session?.user?.id]);

  // Fetch all sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (err) {
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/instructors');
        if (res.ok) {
          const data = await res.json();
          setTrainers(data.instructors);
        }
      } catch (err) {
        console.error('Failed to load trainers:', err);
      }
    };
    fetchTrainers();
  }, []);

  // Fetch user registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user?.id) return;
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const to = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);
      const res = await fetch(`/api/registrations/user?user_id=${session.user.id}&from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setUserRegistrations(data.registrations || []);
      }
    };
    fetchRegistrations();
  }, [session?.user?.id]);

  const handleRegister = async (sessionId: number, date: string) => {
    if (!session?.user?.id) return;
    setError(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          session_id: sessionId,
          session_date: date,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Could not register for the session");
      } else {
        setUserRegistrations((prev) => [...prev, { session_id: sessionId, session_date: date }]);
        
        // Update the current participants count
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, current_participants: s.current_participants + 1 }
            : s
        ));
      }
    } catch (err) {
      setError("An error occurred while registering");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      // If adding a new trainer, create it first
      if (showNewTrainer && formData.instructor) {
        const trainerRes = await fetch('/api/instructors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.instructor }),
        });

        if (!trainerRes.ok) {
          const data = await trainerRes.json();
          setError(data.error || 'Failed to create trainer');
          return;
        }

        // Refresh trainers list
        const refreshRes = await fetch('/api/instructors');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setTrainers(data.instructors);
        }
      }

      // Create the session
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create session');
      } else {
        setSessions(prev => [...prev, data.session]);
        setFormData({
          title: "",
          instructor: "",
          date: "",
          time: "",
          max_participants: 20,
          description: "",
        });
        setShowNewTrainer(false);
      }
    } catch (err) {
      setError('An error occurred while creating the session');
    }
  };

  const handleUnregister = async (session_id: number, session_date: string) => {
    try {
      setError(null);

      const res = await fetch("/api/sessions/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, session_date }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        // Remove the registration from the local state
        setUserRegistrations(prev =>
          prev.filter(
            reg =>
              !(reg.session_id === session_id && reg.session_date === session_date)
          )
        );
        // Update the current participants count locally
        setSessions(prev =>
          prev.map(s =>
            s.id === session_id
              ? { ...s, current_participants: Math.max(0, s.current_participants - 1) }
              : s
          )
        );
      }
    } catch (err) {
      setError("En feil oppstod under avmelding");
    }
  };

  const isUserRegistered = (sessionId: number, date: string) =>
    userRegistrations.some(r => r.session_id === sessionId && r.session_date === date);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-8">
          Økter og Påmelding
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`space-y-4 ${isAdmin ? 'lg:w-2/3' : 'w-full'}`}>
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-neutral-600">
                No upcoming sessions available.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={`${session.id}-${session.date}`}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {session.title}
                        </h3>
                        <p className="text-neutral-600">{session.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-neutral-900">
                          {new Date(session.date).toLocaleDateString("no-NO", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-neutral-600">
                          {session.time.slice(0, 5)}
                        </p>
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-4">{session.description}</p>

                    <div className="flex justify-between items-center">
                      <p className="text-neutral-600">
                        {session.current_participants} / {session.max_participants} påmeldte
                      </p>
                      {isUserRegistered(session.id, session.date) ? (
                        <button
                          onClick={() => handleUnregister(session.id, session.date)}
                          className="px-4 py-2 bg-red-100 text-red-900 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Meld av
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(session.id, session.date)}
                          disabled={session.current_participants >= session.max_participants}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            session.current_participants >= session.max_participants
                              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                              : "bg-violet-100 text-violet-900 hover:bg-violet-200"
                          }`}
                        >
                          {session.current_participants >= session.max_participants
                            ? "Fullt"
                            : "Meld på"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {isAdmin && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Ny Økt</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Tittel</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Instruktør</label>
                    <div className="mt-1 flex gap-2">
                      {!showNewTrainer ? (
                        <>
                          <select
                            value={formData.instructor}
                            onChange={e => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                            required
                            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                          >
                            <option value="">Velg instruktør</option>
                            {trainers.map(trainer => (
                              <option key={trainer.id} value={trainer.name}>
                                {trainer.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowNewTrainer(true)}
                            className="px-3 py-2 bg-violet-100 text-violet-900 rounded-md hover:bg-violet-200 transition-colors flex-shrink-0"
                          >
                            Ny
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={formData.instructor}
                            onChange={e => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                            placeholder="Skriv inn ny instruktør"
                            required
                            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewTrainer(false);
                              setFormData(prev => ({ ...prev, instructor: "" }));
                            }}
                            className="px-3 py-2 bg-neutral-100 text-neutral-900 rounded-md hover:bg-neutral-200 transition-colors flex-shrink-0"
                          >
                            Avbryt
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Dato</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        required
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Tid</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="time"
                        value={formData.time}
                        onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Maks deltakere</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        value={formData.max_participants}
                        onChange={e => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                        required
                        min="1"
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Beskrivelse</label>
                    <div className="mt-1 flex gap-2">
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900 text-neutral-900 py-2 px-3"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-violet-900 text-white px-4 py-2 rounded-md hover:bg-violet-800 transition-colors"
                  >
                    Opprett økt
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
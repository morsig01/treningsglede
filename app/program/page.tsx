"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

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

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
}

interface Session {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  max_participants: number;
  current_participants: number;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  weather?: WeatherData;
}

export default function GrupptreningPage() {
  const { data: session } = useSession() as { data: CustomSession };
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<{ session_id: number; session_date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load sessions');
      }
      const data = await res.json();
      
      const sessionsWithWeather = await Promise.all(
        (data.sessions || []).map(async (session: Session) => {
          if (session.latitude && session.longitude) {
            try {
              const weatherData = await fetch(
                `/api/weather?lat=${session.latitude}&lon=${session.longitude}&date=${session.date}`
              ).then(res => res.json());
              return { ...session, weather: weatherData };
            } catch (error) {
              console.error('Error fetching weather for session:', error);
              return session;
            }
          }
          return session;
        })
      );
      
      setSessions(sessionsWithWeather);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all sessions on mount and every 30 seconds
  useEffect(() => {
    fetchSessions();
    
    // Set up periodic refresh
    const intervalId = setInterval(fetchSessions, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
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
  const handleRegister = async (sessionId: number) => {
    if (!session?.user?.id) {
      setError('Du må være logget inn for å melde deg på.');
      return;
    }

    try {
      // Find the session data from our sessions list
      const sessionData = sessions.find(s => s.id === sessionId);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          session_id: sessionId,
          session_date: sessionData.date
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register for session');
      }      // Update the sessions list to reflect the new registration
      await fetchSessions();
      
      // Update the user's registrations
      if (session?.user?.id) {
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const registrationsResponse = await fetch(
          `/api/registrations/user?user_id=${session.user.id}&from=${today}&to=${nextYear}`
        );
        if (registrationsResponse.ok) {
          const data = await registrationsResponse.json();
          setUserRegistrations(data.registrations || []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke melde på økt. Vennligst prøv igjen senere.');
      console.error('Error registering for session:', err);
    }
  };
  const handleUnregister = async (sessionId: number) => {
    if (!session?.user?.id) {
      setError('Du må være logget inn for å melde deg av.');
      return;
    }

    try {
      const response = await fetch('/api/registrations/unregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unregister from session');
      }

      // Update the sessions list to reflect the unregistration
      await fetchSessions();
      
      // Update the user's registrations
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const registrationsResponse = await fetch(
        `/api/registrations/user?user_id=${session.user.id}&from=${today}&to=${nextYear}`
      );
      if (registrationsResponse.ok) {
        const data = await registrationsResponse.json();
        setUserRegistrations(data.registrations || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke melde av økt. Vennligst prøv igjen senere.');
      console.error('Error unregistering from session:', err);
    }
  };

  const isUserRegistered = (sessionId: number, sessionDate: string) => {
    return userRegistrations.some(
      r => r.session_id === sessionId && r.session_date === sessionDate
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">Laster økter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
            Økter og Påmelding
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            <p className="font-medium">Feil ved lasting av økter:</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
            <p className="mt-4 text-lg text-neutral-600">Laster økter...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-neutral-600">
            Ingen kommende økter tilgjengelige.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (              <div
                key={session.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-neutral-900">
                        {session.title}
                      </h2>
                      {session.location && (
                        <p className="text-neutral-600 mt-1">
                          📍 {session.location}
                        </p>
                      )}
                      {session.weather && (
                        <div className="mt-2 flex items-center gap-2 text-neutral-600">
                          <img 
                            src={`https://openweathermap.org/img/w/${session.weather.icon}.png`}
                            alt={session.weather.description}
                            className="w-8 h-8"
                          />
                          <span>{session.weather.temperature}°C</span>
                          <span className="capitalize">{session.weather.description}</span>
                        </div>
                      )}
                      <p className="mt-1 text-sm text-violet-900">
                        {session.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {new Date(session.date).toLocaleDateString('no-NO')}
                      </p>
                      <p className="text-sm text-neutral-600">{session.time}</p>
                    </div>
                  </div>

                  {session.description && (
                    <p className="mt-4 text-neutral-600">{session.description}</p>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-neutral-600">
                      Påmeldte: {session.current_participants} / {session.max_participants}
                    </p>
                    {session && (
                      <button
                        onClick={() =>
                          isUserRegistered(session.id, session.date)
                            ? handleUnregister(session.id)
                            : handleRegister(session.id)
                        }
                        disabled={!isUserRegistered(session.id, session.date) && session.current_participants >= session.max_participants}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          isUserRegistered(session.id, session.date)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : session.current_participants >= session.max_participants
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                        }`}
                      >
                        {isUserRegistered(session.id, session.date)
                          ? 'Meld av'
                          : session.current_participants >= session.max_participants
                          ? 'Fullt'
                          : 'Meld på'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
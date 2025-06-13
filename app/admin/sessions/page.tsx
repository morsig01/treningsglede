"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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

interface SessionFormData {
  title: string;
  instructor: string;
  date: string;
  time: string;
  max_participants: number;
  description: string;
}

export default function AdminSessionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    instructor: '',
    date: '',
    time: '',
    max_participants: 20,
    description: '',
  });

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchSessions();
  }, [session, router]);

  async function fetchSessions() {
    try {
      const response = await fetch('/api/admin/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Kunne ikke laste økter. Vennligst prøv igjen senere.');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSession) {
        const response = await fetch(`/api/admin/sessions/${editingSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update session');
      } else {
        const response = await fetch('/api/admin/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create session');
      }

      await fetchSessions();
      resetForm();
    } catch (err) {
      setError('Kunne ikke lagre økt. Vennligst prøv igjen senere.');
      console.error('Error saving session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne økten?')) return;

    try {
      const response = await fetch(`/api/admin/sessions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete session');
      await fetchSessions();
    } catch (err) {
      setError('Kunne ikke slette økt. Vennligst prøv igjen senere.');
      console.error('Error deleting session:', err);
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      instructor: session.instructor,
      date: session.date,
      time: session.time,
      max_participants: session.max_participants,
      description: session.description || '',
    });
  };

  const resetForm = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      instructor: '',
      date: '',
      time: '',
      max_participants: 20,
      description: '',
    });
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-600">Laster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            {editingSession ? 'Rediger Økt' : 'Legg til Ny Økt'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-base font-medium text-neutral-700 mb-2">
                Tittel
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="instructor" className="block text-base font-medium text-neutral-700 mb-2">
                Instruktør
              </label>
              <input
                type="text"
                name="instructor"
                id="instructor"
                required
                value={formData.instructor}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-base font-medium text-neutral-700 mb-2">
                Dato
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-base font-medium text-neutral-700 mb-2">
                Tid
              </label>
              <input
                type="time"
                name="time"
                id="time"
                required
                value={formData.time}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="max_participants" className="block text-base font-medium text-neutral-700 mb-2">
                Maks deltakere
              </label>
              <input
                type="number"
                name="max_participants"
                id="max_participants"
                required
                min="1"
                value={formData.max_participants}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-base font-medium text-neutral-700 mb-2">
                Beskrivelse
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {editingSession && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-neutral-300 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Avbryt
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              {editingSession ? 'Oppdater' : 'Legg til'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Eksisterende Økter</h2>
          </div>
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Økt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Dato & Tid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Deltakere
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900">{session.title}</div>
                    <div className="text-sm text-neutral-500">{session.instructor}</div>
                    {session.description && (
                      <div className="mt-1 text-sm text-neutral-600">{session.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      {new Date(session.date).toLocaleDateString('no-NO')}
                    </div>
                    <div className="text-sm text-neutral-500">{session.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      {session.current_participants} / {session.max_participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-violet-600 hover:text-violet-900 mr-4"
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
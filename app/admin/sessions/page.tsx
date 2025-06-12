"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function AdminSessionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
      if (!session?.user?.id) {
        router.push('/auth/login');
        return;
      }
      const res = await fetch(`/api/users/check-admin?user_id=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        if (!data.isAdmin) {
          router.push('/program');
        }
      }
    };
    checkAdminStatus();
  }, [session?.user?.id, router]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
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
        setSuccess('Session created successfully');
        setShowForm(false);
        setFormData({
          title: "",
          instructor: "",
          date: "",
          time: "",
          max_participants: 20,
          description: "",
        });
      }
    } catch (err) {
      setError('An error occurred while creating the session');
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setSuccess('Session deleted successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete session');
      }
    } catch (err) {
      setError('An error occurred while deleting the session');
    }
  };

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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Manage Training Sessions
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-900 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Session'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={e => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={e => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-900 focus:ring-violet-900"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-violet-900 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors"
              >
                Create Session
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{session.title}</div>
                    <div className="text-sm text-neutral-500">{session.instructor}</div>
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
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
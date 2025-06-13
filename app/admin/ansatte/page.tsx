'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Trainer {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  specialties: string[];
}

interface TrainerFormData {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  specialties: string;
}

// Type assertion for session
type CustomSession = {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string;
  };
} | null;

export default function AdminTrainersPage() {
  const { data: session } = useSession() as { data: CustomSession };
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<TrainerFormData>({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    specialties: '',
  });

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchTrainers();
  }, [session, router]);

  async function fetchTrainers() {
    try {
      const response = await fetch('/api/admin/trainers');
      if (!response.ok) {
        throw new Error('Failed to fetch trainers');
      }
      const data = await response.json();
      setTrainers(data.trainers || []);
    } catch (err) {
      setError('Kunne ikke laste ansatte. Vennligst prøv igjen senere.');
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.role) {
        throw new Error('Navn og rolle er påkrevd');
      }

      const submitData = {
        ...formData,
        specialties: Array.isArray(formData.specialties) 
          ? formData.specialties 
          : (formData.specialties || '').split(',').map(s => s.trim()).filter(Boolean)
      };

      const url = editingTrainer 
        ? `/api/admin/trainers/${editingTrainer.id}`
        : '/api/admin/trainers';
      
      const method = editingTrainer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunne ikke lagre ansatt');
      }

      await fetchTrainers();
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'En uventet feil oppstod';
      console.error('Error details:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne ansatten?')) return;

    try {
      const response = await fetch(`/api/admin/trainers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kunne ikke slette ansatt');
      }

      await fetchTrainers();
    } catch (err) {
      setError('Kunne ikke slette ansatt. Vennligst prøv igjen senere.');
      console.error('Error deleting trainer:', err);
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      role: trainer.role,
      bio: trainer.bio,
      image_url: trainer.image_url,
      specialties: trainer.specialties.join(', '),
    });
  };

  const resetForm = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      specialties: '',
    });
  };

  if (loading && trainers.length === 0) {
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
            {editingTrainer ? 'Rediger Ansatt' : 'Legg til Ny Ansatt'}
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
              <label htmlFor="name" className="block text-base font-medium text-neutral-700 mb-2">
                Navn
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-base font-medium text-neutral-700 mb-2">
                Rolle
              </label>
              <input
                type="text"
                name="role"
                id="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-base font-medium text-neutral-700 mb-2">
                Bilde URL
              </label>
              <input
                type="text"
                name="image_url"
                id="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-base font-medium text-neutral-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="specialties" className="block text-base font-medium text-neutral-700 mb-2">
                Spesialiteter (kommaseparert)
              </label>
              <input
                type="text"
                name="specialties"
                id="specialties"
                value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : formData.specialties}
                onChange={handleSpecialtiesChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-black py-3 px-4"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {editingTrainer && (
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
              {editingTrainer ? 'Oppdater' : 'Legg til'}
            </button>
          </div>
        </form>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Eksisterende Ansatte</h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative aspect-square w-16 flex-shrink-0">
                    <Image
                      src={trainer.image_url || '/images/trainer-placeholder.jpg'}
                      alt={trainer.name}
                      fill
                      className="object-cover rounded-full"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900">{trainer.name}</h3>
                    <p className="text-sm text-violet-900">{trainer.role}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(trainer)}
                    className="px-3 py-1 text-sm text-violet-600 hover:text-violet-900"
                  >
                    Rediger
                  </button>
                  <button
                    onClick={() => handleDelete(trainer.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
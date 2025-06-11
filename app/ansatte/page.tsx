"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Trainer {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  specialties: string[];
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const { data, error } = await supabase
          .from("trainers")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        setTrainers(data || []);
      } catch (err) {
        setError("Failed to load trainers. Please try again later.");
        console.error("Error fetching trainers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-900 mx-auto"></div>
            <p className="mt-4 text-lg text-neutral-600">Loading trainers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            Our Expert Trainers
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Meet our team of dedicated fitness professionals
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={trainer.image_url || "/images/trainer-placeholder.jpg"}
                  alt={trainer.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {trainer.name}
                </h2>
                <p className="mt-1 text-sm text-violet-900">{trainer.role}</p>
                <p className="mt-4 text-neutral-600">{trainer.bio}</p>
                {trainer.specialties && trainer.specialties.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-neutral-900">
                      Specialties:
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {trainer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-900"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {trainers.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-lg text-neutral-600">
              No trainers available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

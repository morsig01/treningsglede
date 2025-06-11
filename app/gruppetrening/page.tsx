"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getMonthDays(year: number, month: number) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function GrupptreningPage() {
  const { data: session } = useSession();
  const [registered, setRegistered] = useState<string | null>(null); // key: date+sessionId
  const [userRegistrations, setUserRegistrations] = useState<{ session_id: number; session_date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = getMonthDays(year, month);

  // Hent brukerens påmeldinger for denne måneden
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user?.id) return;
      const from = new Date(year, month, 1).toISOString().slice(0, 10);
      const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      const res = await fetch(`/api/registrations/user?user_id=${session.user.id}&from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setUserRegistrations(data.registrations || []);
      }
    };
    fetchRegistrations();
  }, [session?.user?.id, year, month]);

  const isUserRegistered = (dateStr: string, sessionId: number) =>
    userRegistrations.some(r => r.session_id === sessionId && r.session_date === dateStr);

  const handleRegister = async (date: string, sessionType: typeof sessionTypes[0]) => {
    if (!session?.user?.id) return;
    setError(null);
    setSuccess(null);
    console.log("user_id fra session:", session.user.id);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          session_id: sessionType.id,
          session_date: date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Kunne ikke registrere deg: " + (data.error || "Ukjent feil"));
      } else {
        setRegistered(date + "-" + sessionType.id);
        setSuccess("Du er påmeldt " + sessionType.title + " den " + date);
        setUserRegistrations((prev) => [
          ...prev,
          { session_id: sessionType.id, session_date: date }
        ]);
      }
    } catch (err: any) {
      setError("Kunne ikke registrere deg: " + err.message);
    }
  };

  const weekdayNames = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

  // For calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = days.length;
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDay).fill(null);
  days.forEach((date) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(date);
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="min-h-screen bg-[#4B1FA6] py-12 px-2">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-8">
          Grupptrening kalender
        </h1>
        <div className="bg-white/10 rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdayNames.map((name, index) => (
              <div key={`weekday-${index}`} className="text-center text-[#2DE1FC] font-bold">
                {name.slice(0, 2)}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2 mb-2">
              {week.map((date, dayIndex) => {
                if (!date) return <div key={`empty-${weekIndex}-${dayIndex}`} />;
                const sessionType = sessionTypes.find((s) => s.weekday === date.getDay());
                const dateStr = date.toISOString().slice(0, 10);
                const isRegistered = isUserRegistered(dateStr, sessionType?.id ?? -1);
                if (sessionType) {
                  return (
                    <button
                      key={`session-${dateStr}-${sessionType.id}`}
                      onClick={() => session && !isRegistered && handleRegister(dateStr, sessionType)}
                      disabled={isRegistered || !session}
                      className={`rounded-lg p-2 min-h-[80px] flex flex-col items-center justify-between w-full h-full focus:outline-none transition-colors duration-200
                        ${isRegistered ? "bg-[#22223b] text-white cursor-not-allowed" :
                          "bg-white/20 hover:bg-[#2DE1FC] hover:text-[#4B1FA6] cursor-pointer"}
                      `}
                      style={{ border: isRegistered ? '2px solid #2DE1FC' : undefined }}
                      type="button"
                    >
                      <div className="text-white font-bold text-lg">{date.getDate()}</div>
                      <div className="text-xs text-white text-center mb-1">{sessionType.title}</div>
                      {isRegistered ? (
                        <span className="text-xs font-bold">Påmeldt!</span>
                      ) : !session ? (
                        <span className="text-xs">Logg inn</span>
                      ) : (
                        <span className="text-xs font-bold">Meld på</span>
                      )}
                    </button>
                  );
                }
                return (
                  <div key={`date-${dateStr}`} className="bg-white/20 rounded-lg p-2 min-h-[80px] flex flex-col items-center justify-between" >
                    <div className="text-white font-bold">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-4">{success}</div>
        )}
      </div>
    </div>
  );
} 
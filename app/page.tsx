"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-neutral-900">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Fitness background"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Din reise mot bedre helse starter her
          </h1>
          <p className="mt-6 text-xl text-neutral-300 max-w-3xl">
            Bli treningsglede meldem og opplev et fellesskap dedikert til å hjelpe
            deg med å nå dine mål, 24/7.
          </p>
          <div className="mt-10">
            {session ? (
              <Link
                href="/profile"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-900 hover:bg-violet-800"
              >
                Din Profil
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-900 hover:bg-violet-800"
                >
                  Kom i gang
                  <svg
                    className="ml-2 -mr-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-neutral-700"
                >
                  Logg inn
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              Hvorfor Treningsglede?
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Alt du trenger for å nå dine treningsmål, samlet på ett sted.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Personlige Treningsplaner
                </h3>
                <p className="mt-2 text-base text-neutral-600">
                  Få skreddersydde treningsprogrammer tilpasset dine mål og
                  ferdigheter.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Fellesskap og Støtte
                </h3>
                <p className="mt-2 text-base text-neutral-600">
                  Bli en del av vårt støttende fellesskap med tilgang til
                  treningsgrupper og forum.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white mb-4">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Omfattende Treningsressurser
                </h3>
                <p className="mt-2 text-base text-neutral-600">
                  Få tilgang til et bredt utvalg av treningsvideoer, artikler
                  og verktøy for å forbedre din trening.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coach-Guided Goals Section */}
      <div className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              Nå dine mål med hjelp fra våre trenere
            </h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
              Våre erfarne trenere er her for å hjelpe deg med å sette og nå
              realistiske mål, uansett hvor du er i din treningsreise.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Coach Approach */}
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">
                    Personlig Målsetting
                  </h3>
                  <p className="mt-2 text-base text-neutral-600">
                    Sammen med en coach setter du spesifikke, målbare og
                    realistiske mål som passer for deg.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">
                    Skreddersydd Treningsprogram
                  </h3>
                  <p className="mt-2 text-base text-neutral-600">
                    Få et treningsprogram som er tilpasset dine mål, ferdigheter
                    og preferanser, med justeringer underveis.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-900 text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">
                    Kontinuerlig Oppfølging
                  </h3>
                  <p className="mt-2 text-base text-neutral-600">
                    Våre trenere følger opp din fremgang, gir tilbakemeldinger
                    og justerer programmet etter behov for å sikre at du når dine
                    mål.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Benefits */}
            <div className="relative">
              <div className="aspect-w-5 aspect-h-3 rounded-lg shadow-lg overflow-hidden">
                <Image
                  src="/images/trainers/reaching-out.jpg"
                  alt="Coach reaching out to client"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/ansatte"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-900 hover:bg-violet-800 shadow-sm"
            >
              Møt Vårt Team
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Outdoor and Indoor Training Section */}
      <section className="relative text-white h-[30vh]">
        <div className="absolute inset-0">
          <Image
            src="/images/jogging.jpg"
            alt="Utendørs og innendørs trening"
            fill
            className="object-cover object-bottom"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-5xl font-bold">
              Tren inne. Tren ute. Bare tren.
            </h2>
            <div className="space-y-6">
              <p className="text-sm sm:text-base text-neutral-200">
                Varierte økter hele året – inne i studioet eller ute i frisk
                luft.
              </p>
              <Link
                href="/program"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-900 hover:bg-violet-800 shadow-sm"
              >
                Se treningsprogram
                <svg
                  className="ml-2 -mr-1 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

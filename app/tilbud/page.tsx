'use client';

import Link from 'next/link';
import Image from "next/image";

const offers = [
  {
    id: 1,
    title: "Egentrening",
    description: [
      "Få fri tilgang til treningssenteret og tren i ditt eget tempo. Perfekt for deg som ønsker fleksibilitet og selvstendighet i treningen.",
      "Tilgang til moderne utstyr og apparater, samt åpne treningsområder for styrke og kondisjon."
    ],
    features: [
      "Fri tilgang til senteret i åpningstiden",
      "Moderne styrke- og kondisjonsapparater",
      "Mulighet for å lage egne treningsprogrammer",
      "Rolig og motiverende treningsmiljø"
    ],
    button: "Start egentrening",
    href: "/medlemskap",
    image: "/images/working-out-alone.jpg"
  },
  {
    id: 2,
    title: "Personlig trener",
    description: [
      "Få skreddersydd oppfølging og motivasjon fra en sertifisert personlig trener. Sammen setter dere mål og lager en plan som passer deg.",
      "Personlig trener hjelper deg med teknikk, progresjon og gir deg ekstra motivasjon."
    ],
    features: [
      "Individuell treningsplan",
      "Personlig oppfølging og veiledning",
      "Fokus på teknikk og skadeforebygging",
      "Motivasjon og støtte hele veien"
    ],
    button: "Bestill PT-time",
    href: "/personlig-trener",
    image: "/images/personal-trainer.jpg"
  },
  {
    id: 3,
    title: "Gruppetrening",
    description: [
      "Bli med på varierte og energiske gruppetimer ledet av dyktige instruktører. Perfekt for deg som liker å trene sammen med andre og ønsker ekstra motivasjon.",
      "Velg mellom alt fra styrke og kondisjon til yoga og dans."
    ],
    features: [
      "Stort utvalg av gruppetimer hver uke",
      "Motiverende og sosialt miljø",
      "Instruktører som tilpasser øktene",
      "Passer for alle nivåer"
    ],
    button: "Se Program",
    href: "/gruppetrening",
    image: "/images/group-workout.jpg"
  }
];

export default function OffersPage() {
  return (
    <div className="min-h-screen py-12 px-2 bg-white text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center  mb-2">
          TRENINGSTILBUD DESIGNET FOR Å HJELPE DEG
        </h1>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-12 text-violet-900">
          NÅ DINE MÅL.
        </h2>
        <div className="space-y-16 p-6">
          {offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center overflow-hidden`}
            >
              <div className="md:w-1/2 w-full h-64 md:h-80 flex-shrink-0">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-wide">
                  {offer.title}
                </h3>
                {offer.description.map((desc, i) => (
                  <p key={i} className="text-base md:text-lg mb-2">
                    {desc}
                  </p>
                ))}
                <ul className="mb-6 mt-4 space-y-2">
                  {offer.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-violet-900 font-medium">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href={offer.href}
                  className="inline-block bg-violet-900 text-white font-bold text-center px-6 py-3 rounded-xl shadow hover:bg-[#1bc9e5] transition-colors"
                >
                  {offer.button}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

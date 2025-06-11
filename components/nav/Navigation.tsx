"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "../Logo";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-violet-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/ansatte"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/ansatte")
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:border-neutral-300 hover:text-white"
                }`}
              >
                Ansatte
              </Link>
              <Link
                href="/tilbud"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/tilbud")
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:border-neutral-300 hover:text-white"
                }`}
              >
                Tilbud
              </Link>
              {session && (
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/profile")
                      ? "border-white text-white"
                      : "border-transparent text-neutral-200 hover:border-neutral-300 hover:text-white"
                  }`}
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="text-neutral-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-neutral-700">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-violet-900 hover:bg-violet-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900"
                >
                  Logg ut
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-l-md text-black bg-white hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900"
                >
                  Logg inn
                </Link>
                <div className="border-l border-neutral-300 h-8"></div>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-r-md text-black bg-white hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900"
                >
                  Registrer
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
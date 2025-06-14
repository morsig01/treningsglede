"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../Logo";

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

export default function Navigation() {
  const { data: session, status } = useSession() as { data: CustomSession, status: string };
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
                Trening
              </Link>
              <Link
                href="/program"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/program")
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:border-neutral-300 hover:text-white"
                }`}
              >
                Program
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="text-neutral-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={session.user?.role === 'admin' ? "/admin" : "/profile"}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-violet-800 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900"
                >
                  <span>
                    {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900"
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

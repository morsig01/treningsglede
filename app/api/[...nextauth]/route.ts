import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '../../../lib/supabase'; // Updated import path

// Define your config directly since we're not using @client/lib/env
const config = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

interface CustomUser {
  id: string;
  email: string;
  name: string;
}

interface CustomSession {
  user: {
    id: string;
    email: string;
  };
  expires: string;
}

const authHandlers = {
  async handleSignup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${config.NEXTAUTH_URL}`,
      },
    });

    if (error) {
      console.error('[AUTH] Signup error:', error);
      throw new Error(error.message);
    }

    if (!data.user?.id) {
      throw new Error(
        'Signup successful. Please check your email for confirmation.'
      );
    }

    return data.user;
  },

  async handleSignIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[AUTH] Signin error:', error);
      throw new Error(error.message);
    }

    if (!data.user?.id) {
      throw new Error('Invalid credentials');
    }

    return data.user;
  },

  async handleResetPassword(email: string) {
    // Implementation for password reset
  },
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password (if required)',
        },
        mode: {
          label: 'Mode',
          type: 'text',
          placeholder: 'signin, signup, or resetpassword',
        },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          const { email, password, mode } = credentials || {};
          const lowerMode = mode?.toLowerCase();

          if (!email) {
            throw new Error('Email is required');
          }

          if (lowerMode !== 'resetpassword' && !password) {
            throw new Error('Password is required for signin or signup');
          }

          const user =
            lowerMode === 'signup'
              ? await authHandlers.handleSignup(email, password!)
              : await authHandlers.handleSignIn(email, password!);

          return {
            id: user.id,
            email: user.email ?? email,
            name: user.email ?? email,
          };
        } catch (error) {
          console.error('[AUTH] Authorization error:', {
            error,
            email: credentials?.email,
            mode: credentials?.mode,
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.lastUpdated = new Date().toISOString();
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          id: token.userId as string,
          email: token.email as string,
        },
        expires: session.expires,
      };
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log('[AUTH] Successful sign-in:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    },
    async signOut({ token }) {
      if (token?.userId) {
        await supabase.auth.signOut();
      }
    },
  },
  secret: config.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
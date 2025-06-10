'use client';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      mode: 'signin',
      redirect: true,
      callbackUrl: '/',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
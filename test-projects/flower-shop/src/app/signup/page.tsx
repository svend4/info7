'use client';

import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <SignupForm />

      <p className="text-center mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}

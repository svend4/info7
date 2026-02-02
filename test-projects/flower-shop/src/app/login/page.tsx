'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flower2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-cream-100 to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Flower2 className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Petal & Bloom
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <LoginForm />

          <p className="text-center mt-6 text-gray-600">
            Do not have an account?{' '}
            <Link
              href="/signup"
              className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

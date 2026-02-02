/**
 * Landing page with authentication
 * Shows login/signup forms for unauthenticated users
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <div className="text-lg font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <div className="text-lg font-medium animate-pulse">Redirecting to dashboard...</div>
      </div>
    );
  }

  const features = [
    { icon: CheckCircle2, text: 'Organize tasks effortlessly' },
    { icon: Zap, text: 'Lightning-fast performance' },
    { icon: Shield, text: 'Secure & reliable' },
    { icon: Sparkles, text: 'Beautiful, modern UI' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-warm">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-20">
        <div className="max-w-xl stagger-item">
          <h1 className="text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6 leading-tight">
            Task Manager
            <span className="block text-primary">Pro</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            The most powerful and beautiful way to organize your work.
            Stay productive, focused, and in control.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-slate-700 stagger-item"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 lg:py-20">
        <Card className="w-full max-w-md shadow-2xl border-0 stagger-item" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-heading font-bold text-center">
              Welcome
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-medium">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

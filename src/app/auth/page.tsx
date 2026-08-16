'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else {
        setMessage('Registration successful! Signing you in...');
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);
        if (data.user) {
          await supabase.from('user_profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            current_session_token: newSessionToken,
            mock_credits_remaining: 20
          });
        }
        router.push('/exam');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else if (data.user) {
        // Generate new session token and update profile
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);

        await supabase
          .from('user_profiles')
          .update({ current_session_token: newSessionToken })
          .eq('id', data.user.id);

        router.push('/exam');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-sm font-black text-blue-400 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" /> BankerViva
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black">{isSignUp ? 'Create Aspirant Account' : 'Sign In to BankerViva'}</h1>
            <p className="text-xs text-slate-400 mt-1">Track mock exam performance, save scores, and access question banks.</p>
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-blue-900/50 border border-blue-500 text-xs text-blue-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="banker@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-blue-400 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
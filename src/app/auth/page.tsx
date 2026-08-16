'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Mail, Lock, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { getOrCreateDeviceId } from '@/lib/deviceFingerprint';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    const { deviceId, deviceName } = getOrCreateDeviceId();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else if (data.user) {
        setMessage('Registration successful! Setting up device lock...');
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);

        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          current_session_token: newSessionToken,
          mock_credits_remaining: 20,
          registered_devices: [
            {
              device_id: deviceId,
              device_name: deviceName,
              registered_at: new Date().toISOString()
            }
          ]
        });

        router.push('/dashboard');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else if (data.user) {
        // Enforce max 2 registered devices limit
        const { data: devCheck, error: devErr } = await supabase.rpc('register_or_verify_device', {
          p_user_id: data.user.id,
          p_device_id: deviceId,
          p_device_name: deviceName
        });

        if (devErr) {
          console.error(devErr);
        }

        if (devCheck && !devCheck.allowed) {
          await supabase.auth.signOut();
          setErrorMessage('Account locked to 2 registered devices. Contact support or use an authorized device.');
          setLoading(false);
          return;
        }

        // Generate session token
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);

        await supabase
          .from('user_profiles')
          .update({ current_session_token: newSessionToken })
          .eq('id', data.user.id);

        router.push('/dashboard');
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
            <p className="text-xs text-slate-400 mt-1">Single-user license restricted to max 2 personal devices.</p>
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-blue-900/50 border border-blue-500 text-xs text-blue-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {message}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-600 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {errorMessage}
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
              {loading ? 'Validating...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
                setMessage('');
              }}
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
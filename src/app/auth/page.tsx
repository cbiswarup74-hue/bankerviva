'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Mail, Lock, ArrowLeft, CheckCircle, AlertTriangle, KeyRound, RefreshCw } from 'lucide-react';
import { getOrCreateDeviceId } from '@/lib/deviceFingerprint';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    const { deviceId, deviceName } = getOrCreateDeviceId();
    const cleanEmail = email.trim().toLowerCase();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.user) {
        setMessage('Registration successful! Setting up device lock...');
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName || cleanEmail.split('@')[0],
          current_session_token: newSessionToken,
          mock_credits_remaining: 20,
          plan_type: 'guest',
          enrolled_package: 'Free Trial / Demo',
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
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
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password 
      });

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
          console.error('Device check RPC notice:', devErr);
        }

        if (devCheck && !devCheck.allowed) {
          await supabase.auth.signOut();
          setErrorMessage('Account locked to 2 registered devices. Contact support or use an authorized device.');
          setLoading(false);
          return;
        }

        // Generate and update active session token
        const newSessionToken = crypto.randomUUID();
        localStorage.setItem('bankerviva_session_token', newSessionToken);

        await supabase
          .from('user_profiles')
          .update({ current_session_token: newSessionToken })
          .eq('id', data.user.id);

        // Fetch subscription validity details
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan_type, subscription_end_date, enrolled_package')
          .eq('id', data.user.id)
          .single();

        if (profile?.subscription_end_date) {
          const expiryDate = new Date(profile.subscription_end_date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          if (profile.plan_type === 'pro' || profile.plan_type === 'institutional') {
            alert(`Welcome back! Your ${profile.enrolled_package || 'PRO'} package is Active and Valid till: ${expiryDate}`);
          }
        }

        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setForgotSent(true);
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none relative">
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-sm font-black text-blue-400 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" /> BankerViva
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
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
            {isSignUp && (
              <div>
                <label className="text-xs font-bold uppercase text-slate-300">Full Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>
            )}

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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-300">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSent(false);
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Validating...
                </>
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
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
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered Email to receive a secure recovery link.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 space-y-3 text-center">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <p>Recovery email dispatched! Please check your inbox or spam folder.</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Enter registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
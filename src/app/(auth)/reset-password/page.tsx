'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Card, Button, Input, Alert, Spinner } from '@/components/ui';

type Mode = 'request' | 'reset';

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedTokens, setHasCheckedTokens] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    if (hasCheckedTokens) return;
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const searchParamsUrl = new URLSearchParams(search.replace('?', ''));

    const accessToken = hashParams.get('access_token') || searchParamsUrl.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParamsUrl.get('refresh_token');
    const type = hashParams.get('type') || searchParamsUrl.get('type');
    const code = searchParamsUrl.get('code');

    if ((accessToken && refreshToken && type === 'recovery') || code) {
      setMode('reset');
      setIsLoading(true);
      setErr(null);
      setNotice(null);

      const supabase = getSupabaseBrowserClient();
      const setSession = async () => {
        if (accessToken && refreshToken && type === 'recovery') {
          return supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
        if (code) {
          return supabase.auth.exchangeCodeForSession(code);
        }
        return { data: null, error: null };
      };

      setSession()
        .then(async ({ data, error }) => {
          if (error || !data?.session) {
            setErr('Reset link is invalid or expired. Please request a new one.');
            setMode('request');
            return;
          }
          const userEmail = data.session.user.email ?? '';
          if (userEmail) {
            setEmail(userEmail);
          }
          setIsResetComplete(false);
        })
        .catch(() => {
          setErr('Reset link is invalid or expired. Please request a new one.');
          setMode('request');
        })
        .finally(() => {
          setIsLoading(false);
          setHasCheckedTokens(true);

          // Clean hash so it does not linger in history.
          window.location.hash = '';
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, document.title, url.toString());
        });
      return;
    }

    setHasCheckedTokens(true);
  }, [hasCheckedTokens]);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setErr(payload?.message || 'Could not send reset email');
        setIsLoading(false);
        return;
      }

      setNotice('Check your email for a reset link.');
    } catch (error) {
      console.error('Reset request error:', error);
      setErr('Could not send reset email');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);

    if (!password) {
      setErr('Please enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErr(error.message || 'Could not update password');
        setIsLoading(false);
        return;
      }

      await supabase.auth.signOut();
      setIsResetComplete(true);
      setNotice('Password updated. You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      setErr('Could not update password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start pt-8 sm:items-center sm:pt-0 justify-center bg-background p-4 transition-colors overflow-auto">
      <div className="w-full max-w-md">
        <Card className="p-5 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              {mode === 'reset' ? 'Set a new password' : 'Reset your password'}
            </h3>
            <p className="text-foreground-secondary mt-1">
              {mode === 'reset'
                ? 'Choose a new password to finish resetting your account.'
                : 'Enter your email and we will send you a reset link.'}
            </p>
          </div>

          {mode === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Sending reset link...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled
              />
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                disabled={isResetComplete}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isResetComplete}
              />

              <Button type="submit" className="w-full py-3" disabled={isLoading || isResetComplete}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Updating password...
                  </span>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          )}

          {(err || notice) && (
            <div className="mt-6 space-y-3">
              {err && <Alert variant="error">{err}</Alert>}
              {notice && <Alert variant="success">{notice}</Alert>}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-foreground-secondary">
            <Link href="/login" className="text-info-600 dark:text-info-500 hover:underline">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

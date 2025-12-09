'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Card, Button, Input, Alert, Spinner } from '@/components/ui';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);

    try {
      const authData = await signIn(email, password);
      if (!authData || !authData.session) {
        setErr('Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Redirect to the requested page or the default app page
      const redirectUrl = redirectTo || `/app/${authData.session.clientSlug}/home`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Login error:', error);
      setErr('An error occurred during login');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start pt-8 sm:items-center sm:pt-0 justify-center bg-background p-4 transition-colors overflow-auto">
      <div className="w-full max-w-md">
        {/* Toggle Tabs */}
        <Card className="overflow-hidden p-0">
          <div className="flex border-b border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                isLogin
                  ? 'bg-interactive text-foreground-inverse'
                  : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                !isLogin
                  ? 'bg-interactive text-foreground-inverse'
                  : 'bg-surface-elevated text-foreground-secondary hover:text-foreground'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {isLogin ? 'Welcome back' : 'Get started'}
              </h3>
              <p className="text-foreground-secondary mt-1">
                {isLogin
                  ? 'Log in to continue'
                  : 'Create your account to start building bots'
                }
              </p>
            </div>

          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter demo password"
            />

            <Button type="submit" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Log in to Dashboard' : 'Create Account'
              )}
            </Button>

            {err && (
              <Alert variant="error">{err}</Alert>
            )}
          </div>

          {!isLogin && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-foreground-tertiary text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* Logo at bottom */}
          <div className="mt-6 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 586.27 166.98" className="h-6 text-foreground" fill="currentColor">
              <g id="Layer_2" data-name="Layer 2">
                <g id="Laag_2" data-name="Laag 2">
                  <path d="M267,109.19c0-16.4,12.71-27.91,30.52-27.91s30,10.75,30,27.59-12.71,28.56-30.41,28.56S267,126.24,267,109.19Zm44.31.21c0-8.69-5.76-14.23-14-14.23s-14.12,5.43-14.12,14.34,6,14.45,14.12,14.45,14-5.76,14-14.55Z"/>
                  <path d="M353.24,66.61V82.36h10.64V95.5H353.24v40.84h-16V95.5h-6.73V82.36h6.73V66.61Z"/>
                  <path d="M364.88,129l7.06-10.54A19.61,19.61,0,0,0,386.06,125c4.13,0,7.39-1.85,7.39-5.21,0-3.15-1.74-4.24-9.67-5.76-9.67-2.06-14.45-7.28-14.45-15.53,0-9.78,7.82-17.27,20.09-17.27,7.82,0,13.58,2.39,17.38,5.21l-5.21,10.32a17.71,17.71,0,0,0-10.86-4.13c-3.26,0-6,1.19-6,3.91s1.85,4,8.36,5.54c10.75,2.5,15.64,7.06,15.64,15.86,0,11.19-7.93,19.44-22.16,19.44-9.78,0-17.81-4.24-21.72-8.47Z"/>
                  <path d="M413.86,109.19c0-16.4,12.71-27.91,30.52-27.91s30,10.75,30,27.59S461.65,137.43,444,137.43,413.86,126.24,413.86,109.19Zm44.31.21c0-8.69-5.76-14.23-14-14.23S430,100.6,430,109.51,436,124,444.16,124s14-5.76,14-14.55Z"/>
                  <path d="M476.46,128c0-5.54,4-9.34,9.56-9.34s9.45,3.8,9.45,9.34-3.69,9.45-9.45,9.45S476.46,133.74,476.46,128Z"/>
                  <path d="M499.68,109.4c0-16.08,11.19-28.13,26-28.13,7.28,0,14.23,3,17.81,7.93h.11V82.36h16.08v54H543.56V130h-.11c-4,4.78-10.54,7.39-17.92,7.39-15.42,0-25.85-11.3-25.85-28Zm44.85-.32c0-8.8-6.08-14.45-14.34-14.45S516,100.6,516,109.29s5.54,14.77,13.79,14.77c8.91,0,14.77-6.19,14.77-15Z"/>
                  <path d="M568.14,63.14a9.07,9.07,0,0,1,18.13,0c0,5.54-3.58,9-9.12,9S568.14,68.67,568.14,63.14Zm17.05,19.22v54.09h-16V82.36Z"/>
                  <path d="M221.52,136.43l-1.08-29.14c0-6.36,2.17-11.54,9-11.54a13.07,13.07,0,0,1,5.67,1.3,11.94,11.94,0,0,1,4.53,3.87,11.5,11.5,0,0,1,1.92,5.33l3.67,30.17h20.19l-4.29-31.63c-2.41-12.73-13.26-22.75-27-24.43a33.14,33.14,0,0,0-4.12-.25c-17.73,0-28.8,13.5-28.8,30.09v26.23Z"/>
                </g>
                <g id="Layer_2-2" data-name="Layer 2">
                  <path d="M154.71,0H12.27A12.27,12.27,0,0,0,0,12.27V154.71A12.27,12.27,0,0,0,12.27,167H154.71A12.27,12.27,0,0,0,167,154.71V12.27A12.27,12.27,0,0,0,154.71,0ZM126,134.48l-33.07.33L74.51,62.19a14.33,14.33,0,0,0-7.64-9.37A15.82,15.82,0,0,0,60,51.23c-8.3,0-11,6.32-11,14.07l2.56,69.15h-26V68.86c0-20.23,13.5-36.7,35.13-36.7a42.06,42.06,0,0,1,5,.31c16.72,2.05,30,14.26,32.89,29.79l4.78,21.67a1.69,1.69,0,0,0,3.32-.15L113,33.83l28.43.06Z"/>
                </g>
              </g>
            </svg>
          </div>
        </form>
        </Card>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { clients } from '@/lib/data';

export default function LoginPage() {
  const [email, setEmail] = useState(clients[0].login.email);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Sign up
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = signIn(email, password);
    if (!session) { setErr('Invalid credentials'); return; }
    window.location.href = '/app';
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.28 595.28" width="40" height="40" className="text-white">
                <path d="M188.63,447.14h-85.83c-16.82,0-30.55-13.4-31-30.22-.75-27.61-.24-68.5,7.16-98,12.21-48.62,47.21-109.73,109.35-142.66,52.76-27.97,105.14-29.01,142.87-30.07,17.5-.49,31.83,13.7,31.74,31.21-.09,16.39-.43,55.47.37,73.93,1.66,37.96,31.63,46.31,46.37,46.31,38.09,0,54.52-3.7,85.4-1.33,16.18,1.24,28.67,14.7,28.67,30.92v90.86c0,17.13-13.88,31.01-31.01,31.01h-90.06c-17.29,0-31.25-14.13-31.01-31.42.27-19.36.33-42.56-.65-53.79-2.01-23.01-11.59-65.84-64.59-66.04-53-.2-76.05,23.06-82.72,48.27-3.4,12.86-4.07,45.34-4.05,70.02.02,17.13-13.88,31.01-31.01,31.01Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">notso.ai</h1>
              <p className="text-sm text-gray-600">AI Mascot Platform</p>
            </div>
          </div>
        </div>
        
        {/* Toggle Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                isLogin 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                !isLogin 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome back' : 'Get started'}
              </h3>
              <p className="text-gray-600 mt-1">
                {isLogin 
                  ? 'Choose a demo account to continue' 
                  : 'Create your account to start building bots'
                }
              </p>
            </div>
          
          <div className="space-y-6">
            {isLogin ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Demo Account
                </label>
                <select 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.login.email}>
                      {c.name} — {c.login.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all" 
                  placeholder="Enter your email"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all" 
                placeholder="Enter demo password"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              {isLogin ? 'Log in to Dashboard' : 'Create Account'}
            </button>
            
            {err && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{err}</p>
              </div>
            )}
          </div>
          
          {!isLogin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}
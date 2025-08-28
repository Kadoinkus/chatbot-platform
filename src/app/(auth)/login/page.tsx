'use client';
import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { clients } from '@/lib/data';
import { Bot } from 'lucide-react';

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
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">NotsoAI</h1>
              <p className="text-sm text-gray-600">AI Platform</p>
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
          
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4">Demo Credentials:</p>
              <div className="space-y-3">
                {clients.map(c => (
                  <div key={c.id} className="text-xs bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-gray-700 mb-1">{c.name}</div>
                    <div className="text-gray-500">
                      <span className="font-mono">{c.login.email}</span> • 
                      <span className="font-mono ml-1">{c.login.password}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
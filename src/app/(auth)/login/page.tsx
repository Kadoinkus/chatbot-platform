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

          <form onSubmit={handleSubmit} className="p-8 pb-2">
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
          
          {/* Logo at bottom */}
          <div className="mt-2 flex justify-center">
            <svg viewBox="0 0 790.67 153.33" width="82" height="16" className="text-black">
              <path d="M743.08,10.93h26.79v26.27h-26.79V10.93ZM743.73,57.64h25.5v80.05h-25.5V57.64Z" fill="currentColor"/>
              <path d="M292.43,88.21c0,7.77-1.22,14.86-3.66,21.26-2.44,6.41-5.94,11.89-10.49,16.46-4.56,4.57-10.06,8.09-16.52,10.58-6.46,2.49-13.67,3.73-21.63,3.73s-15.51-1.24-22-3.73c-6.49-2.49-12-6.01-16.52-10.58-4.52-4.56-7.98-10.05-10.38-16.46-2.4-6.41-3.6-13.49-3.6-21.26s1.22-14.86,3.66-21.26c2.44-6.41,5.94-11.89,10.49-16.46,4.55-4.56,10.06-8.09,16.52-10.58,6.46-2.49,13.67-3.73,21.63-3.73s15.51,1.24,22,3.73c6.49,2.49,12,6.02,16.52,10.58,4.52,4.57,7.98,10.05,10.38,16.46,2.4,6.41,3.6,13.49,3.6,21.26ZM266.07,88.21c0-5.25-.65-9.88-1.94-13.9-1.29-4.02-3.08-7.39-5.38-10.12-2.3-2.73-5.06-4.77-8.29-6.13-3.23-1.36-6.74-2.04-10.54-2.04s-7.19.68-10.38,2.04c-3.19,1.36-5.94,3.41-8.23,6.13-2.3,2.73-4.09,6.1-5.38,10.12-1.29,4.02-1.94,8.66-1.94,13.9s.65,9.88,1.94,13.9c1.29,4.02,3.1,7.38,5.43,10.07,2.33,2.69,5.09,4.74,8.29,6.13,3.19,1.4,6.69,2.1,10.49,2.1s7.28-.7,10.44-2.1c3.16-1.4,5.88-3.44,8.18-6.13,2.29-2.69,4.09-6.05,5.38-10.07,1.29-4.02,1.94-8.65,1.94-13.9Z" fill="currentColor"/>
              <path d="M373.4,137.59c-2.87.82-6.29,1.46-10.28,1.94-3.98.48-7.69.72-11.14.72-8.75,0-15.91-1.35-21.47-4.04-5.56-2.69-9.49-6.56-11.78-11.6-1.65-3.61-2.47-8.52-2.47-14.72v-51.32h-19.48v-19.93h19.48V10.93h25.5v27.7h30.13v19.93h-30.13v48.15c0,3.82.61,6.64,1.83,8.48,2.15,3.14,6.42,4.7,12.8,4.7,2.94,0,5.86-.22,8.77-.66,2.91-.44,5.65-1,8.23-1.69v20.04Z" fill="currentColor"/>
              <path d="M443.82,108.96c0-2.11-.63-3.85-1.88-5.21-1.26-1.36-2.92-2.5-5-3.42-2.08-.92-4.46-1.72-7.16-2.4-2.69-.68-5.51-1.36-8.45-2.04-3.73-.95-7.32-2.06-10.76-3.32-3.44-1.26-6.48-2.91-9.09-4.96-2.62-2.04-4.7-4.62-6.24-7.72-1.54-3.1-2.31-6.9-2.31-11.4,0-5.52,1.04-10.31,3.12-14.36,2.08-4.05,4.9-7.41,8.45-10.07,3.55-2.66,7.67-4.63,12.38-5.93,4.7-1.29,9.67-1.94,14.9-1.94,6.38,0,12.38.5,17.97,1.48,5.6.99,10.65,2.27,15.17,3.83v19.73c-2.37-.75-4.86-1.45-7.48-2.1-2.62-.65-5.27-1.21-7.96-1.69-2.69-.48-5.36-.87-8.02-1.18-2.65-.31-5.17-.46-7.53-.46-3.01,0-5.56.27-7.64.82-2.08.55-3.77,1.28-5.06,2.2s-2.22,1.98-2.8,3.17c-.58,1.19-.86,2.44-.86,3.73,0,2.25.63,4.09,1.88,5.52,1.25,1.43,2.99,2.59,5.22,3.48,2.22.89,4.55,1.62,6.99,2.2,2.44.58,4.81,1.14,7.1,1.69,3.59.82,7.17,1.81,10.76,2.96,3.59,1.16,6.81,2.78,9.68,4.86,2.87,2.08,5.22,4.77,7.05,8.08,1.83,3.31,2.74,7.51,2.74,12.62,0,5.59-1.11,10.46-3.34,14.62-2.22,4.16-5.33,7.62-9.31,10.38s-8.75,4.8-14.31,6.13c-5.56,1.33-11.67,1.99-18.35,1.99s-12.54-.5-17.81-1.48c-5.27-.99-9.63-2.23-13.07-3.73v-19.52c5.6,1.98,10.76,3.32,15.5,4.04,4.73.72,9.15,1.07,13.24,1.07,3.16,0,6.1-.22,8.82-.66,2.73-.44,5.07-1.14,7.05-2.1,1.97-.95,3.53-2.16,4.68-3.63,1.15-1.46,1.72-3.22,1.72-5.26Z" fill="currentColor"/>
              <path d="M586.13,88.21c0,7.77-1.22,14.86-3.66,21.26-2.44,6.41-5.94,11.89-10.49,16.46-4.56,4.57-10.06,8.09-16.52,10.58-6.46,2.49-13.67,3.73-21.63,3.73s-15.51-1.24-22-3.73c-6.49-2.49-12-6.01-16.52-10.58-4.52-4.56-7.98-10.05-10.38-16.46-2.4-6.41-3.6-13.49-3.6-21.26s1.22-14.86,3.66-21.26c2.44-6.41,5.94-11.89,10.49-16.46,4.55-4.56,10.06-8.09,16.52-10.58,6.46-2.49,13.67-3.73,21.63-3.73s15.51,1.24,22,3.73c6.49,2.49,12,6.02,16.52,10.58,4.52,4.57,7.98,10.05,10.38,16.46,2.4,6.41,3.6,13.49,3.6,21.26ZM559.77,88.21c0-5.25-.65-9.88-1.94-13.9-1.29-4.02-3.08-7.39-5.38-10.12-2.3-2.73-5.06-4.77-8.29-6.13-3.23-1.36-6.74-2.04-10.54-2.04s-7.19.68-10.38,2.04c-3.19,1.36-5.94,3.41-8.23,6.13-2.3,2.73-4.09,6.1-5.38,10.12-1.29,4.02-1.94,8.66-1.94,13.9s.65,9.88,1.94,13.9c1.29,4.02,3.1,7.38,5.43,10.07,2.33,2.69,5.09,4.74,8.29,6.13,3.19,1.4,6.69,2.1,10.49,2.1s7.28-.7,10.44-2.1c3.16-1.4,5.88-3.44,8.18-6.13,2.29-2.69,4.09-6.05,5.38-10.07,1.29-4.02,1.94-8.65,1.94-13.9Z" fill="currentColor"/>
              <path d="M593.28,110.39h28.95v27.29h-28.95v-27.29Z" fill="currentColor"/>
              <path d="M701.19,127.16h-.43c-1.44,1.43-3.16,2.9-5.17,4.4-2.01,1.5-4.3,2.91-6.89,4.24-2.58,1.33-5.45,2.4-8.61,3.22-3.16.82-6.56,1.23-10.22,1.23-4.95,0-9.58-.73-13.88-2.2-4.3-1.46-8-3.58-11.08-6.34-3.08-2.76-5.51-6.1-7.26-10.02-1.76-3.92-2.64-8.3-2.64-13.14,0-5.32,1.02-10.08,3.07-14.31,2.04-4.22,4.9-7.8,8.55-10.73,3.66-2.93,8.03-5.16,13.13-6.7,5.09-1.53,10.72-2.3,16.89-2.3,4.52,0,8.68.27,12.48.82,3.8.55,7.14,1.19,10.01,1.94v-3.99c0-2.32-.41-4.55-1.24-6.7-.83-2.15-2.15-4.05-3.98-5.72-1.83-1.67-4.21-3-7.16-3.99-2.94-.99-6.53-1.48-10.76-1.48-5.17,0-10.33.55-15.5,1.63-5.17,1.09-10.76,2.73-16.79,4.91v-18.91c5.24-2.18,10.8-3.85,16.68-5.01,5.88-1.16,12.05-1.77,18.51-1.84,7.6,0,14.26.89,19.96,2.66,5.7,1.77,10.47,4.21,14.31,7.31,3.84,3.1,6.71,6.76,8.61,10.99,1.9,4.23,2.85,8.83,2.85,13.8v37.31c0,6.54.07,12.17.22,16.87.14,4.7.29,8.89.43,12.57h-23.03l-1.08-10.53ZM699.15,95.47c-2.44-.54-5.24-1.04-8.39-1.48-3.16-.44-6.35-.66-9.58-.66-6.24,0-11.17,1.18-14.8,3.53-3.62,2.35-5.43,5.95-5.43,10.78,0,2.25.41,4.21,1.24,5.88.82,1.67,1.94,3.05,3.34,4.14,1.4,1.09,3.03,1.91,4.9,2.45,1.86.55,3.84.82,5.92.82,2.58,0,5.02-.32,7.32-.97,2.29-.65,4.41-1.46,6.35-2.45,1.94-.99,3.68-2.09,5.22-3.32,1.54-1.23,2.85-2.42,3.93-3.58v-15.13Z" fill="currentColor"/>
              <path d="M57.46,139.87h-29.57c-5.8,0-10.52-4.62-10.68-10.41-.26-9.51-.08-23.6,2.47-33.76,4.21-16.75,16.27-37.8,37.68-49.15,18.18-9.63,36.22-9.99,49.22-10.36,6.03-.17,10.97,4.72,10.94,10.75-.03,5.65-.15,19.11.13,25.47.57,13.08,10.9,15.95,15.98,15.95,13.12,0,18.78-1.27,29.42-.46,5.57.43,9.88,5.06,9.88,10.65v31.3c0,5.9-4.78,10.68-10.68,10.68h-31.03c-5.96,0-10.77-4.87-10.68-10.82.09-6.67.11-14.66-.22-18.53-.69-7.93-3.99-22.68-22.25-22.75s-26.2,7.94-28.5,16.63c-1.17,4.43-1.4,15.62-1.39,24.13,0,5.9-4.78,10.68-10.68,10.68Z" fill="currentColor"/>
            </svg>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
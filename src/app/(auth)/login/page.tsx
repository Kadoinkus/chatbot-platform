'use client';
import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { clients } from '@/lib/data';
export default function LoginPage() {
  const [email, setEmail] = useState(clients[0].login.email);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = signIn(email, password);
    if (!session) { setErr('Invalid credentials'); return; }
    window.location.href = '/app';
  }
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 bg-white">
        <h1 className="text-xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-600">Use one of the demo accounts below.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <select value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border px-3 py-2">
            {clients.map(c => (<option key={c.id} value={c.login.email}>{c.name} — {c.login.email}</option>))}
          </select>
          <label className="block text-sm font-medium mt-4">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full rounded-xl border px-3 py-2" placeholder="Enter demo password" />
          <button className="mt-6 w-full rounded-xl brand-bg brand-hover text-white font-semibold py-2.5">Sign in</button>
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        </div>
        <div className="mt-6 text-xs text-neutral-600">
          <div>Demo logins:</div>
          <ul className="list-disc pl-5">
            {clients.map(c => (<li key={c.id}><b>{c.name}</b> — email: <code>{c.login.email}</code> — password: <code>{c.login.password}</code></li>))}
          </ul>
        </div>
      </form>
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { KeyRound, Mail } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { useAuth } from '@/context/AuthContext';
import { login as loginApi } from '@/services/authService';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi({ email, password });
      login(data.token, data.user);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Gagal masuk ke akun');
      } else {
        setError('Gagal masuk ke akun');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Smart Resource Optimizer"
      eyebrow="Masuk"
      title="Masuk ke akun Anda"
      description="Lanjutkan pengelolaan donasi makanan, cek status verifikasi, dan pantau aktivitas terbaru tanpa tampilan yang gelap."
      sideTitle="Satu pintu untuk restoran dan komunitas bergerak lebih cepat."
      sideDescription="Halaman masuk kini dibuat senada dengan dashboard utama: terang, bersih, dan fokus pada alur kerja harian Anda."
      ctaText="Belum punya akun?"
      ctaLabel="Daftar sekarang"
      ctaHref="/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {registered && !error && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Registrasi berhasil. Silakan masuk menggunakan akun Anda.
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <Mail className="h-5 w-5 text-emerald-600" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@contoh.com"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <span className="text-xs font-medium text-slate-400">Minimal 8 karakter</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Dengan masuk, Anda siap melanjutkan distribusi yang lebih tertata bersama SRO.
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-slate-50" />}>
      <LoginContent />
    </Suspense>
  );
}

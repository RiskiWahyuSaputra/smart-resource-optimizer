'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, MapPin, ShieldCheck, Store, Upload, UserRound, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { register as registerApi } from '@/services/authService';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'restaurant',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password belum sama');
      return;
    }

    if (!documentFile) {
      setError('Dokumen verifikasi wajib diunggah');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      payload.append('verification_document', documentFile);
      if (formData.role === 'restaurant' && storeImageFile) {
        payload.append('store_image', storeImageFile);
      }

      await registerApi(payload);
      router.push('/login?registered=true');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Gagal membuat akun');
      } else {
        setError('Gagal membuat akun');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Akun Baru SRO"
      eyebrow="Daftar"
      title="Buat akun baru"
      description="Daftarkan restoran atau komunitas Anda untuk mulai membagikan dan menerima makanan berlebih dengan antarmuka yang konsisten."
      sideTitle="Mulai kolaborasi distribusi makanan dengan tampilan yang lebih hangat."
      sideDescription="Form pendaftaran disusun ulang agar selaras dengan dashboard utama: terang, terstruktur, dan mudah diisi dari perangkat apa pun."
      ctaText="Sudah punya akun?"
      ctaLabel="Masuk di sini"
      ctaHref="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Nama lengkap
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
              <UserRound className="h-5 w-5 text-emerald-600" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama penanggung jawab"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="organisasi@contoh.com"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
              Tipe akun
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`rounded-2xl border p-4 transition-all ${formData.role === 'restaurant' ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-slate-50 hover:border-emerald-200'}`}>
                <input
                  type="radio"
                  name="role"
                  value="restaurant"
                  checked={formData.role === 'restaurant'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Restoran</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Untuk pemilik usaha yang ingin membagikan makanan berlebih.</p>
                  </div>
                </div>
              </label>

              <label className={`rounded-2xl border p-4 transition-all ${formData.role === 'community' ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-slate-50 hover:border-emerald-200'}`}>
                <input
                  type="radio"
                  name="role"
                  value="community"
                  checked={formData.role === 'community'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Komunitas</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Untuk organisasi sosial atau relawan yang menerima distribusi.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
              Alamat
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat operasional"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="verification_document" className="block text-sm font-semibold text-slate-700">
              Dokumen verifikasi
            </label>
            <label
              htmlFor="verification_document"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-4 transition-all hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {documentFile ? documentFile.name : 'Unggah PDF, JPG, atau PNG'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Maksimal 5MB. Dokumen ini akan diperiksa admin.</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Pilih File
              </span>
            </label>
            <input
              id="verification_document"
              name="verification_document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={(e) => {
                const nextFile = e.target.files?.[0] ?? null;
                setDocumentFile(nextFile);
              }}
            />
          </div>

          {formData.role === 'restaurant' && (
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="store_image" className="block text-sm font-semibold text-slate-700">
                Foto Toko / Supermarket
              </label>
              <label
                htmlFor="store_image"
                className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-4 transition-all hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {storeImageFile ? storeImageFile.name : 'Unggah Foto Toko'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Maksimal 5MB. Foto ini akan tampil di peta.</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Pilih Foto
                </span>
              </label>
              <input
                id="store_image"
                name="store_image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const nextFile = e.target.files?.[0] ?? null;
                  setStoreImageFile(nextFile);
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700">
              Konfirmasi password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Ulangi password"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-emerald-600" />
            <p>Unggah dokumen pendukung agar admin bisa meninjau dan mengaktifkan akun Anda lebih cepat.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <p>Setelah daftar, tim akan meninjau data akun Anda sebelum fitur penuh di dashboard diaktifkan.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Dengan mendaftar, Anda mulai terhubung ke ekosistem distribusi pangan yang lebih tertata.
        </p>

        <p className="text-center text-sm text-slate-500 md:hidden">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

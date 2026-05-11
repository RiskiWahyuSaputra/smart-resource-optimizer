'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthShellProps = {
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  sideTitle: string;
  sideDescription: string;
  ctaLabel: string;
  ctaHref: string;
  ctaText: string;
  children: ReactNode;
};

const highlights = [
  {
    title: 'Distribusi lebih cepat',
    description: 'Pantau donasi, klaim, dan status verifikasi dalam satu alur yang rapi.',
  },
  {
    title: 'Aman untuk tim',
    description: 'Akses akun terjaga dan siap dipakai restoran maupun komunitas.',
  },
  {
    title: 'Selaras dengan dashboard',
    description: 'Tampilan dibuat senada agar perpindahan dari auth ke dashboard terasa mulus.',
  },
];

export default function AuthShell({
  badge,
  eyebrow,
  title,
  description,
  sideTitle,
  sideDescription,
  ctaLabel,
  ctaHref,
  ctaText,
  children,
}: AuthShellProps) {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.10),_transparent_24%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <div className="hidden rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur md:block lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <Image src="/images/logo-sro.png" alt="SRO Logo" width={16} height={16} className="h-4 w-4 object-contain" />
            {badge}
          </div>

          <div className="mt-8 space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
              {eyebrow}
            </p>
            <h1 className="max-w-lg text-4xl font-bold leading-tight text-slate-950 lg:text-5xl">
              {sideTitle}
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              {sideDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                    {item.title === 'Distribusi lebih cepat' ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {eyebrow}
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-100 sm:flex">
                <Image src="/images/logo-sro.png" alt="SRO Logo" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
            </div>

            {children}

            <div className="mt-8 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-200">
              <span>{ctaText} </span>
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

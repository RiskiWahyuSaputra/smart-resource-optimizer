'use client';

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Leaf,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getFoodPosts, type MarketplaceFoodPost } from "@/services/marketplaceService";

const MapView = dynamic(() => import('@/components/marketplace/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
      <p className="text-slate-400 font-medium">Memuat peta lokasi makanan...</p>
    </div>
  ),
});

function normalizeCoordinate(value: number | string | null | undefined, fallback: number) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

const howItWorksSteps = [
  {
    step: "01",
    progress: "33%",
    title: "Restoran Memposting",
    description:
      "Restoran mengunggah makanan berlebih yang masih layak konsumsi lengkap dengan jumlah, foto, lokasi, dan batas waktu pengambilan.",
    meta: "Posting terverifikasi",
    icon: Leaf,
    accent: "emerald",
  },
  {
    step: "02",
    progress: "66%",
    title: "Komunitas Menemukan",
    description:
      "Komunitas melihat pilihan terdekat melalui marketplace dan peta, lalu mengajukan klaim sesuai kebutuhan distribusi.",
    meta: "Matching berbasis lokasi",
    icon: MapPin,
    accent: "sky",
  },
  {
    step: "03",
    progress: "100%",
    title: "Distribusi Aman",
    description:
      "Restoran menyetujui klaim, komunitas mengambil makanan, dan seluruh proses tercatat agar distribusi tetap transparan.",
    meta: "Jejak distribusi jelas",
    icon: ShieldCheck,
    accent: "amber",
  },
] as const;

const progressCardStyles = {
  emerald: {
    icon: "bg-emerald-600 text-white shadow-emerald-900/20",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    meter: "bg-emerald-500",
    dot: "bg-emerald-500 ring-emerald-100",
  },
  sky: {
    icon: "bg-sky-600 text-white shadow-sky-900/20",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    meter: "bg-sky-500",
    dot: "bg-sky-500 ring-sky-100",
  },
  amber: {
    icon: "bg-amber-500 text-white shadow-amber-900/20",
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    meter: "bg-amber-500",
    dot: "bg-amber-500 ring-amber-100",
  },
} as const;

export default function Home() {
  const [foodPosts, setFoodPosts] = useState<MarketplaceFoodPost[]>([]);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);
  const howItWorksRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadFoodPosts = async () => {
      try {
        const data = await getFoodPosts();
        setFoodPosts(data.food_posts ?? []);
      } catch (error) {
        console.error('Failed to load food posts:', error);
        setFoodPosts([]); // Set empty array on error
      }
    };
    void loadFoodPosts();
  }, []);

  useEffect(() => {
    const section = howItWorksRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = window.setTimeout(() => {
        setIsHowItWorksVisible(true);
      }, 0);

      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHowItWorksVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const mappedPosts = foodPosts
    .filter((post) => post.status === 'available')
    .map((post) => ({
      id: post.id,
      title: post.title,
      restaurantName: post.user?.profile?.name || post.user?.name || 'Restoran',
      lat: normalizeCoordinate(post.lat, -5.4292), // Bandar Lampung
      lng: normalizeCoordinate(post.long, 105.2619), // Bandar Lampung
      pickupAddress: post.pickup_address,
      storeImage: post.image_url,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 overflow-hidden">
      <HeroSection />

      {/* Stats / Proof Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-950 mb-1">500+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">Restoran Mitra</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-950 mb-1">10k+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">Porsi Tersalurkan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-950 mb-1">50+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">Komunitas Aktif</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-950 mb-1">2.5 Ton</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">Limbah Dikurangi</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        ref={howItWorksRef}
        className={`relative overflow-hidden bg-[#f8fbf7] py-24 ${
          isHowItWorksVisible ? "how-visible" : ""
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />
        <div className="container relative mx-auto px-6">
          <div className="how-heading mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <Clock className="h-4 w-4" />
              Alur 3 langkah
            </div>
            <h2 className="mb-4 text-3xl font-serif font-bold text-slate-950 md:text-4xl">
              Bagaimana SRO Bekerja?
            </h2>
            <p className="mx-auto max-w-xl text-lg leading-8 text-slate-600">
              Platform sederhana yang menghubungkan restoran, komunitas, dan
              proses distribusi dalam satu alur yang jelas.
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-8 top-5 bottom-5 w-1 rounded-full bg-slate-200 md:hidden"
            >
              <div className="how-progress-y h-full w-full rounded-full bg-gradient-to-b from-emerald-500 via-sky-500 to-amber-500" />
            </div>
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden h-2 overflow-hidden rounded-full bg-slate-200 md:block"
            >
              <div className="how-progress-x h-full w-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500" />
            </div>

            <div className="how-step-grid grid gap-8 md:grid-cols-3">
              {howItWorksSteps.map((item, index) => {
                const Icon = item.icon;
                const styles = progressCardStyles[item.accent];

                return (
                  <article
                    key={item.step}
                    className="group relative pl-20 md:pl-0"
                  >
                    <div className="absolute left-2 top-0 z-10 md:static md:mb-8 md:flex md:justify-center">
                      <div
                        className={`how-step-dot flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white ring-8 ${styles.dot}`}
                        style={{ transitionDelay: `${index * 150 + 250}ms` }}
                      >
                        {item.step}
                      </div>
                    </div>

                    <div
                      className="how-step-card relative h-full overflow-hidden rounded-lg border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                      style={{ transitionDelay: `${index * 150 + 360}ms` }}
                    >
                      <span
                        aria-hidden="true"
                        className="how-card-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        style={{ animationDelay: `${index * 170 + 800}ms` }}
                      />
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg shadow-lg ${styles.icon}`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles.badge}`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.meta}
                        </span>
                      </div>

                      <div className="mb-5 flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">
                          Step {index + 1}
                        </span>
                        {index < howItWorksSteps.length - 1 && (
                          <ArrowRight className="hidden h-4 w-4 text-slate-300 md:block" />
                        )}
                      </div>

                      <h3 className="mb-3 text-xl font-bold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="min-h-24 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>

                      <div className="mt-7">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                          <span>Progress</span>
                          <span className="text-slate-700">
                            {item.progress}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`how-meter-fill h-full rounded-full ${styles.meter}`}
                            style={{
                              width: item.progress,
                              transitionDelay: `${index * 150 + 650}ms`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-950 mb-4">Cerita dari Komunitas Kami</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">Dampak nyata dari kolaborasi restoran dan komunitas peduli.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-slate-950">Restoran Padang Sederhana</h4>
                  <p className="text-sm text-slate-500">Jakarta Selatan</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                &quot;Setiap hari kami punya sisa makanan berkualitas. Dengan SRO, makanan ini sampai ke tangan yang tepat tanpa ribet. Win-win solution!&quot;
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                  K
                </div>
                <div>
                  <h4 className="font-bold text-slate-950">Komunitas Berbagi Harapan</h4>
                  <p className="text-sm text-slate-500">Bandung</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                &quot;Platform ini memudahkan kami menemukan donasi makanan terdekat. Sistemnya transparan dan proses verifikasinya membuat semua pihak merasa aman.&quot;
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xl">
                  C
                </div>
                <div>
                  <h4 className="font-bold text-slate-950">Catering Nusantara</h4>
                  <p className="text-sm text-slate-500">Surabaya</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                &quot;Setelah event besar, sisa makanan selalu jadi masalah. Sekarang tinggal posting di SRO, dalam hitungan jam sudah ada yang ambil. Luar biasa!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map - Makanan Tersedia */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-950 mb-4">Makanan Tersedia di Sekitar Anda</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">Lihat lokasi makanan yang tersedia secara real-time di peta interaktif.</p>
          </div>
          
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
            <MapView 
              posts={mappedPosts}
            />
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/marketplace" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-5 h-5" />
              Lihat Map Lengkap di Marketplace
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              Login diperlukan untuk mengklaim makanan
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-950 mb-4">Pertanyaan Umum</h2>
            <p className="text-slate-600 text-lg">Jawaban cepat untuk pertanyaan yang sering diajukan.</p>
          </div>

          <div className="space-y-4">
            <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-950 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
                <span>Apakah ada biaya untuk bergabung?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                Tidak ada biaya sama sekali. SRO sepenuhnya gratis untuk restoran dan komunitas yang ingin bergabung dalam misi mengurangi food waste.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-950 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
                <span>Bagaimana proses verifikasi dilakukan?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                Setelah registrasi, Anda perlu mengunggah dokumen pendukung (SIUP untuk restoran, dokumen legalitas untuk komunitas). Tim kami akan melakukan verifikasi dalam 1-2 hari kerja.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-950 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
                <span>Apakah makanan yang dibagikan aman dikonsumsi?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                Ya. Semua makanan yang diposting harus memenuhi standar keamanan pangan. Restoran wajib mencantumkan waktu kadaluarsa dan kondisi makanan. Kami juga memiliki sistem rating dan review.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-950 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
                <span>Bagaimana cara kerja sistem pickup?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                Komunitas mengajukan klaim melalui platform, restoran menyetujui, lalu komunitas datang ke lokasi sesuai jadwal yang disepakati. Semua tercatat dalam sistem untuk transparansi.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-950 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
                <span>Apakah bisa untuk wilayah di luar Jakarta?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                Tentu! SRO beroperasi di seluruh Indonesia. Sistem peta kami memudahkan matching antara restoran dan komunitas di area yang sama, di mana pun lokasinya.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-emerald-950 text-white">
        <div className="container mx-auto px-6 text-center">
          <Users className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">Siap Bergabung dengan Perubahan?</h2>
          <p className="text-emerald-100/70 max-w-2xl mx-auto text-lg mb-10">
            Daftarkan restoran atau komunitas Anda hari ini dan jadilah bagian dari solusi untuk ketahanan pangan Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-10 py-4 bg-white text-emerald-950 font-bold rounded-xl hover:bg-emerald-50 transition-all"
            >
              Daftar Sekarang
            </Link>
            <Link 
              href="/marketplace" 
              className="px-10 py-4 bg-transparent border border-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-900/50 transition-all"
            >
              Cari Makanan
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Minor */}
      <footer className="py-8 bg-emerald-950 text-emerald-300/50 text-sm border-t border-emerald-900">
        <div className="container mx-auto px-6 flex flex-col md:row justify-between items-center gap-4">
          <div>© 2026 Smart Resource Optimizer. Made for a better future.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-300 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-emerald-300 transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

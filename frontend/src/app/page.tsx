import Link from "next/link";
import { Leaf, ShieldCheck, Users, MapPin } from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

export default function Home() {
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-950 mb-4">Bagaimana SRO Bekerja?</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">Platform sederhana yang menghubungkan titik-titik kebaikan dalam ekosistem pangan kita.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950">Restoran Memposting</h3>
              <p className="text-slate-600 leading-relaxed">
                Restoran memposting daftar makanan berlebih yang masih layak konsumsi dengan rincian jumlah dan waktu kadaluarsa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950">Komunitas Menemukan</h3>
              <p className="text-slate-600 leading-relaxed">
                Komunitas terverifikasi mencari makanan terdekat melalui peta interaktif kami yang memudahkan logistik penjemputan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950">Distribusi Aman</h3>
              <p className="text-slate-600 leading-relaxed">
                Melalui sistem verifikasi ketat, kami menjamin keamanan pangan dan keabsahan penerima manfaat bagi semua pihak.
              </p>
            </div>
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

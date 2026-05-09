"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export default function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        // Move background at 40% of scroll speed (parallax)
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{ top: "-20%", bottom: "-20%" }}
      >
        <img
          src="/images/bg.png"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>

      {/* Floating Animated Shapes */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[15%] w-96 h-96 bg-green-400/15 rounded-full blur-3xl animate-float-delayed" />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white/20 rounded-lg animate-spin-reverse" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 text-sm font-medium mb-8 shadow-lg border border-white/20 animate-fade-in-down">
            <Leaf className="w-4 h-4 animate-bounce" />
            <span>Misi Zero Food Waste Indonesia</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-white mb-10 leading-[1.05] animate-fade-in-up drop-shadow-2xl">
            Ubah{" "}
            <span className="text-emerald-400 italic relative inline-block animate-scale-in">
              Kelebihan
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-emerald-400/50 -z-10 animate-expand" />
            </span>{" "}
            Menjadi{" "}
            <span className="text-emerald-400 relative inline-block animate-scale-in-delayed">
              Kebaikan
              <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 animate-slide-in" />
            </span>
            .
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in font-light drop-shadow-lg">
            Smart Resource Optimizer (SRO) menghubungkan restoran yang memiliki
            makanan berlebih dengan komunitas yang membutuhkan. Bersama, kita
            kurangi limbah pangan dan bantu sesama.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up-delayed">
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-700 font-semibold rounded-2xl hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Mulai Berbagi Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-10 py-5 bg-transparent backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              Eksplorasi Marketplace
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/80 rounded-full animate-scroll" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

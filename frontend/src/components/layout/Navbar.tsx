'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Leaf, LayoutDashboard, LogOut, LogIn, UserPlus, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { claimFoodPost } from '@/services/marketplaceService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount, items, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wasScrolled, setWasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled && !wasScrolled) setWasScrolled(true);
      setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [wasScrolled]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const isHomePage = pathname === '/';
  const useSolidNavbar = !isHomePage || isScrolled;

  const handleConfirmClaims = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Process all items in cart with their specific quantities
      const promises = items.map(item => 
        claimFoodPost(item.id, item.quantity, 'Klaim kolektif dari keranjang')
      );
      await Promise.all(promises);
      clearCart();
      setIsCartOpen(false);
      alert('Berhasil mengklaim ' + items.length + ' item makanan!');
    } catch (error) {
      console.error('Klaim gagal', error);
      alert('Sebagian atau seluruh klaim gagal diproses. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  ];

  const authLinks = user
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ]
    : [
        { name: 'Login', href: '/login', icon: LogIn },
        { name: 'Register', href: '/register', icon: UserPlus },
      ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      useSolidNavbar
        ? "bg-white/95 backdrop-blur-md shadow-lg navbar-scrolled"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className={cn(
                "p-1.5 rounded-lg transition-colors border",
                useSolidNavbar
                  ? "bg-emerald-50 border-emerald-200 group-hover:bg-emerald-100"
                  : "bg-white/20 backdrop-blur-sm border-white/30 group-hover:bg-white/30"
              )}>
                <Leaf className={cn("h-6 w-6", useSolidNavbar ? "text-emerald-600" : "text-white")} />
              </div>
              <span className={cn("ml-2.5 text-xl font-bold tracking-tight", useSolidNavbar ? "text-slate-900" : "text-white drop-shadow-lg")}>
                SRO<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium transition-all border-b-2 border-transparent",
                    useSolidNavbar
                      ? "text-slate-600 hover:text-slate-900 hover:border-emerald-500"
                      : "text-white/80 hover:text-white hover:border-white/50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {authLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  link.name === 'Register' || link.name === 'Dashboard'
                    ? useSolidNavbar
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                      : "bg-white text-emerald-700 hover:bg-white/90 shadow-lg"
                    : useSolidNavbar
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={cn(
                    "relative p-2 rounded-full transition-all",
                    useSolidNavbar
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                  )}
                  title="Keranjang Klaim"
                >
                  <ShoppingBag className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all",
                    useSolidNavbar
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/90 hover:bg-white/10 backdrop-blur-sm"
                  )}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset transition-colors",
                useSolidNavbar
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-emerald-500"
                  : "text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/50 backdrop-blur-sm"
              )}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className={cn("block h-6 w-6", useSolidNavbar ? "text-slate-700" : "")} aria-hidden="true" />
              ) : (
                <Menu className={cn("block h-6 w-6", useSolidNavbar ? "text-slate-700" : "")} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className={cn(
          "pt-2 pb-3 space-y-1 border-t",
          useSolidNavbar
            ? "bg-white border-slate-200"
            : "bg-white/10 backdrop-blur-lg border-white/20"
        )}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium transition-all",
                useSolidNavbar
                  ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-emerald-500"
                  : "text-white/90 hover:text-white hover:bg-white/10 hover:border-white"
              )}
            >
              <link.icon className="h-5 w-5 mr-3" />
              {link.name}
            </Link>
          ))}
          <div className={cn("pt-4 pb-3 border-t", isScrolled ? "border-slate-200" : "border-white/20")}>
            {authLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium transition-all",
                  useSolidNavbar
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-emerald-500"
                    : "text-white/90 hover:text-white hover:bg-white/10 hover:border-white"
                )}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className={cn(
                  "w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium transition-all",
                  useSolidNavbar
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-white/90 hover:bg-white/10"
                )}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onConfirm={handleConfirmClaims}
      />
    </nav>
  );
};

export default Navbar;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Leaf, LayoutDashboard, LogOut, LogIn, UserPlus, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { claimFoodPost } from '@/services/marketplaceService';
import toast from 'react-hot-toast'; // Wait, do we have toast? I'll check. If not I'll use alert.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount, items, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleConfirmClaims = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Process all items in cart
      const promises = items.map(item => 
        claimFoodPost(item.id, 1, 'Klaim kolektif dari keranjang')
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
    <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-green-600 p-1.5 rounded-lg group-hover:bg-green-700 transition-colors">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2.5 text-xl font-bold text-gray-900 tracking-tight">
                SRO<span className="text-green-600">.</span>
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-green-600 hover:border-green-600 transition-all border-b-2 border-transparent"
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
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
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
                  className="flex items-center px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1 bg-white border-t border-green-50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-600 transition-all"
            >
              <link.icon className="h-5 w-5 mr-3" />
              {link.name}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-green-50">
            {authLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-600 transition-all"
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className="w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 transition-all"
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

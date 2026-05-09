'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      <Navbar />
      {!isHomePage && <div aria-hidden="true" className="h-16 shrink-0" />}
    </>
  );
}

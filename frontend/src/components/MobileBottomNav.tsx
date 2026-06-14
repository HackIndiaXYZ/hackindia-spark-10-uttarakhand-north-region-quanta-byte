'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../app/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path !== '/' && pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <nav className="mobile-bottom-nav">
      <Link href="/" className={`mobile-nav-item ${isActive('/')}`}>
        <i className="fa-solid fa-house"></i><span>{t('home')}</span>
      </Link>
      <Link href="/dashboard" className={`mobile-nav-item ${isActive('/dashboard')}`}>
        <i className="fa-solid fa-chart-pie"></i><span>{t('dashboard')}</span>
      </Link>
      <Link href="/disease" className={`mobile-nav-item ${isActive('/disease')}`}>
        <i className="fa-solid fa-microscope"></i><span>{t('disease').substring(0, 4)}</span>
      </Link>
      <Link href="/market" className={`mobile-nav-item ${isActive('/market')}`}>
        <i className="fa-solid fa-store"></i><span>{t('market').substring(0, 4)}</span>
      </Link>
      <Link href="/profile" className={`mobile-nav-item ${isActive('/profile')}`}>
        <i className="fa-solid fa-user"></i><span>{t('profile')}</span>
      </Link>
    </nav>
  );
}

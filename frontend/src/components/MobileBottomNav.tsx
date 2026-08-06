import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path !== '/' && pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className={`mobile-nav-item ${isActive('/')}`}>
        <i className="fa-solid fa-house"></i>
        <span>{t('home')}</span>
      </Link>
      <Link to="/disease" className={`mobile-nav-item ${isActive('/disease')}`}>
        <i className="fa-solid fa-microscope"></i>
        <span>{t('disease')}</span>
      </Link>
      <Link to="/market" className={`mobile-nav-item ${isActive('/market')}`}>
        <i className="fa-solid fa-store"></i>
        <span>{t('market')}</span>
      </Link>
      <Link to="/schemes" className={`mobile-nav-item ${isActive('/schemes')}`}>
        <i className="fa-solid fa-file-invoice"></i>
        <span>{t('schemes')}</span>
      </Link>
      <Link to="/profile" className={`mobile-nav-item ${isActive('/profile')}`}>
        <i className="fa-solid fa-user"></i>
        <span>{t('profile')}</span>
      </Link>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../app/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path !== '/' && pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <>
      <nav className={`krishi-navbar ${scrolled ? 'scrolled' : ''}`} id="mainNavbar">
        <div className="navbar-top-bar">
          <div className="navbar-lang-list">
            <button 
              onClick={() => setLanguage('en')} 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            >
              <span className="lang-full">English</span>
              <span className="lang-short">EN</span>
            </button>
            <span className="lang-divider">|</span>
            <button 
              onClick={() => setLanguage('hi')} 
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
            >
              <span className="lang-full">हिन्दी</span>
              <span className="lang-short">HI</span>
            </button>
          </div>
        </div>

        <div className="navbar-inner">
          <Link href="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-logo-container">
              <img src="/logo.png" alt="Krishi AI Logo" className="brand-logo-img" />
            </div>
            <span className="brand-text">Krishi <span>AI</span></span>
          </Link>

          <ul className={`navbar-links ${isOpen ? 'open' : ''}`} id="navLinks">
            <li>
              <Link href="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
                <i className="fa-solid fa-house"></i> {t('home')}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                <i className="fa-solid fa-chart-line"></i> {t('dashboard')}
              </Link>
            </li>
            <li>
              <Link href="/disease" className={`nav-link ${isActive('/disease')}`} onClick={closeMenu}>
                <i className="fa-solid fa-microscope"></i> {t('disease')}
              </Link>
            </li>
            <li>
              <Link href="/weather" className={`nav-link ${isActive('/weather')}`} onClick={closeMenu}>
                <i className="fa-solid fa-cloud-sun"></i> {t('weather')}
              </Link>
            </li>
            <li>
              <Link href="/market" className={`nav-link ${isActive('/market')}`} onClick={closeMenu}>
                <i className="fa-solid fa-store"></i> {t('market')}
              </Link>
            </li>
            <li>
              <Link href="/schemes" className={`nav-link ${isActive('/schemes')}`} onClick={closeMenu}>
                <i className="fa-solid fa-file-invoice"></i> {t('schemes')}
              </Link>
            </li>
            <li>
              <Link href="/profile" className={`nav-link ${isActive('/profile')}`} onClick={closeMenu}>
                <i className="fa-solid fa-user"></i> {t('profile')}
              </Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <Link href="/alerts" className="nav-alert-btn" title="Alerts" onClick={closeMenu}>
              <i className="fa-solid fa-bell"></i>
              <span className="alert-dot"></span>
            </Link>
            <button className={`hamburger ${isOpen ? 'open' : ''}`} id="hamburger" onClick={toggleMenu} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div 
        className={`nav-overlay ${isOpen ? 'open' : ''}`} 
        id="navOverlay"
        onClick={closeMenu}
      ></div>
    </>
  );
}

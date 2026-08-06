import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
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
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path !== '/' && pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <>
      <nav className={`krishi-navbar ${scrolled ? 'scrolled' : ''}`} id="mainNavbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-logo-container">
              <span style={{ fontSize: '1.2rem' }}>🌾</span>
            </div>
            <span className="brand-text">Krishi <span>AI</span></span>
          </Link>

          <ul className={`navbar-links ${isOpen ? 'open' : ''}`} id="navLinks">
            <li>
              <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
                <i className="fa-solid fa-house"></i> <span>{t('home')}</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                <i className="fa-solid fa-chart-line"></i> <span>{t('dashboard')}</span>
              </Link>
            </li>
            <li>
              <Link to="/disease" className={`nav-link ${isActive('/disease')}`} onClick={closeMenu}>
                <i className="fa-solid fa-microscope"></i> <span>{t('disease')}</span>
              </Link>
            </li>
            <li>
              <Link to="/weather" className={`nav-link ${isActive('/weather')}`} onClick={closeMenu}>
                <i className="fa-solid fa-cloud-sun"></i> <span>{t('weather')}</span>
              </Link>
            </li>
            <li>
              <Link to="/market" className={`nav-link ${isActive('/market')}`} onClick={closeMenu}>
                <i className="fa-solid fa-store"></i> <span>{t('market')}</span>
              </Link>
            </li>
            <li>
              <Link to="/schemes" className={`nav-link ${isActive('/schemes')}`} onClick={closeMenu}>
                <i className="fa-solid fa-file-invoice"></i> <span>{t('schemes')}</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={closeMenu}>
                <i className="fa-solid fa-user"></i> <span>{t('profile')}</span>
              </Link>
            </li>
          </ul>

          <div className="navbar-actions">
            {/* Language Switcher */}
            <div className="navbar-lang-list">
              <button 
                onClick={() => setLanguage('en')} 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('hi')} 
                className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              >
                HI
              </button>
            </div>

            {/* Alert Bell */}
            <Link to="/alerts" className="nav-alert-btn" title="Alerts" onClick={closeMenu}>
              <i className="fa-solid fa-bell"></i>
              <span className="alert-dot"></span>
            </Link>

            {/* Mobile Hamburger Menu */}
            <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div 
          className="nav-overlay open"
          onClick={closeMenu}
        ></div>
      )}
    </>
  );
}

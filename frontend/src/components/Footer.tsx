'use client';

import React from 'react';
import { useTranslation } from '../app/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="krishi-footer">
      <div className="footer-inner krishi-container">
        <div className="footer-brand">
          <div className="brand-logo-container small">
            <img src="/logo.png" alt="Krishi AI Logo" className="brand-logo-img" />
          </div>
          <span>Krishi AI</span>
        </div>
        <p className="footer-tagline">{t('footer_tagline')}</p>
        <div className="footer-links" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.2rem', margin: '0.4rem 0' }}>
          <a href="#">{t('privacy')}</a>
          <a href="#">{t('help')}</a>
          <a href="mailto:support@krishiai.com" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fa-solid fa-envelope"></i> support@krishiai.com
          </a>
          <a href="tel:+919876543210" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fa-solid fa-phone"></i> +91 98765 43210
          </a>
        </div>
        <p className="footer-copy">&copy; 2026 Krishi AI. {t('designed_for')}</p>
      </div>
    </footer>
  );
}

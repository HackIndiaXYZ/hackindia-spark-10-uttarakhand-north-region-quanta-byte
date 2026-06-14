'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function SchemesPage() {
  const { t, language } = useTranslation();
  const [activeCat, setActiveCat] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch government schemes based on active category and search query
  const { data: schemes, isLoading, isError } = useQuery({
    queryKey: ['schemes', activeCat, searchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (activeCat && activeCat !== 'all') queryParams.append('category', activeCat);
      if (searchQuery) queryParams.append('query', searchQuery);
      
      const res = await fetch(`${API_BASE_URL}/schemes?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch schemes');
      return res.json();
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const getCategoryClass = (cat: string) => {
    switch(cat) {
      case 'financial': return 'financial';
      case 'insurance': return 'insurance';
      case 'organic': return 'organic';
      case 'technology': return 'technology';
      default: return '';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<'hi' | 'en', Record<string, string>> = {
      hi: {
        financial: 'वित्तीय सहायता',
        insurance: 'फसल बीमा',
        organic: 'जैविक खेती',
        technology: 'तकनीकी'
      },
      en: {
        financial: 'Financial Aid',
        insurance: 'Crop Insurance',
        organic: 'Organic Farming',
        technology: 'Technical Support'
      }
    };
    return labels[language] ? labels[language][cat] || cat : cat;
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'financial': return 'fa-hand-holding-dollar';
      case 'insurance': return 'fa-shield-halved';
      case 'organic': return 'fa-leaf';
      case 'technology': return 'fa-tractor';
      default: return 'fa-file-invoice-dollar';
    }
  };

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case 'financial': return { background: 'linear-gradient(135deg, #43A047, #1B5E20)' };
      case 'insurance': return { background: 'linear-gradient(135deg, #1E88E5, #0D47A1)' };
      case 'organic': return { background: 'linear-gradient(135deg, #66BB6A, #2E7D32)' };
      case 'technology': return { background: 'linear-gradient(135deg, #AB47BC, #6A1B9A)' };
      default: return { background: 'linear-gradient(135deg, #FFA726, #E65100)' };
    }
  };

  return (
    <div className="krishi-container" style={{ paddingBottom: '4rem' }}>
      <BackButton />
      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-file-invoice-dollar"></i> {t('schemes_title_page')}</h1>
        <p className="page-sub">{t('schemes_sub_page')}</p>
      </div>

      {/* Search Bar */}
      <div className="krishi-card search-filter-bar fade-in-up" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              className="krishi-input" 
              placeholder={t('schemes_search_placeholder')} 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-krishi-primary">{t('schemes_search_btn')}</button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="scheme-tabs fade-in-up">
        <button 
          className={`scheme-tab ${activeCat === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCat('all')}
        >
          {t('schemes_all')}
        </button>
        <button 
          className={`scheme-tab ${activeCat === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveCat('financial')}
        >
          {t('schemes_cat_financial')}
        </button>
        <button 
          className={`scheme-tab ${activeCat === 'insurance' ? 'active' : ''}`}
          onClick={() => setActiveCat('insurance')}
        >
          {t('schemes_cat_insurance')}
        </button>
        <button 
          className={`scheme-tab ${activeCat === 'organic' ? 'active' : ''}`}
          onClick={() => setActiveCat('organic')}
        >
          {t('schemes_cat_organic')}
        </button>
        <button 
          className={`scheme-tab ${activeCat === 'technology' ? 'active' : ''}`}
          onClick={() => setActiveCat('technology')}
        >
          {t('schemes_cat_technology')}
        </button>
      </div>

      {/* Schemes Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2E7D32' }}></i>
          <p style={{ marginTop: '1rem', color: '#6B7280' }}>{t('loading')}</p>
        </div>
      ) : isError || !schemes || schemes.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="fa-solid fa-file-excel" style={{ fontSize: '3.5rem', color: '#66BB6A', display: 'block', marginBottom: '1rem' }}></i>
          <h3>{t('schemes_empty_title')}</h3>
          <p style={{ color: '#6B7280' }}>{t('schemes_empty_desc')}</p>
        </div>
      ) : (
        <div className="schemes-grid fade-in-up delay-1">
          {schemes.map((scheme: any) => (
            <div key={scheme.id} className="scheme-card">
              <div 
                className="scheme-icon-wrap" 
                style={getCategoryStyle(scheme.category)}
              >
                <i className={`fa-solid ${getCategoryIcon(scheme.category)}`}></i>
              </div>
              <div className="scheme-content">
                <span className={`scheme-category-tag ${getCategoryClass(scheme.category)}`}>
                  {getCategoryLabel(scheme.category)}
                </span>
                <h3>{t(scheme.name)}</h3>
                <p>{t(scheme.description)}</p>
                <div className="scheme-benefit">
                  <i className="fa-solid fa-circle-check"></i> {t(scheme.benefit)}
                </div>
              </div>
              <div className="scheme-actions">
                <a 
                  href={scheme.apply_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-krishi-primary btn-sm"
                >
                  {t('schemes_apply_btn')}
                </a>
                <button 
                  className="btn-krishi-secondary btn-sm"
                  onClick={() => alert(`${t(scheme.name)}\n\n${t(scheme.description)}\n\n${language === 'hi' ? 'लाभ' : 'Benefit'}: ${t(scheme.benefit)}`)}
                >
                  {t('schemes_learn_more')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

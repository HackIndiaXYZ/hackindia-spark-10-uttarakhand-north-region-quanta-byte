'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function MarketPricesPage() {
  const { t, language } = useTranslation();
  const [cropInput, setCropInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [filters, setFilters] = useState({ crop: '', state: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Fetch market prices based on active filters
  const { data: prices, isLoading, isError } = useQuery({
    queryKey: ['marketPrices', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.crop) queryParams.append('crop', filters.crop);
      if (filters.state) queryParams.append('state', filters.state);
      
      const res = await fetch(`${API_BASE_URL}/market?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch market prices');
      return res.json();
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ crop: cropInput, state: stateInput });
  };

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Crop translation
  const getCropTranslation = (crop: string) => {
    const clean = crop.split(' (')[0];
    return t(`crop_${clean}`) || clean;
  };

  // Market translation helper
  const getMarketTranslation = (market: string) => {
    if (language === 'hi') return market;
    const marketsMap: Record<string, string> = {
      'रामपुर': 'Rampur', 'ज्ञानपुर': 'Gyanpur', 'कपसेठी': 'Kapsethi', 'मिर्जामुराद': 'Mirzamurad',
      'वाराणसी': 'Varanasi', 'भदोही': 'Bhadohi', 'चोला': 'Chola', 'दादरी': 'Dadri', 'हापुड़': 'Hapur',
      'अमरोहा': 'Amroha'
    };
    return marketsMap[market] || market;
  };

  // State translation helper
  const getStateTranslation = (state: string) => {
    if (language === 'hi') {
      const statesMap: Record<string, string> = {
        'Uttar Pradesh': 'उत्तर प्रदेश', 'Punjab': 'पंजाब', 'Haryana': 'हरियाणा', 'Bihar': 'बिहार', 'Madhya Pradesh': 'मध्य प्रदेश', 'Rajasthan': 'राजस्थान'
      };
      return statesMap[state] || state;
    }
    return state;
  };

  return (
    <div className="krishi-container" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: '#fff', borderLeft: `4px solid ${toast.type === 'success' ? '#43A047' : '#E53935'}`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#1B1B1B'
          }}
        >
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'
          }`} style={{ color: toast.type === 'success' ? '#43A047' : '#E53935' }}></i>
          {toast.message}
        </div>
      )}

      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-store"></i> {t('market_title_page')}</h1>
        <p className="page-sub">{t('market_sub_page')}</p>
      </div>

      {/* Market Search & Filter Bar */}
      <div className="krishi-card search-filter-bar fade-in-up">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              className="krishi-input" 
              placeholder={t('market_search_placeholder')} 
              value={cropInput}
              onChange={(e) => setCropInput(e.target.value)}
            />
          </div>
          <select 
            className="krishi-input mini-select"
            value={stateInput}
            onChange={(e) => setStateInput(e.target.value)}
          >
            <option value="">{t('market_all_states')}</option>
            <option value="Uttar Pradesh">{language === 'hi' ? 'उत्तर प्रदेश' : 'Uttar Pradesh'}</option>
            <option value="Punjab">{language === 'hi' ? 'पंजाब' : 'Punjab'}</option>
            <option value="Haryana">{language === 'hi' ? 'हरियाणा' : 'Haryana'}</option>
            <option value="Bihar">{language === 'hi' ? 'बिहार' : 'Bihar'}</option>
            <option value="Madhya Pradesh">{language === 'hi' ? 'मध्य प्रदेश' : 'Madhya Pradesh'}</option>
            <option value="Rajasthan">{language === 'hi' ? 'राजस्थान' : 'Rajasthan'}</option>
          </select>
          <button type="submit" className="btn-krishi-primary">{t('market_filter_btn')}</button>
        </form>
      </div>

      {/* Last Updated Ticker */}
      <div className="market-update-bar fade-in-up">
        <i className="fa-solid fa-clock"></i> {t('market_last_updated')}
        <span className="live-dot"></span> Live
      </div>

      {/* Price Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2E7D32' }}></i>
          <p style={{ marginTop: '1rem', color: '#6B7280' }}>{t('loading')}</p>
        </div>
      ) : isError || !prices || prices.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: '3.5rem', color: '#66BB6A', display: 'block', marginBottom: '1rem' }}></i>
          <h3>{t('market_empty_title')}</h3>
          <p style={{ color: '#6B7280' }}>{t('market_empty_desc')}</p>
        </div>
      ) : (
        <div className="market-grid fade-in-up delay-1">
          {prices.map((crop: any) => (
            <div key={crop.id} className={`price-card ${crop.is_best ? 'price-card-best' : ''}`}>
              {crop.is_best && (
                <div className="best-price-badge">
                  <i className="fa-solid fa-trophy"></i> {language === 'hi' ? 'सर्वोत्तम भाव' : 'Best Price'}
                </div>
              )}
              <div className="price-card-header">
                <div className="crop-emoji">{crop.emoji}</div>
                <div>
                  <h3 className="crop-name">{getCropTranslation(crop.crop_name)}</h3>
                  <span className="crop-market">{getMarketTranslation(crop.market)}, {getStateTranslation(crop.state)}</span>
                </div>
              </div>
              <div className="price-main">
                <span className="price-value">₹{crop.price.toLocaleString('en-IN')}</span>
                <span className="price-unit">/{t('dash_per_quintal')}</span>
                <span className={`price-change ${
                  crop.change_percent > 0 ? 'price-up' : 
                  crop.change_percent < 0 ? 'price-down' : 
                  'price-flat'
                }`}>
                  {crop.change_percent > 0 ? '↑' : crop.change_percent < 0 ? '↓' : '→'} {Math.abs(crop.change_percent)}%
                </span>
              </div>
              <div className="price-meta-row">
                <span>{language === 'hi' ? 'न्यूनतम: ' : 'Min: '}₹{crop.min_price.toLocaleString('en-IN')}</span>
                <span>{language === 'hi' ? 'अधिकतम: ' : 'Max: '}₹{crop.max_price.toLocaleString('en-IN')}</span>
                {crop.msp > 0 && <span>{language === 'hi' ? 'एमएसपी: ' : 'MSP: '}₹{crop.msp.toLocaleString('en-IN')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

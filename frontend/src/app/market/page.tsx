'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

// Farming insight for the card detail panel
const CROP_INSIGHT: Record<string, { sell_tip: string; storage: string; trend: string[] }> = {
  'गेहूं':   { sell_tip: 'MSP से ऊपर है — अभी बेचना फायदेमंद।', storage: '6 महीने तक सुरक्षित भंडारण।', trend: ['2050','2080','2100','2130','2150'] },
  'धान':    { sell_tip: 'भाव स्थिर है — थोड़ा इंतज़ार करें।', storage: 'नमी 14% से कम रखें।', trend: ['2100','2080','2060','2050','2050'] },
  'मक्का':  { sell_tip: 'अच्छा मौका — 5% बढ़त जारी है।', storage: '2–3 माह तक सुरक्षित।', trend: ['1750','1780','1810','1835','1850'] },
  'सरसों':  { sell_tip: 'MSP के करीब — मंडी भाव देखें।', storage: 'तेल निकालकर बेचें — ज़्यादा लाभ।', trend: ['5000','5050','5100','5150','5200'] },
  'चना':    { sell_tip: 'भाव गिर रहा है — जल्दी बेचें।', storage: 'आर्द्रता 10% से कम रखें।', trend: ['5300','5250','5200','5120','5100'] },
  'प्याज':  { sell_tip: 'बाज़ार गर्म है — अभी बेचें।', storage: '1 माह तक हवादार जगह रखें।', trend: ['900','1000','1050','1150','1200'] },
  'Wheat':  { sell_tip: 'MSP से ऊपर है — अभी बेचना फायदेमंद।', storage: '6 महीने तक सुरक्षित भंडारण।', trend: ['2050','2080','2100','2130','2150'] },
  'Paddy':  { sell_tip: 'भाव स्थिर है — थोड़ा इंतज़ार करें।', storage: 'नमी 14% से कम रखें।', trend: ['2100','2080','2060','2050','2050'] },
  'Rice':   { sell_tip: 'भाव स्थिर है — थोड़ा इंतज़ार करें।', storage: 'नमी 14% से कम रखें।', trend: ['2100','2080','2060','2050','2050'] },
  'Maize':  { sell_tip: 'अच्छा मौका — 5% बढ़त जारी है।', storage: '2–3 माह तक सुरक्षित।', trend: ['1750','1780','1810','1835','1850'] },
};

interface LiveMandiRecord {
  crop_name: string;
  district: string;
  market: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_date: string;
  variety: string;
  unit: string;
}

export default function MarketPricesPage() {
  const { t, language } = useTranslation();
  const [districtInput, setDistrictInput] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [searchParams, setSearchParams] = useState<{ district: string; commodity: string } | null>(null);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Fetch live mandi prices
  const { data: liveData, isLoading, isError, error } = useQuery({
    queryKey: ['liveMandiPrices', searchParams],
    queryFn: async () => {
      if (!searchParams) return null;
      const queryParams = new URLSearchParams();
      queryParams.append('district', searchParams.district);
      queryParams.append('commodity', searchParams.commodity);
      const res = await fetch(`${API_BASE_URL}/market/live?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch live mandi prices');
      return res.json();
    },
    enabled: !!searchParams,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtInput.trim() || !cropInput.trim()) {
      setToast({
        message: language === 'hi' ? 'कृपया जिला और फसल दोनों दर्ज करें।' : 'Please enter both district and crop name.',
        type: 'warning'
      });
      return;
    }
    setSelectedCard(null);
    setSearchParams({ district: districtInput.trim(), commodity: cropInput.trim() });
  };

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const records: LiveMandiRecord[] = liveData?.records || [];
  const liveMessage: string = liveData?.message || '';
  const liveSource: string = liveData?.source || '';

  // Get emoji for common crops
  const getCropEmoji = (cropName: string) => {
    const lower = cropName.toLowerCase();
    if (lower.includes('wheat') || lower.includes('गेहूं')) return '🌾';
    if (lower.includes('rice') || lower.includes('paddy') || lower.includes('धान')) return '🌾';
    if (lower.includes('maize') || lower.includes('मक्का')) return '🌽';
    if (lower.includes('mustard') || lower.includes('सरसों')) return '🌻';
    if (lower.includes('gram') || lower.includes('चना')) return '🟡';
    if (lower.includes('onion') || lower.includes('प्याज')) return '🧅';
    if (lower.includes('potato') || lower.includes('आलू')) return '🥔';
    if (lower.includes('tomato') || lower.includes('टमाटर')) return '🍅';
    if (lower.includes('soyabean') || lower.includes('soybean')) return '🫘';
    if (lower.includes('garlic') || lower.includes('लहसुन')) return '🧄';
    if (lower.includes('sugarcane') || lower.includes('गन्ना')) return '🎋';
    if (lower.includes('cotton') || lower.includes('कपास')) return '🧶';
    return '🌱';
  };

  const insight = selectedCard ? (CROP_INSIGHT[selectedCard.crop_name] || null) : null;

  return (
    <div className="krishi-container" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: '#fff', borderLeft: `4px solid ${toast.type === 'success' ? '#43A047' : toast.type === 'warning' ? '#F9A825' : '#E53935'}`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#1B1B1B'
          }}
        >
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-times-circle'}`}
            style={{ color: toast.type === 'success' ? '#43A047' : toast.type === 'warning' ? '#F9A825' : '#E53935' }}></i>
          {toast.message}
        </div>
      )}

      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-store"></i> {t('market_title_page')}</h1>
        <p className="page-sub">{t('market_sub_page')}</p>
      </div>

      {/* ── Search Bar: District + Crop ── */}
      <div className="krishi-card search-filter-bar fade-in-up" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearchSubmit} className="mkt-search-form">
          {/* District input */}
          <div className="mkt-input-wrap">
            <i className="fa-solid fa-city"></i>
            <input
              type="text"
              className="krishi-input"
              placeholder={language === 'hi' ? 'जिला दर्ज करें (जैसे: Sonbhadra)' : 'Enter district (e.g. Sonbhadra)'}
              value={districtInput}
              onChange={(e) => setDistrictInput(e.target.value)}
            />
          </div>

          {/* Crop input */}
          <div className="mkt-input-wrap mkt-city-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="krishi-input"
              placeholder={language === 'hi' ? 'फसल का नाम (जैसे: Wheat, Rice)' : 'Enter crop name (e.g. Wheat, Rice)'}
              value={cropInput}
              onChange={(e) => setCropInput(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-krishi-primary">
            <i className="fa-solid fa-search"></i>
            {language === 'hi' ? 'देखें' : 'Search'}
          </button>
        </form>

        {/* Active search chip */}
        {searchParams && (
          <div className="mkt-city-chip">
            <i className="fa-solid fa-location-dot"></i>
            {searchParams.district} — {searchParams.commodity}
            <button onClick={() => { setSearchParams(null); setDistrictInput(''); setCropInput(''); }} aria-label="clear search">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
      </div>

      {/* Last Updated Ticker */}
      {searchParams && (
        <div className="market-update-bar fade-in-up">
          <i className="fa-solid fa-clock"></i> {language === 'hi' ? 'स्रोत:' : 'Source:'} {liveSource || 'data.gov.in (Agmarknet)'}
          <span className="live-dot"></span> Live
        </div>
      )}

      {/* Content */}
      {!searchParams ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="fa-solid fa-store" style={{ fontSize: '3.5rem', color: '#66BB6A', display: 'block', marginBottom: '1rem' }}></i>
          <h3>{language === 'hi' ? 'लाइव मंडी भाव देखें' : 'View Live Mandi Prices'}</h3>
          <p style={{ color: '#6B7280' }}>
            {language === 'hi'
              ? 'ऊपर जिला और फसल का नाम डालकर "देखें" बटन दबाएं।'
              : 'Enter district and crop name above, then press "Search".'
            }
          </p>
        </div>
      ) : isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2E7D32' }}></i>
          <p style={{ marginTop: '1rem', color: '#6B7280' }}>{language === 'hi' ? 'लाइव डेटा लोड हो रहा है...' : 'Loading live data...'}</p>
        </div>
      ) : isError || (records.length === 0 && liveMessage) ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: '3.5rem', color: '#66BB6A', display: 'block', marginBottom: '1rem' }}></i>
          <h3>{language === 'hi' ? 'कोई डेटा नहीं मिला' : 'No Data Found'}</h3>
          <p style={{ color: '#6B7280' }}>
            {liveMessage || (language === 'hi'
              ? `"${searchParams.district}" जिले में "${searchParams.commodity}" के लिए अभी लाइव मंडी डेटा उपलब्ध नहीं है।`
              : `No live mandi data available for "${searchParams.commodity}" in "${searchParams.district}".`
            )}
          </p>
        </div>
      ) : (
        <div className="market-grid fade-in-up delay-1">
          {records.map((rec: LiveMandiRecord, index: number) => (
            <div
              key={index}
              className={`price-card ${selectedCard === rec ? 'price-card-active' : ''}`}
              onClick={() => setSelectedCard(selectedCard === rec ? null : rec)}
              style={{ cursor: 'pointer' }}
            >
              <div className="price-card-header">
                <div className="crop-emoji">{getCropEmoji(rec.crop_name)}</div>
                <div>
                  <h3 className="crop-name">{rec.crop_name}{rec.variety ? ` (${rec.variety})` : ''}</h3>
                  <span className="crop-market">{rec.market}, {rec.district}</span>
                </div>
              </div>
              <div className="price-main">
                <span className="price-value">₹{rec.modal_price.toLocaleString('en-IN')}</span>
                <span className="price-unit">/{language === 'hi' ? 'क्विंटल' : 'Quintal'}</span>
              </div>
              <div className="price-meta-row">
                <span>{language === 'hi' ? 'न्यूनतम: ' : 'Min: '}₹{rec.min_price.toLocaleString('en-IN')}</span>
                <span>{language === 'hi' ? 'अधिकतम: ' : 'Max: '}₹{rec.max_price.toLocaleString('en-IN')}</span>
                <span>{language === 'hi' ? 'मोडल: ' : 'Modal: '}₹{rec.modal_price.toLocaleString('en-IN')}</span>
              </div>

              {/* Date and state info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                <span><i className="fa-solid fa-calendar-day" style={{ marginRight: '0.25rem' }}></i>{rec.arrival_date}</span>
                <span><i className="fa-solid fa-location-dot" style={{ marginRight: '0.25rem' }}></i>{rec.state}</span>
              </div>

              {/* Expanded Detail Panel */}
              {selectedCard === rec && (
                <div className="mkt-detail-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="mkt-detail-divider"></div>

                  {/* Price range bar */}
                  <div className="mkt-range-row">
                    <span className="mkt-range-label">{language === 'hi' ? 'भाव रेंज' : 'Price Range'}</span>
                    <div className="mkt-range-bar-wrap">
                      <span className="mkt-range-min">₹{rec.min_price.toLocaleString('en-IN')}</span>
                      <div className="mkt-range-bar">
                        <div
                          className="mkt-range-fill"
                          style={{
                            left: '0%',
                            width: `${Math.min(100, Math.max(5, ((rec.modal_price - rec.min_price) / Math.max(1, rec.max_price - rec.min_price)) * 100))}%`
                          }}
                        ></div>
                        <div
                          className="mkt-range-dot"
                          style={{
                            left: `${Math.min(96, Math.max(2, ((rec.modal_price - rec.min_price) / Math.max(1, rec.max_price - rec.min_price)) * 100))}%`
                          }}
                          title={`₹${rec.modal_price}`}
                        ></div>
                      </div>
                      <span className="mkt-range-max">₹{rec.max_price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="mkt-insights">
                    <div className="mkt-insight-item">
                      <i className="fa-solid fa-store"></i>
                      <span>{language === 'hi' ? `मंडी: ${rec.market}` : `Market: ${rec.market}`}</span>
                    </div>
                    <div className="mkt-insight-item">
                      <i className="fa-solid fa-calendar"></i>
                      <span>{language === 'hi' ? `तिथि: ${rec.arrival_date}` : `Date: ${rec.arrival_date}`}</span>
                    </div>
                    {rec.variety && (
                      <div className="mkt-insight-item">
                        <i className="fa-solid fa-seedling"></i>
                        <span>{language === 'hi' ? `किस्म: ${rec.variety}` : `Variety: ${rec.variety}`}</span>
                      </div>
                    )}
                    <div className="mkt-insight-item">
                      <i className="fa-solid fa-database"></i>
                      <span>{language === 'hi' ? 'स्रोत: data.gov.in (Agmarknet)' : 'Source: data.gov.in (Agmarknet)'}</span>
                    </div>
                  </div>

                  <button
                    className="mkt-close-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedCard(null); }}
                  >
                    <i className="fa-solid fa-chevron-up"></i>
                    {language === 'hi' ? 'बंद करें' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

interface AlertItem {
  id: string;
  type: string; // 'danger', 'warning', 'info'
  title: string;
  message: string;
  time_label: string;
  area: string | null;
  active: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Fetch alerts from backend
  const { data: alertsList, isLoading } = useQuery<AlertItem[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    }
  });

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  // Helper for action buttons on specific alert titles
  const renderActionBtn = (alert: AlertItem) => {
    const title = alert.title || '';
    const isPest = title.includes('कीट') || title.includes('Pest') || title.includes('रोग') || title.includes('Disease');
    const isScheme = title.includes('PM Kisan') || title.includes('किस्त') || title.includes('योजना') || title.includes('Scheme') || title.includes('Installment');
    const isWeather = title.includes('बारिश') || title.includes('मौसम') || title.includes('तूफान') || title.includes('Rain') || title.includes('Weather') || title.includes('Storm');

    if (isPest) {
      return (
        <Link href="/disease" className="alert-action-btn">
          {t('check_now')} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
        </Link>
      );
    }
    if (isScheme) {
      return (
        <Link href="/schemes" className="alert-action-btn">
          {t('check_scheme')} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
        </Link>
      );
    }
    if (isWeather) {
      return (
        <Link href="/weather" className="alert-action-btn">
          {t('check_weather')} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
        </Link>
      );
    }
    return null;
  };

  // Helper for rendering the correct pulse icon
  const renderAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return (
          <div className="alert-pulse-icon danger">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        );
      case 'warning':
        return (
          <div className="alert-pulse-icon warning">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
        );
      default:
        return (
          <div className="alert-pulse-icon info">
            <i className="fa-solid fa-circle-info"></i>
          </div>
        );
    }
  };

  // Filter alerts by tab and remove dismissed ones
  const filteredAlerts = (alertsList || []).filter((alert) => {
    if (dismissedIds.includes(alert.id)) return false;
    if (activeTab === 'all') return true;
    return alert.type === activeTab;
  });

  return (
    <div className="krishi-container">
      <BackButton />
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <div>
          <h1 className="page-title"><i className="fa-solid fa-bell"></i> {t('alerts_title')}</h1>
          <p className="page-sub">{t('alerts_sub')}</p>
        </div>
      </div>

      {/* Alert Filter Tabs */}
      <div className="alert-tabs fade-in-up">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`alert-tab ${activeTab === 'all' ? 'active' : ''}`}
        >
          {t('all')}
        </button>
        <button 
          onClick={() => setActiveTab('danger')} 
          className={`alert-tab ${activeTab === 'danger' ? 'active' : ''}`}
        >
          {t('danger')}
        </button>
        <button 
          onClick={() => setActiveTab('warning')} 
          className={`alert-tab ${activeTab === 'warning' ? 'active' : ''}`}
        >
          {t('warning')}
        </button>
        <button 
          onClick={() => setActiveTab('info')} 
          className={`alert-tab ${activeTab === 'info' ? 'active' : ''}`}
        >
          {t('info')}
        </button>
      </div>

      {/* Alerts List */}
      <div className="alerts-list fade-in-up delay-1">
        {isLoading ? (
          <div className="empty-state" style={{ padding: '3rem 0' }}>
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>{t('loading')}</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`alert-notification-card alert-${alert.type}`}
            >
              <div className="alert-icon-wrap">
                {renderAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <h4 className="alert-title">{t(alert.title)}</h4>
                <p className="alert-msg">{t(alert.message)}</p>
                <div className="alert-meta">
                  <span><i className="fa-solid fa-clock"></i> {t(alert.time_label)}</span>
                  {alert.area && (
                    <span><i className="fa-solid fa-location-dot"></i> {t(alert.area)}</span>
                  )}
                </div>
                {renderActionBtn(alert)}
              </div>
              <button 
                onClick={() => handleDismiss(alert.id)} 
                className="alert-dismiss-btn"
                title={language === 'hi' ? 'हटाएं' : 'Dismiss'}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ padding: '3rem 0' }}>
            <i className="fa-solid fa-bell-slash"></i>
            <p>{t('no_alerts')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

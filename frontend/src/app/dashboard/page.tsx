'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bar, Line } from 'react-chartjs-2';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('गेहूं');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, [language]);

  // Crop translation lookup helper
  const getCropTranslation = (crop: string) => {
    const clean = crop.split(' (')[0];
    return t(`crop_${clean}`) || clean;
  };

  // Weather condition translation parser
  const getWeatherConditionText = (cond: string) => {
    if (!cond) return '';
    if (language === 'hi') {
      return cond.split(' (')[0];
    } else {
      const match = cond.match(/\(([^)]+)\)/);
      return match ? match[1] : cond;
    }
  };

  // Advisory tip translation mapper
  const translateAdvisoryTip = (text: string) => {
    if (language === 'hi') return text;
    // Map common tip sentences to English
    const mapping: Record<string, string> = {
      'आज सिंचाई करना सही रहेगा — मौसम साफ है': 'Good day for irrigation — weather is clear',
      'गेहूं में पीलापन दिख रहा हो तो Urea spray करें': 'If wheat looks yellow, spray Urea',
      'कल बारिश संभव — कटाई रोकें': 'Rain expected tomorrow — stop harvesting',
      'मंडी में गेहूं का भाव अच्छा है — बेचने का समय': 'Wheat price is good in market — right time to sell',
      '🌧️ भारी बारिश की संभावना है — अपनी फसल कटाई रोकें और भीगने से बचाएं।': '🌧️ Heavy rain expected — stop harvesting and protect crops.',
      '💧 खेतों में अतिरिक्त पानी निकासी का प्रबंध करें, सिंचाई तुरंत बंद करें।': '💧 Arrange drainage in fields, stop irrigation immediately.',
      '🥵 अत्यधिक तापमान — फसलों को झुलसने से बचाने के लिए शाम को हल्की सिंचाई करें।': '🥵 Extreme heat — irrigate lightly in the evening to protect crops.',
      '🌻 गर्मी सहन करने वाली फसलें (जैसे मक्का) के लिए अनुकूल मौसम।': '🌻 Favorable weather for heat-tolerant crops like maize.',
      '🌤️ मौसम सुहावना है — आज सिंचाई और उर्वरक छिड़काव (Urea spray) के लिए उत्तम दिन है।': '🌤️ Pleasant weather — great day for irrigation and Urea spraying.',
      '🌾 कटी हुई फसल को धूप में सुखाने का सही समय है।': '🌾 Suitable time to dry harvested crops in the sun.',
      '🌧️ अगले कुछ दिनों में बारिश की संभावना है — अपनी फसल कटाई रोकें और सुरक्षित स्थान पर रखें।': '🌧️ Rain expected in coming days — stop harvesting and store crops safely.',
      '💧 सिंचाई तुरंत बंद करें। खेतों में पानी जमा न होने दें।': '💧 Stop irrigation immediately. Avoid waterlogging in fields.',
      '🥵 अत्यधिक गर्मी — फसलों को सूखने से बचाने के लिए शाम को हल्की सिंचाई करें।': '🥵 Extreme heat — water lightly in the evening to prevent drying.',
      '🌤️ मौसम अनुकूल है — आज कीटनाशक छिड़काव (Pest spray) या यूरिया का प्रयोग करें।': '🌤️ Favorable weather — apply pest spray or urea today.',
      '🌾 कटी फसलों को सुखाने और मंडी ले जाने के लिए उपयुक्त समय है।': '🌾 Good time to dry harvested crops and take them to market.'
    };
    return mapping[text] || text;
  };

  // API fetches using React Query
  // 1. Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });

  const userLocation = profile?.district || profile?.village || (language === 'hi' ? 'वाराणसी' : 'Varanasi');

  // 2. Fetch Weather
  const { data: weatherData } = useQuery({
    queryKey: ['weather', userLocation],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(userLocation)}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to fetch weather');
      return res.json();
    },
    enabled: !!profile || !profileLoading
  });

  // 3. Fetch Mandi Prices
  const { data: marketPrices } = useQuery({
    queryKey: ['market'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/market`);
      if (!res.ok) throw new Error('Failed to fetch market prices');
      return res.json();
    }
  });

  // 4. Fetch Alerts
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    }
  });

  // 5. Fetch Recent Disease Inspections
  const { data: recentDiseases } = useQuery({
    queryKey: ['recentDiseases'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/disease/recent`);
      if (!res.ok) throw new Error('Failed to fetch recent diseases');
      return res.json();
    }
  });

  // 6. Fetch Yield Data
  const { data: yieldResponse } = useQuery({
    queryKey: ['yieldData'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/yield`);
      if (!res.ok) throw new Error('Failed to fetch yield');
      return res.json();
    }
  });

  // Helper variables
  const weather = weatherData?.weather;
  const activeAlertsCount = alerts?.filter((a: any) => a.active).length || 0;
  
  // Find price for user's crop (fallback to seed wheat price if not found)
  const cropPriceObj = marketPrices?.find((p: any) => p.crop_name === selectedCrop) || 
                       marketPrices?.find((p: any) => p.crop_name === 'गेहूं');
  const cropPrice = cropPriceObj ? `₹${cropPriceObj.price.toLocaleString('en-IN')}` : '₹2,150';
  const cropPriceChange = cropPriceObj ? `${cropPriceObj.change_percent >= 0 ? '+' : ''}${cropPriceObj.change_percent}%` : '+3%';

  // Dynamic advisory text based on weather/season
  const advisoryTips = weather?.farming_tips || [
    { type: 'safe', text: 'आज सिंचाई करना सही रहेगा — मौसम साफ है' },
    { type: 'warning', text: 'गेहूं में पीलापन दिख रहा हो तो Urea spray करें' },
    { type: 'danger', text: 'कल बारिश संभव — कटाई रोकें' },
    { type: 'safe', text: 'मंडी में गेहूं का भाव अच्छा है — बेचने का समय' }
  ];

  // Chart 1: Yield Chart Data (Mocking monthly stats)
  const yieldChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: `${t('production')} (Q)`,
      data: selectedCrop === 'धान' ? [20, 30, 25, 40, 50, 45, 60, 55, 70, 65, 55, 60] : 
            selectedCrop === 'मक्का' ? [15, 20, 18, 30, 35, 28, 40, 35, 45, 38, 30, 40] :
            [30, 45, 28, 60, 75, 50, 80, 65, 90, 70, 55, 85], // default wheat
      backgroundColor: 'rgba(46,125,50,0.7)',
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // Chart 2: Profit Chart Data
  const profitChartData = {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        label: t('revenue'),
        data: [20000, 35000, 28000, 45000, 38000, 55000],
        borderColor: '#43A047',
        backgroundColor: 'rgba(67,160,71,0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: t('expenses'),
        data: [12000, 18000, 15000, 22000, 19000, 25000],
        borderColor: '#E53935',
        backgroundColor: 'rgba(229,57,53,0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="krishi-container dashboard-wrap">
      <BackButton />

      {/* Page Header */}
      <div className="page-header fade-in-up">
        <div>
          <h1 className="page-title"><i className="fa-solid fa-chart-line"></i> {t('dash_title')}</h1>
          <p className="page-sub">
            {t('dash_subtitle').replace('{name}', profile?.name || t('dash_hello_farmer'))}
          </p>
        </div>
        <div className="header-date">
          <i className="fa-solid fa-calendar"></i>
          <span id="currentDate">{currentDate}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid fade-in-up delay-1">
        <div className="summary-card status-safe">
          <div className="summary-icon"><i className="fa-solid fa-seedling"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('dash_crop_health')}</span>
            <span className="summary-value">{t('dash_crop_healthy')}</span>
            <span className="summary-sub">{t('dash_crop_health_sub')}</span>
          </div>
          <div className="summary-badge safe">{t('dash_status_safe')}</div>
        </div>
        <div className="summary-card status-warning">
          <div className="summary-icon"><i className="fa-solid fa-cloud-rain"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('dash_weather_loc')} ({userLocation})</span>
            <span className="summary-value">{weather ? `${weather.temp}°C` : '28°C'}</span>
            <span className="summary-sub">{weather ? getWeatherConditionText(weather.condition) : (language === 'hi' ? 'आंशिक बादल' : 'Partly Cloudy')}</span>
          </div>
          <div className="summary-badge warning">
            {weather && weather.condition.includes('बारिश') ? t('dash_weather_irrigate') : t('dash_weather_normal')}
          </div>
        </div>
        <div className="summary-card status-safe">
          <div className="summary-icon"><i className="fa-solid fa-rupee-sign"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('dash_mandi_today')} ({getCropTranslation(selectedCrop)})</span>
            <span className="summary-value">{cropPrice}</span>
            <span className="summary-sub">{t('dash_per_quintal')}</span>
          </div>
          <div className="summary-badge safe">↑ {cropPriceChange}</div>
        </div>
        <div className="summary-card status-danger">
          <div className="summary-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('dash_active_alerts')}</span>
            <span className="summary-value">{activeAlertsCount} {t('dash_alerts_new')}</span>
            <span className="summary-sub">{language === 'hi' ? 'टिड्डी/मौसम चेतावनियां' : 'Locust/weather warnings'}</span>
          </div>
          <div className="summary-badge danger"><Link href="/alerts" style={{ color: 'inherit' }}>{t('dash_alerts_view')}</Link></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row fade-in-up delay-2">
        <div className="krishi-card chart-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-bar"></i> {t('dash_crop_yield')}</h3>
            <select 
              className="krishi-input mini-select" 
              id="cropSelect"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="गेहूं">{t('crop_गेहूं') || 'गेहूं'}</option>
              <option value="धान">{t('crop_धान') || 'धान'}</option>
              <option value="मक्का">{t('crop_मक्का') || 'मक्का'}</option>
            </select>
          </div>
          <div style={{ height: '200px', position: 'relative' }}>
            <Bar 
              data={yieldChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }, 
                scales: { y: { beginAtZero: true } } 
              }} 
            />
          </div>
        </div>
        <div className="krishi-card chart-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-rupee-sign"></i> {t('dash_revenue_vs_expense')}</h3>
          </div>
          <div style={{ height: '200px', position: 'relative' }}>
            <Line 
              data={profitChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Advisory + Disease Row */}
      <div className="dash-mid-row fade-in-up delay-3">
        {/* AI Advisory */}
        <div className="krishi-card advisory-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-robot"></i> {t('dash_ai_advisory')}</h3>
            <span className="badge-green">{t('fresh')}</span>
          </div>
          <ul className="advisory-list">
            {advisoryTips.map((tip: any, index: number) => (
              <li key={index} className={`advisory-item ${tip.type}`}>
                <i className={`fa-solid ${
                  tip.type === 'safe' ? 'fa-check-circle' : 
                  tip.type === 'warning' ? 'fa-exclamation-triangle' : 
                  'fa-times-circle'
                }`}></i>
                <span>{translateAdvisoryTip(tip.text)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disease Status */}
        <div className="krishi-card disease-status-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-microscope"></i> {t('dash_recent_checks')}</h3>
            <Link href="/disease" className="btn-krishi-secondary btn-sm">{t('dash_new_check')}</Link>
          </div>
          {recentDiseases && recentDiseases.length > 0 ? (
            recentDiseases.map((d: any) => (
              <div key={d.id} className="disease-row">
                <div className="disease-thumb">
                  <img src={d.image_url} alt={d.crop} />
                </div>
                <div className="disease-info">
                  <strong>{getCropTranslation(d.crop)}</strong>
                  <span className="disease-name">{language === 'hi' ? d.disease_name : (d.disease_name.match(/\(([^)]+)\)/) ? d.disease_name.match(/\(([^)]+)\)/)[1] : d.disease_name)}</span>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${d.confidence}%` }}></div>
                  </div>
                  <small>{d.confidence}% {language === 'hi' ? 'भरोसा' : 'confidence'}</small>
                </div>
                <span className={`status-${
                  d.severity === 'High' ? 'danger' : 
                  d.severity === 'Medium' ? 'warning' : 
                  'safe'
                }`}>
                  {language === 'hi' ? (d.severity === 'High' ? 'गंभीर' : d.severity === 'Medium' ? 'मध्यम' : 'सामान्य') : d.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-camera"></i>
              <p>{t('dash_no_checks')}</p>
              <Link href="/disease" className="btn-krishi-primary btn-sm">{t('dash_check_now')}</Link>
            </div>
          )}
        </div>
      </div>

      {/* Weather + Yield Progress */}
      <div className="dash-bottom-row fade-in-up delay-4">
        {/* Weather Mini */}
        <div className="krishi-card weather-mini-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-cloud-sun"></i> {t('dash_5day_weather')} ({userLocation})</h3>
            <Link href="/weather" className="btn-krishi-secondary btn-sm">{t('dash_weather_details')}</Link>
          </div>
          <div className="weather-mini-row">
            {weather?.forecast.slice(0, 5).map((day: any, i: number) => (
              <div key={i} className="weather-day">
                <span>{language === 'hi' ? day.day : (day.day === 'आज' ? 'Today' : day.day === 'कल' ? 'Tomorrow' : day.day === 'परसों' ? 'Overmorrow' : day.day)}</span>
                <i className={`fa-solid ${
                  day.condition.includes('बारिश') ? 'fa-cloud-rain' : 
                  day.condition.includes('बादल') ? 'fa-cloud' : 
                  'fa-sun'
                }`}></i>
                <b>{day.high}°</b>
              </div>
            ))}
          </div>
        </div>

        {/* Yield Progress */}
        <div className="krishi-card yield-progress-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-seedling"></i> {t('dash_crop_progress')}</h3>
            <Link href="/yield" className="btn-krishi-secondary btn-sm">{t('dash_full_report')}</Link>
          </div>
          <div className="yield-progress-list">
            <div className="yield-progress-item">
              <div className="yield-label"><span>{t('crop_गेहूं') || 'गेहूं'}</span><span>72%</span></div>
              <div className="progress-bar"><div className="progress-fill safe" style={{ width: '72%' }}></div></div>
            </div>
            <div className="yield-progress-item">
              <div className="yield-label"><span>{t('crop_धान') || 'धान'}</span><span>45%</span></div>
              <div className="progress-bar"><div className="progress-fill warning" style={{ width: '45%' }}></div></div>
            </div>
            <div className="yield-progress-item">
              <div className="yield-label"><span>{t('crop_मक्का') || 'मक्का'}</span><span>88%</span></div>
              <div className="progress-bar"><div className="progress-fill safe" style={{ width: '88%' }}></div></div>
            </div>
            <div className="yield-progress-item">
              <div className="yield-label"><span>{t('crop_सरसों') || 'सरसों'}</span><span>30%</span></div>
              <div className="progress-bar"><div className="progress-fill danger" style={{ width: '30%' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

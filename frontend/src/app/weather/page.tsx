'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function WeatherPage() {
  const { t, language } = useTranslation();
  const [locationInput, setLocationInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // 1. Fetch user profile to get default location
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });

  // Set initial location input from profile
  useEffect(() => {
    if (profile && !searchQuery) {
      const defaultLoc = profile.district || profile.village || (language === 'hi' ? 'वाराणसी' : 'Varanasi');
      setLocationInput(defaultLoc);
      setSearchQuery(defaultLoc);
    }
  }, [profile, searchQuery, language]);

  // 2. Fetch weather info
  const { data: weatherResponse, isLoading, isError } = useQuery({
    queryKey: ['weather', searchQuery],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(searchQuery)}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to fetch weather');
      return res.json();
    },
    enabled: !!searchQuery
  });

  const weather = weatherResponse?.weather;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      setToast({ 
        message: language === 'hi' ? 'कृपया स्थान का नाम दर्ज करें' : 'Please enter location', 
        type: 'warning' 
      });
      return;
    }
    setSearchQuery(locationInput);
  };

  // 3. Geolocation detector
  const handleAutoLocation = () => {
    if (navigator.geolocation) {
      setToast({ 
        message: language === 'hi' ? 'स्थान ढूँढ रहे हैं...' : 'Detecting location...', 
        type: 'info' 
      });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/weather/auto?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            if (!res.ok) throw new Error('Failed to reverse geocode');
            const data = await res.json();
            setLocationInput(data.city);
            setSearchQuery(data.city);
            setToast({ 
              message: language === 'hi' ? 'स्थान पहचाना गया!' : 'Location detected!', 
              type: 'success' 
            });
          } catch (error) {
            setToast({ 
              message: language === 'hi' ? 'स्थान का पता लगाने में विफलता।' : 'Location lookup failed.', 
              type: 'error' 
            });
          }
        },
        () => {
          setToast({ 
            message: language === 'hi' ? 'स्थान की अनुमति अस्वीकृत।' : 'Location permission denied.', 
            type: 'warning' 
          });
        }
      );
    } else {
      setToast({ 
        message: language === 'hi' ? 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता।' : 'Your browser does not support geolocation.', 
        type: 'error' 
      });
    }
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Day name translation helper
  const translateDay = (day: string) => {
    if (language === 'hi') return day;
    const daysMap: Record<string, string> = {
      'आज': 'Today',
      'कल': 'Tomorrow',
      'परसों': 'Overmorrow',
      'सोमवार': 'Monday',
      'मंगलवार': 'Tuesday',
      'बुधवार': 'Wednesday',
      'गुरुवार': 'Thursday',
      'शुक्रवार': 'Friday',
      'शनिवार': 'Saturday',
      'रविवार': 'Sunday'
    };
    return daysMap[day] || day;
  };

  // Advisory tip translation mapper
  const translateAdvisoryTip = (text: string) => {
    if (language === 'hi') return text;
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

  return (
    <div className="krishi-container" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: '#fff', borderLeft: `4px solid ${
              toast.type === 'success' ? '#43A047' : 
              toast.type === 'error' ? '#E53935' : 
              toast.type === 'warning' ? '#F9A825' : '#1E88E5'
            }`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#1B1B1B'
          }}
        >
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-check-circle' : 
            toast.type === 'error' ? 'fa-times-circle' : 
            toast.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
          }`} style={{ color: 
            toast.type === 'success' ? '#43A047' : 
            toast.type === 'error' ? '#E53935' : 
            toast.type === 'warning' ? '#F9A825' : '#1E88E5' 
          }}></i>
          {toast.message}
        </div>
      )}

      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-cloud-sun"></i> {t('weather_title_page')}</h1>
        <p className="page-sub">{t('weather_sub_page')}</p>
      </div>

      {/* Location Bar */}
      <div className="krishi-card location-bar fade-in-up">
        <form onSubmit={handleSearchSubmit} className="location-form">
          <div className="location-input-wrap">
            <i className="fa-solid fa-location-dot"></i>
            <input 
              type="text" 
              className="krishi-input" 
              placeholder={t('weather_search_placeholder')} 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-krishi-primary">
            <i className="fa-solid fa-magnifying-glass"></i> {t('weather_search_btn')}
          </button>
          <button type="button" className="btn-krishi-secondary" id="autoLocBtn" onClick={handleAutoLocation}>
            <i className="fa-solid fa-crosshairs"></i> {t('weather_auto_btn')}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2E7D32' }}></i>
          <p style={{ marginTop: '1rem', color: '#6B7280' }}>{t('loading')}</p>
        </div>
      ) : isError || !weather ? (
        <div className="krishi-card weather-empty-card fade-in-up delay-1" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="placeholder-inner">
            <i className="fa-solid fa-cloud-sun placeholder-icon" style={{ color: '#29B6F6' }}></i>
            <h3>{t('weather_empty_title')}</h3>
            <p>{t('weather_empty_desc')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Current Weather Card */}
          <div className="krishi-card current-weather-card fade-in-up delay-1">
            <div className="weather-main">
              <div className="weather-location-info">
                <h2><i className="fa-solid fa-location-dot"></i> {weather.location}</h2>
                <p>{weather.date}</p>
              </div>
              <div className="weather-temp-display">
                <div className="weather-big-icon">
                  {weather.condition.includes('बारिश') ? (
                    <i className="fa-solid fa-cloud-rain"></i>
                  ) : weather.condition.includes('बादल') ? (
                    <i className="fa-solid fa-cloud"></i>
                  ) : weather.condition.includes('तूफान') ? (
                    <i className="fa-solid fa-cloud-bolt"></i>
                  ) : (
                    <i className="fa-solid fa-sun"></i>
                  )}
                </div>
                <div className="temp-big">{weather.temp}<sup>°C</sup></div>
                <div className="condition-text">{getWeatherConditionText(weather.condition)}</div>
              </div>
            </div>
            <div className="weather-details-row">
              <div className="weather-detail-item">
                <i className="fa-solid fa-droplet"></i>
                <span>{t('weather_humidity')}</span>
                <strong>{weather.humidity}%</strong>
              </div>
              <div className="weather-detail-item">
                <i className="fa-solid fa-wind"></i>
                <span>{t('weather_wind')}</span>
                <strong>{weather.wind_speed} km/h</strong>
              </div>
              <div className="weather-detail-item">
                <i className="fa-solid fa-gauge"></i>
                <span>{t('weather_pressure')}</span>
                <strong>{weather.pressure} hPa</strong>
              </div>
              <div className="weather-detail-item">
                <i className="fa-solid fa-eye"></i>
                <span>{t('weather_visibility')}</span>
                <strong>{weather.visibility} km</strong>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="krishi-card forecast-card fade-in-up delay-2">
            <h3 className="card-section-title"><i className="fa-solid fa-calendar-week"></i> {t('weather_forecast_title')}</h3>
            <div className="forecast-row">
              {weather.forecast.map((day: any, idx: number) => (
                <div key={idx} className="forecast-day-card">
                  <span className="forecast-day-name">{translateDay(day.day)}</span>
                  <div className="forecast-icon">
                    {day.condition.includes('बारिश') ? (
                      <i className="fa-solid fa-cloud-rain"></i>
                    ) : day.condition.includes('बादल') ? (
                      <i className="fa-solid fa-cloud"></i>
                    ) : (
                      <i className="fa-solid fa-sun"></i>
                    )}
                  </div>
                  <span className="forecast-temp">{day.high}° / {day.low}°</span>
                  <span className="forecast-rain"><i className="fa-solid fa-umbrella"></i> {day.rain_chance}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Farming Advisory based on weather */}
          <div className="krishi-card weather-advisory-card fade-in-up delay-3">
            <h3 className="card-section-title"><i className="fa-solid fa-robot"></i> {t('weather_advisory_title')}</h3>
            <div className="advisory-list">
              {weather.farming_tips.map((tip: any, index: number) => (
                <div key={index} className={`advisory-item ${tip.type}`}>
                  <i className={`fa-solid ${
                    tip.type === 'safe' ? 'fa-check-circle' : 
                    tip.type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-times-circle'
                  }`}></i>
                  <span>{translateAdvisoryTip(tip.text)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

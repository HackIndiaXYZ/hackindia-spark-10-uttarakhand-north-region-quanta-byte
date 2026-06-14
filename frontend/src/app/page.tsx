'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from './LanguageContext';

export default function HomePage() {
  const { t, language } = useTranslation();

  // Stats Counters
  const [farmers, setFarmers] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [crops, setCrops] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const intervalTime = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setFarmers(Math.floor((50000 / steps) * currentStep));
      setAccuracy(Math.min(95, Math.floor((95 / steps) * currentStep)));
      setCrops(Math.floor((200 / steps) * currentStep));
      
      if (currentStep >= steps) {
        setFarmers(50000);
        setAccuracy(95);
        setCrops(200);
        clearInterval(timer);
      }
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, []);

  // Alert Ticker rotation
  const tickerItems = [
    t('home_ticker_1'),
    t('home_ticker_2'),
    t('home_ticker_3'),
    t('home_ticker_4')
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content krishi-container">
          <div className="hero-badge fade-in-up">
            <i className="fa-solid fa-leaf"></i> {t('home_badge')}
          </div>
          <h1 className="hero-title fade-in-up delay-1">
            {language === 'hi' ? (
              <>खेती को बनाएं<br /><span className="hero-highlight">Smart & Profitable</span></>
            ) : (
              <>Make Farming<br /><span className="hero-highlight">Smart & Profitable</span></>
            )}
          </h1>
          <p className="hero-subtitle fade-in-up delay-2">
            {t('home_subtitle')}
          </p>
          <div className="hero-actions fade-in-up delay-3">
            <Link href="/dashboard" className="btn-krishi-primary hero-cta">
              <i className="fa-solid fa-rocket"></i> {t('home_start_cta')}
            </Link>
            <Link href="/chatbot" className="btn-krishi-secondary hero-cta-2">
              <i className="fa-solid fa-comments"></i> {t('home_ask_cta')}
            </Link>
          </div>
          <div className="hero-stats fade-in-up delay-4">
            <div className="hero-stat">
              <span className="stat-num">{farmers.toLocaleString('en-IN')}</span><span>+</span>
              <small>{t('home_farmers_connected')}</small>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-num">{accuracy}</span><span>%</span>
              <small>{t('home_accuracy')}</small>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-num">{crops}</span><span>+</span>
              <small>{t('home_crops_covered')}</small>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </section>

      {/* Alert Banner Slider */}
      <section className="alert-ticker-section alert-banner-section">
        <div className="alert-ticker">
          <div className="alert-ticker-label"><i className="fa-solid fa-bell"></i> {t('home_latest_updates')}</div>
          <div className="alert-ticker-content" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <span style={{ display: 'inline', transition: 'opacity 0.5s' }}>
              {tickerItems[tickerIndex]}
            </span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section krishi-container">
        <h2 className="section-title fade-in-up" dangerouslySetInnerHTML={{ __html: t('home_our_services') }}></h2>
        <p className="section-subtitle fade-in-up">{t('home_services_sub')}</p>
        <div className="services-grid">
          <Link href="/disease" className="service-card fade-in-up">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}>
              <i className="fa-solid fa-microscope"></i>
            </div>
            <h3>{t('disease')}</h3>
            <p>{t('home_service_disease_desc')}</p>
            <span className="service-tag">AI Powered</span>
          </Link>
          <Link href="/soil" className="service-card fade-in-up delay-1">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #8D6E63, #5D4037)' }}>
              <i className="fa-solid fa-mountain"></i>
            </div>
            <h3>{t('profile_soil_type')}</h3>
            <p>{t('home_service_soil_desc')}</p>
            <span className="service-tag">Image Analysis</span>
          </Link>
          <Link href="/weather" className="service-card fade-in-up delay-2">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #29B6F6, #0277BD)' }}>
              <i className="fa-solid fa-cloud-sun-rain"></i>
            </div>
            <h3>{t('weather')}</h3>
            <p>{t('home_service_weather_desc')}</p>
            <span className="service-tag">Real-time</span>
          </Link>
          <Link href="/chatbot" className="service-card fade-in-up delay-3">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #AB47BC, #6A1B9A)' }}>
              <i className="fa-solid fa-robot"></i>
            </div>
            <h3>{t('chatbot')}</h3>
            <p>{t('home_service_ai_desc')}</p>
            <span className="service-tag">24/7 Available</span>
          </Link>
          <Link href="/market" className="service-card fade-in-up delay-1">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #FFA726, #E65100)' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3>{t('market')}</h3>
            <p>{t('home_service_market_desc')}</p>
            <span className="service-tag">Live Prices</span>
          </Link>
          <Link href="/machinery" className="service-card fade-in-up delay-2">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #26C6DA, #00838F)' }}>
              <i className="fa-solid fa-tractor"></i>
            </div>
            <h3>{t('machinery')}</h3>
            <p>{t('home_service_machinery_desc')}</p>
            <span className="service-tag">Near You</span>
          </Link>
          <Link href="/schemes" className="service-card fade-in-up delay-3">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #66BB6A, #2E7D32)' }}>
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <h3>{t('schemes')}</h3>
            <p>{t('home_service_schemes_desc')}</p>
            <span className="service-tag">Government</span>
          </Link>
          <Link href="/voice" className="service-card fade-in-up delay-1">
            <div className="service-icon" style={{ background: 'linear-gradient(135deg, #EF5350, #B71C1C)' }}>
              <i className="fa-solid fa-microphone"></i>
            </div>
            <h3>{t('voice')}</h3>
            <p>{t('home_service_voice_desc')}</p>
            <span className="service-tag">Hindi Voice</span>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="krishi-container">
          <h2 className="section-title fade-in-up" style={{ color: '#fff' }} dangerouslySetInnerHTML={{ __html: t('home_how_it_works') }}></h2>
          <div className="steps-row">
            <div className="step-item fade-in-up">
              <div className="step-circle">1</div>
              <i className="fa-solid fa-camera step-icon"></i>
              <h4>{t('home_step1_title')}</h4>
              <p>{t('home_step1_desc')}</p>
            </div>
            <div className="step-arrow"><i className="fa-solid fa-arrow-right"></i></div>
            <div className="step-item fade-in-up delay-1">
              <div className="step-circle">2</div>
              <i className="fa-solid fa-upload step-icon"></i>
              <h4>{t('home_step2_title')}</h4>
              <p>{t('home_step2_desc')}</p>
            </div>
            <div className="step-arrow"><i className="fa-solid fa-arrow-right"></i></div>
            <div className="step-item fade-in-up delay-2">
              <div className="step-circle">3</div>
              <i className="fa-solid fa-brain step-icon"></i>
              <h4>{t('home_step3_title')}</h4>
              <p>{t('home_step3_desc')}</p>
            </div>
            <div className="step-arrow"><i className="fa-solid fa-arrow-right"></i></div>
            <div className="step-item fade-in-up delay-3">
              <div className="step-circle">4</div>
              <i className="fa-solid fa-lightbulb step-icon"></i>
              <h4>{t('home_step4_title')}</h4>
              <p>{t('home_step4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section krishi-container">
        <h2 className="section-title fade-in-up" dangerouslySetInnerHTML={{ __html: t('home_testimonials') }}></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card fade-in-up">
            <div className="testimonial-quote"><i className="fa-solid fa-quote-left"></i></div>
            <p>{t('home_testimonial_1_text')}</p>
            <div className="testimonial-author">
              <div className="author-avatar">रS</div>
              <div>
                <strong>{t('home_testimonial_1_author')}</strong>
                <small>{t('home_testimonial_1_sub')}</small>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          <div className="testimonial-card fade-in-up delay-1">
            <div className="testimonial-quote"><i className="fa-solid fa-quote-left"></i></div>
            <p>{t('home_testimonial_2_text')}</p>
            <div className="testimonial-author">
              <div className="author-avatar">सK</div>
              <div>
                <strong>{t('home_testimonial_2_author')}</strong>
                <small>{t('home_testimonial_2_sub')}</small>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          <div className="testimonial-card fade-in-up delay-2">
            <div className="testimonial-quote"><i className="fa-solid fa-quote-left"></i></div>
            <p>{t('home_testimonial_3_text')}</p>
            <div className="testimonial-author">
              <div className="author-avatar">मP</div>
              <div>
                <strong>{t('home_testimonial_3_author')}</strong>
                <small>{t('home_testimonial_3_sub')}</small>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner fade-in-up">
        <div className="krishi-container cta-inner">
          <div>
            <h2 dangerouslySetInnerHTML={{ __html: t('home_cta_title') }}></h2>
            <p>{t('home_cta_desc')}</p>
          </div>
          <Link href="/dashboard" className="btn-krishi-primary cta-btn">
            <i className="fa-solid fa-rocket"></i> {t('home_cta_btn')}
          </Link>
        </div>
      </section>
    </>
  );
}

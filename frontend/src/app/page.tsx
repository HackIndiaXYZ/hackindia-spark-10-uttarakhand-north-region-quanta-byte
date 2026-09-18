'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from './LanguageContext';

export default function HomePage() {
  const { language } = useTranslation();

  return (
    <>
      {/* ============================================================
          PREMIUM 8-FEATURE CARDS SECTION — main landing content
          ============================================================ */}
      <section className="services-section krishi-container">
        <div className="services-header fade-in-up">
          <h2 className="services-main-title">
            {language === 'hi' ? 'स्मार्ट कृषि समाधान' : 'Smart Agriculture Solutions'}
          </h2>
          <p className="services-main-sub">
            {language === 'hi'
              ? 'एआई-संचालित 8 शक्तिशाली उपकरण — बेहतर फसल, बेहतर जीवन'
              : '8 AI-powered tools to optimize your farm, yield, and income'}
          </p>
        </div>

        <div className="premium-cards-grid">

          {/* ── Card 1: Crop Disease Detection ── */}
          <Link href="/disease" className="pcard pcard--disease fade-in-up">
            <div className="pcard__corner-badge">AI</div>
            <div className="pcard__img-wrap">
              <img src="/images/crop_disease.png" alt="Crop Disease Detection" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'फसल रोग पहचान' : 'Crop Disease Detection'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'पत्ती की फोटो अपलोड करें और तुरंत रोग निदान व उपचार सलाह पाएं।'
                  : 'Upload a leaf image and get AI-powered disease diagnosis & treatment instantly.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn">
                  {language === 'hi' ? 'जांच करें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon"><i className="fa-solid fa-leaf"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 2: Soil Analysis ── */}
          <Link href="/soil" className="pcard pcard--soil fade-in-up delay-1">
            <div className="pcard__corner-badge pcard__corner-badge--soil">Lab</div>
            <div className="pcard__img-wrap">
              <img src="/images/soil_analysis.png" alt="Soil Analysis" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'मृदा स्वास्थ्य जांच' : 'Soil Analysis'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'मिट्टी के प्रकार, पोषक तत्व जानें और उर्वरक सिफारिशें पाएं।'
                  : 'Detect soil type, nutrients & get fertilizer recommendations using AI.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--soil">
                  {language === 'hi' ? 'जांच करें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--soil"><i className="fa-solid fa-flask"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 3: Pest Detection ── */}
          <Link href="/pest" className="pcard pcard--pest fade-in-up delay-2">
            <div className="pcard__corner-badge pcard__corner-badge--pest">AI</div>
            <div className="pcard__img-wrap">
              <img src="/images/pest_detection.png" alt="Pest Detection" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'कीट पहचान' : 'Pest Detection'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'कीट पहचानने के लिए फसल की फोटो अपलोड करें और एआई समाधान पाएं।'
                  : 'Upload a crop image to detect pests & get AI-based control solutions.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--pest">
                  {language === 'hi' ? 'पहचानें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--pest"><i className="fa-solid fa-bug"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 4: Weather Forecast ── */}
          <Link href="/weather" className="pcard pcard--weather fade-in-up delay-3">
            <div className="pcard__img-wrap">
              <img src="/images/weather_forecast.png" alt="Weather Forecast" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Forecast'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'खेत के स्थान के लिए लाइव मौसम और 5 दिनों का पूर्वानुमान देखें।'
                  : 'Live weather updates & 5-day forecast tailored for your farm location.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--weather">
                  {language === 'hi' ? 'मौसम देखें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--weather"><i className="fa-solid fa-location-dot"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 5: Mandi Market Price ── */}
          <Link href="/market" className="pcard pcard--market fade-in-up">
            <div className="pcard__img-wrap">
              <img src="/images/mandi_price.png" alt="Mandi Market Price" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'मंडी बाजार भाव' : 'Mandi Market Price'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'रियल-टाइम मंडी भाव, MSP और मूल्य प्रवृत्ति ट्रैक करें।'
                  : 'Real-time mandi rates, MSP details & price trends for your crops.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--market">
                  {language === 'hi' ? 'भाव देखें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--market"><i className="fa-solid fa-indian-rupee-sign"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 6: Government Schemes ── */}
          <Link href="/schemes" className="pcard pcard--schemes fade-in-up delay-1">
            <div className="pcard__img-wrap">
              <img src="/images/government_schemes.png" alt="Government Schemes" className="pcard__img" />
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'PM-KISAN, KCC, PMFBY और अन्य सरकारी सब्सिडी योजनाएं देखें।'
                  : 'Explore PM-KISAN, KCC, PMFBY & other farming subsidies & schemes.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--schemes">
                  {language === 'hi' ? 'योजनाएं देखें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--schemes"><i className="fa-solid fa-landmark"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 7: Voice Advisory ── */}
          <Link href="/voice" className="pcard pcard--voice fade-in-up delay-2">
            <div className="pcard__corner-badge pcard__corner-badge--voice">
              <i className="fa-solid fa-microphone" style={{fontSize:'0.6rem'}}></i>
            </div>
            <div className="pcard__img-wrap pcard__img-wrap--svg">
              <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" className="pcard__svg">
                <defs>
                  <radialGradient id="vGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="micBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc"/>
                    <stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                  <linearGradient id="micHead" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e879f9"/>
                    <stop offset="100%" stopColor="#9333ea"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <ellipse cx="140" cy="110" rx="80" ry="75" fill="url(#vGlow)"/>
                <path d="M55 80 Q40 110 55 140" stroke="#a855f7" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" filter="url(#glow)"/>
                <path d="M68 65 Q45 110 68 155" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
                <path d="M225 80 Q240 110 225 140" stroke="#a855f7" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" filter="url(#glow)"/>
                <path d="M212 65 Q235 110 212 155" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
                <rect x="130" y="148" width="20" height="30" rx="4" fill="url(#micBody)"/>
                <rect x="108" y="172" width="64" height="10" rx="5" fill="url(#micBody)"/>
                <rect x="114" y="50" width="52" height="100" rx="26" fill="url(#micHead)" filter="url(#glow)"/>
                <line x1="114" y1="85" x2="166" y2="85" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <line x1="114" y1="100" x2="166" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <line x1="114" y1="115" x2="166" y2="115" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <line x1="114" y1="130" x2="166" y2="130" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <ellipse cx="130" cy="68" rx="8" ry="12" fill="rgba(255,255,255,0.18)" transform="rotate(-10 130 68)"/>
              </svg>
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'ध्वनि सलाहकार' : 'Voice Advisory'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'हिंदी में बोलकर खेती के सवाल पूछें और तुरंत आवाज़ में जवाब पाएं।'
                  : 'Ask farming questions by voice in Hindi or English and get instant answers.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--voice">
                  {language === 'hi' ? 'बोलें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--voice"><i className="fa-solid fa-waveform-lines"></i></span>
              </div>
            </div>
          </Link>

          {/* ── Card 8: Organic Farming ── */}
          <Link href="/organic" className="pcard pcard--organic fade-in-up delay-3">
            <div className="pcard__corner-badge pcard__corner-badge--organic">
              <i className="fa-solid fa-leaf" style={{fontSize:'0.6rem'}}></i>
            </div>
            <div className="pcard__img-wrap pcard__img-wrap--svg">
              <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" className="pcard__svg">
                <defs>
                  <radialGradient id="oGlow2" cx="50%" cy="60%" r="55%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="plantGreen2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399"/>
                    <stop offset="100%" stopColor="#059669"/>
                  </linearGradient>
                  <linearGradient id="soilBrown2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#78350f"/>
                    <stop offset="100%" stopColor="#3d1a02"/>
                  </linearGradient>
                  <filter id="plantGlow2">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <ellipse cx="140" cy="130" rx="90" ry="70" fill="url(#oGlow2)"/>
                <ellipse cx="140" cy="158" rx="65" ry="18" fill="#1c0a00" opacity="0.8"/>
                <path d="M75 145 Q140 175 205 145 L200 158 Q140 188 80 158 Z" fill="url(#soilBrown2)"/>
                <ellipse cx="140" cy="145" rx="65" ry="18" fill="#78350f"/>
                <ellipse cx="140" cy="143" rx="60" ry="15" fill="#92400e" opacity="0.7"/>
                <path d="M140 145 L140 70" stroke="url(#plantGreen2)" strokeWidth="7" strokeLinecap="round" filter="url(#plantGlow2)"/>
                <path d="M140 95 Q95 55 112 108 Q126 108 140 95Z" fill="url(#plantGreen2)" filter="url(#plantGlow2)"/>
                <path d="M140 80 Q185 40 168 92 Q154 92 140 80Z" fill="url(#plantGreen2)" filter="url(#plantGlow2)"/>
                <path d="M140 72 Q112 52 120 75 Q130 75 140 72Z" fill="#34d399" opacity="0.8"/>
                <circle cx="90" cy="100" r="3.5" fill="#34d399" opacity="0.8" filter="url(#plantGlow2)"/>
                <circle cx="195" cy="85" r="2.5" fill="#6ee7b7" opacity="0.7" filter="url(#plantGlow2)"/>
                <circle cx="210" cy="115" r="3" fill="#34d399" opacity="0.7" filter="url(#plantGlow2)"/>
              </svg>
            </div>
            <div className="pcard__body">
              <h3 className="pcard__title">
                {language === 'hi' ? 'जैविक खेती संवर्धन' : 'Organic Farming'}
              </h3>
              <p className="pcard__desc">
                {language === 'hi'
                  ? 'प्रमाणन गाइड, जैविक खाद रेसिपी और बेहतर पैदावार के सर्वोत्तम तरीके।'
                  : 'Certification guides, organic fertilizer recipes & best practices for better yield.'}
              </p>
              <div className="pcard__footer">
                <span className="pcard__btn pcard__btn--organic">
                  {language === 'hi' ? 'सीखें' : 'Explore'} <i className="fa-solid fa-arrow-right"></i>
                </span>
                <span className="pcard__icon pcard__icon--organic"><i className="fa-solid fa-seedling"></i></span>
              </div>
            </div>
          </Link>

        </div>
      </section>
    </>
  );
}

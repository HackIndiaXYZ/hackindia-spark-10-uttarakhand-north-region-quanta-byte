'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function SoilPage() {
  const { t, language } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [location, setLocation] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default location from user profile if available
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/profile`);
      return res.json();
    }
  });

  useEffect(() => {
    if (profile) {
      setLocation(profile.district || profile.village || '');
    }
  }, [profile]);

  // Toast dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Soil analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/soil`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze soil image');
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setToast({ message: language === 'hi' ? 'मिट्टी जांच पूरी हुई!' : 'Soil Analysis Complete!', type: 'success' });
    },
    onError: () => {
      setToast({ message: language === 'hi' ? 'जांच करने में विफलता। कृपया पुनः प्रयास करें।' : 'Analysis failed. Please try again.', type: 'error' });
    }
  });

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToast({ message: language === 'hi' ? 'कृपया सिर्फ इमेज फाइल चुनें' : 'Please select image files only', type: 'warning' });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setToast({ message: language === 'hi' ? 'पहले फोटो अपलोड करें!' : 'Upload a photo first!', type: 'warning' });
      return;
    }
    if (!location.trim()) {
      setToast({ message: language === 'hi' ? 'कृपया स्थान दर्ज करें' : 'Please enter location', type: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('location', location);
    formData.append('image', imageFile);

    setAnalysisResult(null);
    analyzeMutation.mutate(formData);
  };

  return (
    <div className="krishi-container upload-page-wrap" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      {/* Toast */}
      {toast && (
        <div 
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: 'rgba(17, 24, 39, 0.95)', borderLeft: `4px solid ${toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#F59E0B'}`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#F3F4F6',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'
          }`} style={{ color: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#F59E0B' }}></i>
          {toast.message}
        </div>
      )}

      <div className="page-header fade-in-up">
        <h1 className="page-title" style={{ color: '#F59E0B' }}><i className="fa-solid fa-mountain"></i> {language === 'hi' ? 'मिट्टी स्वास्थ्य जांच' : 'Soil Health Analysis'}</h1>
        <p className="page-sub">{language === 'hi' ? 'अपनी मिट्टी की फोटो अपलोड करें और तुरंत पाएँ उर्वरता, pH और पोषण की जानकारी।' : 'Upload a photo of your soil to get AI-powered insights on pH, fertility, and nutrients.'}</p>
      </div>

      <div className="upload-layout">
        {/* Upload Form */}
        <div className="krishi-card upload-card fade-in-up" style={{ borderLeft: '3px solid #D97706' }}>
          <form onSubmit={handleSubmit}>
            <div 
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`} 
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              style={{
                background: 'rgba(3, 7, 18, 0.4)',
                border: '2px dashed rgba(217, 119, 6, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                marginBottom: '1.5rem'
              }}
            >
              {!imagePreview ? (
                <div>
                  <div style={{ fontSize: '3rem', color: '#D97706', marginBottom: '1rem' }}><i className="fa-solid fa-layer-group"></i></div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{language === 'hi' ? 'मिट्टी की फोटो खींचें या अपलोड करें' : 'Snap or Upload Soil Photo'}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '1rem' }}>{language === 'hi' ? 'JPG, PNG formats supported' : 'JPG, PNG formats supported'}</p>
                  <label htmlFor="soilImage" className="btn-krishi-primary" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>
                    <i className="fa-solid fa-camera"></i> {language === 'hi' ? 'Photo चुनें' : 'Choose Photo'}
                  </label>
                  <input 
                    type="file" 
                    id="soilImage" 
                    accept="image/*" 
                    capture="environment" 
                    hidden 
                    onChange={handleFileInputChange}
                    ref={fileInputRef}
                  />
                </div>
              ) : (
                <div className="image-preview-wrap" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={imagePreview} alt="Soil Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} />
                  <button type="button" className="remove-image-btn" onClick={removeImage} style={{
                    position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff',
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#D97706' }}><i className="fa-solid fa-location-dot"></i> {language === 'hi' ? 'जिला / स्थान' : 'District / Location'}</label>
              <input 
                type="text" 
                className="krishi-input" 
                placeholder={language === 'hi' ? 'जैसे: वाराणसी, उत्तर प्रदेश' : 'e.g. Varanasi, Uttar Pradesh'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-krishi-primary full-btn" 
              disabled={analyzeMutation.isPending}
              style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}
            >
              {analyzeMutation.isPending ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> {language === 'hi' ? 'जांच की जा रही है...' : 'Analyzing...'}</>
              ) : (
                <><i className="fa-solid fa-brain"></i> {language === 'hi' ? 'मिट्टी की जांच करें' : 'Analyze Soil'}</>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="result-section fade-in-up delay-1">
          {analyzeMutation.isPending && (
            <div className="krishi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 1rem' }}>
              <i className="fa-solid fa-flask fa-spin" style={{ fontSize: '3rem', color: '#D97706', marginBottom: '1.5rem' }}></i>
              <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>{language === 'hi' ? 'मिट्टी के कणों का विश्लेषण चालू है...' : 'Scanning Soil Composition...'}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.5rem' }}>{language === 'hi' ? 'कृत्रिम बुद्धिमत्ता (AI) द्वारा पोषक तत्वों की जांच' : 'AI algorithm calculating pH and fertility indicators'}</p>
            </div>
          )}

          {analysisResult ? (
            <div className="krishi-card" style={{ borderTop: '4px solid #D97706' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <i className="fa-solid fa-vial"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>{analysisResult.soil_type}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{language === 'hi' ? 'सटीक एआई विश्लेषण' : 'Advanced AI Analysis Report'}</p>
                </div>
              </div>

              {/* pH Meter */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(3, 7, 18, 0.4)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  <span>pH Level (Estimated)</span>
                  <span style={{ color: '#D97706' }}>{analysisResult.ph}</span>
                </div>
                <div style={{ height: '8px', background: 'linear-gradient(90deg, #EF4444 0%, #10B981 50%, #3B82F6 100%)', borderRadius: '4px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: '-4px', left: `${Math.min(100, Math.max(0, ((analysisResult.ph - 4) / 6) * 100))}%`,
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '3px solid #D97706', transform: 'translateX(-50%)', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                  <span>Acidic (अम्लीय)</span>
                  <span>Neutral (सामान्य)</span>
                  <span>Alkaline (क्षारीय)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'नमी (Moisture)' : 'Moisture'}</span>
                  <strong style={{ fontSize: '1rem', color: '#fff', marginTop: '0.2rem', display: 'block' }}>
                    {analysisResult.moisture === 'High' ? (language === 'hi' ? 'उच्च' : 'High') : analysisResult.moisture === 'Medium' ? (language === 'hi' ? 'मध्यम' : 'Medium') : (language === 'hi' ? 'कम' : 'Low')}
                  </strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'उर्वरता (Fertility)' : 'Fertility'}</span>
                  <strong style={{ fontSize: '1rem', color: '#fff', marginTop: '0.2rem', display: 'block' }}>
                    {analysisResult.fertility === 'High' ? (language === 'hi' ? 'उच्च' : 'High') : analysisResult.fertility === 'Medium' ? (language === 'hi' ? 'मध्यम' : 'Medium') : (language === 'hi' ? 'कम' : 'Low')}
                  </strong>
                </div>
              </div>

              {/* Recommended Crops */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#D97706', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-seedling"></i> {language === 'hi' ? 'अनुशंसित फसलें' : 'Recommended Crops'}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {analysisResult.recommended_crops.map((crop: string, idx: number) => (
                    <span key={idx} style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#F59E0B', border: '1px solid rgba(217, 119, 6, 0.2)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fertilizers Advice */}
              <div style={{ background: 'rgba(217, 119, 6, 0.03)', border: '1px solid rgba(217, 119, 6, 0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#F59E0B', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <i className="fa-solid fa-flask"></i> {language === 'hi' ? 'उर्वरक एवं पोषक तत्व सलाह' : 'Fertilizer & Nutrient Advice'}
                </h4>
                <p style={{ color: '#D1D5DB', fontSize: '0.88rem', lineHeight: 1.6 }}>{analysisResult.fertilizer_advice}</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-krishi-secondary" onClick={() => window.print()} style={{ flex: 1, borderColor: '#D97706', color: '#F59E0B' }}>
                  <i className="fa-solid fa-print"></i> {language === 'hi' ? 'रिपोर्ट प्रिंट' : 'Print Report'}
                </button>
                <Link href="/chatbot" className="btn-krishi-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#fff', justifyContent: 'center' }}>
                  <i className="fa-solid fa-robot"></i> {language === 'hi' ? 'AI सलाह लें' : 'Consult AI'}
                </Link>
              </div>
            </div>
          ) : (
            /* Placeholder when no result */
            !analyzeMutation.isPending && (
              <div className="krishi-card placeholder-result-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(217, 119, 6, 0.05)', color: '#D97706', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>{language === 'hi' ? 'मिट्टी जांच रिपोर्ट' : 'Soil Analysis Report'}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.88rem', maxWidth: '320px', margin: '0.5rem auto 1.5rem' }}>{language === 'hi' ? 'कृपया अपनी मिट्टी की फोटो अपलोड करें और जांच शुरू करें।' : 'Upload a photo of your field soil and input location to generate report.'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', width: '100%', maxWidth: '280px', fontSize: '0.82rem', color: '#9CA3AF', background: 'rgba(3, 7, 18, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#D97706' }}></i> <span>हाथ में मिट्टी रखकर साफ़ फ़ोटो लें</span></div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#D97706' }}></i> <span>पर्याप्त रोशनी (धूप) में फ़ोटो लें</span></div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#D97706' }}></i> <span>ऊपरी सतह हटाकर 10cm गहरी मिट्टी लें</span></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

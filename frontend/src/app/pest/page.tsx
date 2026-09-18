'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function PestPage() {
  const { t, language } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mutation to analyze crop pest by hitting the disease endpoint with custom symptoms
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/disease`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze pest image');
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setToast({ message: language === 'hi' ? 'कीट पहचान पूरी हुई!' : 'Pest Identification Complete!', type: 'success' });
    },
    onError: () => {
      setToast({ message: language === 'hi' ? 'पहचान करने में विफलता। कृपया पुनः प्रयास करें।' : 'Identification failed. Please try again.', type: 'error' });
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
    if (!selectedCrop) {
      setToast({ message: language === 'hi' ? 'कृपया फसल का चयन करें' : 'Please select a crop', type: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('crop', selectedCrop);
    // Guide the backend Gemini prompt towards pest/insect identification specifically
    const guidedSymptoms = `[PEST IDENTIFICATION REQUEST] The user wants to identify insect pests on this crop. User observation: ${symptoms || 'None reported'}. Identify the pest/insect, damage symptoms, chemical and biological control measures.`;
    formData.append('symptoms', guidedSymptoms);
    formData.append('image', imageFile);

    setAnalysisResult(null);
    analyzeMutation.mutate(formData);
  };

  const getCropTranslation = (cropName: string) => {
    const clean = cropName.split(' (')[0];
    return t(`crop_${clean}`) || clean;
  };

  const getPestName = (name: string) => {
    if (!name) return '';
    if (language === 'hi') {
      return name.split(' (')[0];
    } else {
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1] : name;
    }
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
        <h1 className="page-title" style={{ color: '#22C55E' }}><i className="fa-solid fa-bug"></i> {language === 'hi' ? 'कीट एवं रोग नियंत्रण' : 'Pest Detection & Control'}</h1>
        <p className="page-sub">{language === 'hi' ? 'कीट या फसल नुकसान की फोटो लें और एआई से पाएं जैविक व रासायनिक समाधान।' : 'Snap a photo of insects or crop damage to get instant organic and chemical solutions.'}</p>
      </div>

      <div className="upload-layout">
        {/* Upload Form */}
        <div className="krishi-card upload-card fade-in-up" style={{ borderLeft: '3px solid #22C55E' }}>
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
                border: '2px dashed rgba(34, 197, 94, 0.3)',
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
                  <div style={{ fontSize: '3rem', color: '#22C55E', marginBottom: '1rem' }}><i className="fa-solid fa-cloud-arrow-up"></i></div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{language === 'hi' ? 'कीट की फोटो खींचें या अपलोड करें' : 'Snap or Upload Pest Photo'}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '1rem' }}>{language === 'hi' ? 'जैसे: टिड्डी, इल्ली, कीट नुकसान' : 'e.g. Locusts, caterpillars, crop damage'}</p>
                  <label htmlFor="pestImage" className="btn-krishi-primary" style={{ background: 'linear-gradient(135deg, #22C55E, #10B981)', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}>
                    <i className="fa-solid fa-camera"></i> {language === 'hi' ? 'Photo चुनें' : 'Choose Photo'}
                  </label>
                  <input 
                    type="file" 
                    id="pestImage" 
                    accept="image/*" 
                    capture="environment" 
                    hidden 
                    onChange={handleFileInputChange}
                    ref={fileInputRef}
                  />
                </div>
              ) : (
                <div className="image-preview-wrap" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={imagePreview} alt="Pest Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} />
                  <button type="button" className="remove-image-btn" onClick={removeImage} style={{
                    position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff',
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Crop Select */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#22C55E' }}><i className="fa-solid fa-seedling"></i> {t('disease_crop_label')}</label>
              <select 
                className="krishi-input" 
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                required
              >
                <option value="">{t('disease_select_crop')}</option>
                <option value="गेहूं (Wheat)">{t('crop_गेहूं') || 'गेहूं'} (Wheat)</option>
                <option value="धान (Paddy)">{t('crop_धान') || 'धान'} (Paddy)</option>
                <option value="मक्का (Maize)">{t('crop_मक्का') || 'मक्का'} (Maize)</option>
                <option value="सरसों (Mustard)">{t('crop_सरसों') || 'सरसों'} (Mustard)</option>
                <option value="टमाटर (Tomato)">{t('crop_टमाटर') || 'टमाटर'} (Tomato)</option>
                <option value="आलू (Potato)">{t('crop_आलू') || 'आलू'} (Potato)</option>
                <option value="प्याज (Onion)">{t('crop_प्याज') || 'प्याज'} (Onion)</option>
                <option value="मिर्च (Chili)">{t('crop_मिर्च') || 'मिर्च'} (Chili)</option>
                <option value="गन्ना (Sugarcane)">{t('crop_गन्ना') || 'गन्ना'} (Sugarcane)</option>
              </select>
            </div>

            {/* Symptoms / Observation */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#22C55E' }}><i className="fa-solid fa-eye"></i> {language === 'hi' ? 'कीट या नुकसान के लक्षण' : 'Observations / Symptoms'}</label>
              <textarea 
                className="krishi-input" 
                rows={3} 
                placeholder={language === 'hi' ? 'जैसे: पत्तियों पर कीड़े, कटे हुए किनारे, छिद्र आदि...' : 'e.g. insects on leaves, holes, skeletonized crop...'}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-krishi-primary full-btn" 
              disabled={analyzeMutation.isPending}
              style={{ background: 'linear-gradient(135deg, #22C55E, #10B981)', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
            >
              {analyzeMutation.isPending ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> {language === 'hi' ? 'पहचान हो रही है...' : 'Scanning...'}</>
              ) : (
                <><i className="fa-solid fa-brain"></i> {language === 'hi' ? 'कीट की जांच करें' : 'Detect Pest'}</>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="result-section fade-in-up delay-1">
          {analyzeMutation.isPending && (
            <div className="krishi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 1rem' }}>
              <i className="fa-solid fa-bug fa-spin" style={{ fontSize: '3rem', color: '#22C55E', marginBottom: '1.5rem' }}></i>
              <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>{language === 'hi' ? 'कीट प्रजाति की पहचान जारी है...' : 'Scanning Pest Database...'}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '0.5rem' }}>{language === 'hi' ? 'मशीन लर्निंग द्वारा कीट व नियंत्रण पद्धतियों का विश्लेषण' : 'Evaluating damage patterns and bio-chemical controls'}</p>
            </div>
          )}

          {analysisResult ? (
            <div className="krishi-card" style={{ borderTop: '4px solid #22C55E' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>{getPestName(analysisResult.disease_name)}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{getCropTranslation(analysisResult.crop)} {language === 'hi' ? 'की फसल पर' : 'crop'}</p>
                </div>
                <div className={`severity-badge severity-${analysisResult.severity.toLowerCase()}`} style={{ marginLeft: 'auto' }}>
                  {language === 'hi' ? (analysisResult.severity === 'High' ? 'अति नुकसानदेह' : analysisResult.severity === 'Medium' ? 'मध्यम' : 'न्यून') : analysisResult.severity}
                </div>
              </div>

              {/* Confidence */}
              <div className="confidence-section" style={{ marginBottom: '1.5rem' }}>
                <div className="confidence-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '0.4rem' }}>
                  <span>AI Confidence</span>
                  <strong style={{ color: '#22C55E' }}>{analysisResult.confidence}%</strong>
                </div>
                <div className="confidence-track" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="confidence-fill-bar" style={{ width: `${analysisResult.confidence}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #10B981)' }}></div>
                </div>
              </div>

              {/* Behavior & Damage */}
              <div className="result-section-block" style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#22C55E', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}><i className="fa-solid fa-circle-exclamation"></i> {language === 'hi' ? 'नुकसान और व्यवहार' : 'Damage Symptoms & Behavior'}</h4>
                <p style={{ color: '#D1D5DB', fontSize: '0.88rem', lineHeight: 1.6 }}>{analysisResult.cause}</p>
              </div>

              {/* Control measures */}
              <div className="result-section-block treatment-block" style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#22C55E', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}><i className="fa-solid fa-spray-can-sparkles"></i> {language === 'hi' ? 'कीट नियंत्रण उपाय (जैविक व रासायनिक)' : 'Control Measures (Organic & Chemical)'}</h4>
                <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                  {analysisResult.treatment.map((step: string, index: number) => (
                    <li key={index} style={{ color: '#D1D5DB', fontSize: '0.88rem', display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', lineHeight: 1.5 }}>
                      <i className="fa-solid fa-circle-check" style={{ color: '#22C55E', marginTop: '3px', flexShrink: 0 }}></i>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention */}
              <div className="result-section-block prevention-block" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#22C55E', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}><i className="fa-solid fa-shield-halved"></i> {language === 'hi' ? 'भविष्य में कीट से बचाव' : 'Prevention Strategy'}</h4>
                <p style={{ color: '#D1D5DB', fontSize: '0.88rem', lineHeight: 1.6 }}>{analysisResult.prevention}</p>
              </div>

              {/* Warning */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)', border: '1.5px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px',
                padding: '0.75rem', fontSize: '0.82rem', color: '#F59E0B', marginTop: '1rem', display: 'flex', gap: '0.5rem', fontWeight: 500, lineHeight: 1.5
              }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: '2px' }}></i>
                <span>{language === 'hi' ? 'चेतावनी: यह एआई कीटनाशक सुझाव है। वास्तविक प्रयोग से पहले स्थानीय कृषि सेवा अधिकारी या विशेषज्ञ से सलाह ज़रूर लें।' : 'Advisory Note: These are AI-suggested measures. Please consult an agronomist or extension officer before chemical spray.'}</span>
              </div>

              <div className="result-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-krishi-secondary" onClick={() => window.print()} style={{ flex: 1, borderColor: '#22C55E', color: '#22C55E' }}>
                  <i className="fa-solid fa-print"></i> {language === 'hi' ? 'प्रिंट' : 'Print'}
                </button>
                <Link href="/chatbot" className="btn-krishi-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #22C55E, #10B981)', color: '#fff', justifyContent: 'center' }}>
                  <i className="fa-solid fa-robot"></i> {language === 'hi' ? 'AI सहायक से पूछें' : 'Ask AI Bot'}
                </Link>
              </div>
            </div>
          ) : (
            /* Placeholder when no result */
            !analyzeMutation.isPending && (
              <div className="krishi-card placeholder-result-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', color: '#22C55E', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-bug"></i>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>{language === 'hi' ? 'कीट पहचान रिपोर्ट' : 'Pest Diagnostics Report'}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.88rem', maxWidth: '320px', margin: '0.5rem auto 1.5rem' }}>{language === 'hi' ? 'कीट या फसल बर्बादी की साफ़ फोटो अपलोड करें और जांच शुरू करें।' : 'Upload a clear photo of the insect or crop damages to diagnose.'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', width: '100%', maxWidth: '280px', fontSize: '0.82rem', color: '#9CA3AF', background: 'rgba(3, 7, 18, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#22C55E' }}></i> <span>प्रभावित पत्ती/कीड़े की नज़दीकी फ़ोटो लें</span></div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#22C55E' }}></i> <span>फ़ोटो में कीड़ा साफ़ दिखना चाहिए</span></div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-info" style={{ color: '#22C55E' }}></i> <span>लक्षण व फसल नाम सही चुनें</span></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function DiseasePage() {
  const { t, language } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geolocation detector or profile district lookup for crop defaults
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/profile`);
      return res.json();
    }
  });

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mutation to analyze crop disease
  const analyzeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/disease`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze crop image');
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setToast({ message: language === 'hi' ? 'जांच पूरी हुई!' : 'Inspection Complete!', type: 'success' });
    },
    onError: () => {
      setToast({ message: language === 'hi' ? 'जांच करने में विफलता। कृपया पुनः प्रयास करें।' : 'Inspection failed. Please try again.', type: 'error' });
    }
  });

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToast({ message: language === 'hi' ? 'कृपया सिर्फ इमेज फाइल चुनें' : 'Please select image files only', type: 'warning' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: language === 'hi' ? 'फाइल बहुत बड़ी है। Max 10MB allowed.' : 'File too large. Max 10MB allowed.', type: 'warning' });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    if (file.size < 20 * 1024) {
      setToast({ message: language === 'hi' ? 'फोटो की क्वालिटी कम है। साफ़ फोटो लें।' : 'Low image quality. Please take a clear photo.', type: 'warning' });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Drag & Drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
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
    if (symptoms) formData.append('symptoms', symptoms);
    formData.append('image', imageFile);

    setAnalysisResult(null); // Clear previous result
    analyzeMutation.mutate(formData);
  };

  const getCropTranslation = (cropName: string) => {
    const clean = cropName.split(' (')[0];
    return t(`crop_${clean}`) || clean;
  };

  const getDiseaseName = (name: string) => {
    if (!name) return '';
    if (language === 'hi') {
      return name.split(' (')[0];
    } else {
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1] : name;
    }
  };

  const translateResultText = (text: string) => {
    if (!text || language === 'hi') return text;
    const map: Record<string, string> = {
      // Cause
      "पुक्सिनिया स्ट्रइफोर्मिस नामक फंगस (Fungus) के कारण। ठंडे और नम मौसम में यह तेज़ी से फैलता है।": "Caused by fungus Puccinia striiformis. Spreads rapidly in cool, wet weather.",
      "जैनथोमोनास ओराइजी नामक बैक्टीरिया के कारण। तेज हवा और बारिश में यह रोग फैलता है।": "Caused by bacteria Xanthomonas oryzae. Disease spreads in strong wind and rain.",
      "अल्टरनेरिया सोलेनी नामक कवक के कारण। पत्तियों पर गोल छल्लेदार काले धब्बे बनते हैं।": "Caused by Alternaria solani fungus. Creates target-like circular dark spots on leaves.",
      "कवक या फंगस के संक्रमण के कारण। हवा और नमी के कारण फैलता है।": "Caused by fungal infection. Spreads through wind and humidity.",
      
      // Treatments
      "खेत में प्रोपिकोनाजोल (Tilt) 25% EC का 1ml प्रति लीटर पानी में मिलाकर छिड़काव करें।": "Spray Propiconazole (Tilt) 25% EC at 1ml per liter of water.",
      "प्रभावित पौधों को खेत से अलग कर नष्ट कर दें।": "Remove and destroy infected plants from the field.",
      "नाइट्रोजन खाद (Urea) का आवश्यकता से अधिक प्रयोग न करें।": "Do not apply excessive Nitrogen fertilizer (Urea).",
      
      "खेत का पानी सुखाएं और नाइट्रोजन की खुराक रोक दें।": "Drain excess water from fields and stop nitrogen dose.",
      "स्ट्रेप्टोसाइक्लिन (Streptocycline) 6 ग्राम को 120 लीटर पानी में मिलाकर छिड़काव करें।": "Spray Streptocycline (6 grams mixed in 120 liters of water).",
      "पोटैशियम खाद की मात्रा बढ़ाएं ताकि पौधे में रोग प्रतिरोधक क्षमता बढ़े।": "Increase potassium fertilizer to boost plant disease resistance.",
      
      "मैन्कोजेब (Mancozeb) 75% WP का 2.5 ग्राम प्रति लीटर पानी में छिड़काव करें।": "Spray Mancozeb 75% WP at 2.5 grams per liter of water.",
      "निचली संक्रमित पत्तियों को तोड़कर जला दें।": "Prune lower infected leaves and burn them.",
      "ड्रिप सिंचाई का प्रयोग करें ताकि पत्तियों पर पानी जमा न हो।": "Use drip irrigation to keep leaf surfaces dry.",
      
      "कॉपर ऑक्सीक्लोराइड 50% WP का 3 ग्राम प्रति लीटर पानी में छिड़काव करें।": "Spray Copper Oxychloride 50% WP at 3 grams per liter of water.",
      "खेत में खरपतवार (Weeds) को साफ रखें।": "Keep the fields free from weeds.",
      
      // Prevention
      "प्रतिरोधी किस्मों (Resistant varieties) जैसे HD 2967 या HD 3086 का चयन करें। समय पर बुवाई करें। (चेतावनी: यह एक AI सलाह है। पुष्टि के लिए स्थानीय कृषि विशेषज्ञ से संपर्क करें)": "Choose resistant varieties like HD 2967 or HD 3086. Sow crops timely. (Note: This is an AI advisory report. Consult your local agronomist before spraying.)",
      "धान की नर्सरी में बीज उपचार (Seed treatment) अवश्य करें। रोग-मुक्त बीजों का चयन करें। (चेतावनी: यह एक AI सलाह है। पुष्टि के लिए स्थानीय कृषि विशेषज्ञ से संपर्क करें)": "Perform seed treatment in paddy nursery. Select disease-free seeds. (Note: This is an AI advisory report. Consult your local agronomist before spraying.)",
      "फसल चक्र (Crop rotation) अपनाएं। टमाटर के साथ आलू की खेती न करें। (चेतावनी: यह एक AI सलाह है। पुष्टि के लिए स्थानीय कृषि विशेषज्ञ से संपर्क करें)": "Practice crop rotation. Do not plant potatoes along with tomatoes. (Note: This is an AI advisory report. Consult your local agronomist before spraying.)",
      "पौधों के बीच पर्याप्त दूरी रखें ताकि हवा और धूप पत्तियों तक अच्छे से पहुंचे। (चेतावनी: यह एक AI सलाह है। पुष्टि के लिए स्थानीय कृषि विशेषज्ञ से संपर्क करें)": "Maintain proper spacing between plants for adequate sunlight and airflow. (Note: This is an AI advisory report. Consult your local agronomist before spraying.)"
    };
    
    const cleanText = text.trim();
    if (map[cleanText]) return map[cleanText];
    
    for (const key in map) {
      if (cleanText.includes(key) || key.includes(cleanText)) {
        return map[key];
      }
    }
    return cleanText;
  };

  return (
    <div className="krishi-container upload-page-wrap" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: '#fff', borderLeft: `4px solid ${toast.type === 'success' ? '#43A047' : toast.type === 'error' ? '#E53935' : '#F9A825'}`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#1B1B1B'
          }}
        >
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'
          }`} style={{ color: toast.type === 'success' ? '#43A047' : toast.type === 'error' ? '#E53935' : '#F9A825' }}></i>
          {toast.message}
        </div>
      )}

      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-microscope"></i> {t('disease_title_page')}</h1>
        <p className="page-sub">{t('disease_sub_page')}</p>
      </div>

      <div className="upload-layout">
        {/* Upload Card */}
        <div className="krishi-card upload-card fade-in-up">
          <form onSubmit={handleSubmit} id="diseaseForm">
            {/* Drag Drop Zone */}
            <div 
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`} 
              id="dropZone"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!imagePreview ? (
                <div className="drop-inner" id="dropInner">
                  <div className="drop-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                  <h3>{t('disease_dropzone_title')}</h3>
                  <p>{t('disease_dropzone_desc')}</p>
                  <label htmlFor="cropImage" className="btn-krishi-primary upload-btn">
                    <i className="fa-solid fa-camera"></i> {t('disease_choose_btn')}
                  </label>
                  <input 
                    type="file" 
                    id="cropImage" 
                    accept="image/*" 
                    capture="environment" 
                    hidden 
                    onChange={handleFileInputChange}
                    ref={fileInputRef}
                  />
                </div>
              ) : (
                /* Preview */
                <div className="image-preview-wrap" id="previewWrap">
                  <img id="imagePreview" src={imagePreview} alt="Crop Preview" />
                  <button type="button" className="remove-image-btn" id="removeImage" onClick={removeImage}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Crop Selection */}
            <div className="form-group">
              <label className="form-label"><i className="fa-solid fa-seedling"></i> {t('disease_crop_label')}</label>
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

            {/* Symptoms */}
            <div className="form-group">
              <label className="form-label"><i className="fa-solid fa-stethoscope"></i> {t('disease_symptoms_label')}</label>
              <textarea 
                className="krishi-input" 
                rows={3} 
                placeholder={t('disease_symptoms_placeholder')}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-krishi-primary full-btn" 
              id="analyzeBtn"
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> {language === 'hi' ? 'जांच हो रही है...' : 'Diagnosing...'}</>
              ) : (
                <><i className="fa-solid fa-brain"></i> {t('disease_submit_btn')}</>
              )}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="result-section fade-in-up delay-1">
          {/* Analyzing State */}
          {analyzeMutation.isPending && (
            <div className="krishi-card analyzing-card" id="analyzingCard">
              <div className="ai-analyzing">
                <div className="ai-spinner">
                  <div className="spinner-ring"></div>
                  <i className="fa-solid fa-brain ai-brain-icon"></i>
                </div>
                <h3>{t('disease_scanning')}</h3>
                <p>{t('disease_scanning_wait')}</p>
                <div className="analyzing-steps">
                  <div className="step-dot active"></div>
                  <div className="step-dot active"></div>
                  <div className="step-dot active"></div>
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {analysisResult ? (
            <div className={`krishi-card result-card ${
              analysisResult.severity === 'High' ? 'result-danger' : 
              analysisResult.severity === 'Medium' ? 'result-warning' : 
              'result-safe'
            } fade-in-up`}>
              <div className="result-header">
                <div className="result-icon">
                  {analysisResult.severity === 'High' ? (
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  ) : analysisResult.severity === 'Medium' ? (
                    <i className="fa-solid fa-circle-exclamation"></i>
                  ) : (
                    <i className="fa-solid fa-circle-check"></i>
                  )}
                </div>
                <div>
                  <h2 className="result-disease-name">{getDiseaseName(analysisResult.disease_name)}</h2>
                  <p className="result-crop">{getCropTranslation(analysisResult.crop)} {language === 'hi' ? 'की फसल' : 'crop'}</p>
                </div>
                <div className={`severity-badge severity-${analysisResult.severity.toLowerCase()}`}>
                  {language === 'hi' ? (analysisResult.severity === 'High' ? 'गंभीर' : analysisResult.severity === 'Medium' ? 'मध्यम' : 'सामान्य') : analysisResult.severity}
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="confidence-section">
                <div className="confidence-label">
                  <span>AI Confidence</span>
                  <strong>{analysisResult.confidence}%</strong>
                </div>
                <div className="confidence-track">
                  <div className="confidence-fill-bar" style={{ width: `${analysisResult.confidence}%` }}></div>
                </div>
              </div>

              {/* Cause */}
              <div className="result-section-block">
                <h4><i className="fa-solid fa-magnifying-glass"></i> {t('disease_cause')}</h4>
                <p>{translateResultText(analysisResult.cause)}</p>
              </div>

              {/* Treatment */}
              <div className="result-section-block treatment-block">
                <h4><i className="fa-solid fa-syringe"></i> {t('disease_treatment')}</h4>
                <ul>
                  {analysisResult.treatment.map((step: string, index: number) => (
                    <li key={index}><i className="fa-solid fa-arrow-right"></i> {translateResultText(step)}</li>
                  ))}
                </ul>
              </div>

              {/* Prevention */}
              <div className="result-section-block prevention-block">
                <h4><i className="fa-solid fa-shield-halved"></i> {t('disease_prevention')}</h4>
                <p>{translateResultText(analysisResult.prevention)}</p>
              </div>

              {/* Advisory Disclaimer */}
              <div 
                style={{
                  background: '#FFF3E0',
                  border: '1.5px solid #F9A825',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.82rem',
                  color: '#6D4C00',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontWeight: 600,
                  lineHeight: 1.5
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#F9A825', marginTop: '2px' }}></i>
                <span>{t('disease_warning_disclaimer')}</span>
              </div>

              <div className="result-actions">
                <button className="btn-krishi-secondary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print"></i> {language === 'hi' ? 'प्रिंट' : 'Print'}
                </button>
                <Link href="/chatbot" className="btn-krishi-primary">
                  <i className="fa-solid fa-robot"></i> {t('home_ask_cta')}
                </Link>
              </div>
            </div>
          ) : (
            /* Placeholder when no result */
            !analyzeMutation.isPending && (
              <div className="krishi-card placeholder-result-card">
                <div className="placeholder-inner">
                  <i className="fa-solid fa-leaf placeholder-icon"></i>
                  <h3>{t('disease_empty_title')}</h3>
                  <p>{t('disease_empty_desc')}</p>
                  <ul className="placeholder-tips">
                    <li><i className="fa-solid fa-camera"></i> {t('disease_tip_clean')}</li>
                    <li><i className="fa-solid fa-sun"></i> {t('disease_tip_light')}</li>
                    <li><i className="fa-solid fa-seedling"></i> {t('disease_tip_part')}</li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

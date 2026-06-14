'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function ProfilePage() {
  const { t, language: globalLanguage, setLanguage: setGlobalLanguage } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [language, setLanguage] = useState('hi');
  
  const [landAcres, setLandAcres] = useState('');
  const [irrigation, setIrrigation] = useState('नहर (Canal)');
  const [soilType, setSoilType] = useState('दोमट मिट्टी');
  const [ownTractor, setOwnTractor] = useState('no');
  
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Fetch existing profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });

  // Pre-populate form when profile data is fetched
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setMobile(profile.mobile || '');
      setVillage(profile.village || '');
      setDistrict(profile.district || '');
      setState(profile.state || 'Uttar Pradesh');
      setLanguage(profile.language || 'hi');
      setLandAcres(profile.land_acres?.toString() || '');
      setIrrigation(profile.irrigation || 'नहर (Canal)');
      setSoilType(profile.soil_type || 'दोमट मिट्टी');
      setOwnTractor(profile.own_tractor ? 'yes' : 'no');
      setSelectedCrops(profile.crops || []);
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      setToast({ 
        message: globalLanguage === 'hi' ? 'प्रोफाइल सेव हो गई!' : 'Profile Saved successfully!', 
        type: 'success' 
      });
      // Synchronize global language with profile saved language
      setGlobalLanguage(language as 'hi' | 'en');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      setToast({ 
        message: globalLanguage === 'hi' ? 'अपडेट करने में त्रुटि हुई।' : 'Error updating profile.', 
        type: 'error' 
      });
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropCheckbox = (crop: string) => {
    setSelectedCrops((prev) => 
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleNextStep = (next: number) => {
    // Basic validation for step 1
    if (step === 1 && !name.trim()) {
      setToast({ 
        message: globalLanguage === 'hi' ? 'कृपया नाम दर्ज करें' : 'Please enter your name', 
        type: 'warning' 
      });
      return;
    }
    setStep(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct payload matching models/schemas
    const payload = {
      name,
      mobile,
      village,
      district,
      state,
      language,
      land_acres: landAcres ? parseFloat(landAcres) : null,
      irrigation,
      soil_type: soilType,
      own_tractor: ownTractor === 'yes',
      crops: selectedCrops,
      avatar_url: avatarPreview // Send base64 avatar URL if changed locally
    };

    updateProfileMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="krishi-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2E7D32' }}></i>
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="krishi-container profile-page-wrap">
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
        <h1 className="page-title"><i className="fa-solid fa-user-circle"></i> {t('profile_title_page')}</h1>
        <p className="page-sub">{t('profile_sub_page')}</p>
      </div>

      {/* Step Progress Bar */}
      <div className="step-progress-bar fade-in-up">
        <div className={`step-progress-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} data-step="1">
          <div className="step-num">1</div><span>{t('profile_step1')}</span>
        </div>
        <div className="step-progress-line"></div>
        <div className={`step-progress-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} data-step="2">
          <div className="step-num">2</div><span>{t('profile_step2')}</span>
        </div>
        <div className="step-progress-line"></div>
        <div className={`step-progress-item ${step >= 3 ? 'active' : ''}`} data-step="3">
          <div className="step-num">3</div><span>{t('profile_step3')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="profileForm">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="profile-step" id="step1">
            <div className="krishi-card fade-in-up">
              <h3 className="card-section-title">{t('profile_personal_title')}</h3>

              {/* Avatar Upload */}
              <div className="avatar-upload-section">
                <div className="avatar-preview" id="avatarPreview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile Avatar" />
                  ) : (
                    <i className="fa-solid fa-user"></i>
                  )}
                </div>
                <label htmlFor="avatarInput" className="avatar-change-btn">
                  <i className="fa-solid fa-camera"></i> {t('profile_photo_change')}
                </label>
                <input 
                  type="file" 
                  id="avatarInput" 
                  accept="image/*" 
                  hidden 
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-user"></i> {t('profile_name')}</label>
                  <input 
                    type="text" 
                    className="krishi-input" 
                    placeholder={t('profile_name_placeholder')} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-phone"></i> {t('profile_mobile')}</label>
                  <input 
                    type="tel" 
                    className="krishi-input" 
                    placeholder={t('profile_mobile_placeholder')} 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-location-dot"></i> {t('profile_village')}</label>
                  <input 
                    type="text" 
                    className="krishi-input" 
                    placeholder={t('profile_village_placeholder')} 
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-map"></i> {t('profile_district')}</label>
                  <input 
                    type="text" 
                    className="krishi-input" 
                    placeholder={t('profile_district_placeholder')} 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-flag"></i> {t('profile_state')}</label>
                  <select 
                    className="krishi-input" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-language"></i> {t('profile_language')}</label>
                  <select 
                    className="krishi-input" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="hi">हिंदी</option>
                    <option value="pa">ਪੰਜਾਬੀ</option>
                    <option value="mr">मराठी</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="step-nav-btns">
                <button type="button" className="btn-krishi-primary" onClick={() => handleNextStep(2)}>
                  {t('profile_next')} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Farm Info */}
        {step === 2 && (
          <div className="profile-step" id="step2">
            <div className="krishi-card fade-in-up">
              <h3 className="card-section-title">{t('profile_farm_title')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-ruler-combined"></i> {t('profile_land_acres')}</label>
                  <input 
                    type="number" 
                    className="krishi-input" 
                    placeholder={t('profile_land_placeholder')} 
                    value={landAcres}
                    onChange={(e) => setLandAcres(e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-droplet"></i> {t('profile_irrigation')}</label>
                  <select 
                    className="krishi-input" 
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value)}
                  >
                    <option value="नहर (Canal)">{t('नहर (Canal)')}</option>
                    <option value="बोरवेल (Borewell)">{t('बोरवेल (Borewell)')}</option>
                    <option value="वर्षा (Rainwater)">{t('वर्षा (Rainwater)')}</option>
                    <option value="Drip Irrigation">{t('Drip Irrigation')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-layer-group"></i> {t('profile_soil_type')}</label>
                  <select 
                    className="krishi-input" 
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                  >
                    <option value="काली मिट्टी">{t('काली मिट्टी')}</option>
                    <option value="लाल मिट्टी">{t('लाल मिट्टी')}</option>
                    <option value="बलुई मिट्टी">{t('बलुई मिट्टी')}</option>
                    <option value="दोमट मिट्टी">{t('दोमट मिट्टी')}</option>
                    <option value="जलोढ़ मिट्टी">{t('जलोढ़ मिट्टी')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><i className="fa-solid fa-tractor"></i> {t('profile_own_tractor')}</label>
                  <div className="radio-group" style={{ marginTop: '0.5rem' }}>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="own_tractor" 
                        value="yes"
                        checked={ownTractor === 'yes'}
                        onChange={() => setOwnTractor('yes')}
                      /> {t('profile_tractor_yes')}
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="own_tractor" 
                        value="no"
                        checked={ownTractor === 'no'}
                        onChange={() => setOwnTractor('no')}
                      /> {t('profile_tractor_no')}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="step-nav-btns">
                <button type="button" className="btn-krishi-secondary" onClick={() => setStep(1)}>
                  <i className="fa-solid fa-arrow-left"></i> {t('profile_prev')}
                </button>
                <button type="button" className="btn-krishi-primary" onClick={() => handleNextStep(3)}>
                  {t('profile_next')} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Crops Checklist */}
        {step === 3 && (
          <div className="profile-step" id="step3">
            <div className="krishi-card fade-in-up">
              <h3 className="card-section-title">{t('profile_crops_title')}</h3>
              <div className="crop-select-grid">
                {['गेहूं', 'धान', 'मक्का', 'सरसों', 'गन्ना', 'टमाटर', 'आलू', 'प्याज', 'मिर्च', 'चना', 'सोयाबीन', 'कपास'].map((crop) => (
                  <label key={crop} className="crop-check-item">
                    <input 
                      type="checkbox" 
                      name="crops" 
                      value={crop}
                      checked={selectedCrops.includes(crop)}
                      onChange={() => handleCropCheckbox(crop)}
                    />
                    <span className="crop-check-label">{t('crop_' + crop)}</span>
                  </label>
                ))}
              </div>

              <div className="step-nav-btns">
                <button type="button" className="btn-krishi-secondary" onClick={() => setStep(2)}>
                  <i className="fa-solid fa-arrow-left"></i> {t('profile_prev')}
                </button>
                <button type="submit" className="btn-krishi-primary">
                  <i className="fa-solid fa-save"></i> {t('profile_save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

interface MachineryItem {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  price_per_day: number;
  owner_name: string;
  mobile: string;
  available: boolean;
  image_url: string | null;
}

export default function MachineryPage() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ट्रैक्टर',
    location: '',
    price_per_day: '',
    owner_name: '',
    mobile: '',
    image_url: ''
  });

  // Fetch machinery list from FastAPI
  const { data: machineryList, isLoading } = useQuery<MachineryItem[]>({
    queryKey: ['machinery', querySearch, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (querySearch) params.append('q', querySearch);
      if (selectedType) params.append('type', selectedType);
      const res = await fetch(`${API_BASE_URL}/machinery?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch machinery');
      return res.json();
    }
  });

  // Booking mutation
  const rentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/machinery/rent/${id}`, {
        method: 'POST'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to rent machinery');
      }
      return res.json();
    },
    onSuccess: (updatedItem: MachineryItem) => {
      // Invalidate query to refresh list
      queryClient.invalidateQueries({ queryKey: ['machinery'] });
      const msg = t('machinery_rent_success')
        .replace('{name}', updatedItem.name)
        .replace('{owner}', updatedItem.owner_name)
        .replace('{mobile}', updatedItem.mobile);
      alert(msg);
    },
    onError: (err: any) => {
      alert((language === 'hi' ? 'त्रुटि: ' : 'Error: ') + err.message);
    }
  });

  // Add machinery mutation
  const addMutation = useMutation({
    mutationFn: async (newMac: any) => {
      const res = await fetch(`${API_BASE_URL}/machinery/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMac)
      });
      if (!res.ok) throw new Error('Failed to add machinery');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machinery'] });
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'ट्रैक्टर',
        location: '',
        price_per_day: '',
        owner_name: '',
        mobile: '',
        image_url: ''
      });
      alert(language === 'hi' ? 'नया मशीनरी विज्ञापन सफलतापूर्वक जोड़ा गया!' : 'New machinery advertisement successfully added!');
    },
    onError: (err: any) => {
      alert((language === 'hi' ? 'त्रुटि: ' : 'Error: ') + err.message);
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuerySearch(searchText);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.price_per_day || !formData.owner_name || !formData.mobile) {
      alert(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill in all required fields');
      return;
    }
    addMutation.mutate({
      name: formData.name,
      type: formData.type,
      location: formData.location,
      price_per_day: parseFloat(formData.price_per_day),
      owner_name: formData.owner_name,
      mobile: formData.mobile,
      rating: 4.5,
      available: true,
      image_url: formData.image_url ? formData.image_url : null
    });
  };

  const handleShare = (item: MachineryItem) => {
    const rentLabel = language === 'hi' ? 'किराया' : 'Rent';
    const locationLabel = language === 'hi' ? 'स्थान' : 'Location';
    const ownerLabel = language === 'hi' ? 'मालिक' : 'Owner';
    const shareText = `${item.name}\n${locationLabel}: ${item.location}\n${rentLabel}: ₹${item.price_per_day}/${language === 'hi' ? 'दिन' : 'day'}\n${ownerLabel}: ${item.owner_name} (${item.mobile})`;
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert(language === 'hi' ? 'जानकारी क्लिपबोर्ड पर कॉपी हो गई है!' : 'Information copied to clipboard!');
    }
  };

  // Local helper for image placeholders
  const getPlaceholderImage = (type: string) => {
    switch (type) {
      case 'ट्रैक्टर':
      case 'Tractor':
        return 'https://images.unsplash.com/photo-1594142460634-14b5333f269a?auto=format&fit=crop&w=500&q=80';
      case 'हार्वेस्टर':
      case 'Harvester':
        return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80';
      case 'रोटावेटर':
      case 'Rotavator':
        return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80';
      case 'स्प्रेयर':
      case 'Sprayer':
        return 'https://images.unsplash.com/photo-1563514220-ea47e62b25ce?auto=format&fit=crop&w=500&q=80';
      default:
        return 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=500&q=80';
    }
  };

  return (
    <div className="krishi-container" style={{ position: 'relative' }}>
      <BackButton />
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <div>
          <h1 className="page-title"><i className="fa-solid fa-tractor"></i> {t('machinery_title')}</h1>
          <p className="page-sub">{t('machinery_sub')}</p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="krishi-card search-filter-bar fade-in-up" style={{ padding: '0.8rem 1.15rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              className="krishi-input" 
              placeholder={t('machinery_search_placeholder')} 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select 
            className="krishi-input mini-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">{t('all_machines')}</option>
            <option value="ट्रैक्टर">{t('tractor')}</option>
            <option value="हार्वेस्टर">{t('harvester')}</option>
            <option value="रोटावेटर">{t('rotavator')}</option>
            <option value="स्प्रेयर">{t('sprayer')}</option>
            <option value="थ्रेशर">{t('thresher')}</option>
          </select>
          <button type="submit" className="btn-krishi-primary">{t('machinery_search_btn')}</button>
        </form>
      </div>

      {/* Machinery Cards Grid */}
      {isLoading ? (
        <div className="empty-state" style={{ margin: '3rem auto' }}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>{t('loading')}</p>
        </div>
      ) : machineryList && machineryList.length > 0 ? (
        <div className="machinery-grid fade-in-up delay-1">
          {machineryList.map((m) => (
            <div key={m.id} className="machinery-card">
              <div className="machinery-img-wrap">
                <img 
                  src={m.image_url || getPlaceholderImage(m.type)} 
                  alt={m.name} 
                  className="machinery-img"
                />
                <span className={`machinery-availability ${m.available ? 'avail-yes' : 'avail-no'}`}>
                  {m.available ? t('available') : t('booked')}
                </span>
              </div>
              <div className="machinery-info">
                <h3 className="machinery-name">{m.name}</h3>
                <div className="machinery-meta">
                  <span><i className="fa-solid fa-location-dot"></i> {m.location}</span>
                  <span><i className="fa-solid fa-star"></i> {m.rating}</span>
                </div>
                <div className="machinery-price">
                  <span className="price-amount">₹{m.price_per_day}</span>
                  <span className="price-unit">{t('per_day')}</span>
                </div>
                <div className="machinery-owner">
                  <i className="fa-solid fa-user"></i> {m.owner_name}
                  <a href={`tel:${m.mobile}`} className="machinery-call-btn">
                    <i className="fa-solid fa-phone"></i> {m.mobile}
                  </a>
                </div>
                <div className="machinery-actions">
                  <button 
                    onClick={() => rentMutation.mutate(m.id)}
                    disabled={!m.available || rentMutation.isPending}
                    className={`btn-krishi-primary ${!m.available ? 'btn-disabled' : ''}`}
                  >
                    <i className="fa-solid fa-calendar-check"></i> {m.available ? t('rent_now') : t('booked')}
                  </button>
                  <button 
                    onClick={() => handleShare(m)}
                    className="btn-krishi-secondary"
                  >
                    <i className="fa-solid fa-share"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ margin: '3rem auto' }}>
          <i className="fa-solid fa-tractor"></i>
          <p>{t('machinery_no_results')}</p>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)} 
        className="fab-add-btn" 
        title={t('add_machine')}
        style={{ border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-plus"></i>
        <span>{t('add_machine')}</span>
      </button>

      {/* Add Machinery Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="krishi-card fade-in-up" style={{
            background: '#fff',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 className="card-section-title" style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="fa-solid fa-plus-circle"></i> {t('machinery_modal_title')}</span>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </h3>
            <form onSubmit={handleAddSubmit} className="krishi-form-grid" style={{ gap: '0.8rem' }}>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'मशीन का नाम (Name)' : 'Machinery Name'}</label>
                <input 
                  type="text" 
                  placeholder={language === 'hi' ? 'उदा. सोनालिका डीआई 750' : 'e.g. Sonalika DI 750'}
                  className="krishi-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'प्रकार (Type)' : 'Type'}</label>
                <select 
                  className="krishi-input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="ट्रैक्टर">{t('tractor')}</option>
                  <option value="हार्वेस्टर">{t('harvester')}</option>
                  <option value="रोटावेटर">{t('rotavator')}</option>
                  <option value="स्प्रेयर">{t('sprayer')}</option>
                  <option value="थ्रेशर">{t('thresher')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'स्थान (Location)' : 'Location'}</label>
                <input 
                  type="text" 
                  placeholder={language === 'hi' ? 'उदा. कपसेठी, वाराणसी' : 'e.g. Varanasi, UP'}
                  className="krishi-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'प्रति दिन किराया (₹/Day)' : 'Rent per Day (₹/Day)'}</label>
                <input 
                  type="number" 
                  placeholder={language === 'hi' ? 'उदा. 1200' : 'e.g. 1200'}
                  className="krishi-input"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="krishi-label">{t('machinery_owner_name')}</label>
                <input 
                  type="text" 
                  placeholder={language === 'hi' ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                  className="krishi-input"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'मोबाइल नंबर (Mobile)' : 'Mobile Number'}</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10}"
                  placeholder={language === 'hi' ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                  className="krishi-input"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="krishi-label">{language === 'hi' ? 'इमेज यूआरएल (वैकल्पिक)' : 'Image URL (Optional)'}</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="krishi-input"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={addMutation.isPending}
                  className="btn-krishi-primary"
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  {addMutation.isPending ? t('machinery_posting') : t('machinery_post_btn')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-krishi-secondary"
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

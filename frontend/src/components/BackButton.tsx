import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

export default function BackButton({ label, className }: { label?: string; className?: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button onClick={() => navigate(-1)} className={`btn-back ${className || ''}`}>
      <i className="fa-solid fa-arrow-left"></i> {label || t('back')}
    </button>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../app/LanguageContext';

interface BackButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BackButton({ className = '', style }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <button 
      onClick={() => router.back()} 
      className={`btn-back ${className}`} 
      style={style}
      aria-label="Back"
    >
      <i className="fa-solid fa-arrow-left"></i> {t('back')}
    </button>
  );
}

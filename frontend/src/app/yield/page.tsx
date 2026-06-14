'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bar, Doughnut } from 'react-chartjs-2';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  ArcElement
);

interface YieldRecord {
  id: string;
  crop_name: string;
  amount_quintal: number;
  revenue: number;
  expenses: number;
  date: string;
}

interface YieldResponse {
  summary: {
    total_yield: string;
    revenue: string;
    expenses: string;
    profit: string;
    raw_total_yield: number;
    raw_revenue: number;
    raw_expenses: number;
    raw_profit: number;
  };
  records: YieldRecord[];
}

export default function YieldPage() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    crop_name: 'गेहूं',
    amount_quintal: '',
    revenue: '',
    expenses: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch yield data from FastAPI backend
  const { data: yieldData, isLoading } = useQuery<YieldResponse>({
    queryKey: ['yieldData'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/yield`);
      if (!res.ok) throw new Error('Failed to fetch yield analysis');
      return res.json();
    }
  });

  // Mutation to add new yield record
  const addYieldMutation = useMutation({
    mutationFn: async (newRecord: any) => {
      const res = await fetch(`${API_BASE_URL}/yield/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord)
      });
      if (!res.ok) throw new Error('Failed to add record');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yieldData'] });
      setShowAddForm(false);
      setFormData({
        crop_name: 'गेहूं',
        amount_quintal: '',
        revenue: '',
        expenses: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount_quintal || !formData.revenue || !formData.expenses) {
      alert(language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill in all fields');
      return;
    }
    addYieldMutation.mutate({
      crop_name: formData.crop_name,
      amount_quintal: parseFloat(formData.amount_quintal),
      revenue: parseFloat(formData.revenue),
      expenses: parseFloat(formData.expenses),
      date: formData.date
    });
  };

  // Fallbacks if backend doesn't return data yet
  const summary = yieldData?.summary || {
    total_yield: '245 Q',
    revenue: '₹5.2L',
    expenses: '₹1.8L',
    profit: '₹3.4L',
    raw_total_yield: 245,
    raw_revenue: 520000,
    raw_expenses: 180000,
    raw_profit: 340000
  };

  const records = yieldData?.records || [];

  // Monthly yield dataset (Apr to Mar)
  const yieldMonthChartData = {
    labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
    datasets: [
      { 
        label: language === 'hi' ? 'इस साल' : 'This Year', 
        data: [20, 35, 15, 40, 55, 38, 65, 48, 72, 60, 45, 80], 
        backgroundColor: 'rgba(46,125,50,0.8)', 
        borderRadius: 6 
      },
      { 
        label: language === 'hi' ? 'पिछला साल' : 'Last Year', 
        data: [15, 28, 12, 32, 42, 30, 55, 40, 60, 48, 38, 65], 
        backgroundColor: 'rgba(102,187,106,0.4)', 
        borderRadius: 6 
      }
    ]
  };

  // Crop share doughnut chart data
  const cropGroup: { [key: string]: number } = {};
  if (records.length > 0) {
    records.forEach(r => {
      cropGroup[r.crop_name] = (cropGroup[r.crop_name] || 0) + r.amount_quintal;
    });
  } else {
    cropGroup['गेहूं'] = 120;
    cropGroup['धान'] = 90;
    cropGroup['मक्का'] = 35;
  }

  const cropLabels = Object.keys(cropGroup);
  const cropValues = Object.values(cropGroup);

  const cropColors = ['#2E7D32', '#66BB6A', '#FFA726', '#29B6F6', '#AB47BC'];
  const cropShareChartData = {
    labels: cropLabels.map(c => t(`crop_${c}`) || c),
    datasets: [{
      data: cropValues,
      backgroundColor: cropColors.slice(0, cropLabels.length),
      borderWidth: 0
    }]
  };

  const getExtraProfitText = () => {
    const profitValHi = summary.raw_profit > 238000 ? `₹${((summary.raw_profit - 238000) / 100000).toFixed(2)} लाख` : '₹1.02 लाख';
    const profitValEn = summary.raw_profit > 238000 ? `₹${((summary.raw_profit - 238000) / 100000).toFixed(2)} Lakh` : '₹1.02 Lakh';
    const profitVal = language === 'hi' ? profitValHi : profitValEn;
    return t('yield_extra_profit_text').replace('{profit}', profitVal);
  };

  return (
    <div className="krishi-container dashboard-wrap">
      <BackButton />
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <div>
          <h1 className="page-title"><i className="fa-solid fa-chart-simple"></i> {t('yield_title')}</h1>
          <p className="page-sub">{t('yield_sub')}</p>
        </div>
        <div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn-krishi-primary"
          >
            <i className="fa-solid fa-plus"></i> {t('add_record')}
          </button>
        </div>
      </div>

      {/* Add Record Form Panel */}
      {showAddForm && (
        <div className="krishi-card fade-in-up" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
          <h3 className="card-section-title" style={{ marginBottom: '1rem' }}>
            <i className="fa-solid fa-plus-circle"></i> {t('yield_add_title')}
          </h3>
          <form onSubmit={handleSubmit} className="krishi-form-grid">
            <div className="form-group">
              <label className="krishi-label">{t('crop_name')}</label>
              <select 
                className="krishi-input"
                value={formData.crop_name}
                onChange={e => setFormData({ ...formData, crop_name: e.target.value })}
              >
                <option value="गेहूं">{t('crop_गेहूं')}</option>
                <option value="धान">{t('crop_धान')}</option>
                <option value="मक्का">{t('crop_मक्का')}</option>
                <option value="सरसों">{t('crop_सरसों')}</option>
                <option value="अन्य">{language === 'hi' ? 'अन्य' : 'Other'}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="krishi-label">{t('yield_amount_q')}</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder={language === 'hi' ? 'उदा. 45' : 'e.g. 45'}
                className="krishi-input"
                value={formData.amount_quintal}
                onChange={e => setFormData({ ...formData, amount_quintal: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="krishi-label">{language === 'hi' ? 'कुल कमाई (₹)' : 'Total Revenue (₹)'}</label>
              <input 
                type="number" 
                placeholder={language === 'hi' ? 'उदा. 95000' : 'e.g. 95000'}
                className="krishi-input"
                value={formData.revenue}
                onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="krishi-label">{language === 'hi' ? 'कुल खर्च (₹)' : 'Total Expenses (₹)'}</label>
              <input 
                type="number" 
                placeholder={language === 'hi' ? 'उदा. 35000' : 'e.g. 35000'}
                className="krishi-input"
                value={formData.expenses}
                onChange={e => setFormData({ ...formData, expenses: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="krishi-label">{t('yield_date_label')}</label>
              <input 
                type="date" 
                className="krishi-input"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button 
                type="submit" 
                disabled={addYieldMutation.isPending} 
                className="btn-krishi-primary" 
                style={{ width: '100%', padding: '0.65rem' }}
              >
                {addYieldMutation.isPending ? t('yield_saving') : t('post_ad')}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn-krishi-secondary" 
                style={{ width: '100%', padding: '0.65rem' }}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Yield Summary Cards */}
      <div className="summary-grid fade-in-up delay-1">
        <div className="summary-card status-safe">
          <div className="summary-icon"><i className="fa-solid fa-weight-scale"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('total_yield')}</span>
            <span className="summary-value">{summary.total_yield}</span>
            <span className="summary-sub">{t('this_season')}</span>
          </div>
          <div className="summary-badge safe">↑ +18%</div>
        </div>
        <div className="summary-card status-safe">
          <div className="summary-icon"><i className="fa-solid fa-rupee-sign"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('total_revenue')}</span>
            <span className="summary-value">{summary.revenue}</span>
            <span className="summary-sub">{t('from_mandi')}</span>
          </div>
          <div className="summary-badge safe">↑ +22%</div>
        </div>
        <div className="summary-card status-warning">
          <div className="summary-icon"><i className="fa-solid fa-cart-shopping"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('total_expenses')}</span>
            <span className="summary-value">{summary.expenses}</span>
            <span className="summary-sub">{t('seeds_fertilizer')}</span>
          </div>
          <div className="summary-badge warning">↓ -5%</div>
        </div>
        <div className="summary-card status-safe">
          <div className="summary-icon"><i className="fa-solid fa-coins"></i></div>
          <div className="summary-info">
            <span className="summary-label">{t('net_profit')}</span>
            <span className="summary-value">{summary.profit}</span>
            <span className="summary-sub">{t('net_profit_sub')}</span>
          </div>
          <div className="summary-badge safe">
            {summary.raw_revenue > 0 ? `${Math.round((summary.raw_profit / summary.raw_revenue) * 100)}% Margin` : '65% Margin'}
          </div>
        </div>
      </div>

      {/* Before vs After Comparison */}
      <div className="krishi-card before-after-card fade-in-up delay-2">
        <h3 className="card-section-title"><i className="fa-solid fa-arrows-left-right"></i> {t('last_vs_this')}</h3>
        <div className="before-after-grid">
          <div className="before-col">
            <h4><i className="fa-solid fa-clock-rotate-left"></i> {t('last_year')}</h4>
            <div className="comparison-stat"><span>{t('production')}</span><strong>208 Q</strong></div>
            <div className="comparison-stat"><span>{t('revenue')}</span><strong>₹4.27L</strong></div>
            <div className="comparison-stat"><span>{t('expenses')}</span><strong>₹1.89L</strong></div>
            <div className="comparison-stat highlight"><span>{t('profit')}</span><strong>₹2.38L</strong></div>
          </div>
          <div className="vs-divider"><span>VS</span></div>
          <div className="after-col">
            <h4><i className="fa-solid fa-star"></i> {t('this_year_ai')}</h4>
            <div className="comparison-stat"><span>{t('production')}</span><strong className="up">{summary.total_yield} ↑</strong></div>
            <div className="comparison-stat"><span>{t('revenue')}</span><strong className="up">{summary.revenue} ↑</strong></div>
            <div className="comparison-stat"><span>{t('expenses')}</span><strong className="down">{summary.expenses} ↓</strong></div>
            <div className="comparison-stat highlight"><span>{t('profit')}</span><strong className="up">{summary.profit} ↑</strong></div>
          </div>
        </div>
        <div className="improvement-banner">
          <i className="fa-solid fa-rocket"></i>
          {getExtraProfitText()}
        </div>
      </div>

      {/* Yield Chart Row */}
      <div className="charts-row fade-in-up delay-3">
        <div className="krishi-card chart-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-bar"></i> {t('monthly_production')}</h3>
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            <Bar 
              data={yieldMonthChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>
        <div className="krishi-card chart-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-pie"></i> {t('crop_contribution')}</h3>
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            <Doughnut 
              data={cropShareChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Records History Table */}
      {records.length > 0 && (
        <div className="krishi-card fade-in-up delay-4" style={{ marginTop: '1.5rem', padding: '1.2rem' }}>
          <h3 className="card-section-title" style={{ marginBottom: '1rem' }}>
            <i className="fa-solid fa-list"></i> {t('record_history')}
          </h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="krishi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>{t('crop_name')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('amount')} (Q)</th>
                  <th style={{ padding: '0.75rem' }}>{t('revenue')} (₹)</th>
                  <th style={{ padding: '0.75rem' }}>{t('expenses')} (₹)</th>
                  <th style={{ padding: '0.75rem' }}>{t('profit')} (₹)</th>
                  <th style={{ padding: '0.75rem' }}>{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('crop_' + r.crop_name) || r.crop_name}</td>
                    <td style={{ padding: '0.75rem' }}>{r.amount_quintal} Q</td>
                    <td style={{ padding: '0.75rem' }}>₹{r.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem' }}>₹{r.expenses.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem', color: r.revenue - r.expenses >= 0 ? '#2E7D32' : '#d32f2f', fontWeight: 600 }}>
                      ₹{(r.revenue - r.expenses).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{new Date(r.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

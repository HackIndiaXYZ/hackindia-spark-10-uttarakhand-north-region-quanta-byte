/* =====================================================
   charts.js — Chart.js Configurations & Helpers
   ===================================================== */

'use strict';

// ==============================
// GLOBAL CHART DEFAULTS
// ==============================
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#6B7280';
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(27,27,27,0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#fff';
    Chart.defaults.plugins.tooltip.bodyColor = 'rgba(255,255,255,0.85)';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.callbacks.label = function (context) {
        let label = context.dataset.label || '';
        let value = context.parsed.y ?? context.parsed;
        if (typeof value === 'number' && label.toLowerCase().includes('₹')) {
            return `${label}: ₹${value.toLocaleString('en-IN')}`;
        }
        return `${label}: ${value}`;
    };
    Chart.defaults.scale.grid.color = 'rgba(0,0,0,0.04)';
    Chart.defaults.scale.grid.borderColor = 'transparent';
}


// ==============================
// COLOR PALETTE
// ==============================
const KRISHI_COLORS = {
    primary:   '#2E7D32',
    secondary: '#66BB6A',
    light:     '#A5D6A7',
    warning:   '#F9A825',
    danger:    '#E53935',
    info:      '#1E88E5',
    purple:    '#AB47BC',
    teal:      '#26C6DA',
    orange:    '#FFA726',
};

const KRISHI_PALETTE = [
    KRISHI_COLORS.primary,
    KRISHI_COLORS.warning,
    KRISHI_COLORS.info,
    KRISHI_COLORS.purple,
    KRISHI_COLORS.teal,
    KRISHI_COLORS.orange,
    KRISHI_COLORS.danger,
];


// ==============================
// CHART FACTORY HELPERS
// ==============================
window.KrishiCharts = {

    /**
     * Create a bar chart
     */
    bar(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaults = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: datasets.length > 1, position: 'bottom' } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }
            }
        };

        return new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: Object.assign(defaults, options)
        });
    },

    /**
     * Create a line chart
     */
    line(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaults = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: datasets.length > 1, position: 'bottom' } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true }
            },
            elements: { line: { tension: 0.4 }, point: { radius: 4, hoverRadius: 6 } }
        };

        return new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: Object.assign(defaults, options)
        });
    },

    /**
     * Create a doughnut chart
     */
    doughnut(canvasId, labels, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaults = {
            responsive: true,
            cutout: '65%',
            plugins: { legend: { position: 'right' } }
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{ data, backgroundColor: KRISHI_PALETTE.slice(0, data.length), borderWidth: 0, hoverOffset: 6 }]
            },
            options: Object.assign(defaults, options)
        });
    },

    /**
     * Create a mini sparkline (no axes, no labels)
     */
    sparkline(canvasId, data, color = KRISHI_COLORS.primary) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data,
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    },

    /**
     * Create price trend chart (market page)
     */
    priceTrend(canvasId, trendData, color = KRISHI_COLORS.primary) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        ctx.style.borderRadius = '8px';

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['7d', '6d', '5d', '4d', '3d', '2d', 'आज'],
                datasets: [{
                    data: trendData || [100, 105, 102, 108, 106, 112, 115],
                    borderColor: color,
                    backgroundColor: `${color}15`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }
};


// ==============================
// DASHBOARD CHARTS (auto-init)
// ==============================
document.addEventListener('DOMContentLoaded', () => {

    // Yield Bar Chart (if canvas exists)
    if (document.getElementById('yieldChart')) {
        KrishiCharts.bar(
            'yieldChart',
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            [{
                label: 'उत्पादन (Q)',
                data: [30, 45, 28, 60, 75, 50, 80, 65, 90, 70, 55, 85],
                backgroundColor: `${KRISHI_COLORS.primary}CC`,
                borderRadius: 8,
                borderSkipped: false
            }],
            { plugins: { legend: { display: false } } }
        );
    }

    // Profit Line Chart (if canvas exists)
    if (document.getElementById('profitChart')) {
        KrishiCharts.line(
            'profitChart',
            ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
            [
                {
                    label: '💰 कमाई',
                    data: [20000, 35000, 28000, 45000, 38000, 55000],
                    borderColor: KRISHI_COLORS.primary,
                    backgroundColor: `${KRISHI_COLORS.primary}15`,
                    fill: true
                },
                {
                    label: '🛒 खर्च',
                    data: [12000, 18000, 15000, 22000, 19000, 25000],
                    borderColor: KRISHI_COLORS.danger,
                    backgroundColor: `${KRISHI_COLORS.danger}10`,
                    fill: true
                }
            ]
        );
    }

    // Yield Month Chart (yield page)
    if (document.getElementById('yieldMonthChart')) {
        KrishiCharts.bar(
            'yieldMonthChart',
            ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            [
                {
                    label: '📈 इस साल',
                    data: [20, 35, 15, 40, 55, 38, 65, 48, 72, 60, 45, 80],
                    backgroundColor: `${KRISHI_COLORS.primary}CC`,
                    borderRadius: 6
                },
                {
                    label: '📉 पिछला साल',
                    data: [15, 28, 12, 32, 42, 30, 55, 40, 60, 48, 38, 65],
                    backgroundColor: `${KRISHI_COLORS.secondary}80`,
                    borderRadius: 6
                }
            ]
        );
    }

    // Crop Share Doughnut (yield page)
    if (document.getElementById('cropShareChart')) {
        KrishiCharts.doughnut(
            'cropShareChart',
            ['गेहूं', 'धान', 'मक्का', 'सरसों', 'अन्य'],
            [40, 25, 18, 12, 5]
        );
    }

    // Market trend sparklines (auto-generate for price cards)
    document.querySelectorAll('[id^="trendChart_"]').forEach((canvas, i) => {
        const basePrice = 1800 + (i * 300);
        const fluctuation = () => Math.round(basePrice + (Math.random() - 0.4) * 200);
        const data = Array.from({ length: 7 }, fluctuation);
        KrishiCharts.sparkline(canvas.id, data, KRISHI_PALETTE[i % KRISHI_PALETTE.length]);
    });

});

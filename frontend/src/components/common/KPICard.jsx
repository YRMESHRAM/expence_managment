import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  trendPositive,
}) => {
  const colorMap = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.25)',
      text: '#818cf8',
      glow: 'rgba(99, 102, 241, 0.15)',
    },
    cyan: {
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.25)',
      text: '#22d3ee',
      glow: 'rgba(6, 182, 212, 0.15)',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#34d399',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.25)',
      text: '#fb7185',
      glow: 'rgba(244, 63, 94, 0.15)',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '145px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: scheme.bg,
              border: `1px solid ${scheme.border}`,
              color: scheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${scheme.glow}`,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '0.35rem',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {typeof amount === 'number'
            ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : amount}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {trend && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                color: trendPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              }}
            >
              {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../GuestContext';
import type { GuideItem } from '../types';

const T = { oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1', cream: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33', line: 'rgba(15,76,117,0.12)' };

const CAT: Record<string, { label: string; emoji: string }> = {
  dining:        { label: 'Dining',        emoji: '🍽️' },
  bars:          { label: 'Bars',          emoji: '🍹' },
  activities:    { label: 'Activities',    emoji: '🎣' },
  shopping:      { label: 'Shopping',      emoji: '🛍️' },
  beaches:       { label: 'Beaches',       emoji: '🏖️' },
  entertainment: { label: 'Entertainment', emoji: '🎉' },
  other:         { label: 'Other',         emoji: '📍' },
};

export function GuideTab() {
  const { booking } = useGuest();
  const items = booking?.property.guideItems ?? [];
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 6 }}>Local guide</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: '0 0 4px' }}>
          Your host's shortlist
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted }}>
          {items.length > 0 ? `${items.length} local picks from your host` : 'Local recommendations from your host'}
        </p>
      </div>

      {/* Category filter pills */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 150ms',
                background: filter === cat ? T.oceanDeep : T.cream,
                color: filter === cat ? '#fbf7ee' : T.muted,
                outline: filter === cat ? 'none' : `1px solid ${T.line}`,
              }}>
              {cat === 'all' ? 'All' : `${CAT[cat]?.emoji ?? '📍'} ${CAT[cat]?.label ?? cat}`}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: '32px 20px', borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
          <p style={{ fontSize: 13.5, color: T.muted }}>Your host's recommendations will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '24px', borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, textAlign: 'center', fontSize: 13.5, color: T.muted }}>
          No picks in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item, i) => {
            const meta = CAT[item.category] ?? { emoji: '📍', label: item.category };
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.35) }}
                style={{ padding: '14px 16px', borderRadius: 12, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em' }}>{item.name}</div>
                  {item.description && (
                    <p style={{ fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.55 }}>{item.description}</p>
                  )}
                  {item.websiteUrl && (
                    <a href={item.websiteUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: 12.5, color: T.ocean, marginTop: 6, display: 'inline-block', textDecoration: 'none', fontWeight: 500 }}>
                      Visit website →
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

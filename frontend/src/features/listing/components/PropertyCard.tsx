import { Link } from 'react-router-dom';
import type { ListingSummary } from '../types';

const T = {
  oceanDeep: '#0a3457', ocean: '#0f4c75', seafoam: '#56cfe1',
  cream: '#fbf7ee', muted: '#5b6b7a', line: 'rgba(15,76,117,0.12)',
};

const BEACHSIDE: Record<string, string> = {
  ocean: 'Oceanside', bay: 'Bayside', lagoon: 'Lagoon', both: 'Ocean & Bay',
};

interface Props { listing: ListingSummary; }

export default function PropertyCard({ listing }: Props) {
  const photo = listing.coverPhotoUrl ?? listing.photos?.[0]?.url;

  return (
    <Link to={`/properties/${listing.id}`}
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', background: T.cream, border: `1px solid ${T.line}`, textDecoration: 'none', transition: 'transform 150ms, box-shadow 150ms' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(15,76,117,0.14)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>

      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#d0e8f7' }}>
        {photo
          ? <img src={photo} alt={listing.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.2 }}>🏖️</div>
        }
        {/* gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,52,87,0.25) 0%, transparent 50%)' }} />

        {/* badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {listing.beachSide && (
            <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 700, color: T.oceanDeep, letterSpacing: '0.02em' }}>
              {BEACHSIDE[listing.beachSide] ?? listing.beachSide}
            </span>
          )}
        </div>
        {listing.petFriendly && (
          <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 700, color: T.oceanDeep }}>
            🐾 Pets OK
          </span>
        )}
        {listing.nightlyRate && (
          <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
            <span style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(10,52,87,0.88)', backdropFilter: 'blur(8px)', fontSize: 13, fontWeight: 700, color: 'white' }}>
              ${listing.nightlyRate.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 400, opacity: 0.75 }}>/night</span>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ocean, marginBottom: 4 }}>
          {listing.town ?? 'Long Beach Island'}
        </p>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: '0 0 4px', lineHeight: 1.2 }}>
          {listing.name}
        </h3>
        {listing.description && (
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 10px' }}>
            {listing.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: T.muted }}>
          {listing.bedrooms != null && <span>🛏 {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>}
          {listing.bathrooms != null && <span>🚿 {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>}
        </div>
      </div>
    </Link>
  );
}

import { motion } from 'framer-motion';
import { useGuest } from '../GuestContext';

const T = { oceanDeep: '#0a3457', ocean: '#0f4c75', cream: '#fbf7ee', muted: '#5b6b7a', ink: '#0a1f33', line: 'rgba(15,76,117,0.12)', seafoamSoft: '#a8e3ec', sandWarm: '#f7e6c9' };

const TYPE_LABEL: Record<string, string> = { bedroom: 'Bedroom', bathroom: 'Bath', common: 'Common area', outdoor: 'Outdoor', kitchen: 'Kitchen', office: 'Office' };

export function RoomsTab() {
  const { booking } = useGuest();
  const rooms = booking?.property.rooms ?? [];
  const bedrooms = rooms.filter(r => r.type === 'bedroom');
  const others = rooms.filter(r => r.type !== 'bedroom');

  function RoomCard({ room, index }: { room: typeof rooms[0]; index: number }) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
        style={{ padding: 14, borderRadius: 12, background: T.cream, border: `1px solid ${T.line}`, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, background: `repeating-linear-gradient(${index * 30 + 25}deg, ${T.seafoamSoft} 0 6px, ${T.sandWarm} 6px 12px)`, opacity: 0.75 }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>{TYPE_LABEL[room.type] ?? room.type}</div>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 500, color: T.oceanDeep, letterSpacing: '-0.01em', marginTop: 2 }}>{room.name}</div>
          {room.description && <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{room.description}</div>}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ocean, marginBottom: 6 }}>Rooms</div>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: T.oceanDeep, margin: 0 }}>The house, room by room.</h2>
        {rooms.length > 0 && <p style={{ fontSize: 13.5, color: T.muted, marginTop: 6 }}>{rooms.length} space{rooms.length !== 1 ? 's' : ''}</p>}
      </div>

      {rooms.length === 0 ? (
        <div style={{ padding: '32px 20px', borderRadius: 14, background: T.cream, border: `1px solid ${T.line}`, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏠</div>
          <p style={{ fontSize: 13.5, color: T.muted }}>No rooms have been added yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bedrooms.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Bedrooms</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bedrooms.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Other spaces</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {others.map((r, i) => <RoomCard key={r.id} room={r} index={bedrooms.length + i} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Constants ───────────────────────────────────────────────
/** Default to Beach Haven, Long Beach Island, NJ */
const LBI_LAT = 39.5601;
const LBI_LON = -74.2440;

/** NOAA station: Beach Haven, NJ (8536110) */
const NOAA_STATION = '8536110';

// ─── WMO weather code → emoji + description ─────────────────
function wmoInfo(code: number): { emoji: string; desc: string } {
  if (code === 0)             return { emoji: '☀️',  desc: 'Clear' };
  if (code === 1)             return { emoji: '🌤️',  desc: 'Mostly Clear' };
  if (code === 2)             return { emoji: '⛅',  desc: 'Partly Cloudy' };
  if (code === 3)             return { emoji: '🌥️',  desc: 'Overcast' };
  if (code <= 48)             return { emoji: '🌫️',  desc: 'Foggy' };
  if (code <= 55)             return { emoji: '🌦️',  desc: 'Drizzle' };
  if (code <= 65)             return { emoji: '🌧️',  desc: 'Rain' };
  if (code <= 77)             return { emoji: '❄️',  desc: 'Snow' };
  if (code <= 82)             return { emoji: '🌦️',  desc: 'Rain Showers' };
  if (code <= 84)             return { emoji: '🌨️',  desc: 'Snow Showers' };
  if (code <= 99)             return { emoji: '⛈️',  desc: 'Thunderstorm' };
  return { emoji: '🌡️', desc: 'Unknown' };
}

/** Wind direction degrees → compass */
function windDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ─── Types ───────────────────────────────────────────────────
interface WeatherData {
  tempF: number;
  feelsLikeF?: number;
  weatherCode: number;
  windMph: number;
  windDeg: number;
  humidity: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  date: string;       // YYYY-MM-DD
  maxF: number;
  minF: number;
  code: number;
}

interface TideEntry {
  t: string;          // time string
  v: string;          // value (feet)
  type: 'H' | 'L';
}

// ─── Open-Meteo fetch ─────────────────────────────────────────
async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,relativehumidity_2m` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit` +
    `&windspeed_unit=mph` +
    `&timezone=America%2FNew_York` +
    `&forecast_days=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const d = await res.json();

  const c = d.current;
  const daily = d.daily;

  const forecast: ForecastDay[] = (daily.time as string[]).map((date: string, i: number) => ({
    date,
    maxF: Math.round(daily.temperature_2m_max[i]),
    minF: Math.round(daily.temperature_2m_min[i]),
    code: daily.weathercode[i],
  }));

  return {
    tempF: Math.round(c.temperature_2m),
    feelsLikeF: Math.round(c.apparent_temperature),
    weatherCode: c.weathercode,
    windMph: Math.round(c.windspeed_10m),
    windDeg: c.winddirection_10m,
    humidity: c.relativehumidity_2m,
    forecast,
  };
}

// ─── NOAA tides fetch ─────────────────────────────────────────
async function fetchTides(station: string): Promise<TideEntry[]> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  // also fetch tomorrow so we get the full picture across midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?product=predictions&application=shore_stay` +
    `&begin_date=${dateStr}&end_date=${tomorrowStr}` +
    `&datum=MLLW&station=${station}&time_zone=lst%2Fldt` +
    `&interval=hilo&units=english&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Tides fetch failed');
  const d = await res.json();
  if (!d.predictions) throw new Error('No tide data');

  return d.predictions as TideEntry[];
}

// ─── Format tide time ─────────────────────────────────────────
function formatTideTime(t: string): string {
  // t is "YYYY-MM-DD HH:MM"
  const [, timePart] = t.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function isToday(t: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return t.startsWith(today);
}

/** Shorten day label */
function shortDay(date: string, i: number): string {
  if (i === 0) return 'Today';
  if (i === 1) return 'Tmrw';
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

// ─── Widget ───────────────────────────────────────────────────
interface Props {
  lat?: number | null;
  lon?: number | null;
}

/**
 * WeatherTidesWidget — shows live weather (Open-Meteo) and tides (NOAA)
 * for the property's location. Falls back to LBI defaults if no lat/lon.
 */
export function WeatherTidesWidget({ lat, lon }: Props) {
  const resolvedLat = lat ?? LBI_LAT;
  const resolvedLon = lon ?? LBI_LON;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tides, setTides]     = useState<TideEntry[]>([]);
  const [wxLoading, setWxLoading]   = useState(true);
  const [tideLoading, setTideLoading] = useState(true);
  const [wxError, setWxError]   = useState(false);
  const [tideError, setTideError] = useState(false);

  useEffect(() => {
    fetchWeather(resolvedLat, resolvedLon)
      .then(setWeather)
      .catch(() => setWxError(true))
      .finally(() => setWxLoading(false));

    fetchTides(NOAA_STATION)
      .then(setTides)
      .catch(() => setTideError(true))
      .finally(() => setTideLoading(false));
  }, [resolvedLat, resolvedLon]);

  const loading = wxLoading || tideLoading;

  // Filter today's tides
  const todayTides = tides.filter((t) => isToday(t.t));

  const wInfo = weather ? wmoInfo(weather.weatherCode) : null;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      {/* Widget header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <p className="text-[13px] font-bold text-ocean-700 uppercase tracking-wide">
            Weather &amp; Tides
          </p>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Beach Haven, NJ</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-1.5 py-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-ocean-300"
              animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* ── Current weather + today's tides ── */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-white/40">
            {/* Left: current weather */}
            <div className="px-5 py-4">
              {wxError ? (
                <p className="text-sm text-slate-400 italic">Weather unavailable</p>
              ) : weather ? (
                <>
                  <div className="flex items-end gap-2 leading-none">
                    <span className="text-4xl leading-none">{wInfo?.emoji}</span>
                    <span className="text-3xl font-extrabold text-ocean-800">
                      {weather.tempF}°
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-semibold text-slate-700">
                    {wInfo?.desc}
                  </p>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-slate-400">
                      <span className="font-medium text-slate-500">
                        💨 {weather.windMph} mph {windDir(weather.windDeg)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      <span className="font-medium text-slate-500">
                        💧 {weather.humidity}% humidity
                      </span>
                    </p>
                    {weather.feelsLikeF !== undefined && (
                      <p className="text-xs text-slate-400">
                        Feels like{' '}
                        <span className="font-medium text-slate-500">{weather.feelsLikeF}°F</span>
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Right: today's tides */}
            <div className="px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ocean-400 mb-2">
                Today's Tides
              </p>
              {tideError ? (
                <p className="text-xs text-slate-400 italic">Tide data unavailable</p>
              ) : todayTides.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tide data</p>
              ) : (
                <div className="space-y-1.5">
                  {todayTides.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          t.type === 'H'
                            ? 'bg-ocean/15 text-ocean-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.type === 'H' ? '↑' : '↓'}
                      </span>
                      <div>
                        <span className="text-[12px] font-semibold text-slate-700">
                          {t.type === 'H' ? 'High' : 'Low'}
                        </span>
                        <span className="mx-1 text-slate-300 text-[11px]">·</span>
                        <span className="text-[11px] text-slate-500">{formatTideTime(t.t)}</span>
                        <span className="ml-1 text-[11px] font-semibold text-ocean-500">
                          {parseFloat(t.v).toFixed(1)} ft
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 5-day forecast strip ── */}
          {weather && weather.forecast.length > 0 && (
            <div className="border-t border-white/50 px-4 py-3">
              <div className="flex gap-1">
                {weather.forecast.map((day, i) => {
                  const info = wmoInfo(day.code);
                  return (
                    <div
                      key={day.date}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 ${
                        i === 0 ? 'bg-ocean/8' : ''
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {shortDay(day.date, i)}
                      </span>
                      <span className="text-xl leading-none">{info.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-700">{day.maxF}°</span>
                      <span className="text-[10px] text-slate-400">{day.minF}°</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

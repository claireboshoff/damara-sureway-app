import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, CloudRain, Sun, AlertTriangle } from 'lucide-react';
import type { Profile } from '../lib/auth';
import { getWeather, type WeatherData } from '../lib/weather';

interface Props { dark: boolean; profile: Profile; }

export function WeatherIntel({ dark, profile }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  useEffect(() => {
    getWeather().then(setWeather).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ background: bg }}>
      <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!weather) return (
    <div className="p-8 text-center" style={{ background: bg }}>
      <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
      <p style={{ color: textColor }}>Unable to load weather data</p>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 min-h-full" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Weather Intelligence</h1>

        {/* Current Weather */}
        <div className="rounded-2xl p-8 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2, #42A5F5)', boxShadow: '0 8px 32px rgba(21,101,192,0.2)' }}>
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Current Conditions</p>
              <div className="flex items-end gap-2 mt-3">
                <span className="text-6xl font-bold text-white">{weather.temperature}°</span>
                <span className="text-blue-100 text-2xl mb-2">C</span>
              </div>
              <p className="text-blue-100 text-lg mt-1">{weather.description}</p>
              <p className="text-blue-200/60 text-sm mt-1">{weather.location}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Droplets size={20} />, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: <Wind size={20} />, label: 'Wind', value: `${weather.windSpeed} km/h` },
                { icon: <Thermometer size={20} />, label: 'Feels Like', value: `${weather.temperature}°C` },
                { icon: <CloudRain size={20} />, label: 'Rain Today', value: `${weather.forecast[0]?.rain || 0}mm` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-blue-100">{s.icon}</span>
                  <div className="text-white font-semibold text-lg mt-1">{s.value}</div>
                  <div className="text-blue-200/60 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>7-Day Forecast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.forecast.map((d, i) => (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 text-center"
              style={{ background: cardBg, border: `1px solid ${borderColor}` }}
            >
              <div className="text-xs font-medium" style={{ color: mutedColor }}>
                {new Date(d.date).toLocaleDateString('en-ZA', { weekday: 'short' })}
              </div>
              <div className="text-xs" style={{ color: mutedColor }}>
                {new Date(d.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
              </div>
              <div className="my-3">
                {d.icon === 'sun' ? <Sun size={28} className="mx-auto text-amber-400" /> :
                 d.icon === 'cloud-rain' ? <CloudRain size={28} className="mx-auto text-blue-400" /> :
                 <Cloud size={28} className="mx-auto text-gray-400" />}
              </div>
              <div className="font-bold text-lg" style={{ color: textColor }}>{d.tempMax}°</div>
              <div className="text-sm" style={{ color: mutedColor }}>{d.tempMin}°</div>
              {d.rain > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-blue-400">
                  <Droplets size={10} /> {d.rain}mm
                </div>
              )}
              <div className="text-[10px] mt-1" style={{ color: mutedColor }}>{d.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Farming Advisory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 mt-6"
          style={{ background: cardBg, border: `1px solid ${borderColor}` }}
        >
          <h3 className="font-semibold mb-3" style={{ color: textColor }}>Farming Advisory</h3>
          <div className="space-y-3">
            {weather.temperature > 35 && (
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div><span className="text-sm font-medium text-red-600">Heat Stress Alert:</span> <span className="text-sm" style={{ color: textColor }}>Temperatures above 35°C. Consider irrigation scheduling and monitoring crop stress levels.</span></div>
              </div>
            )}
            {weather.forecast.some(d => d.rain > 20) && (
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <CloudRain size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div><span className="text-sm font-medium text-blue-600">Heavy Rain Expected:</span> <span className="text-sm" style={{ color: textColor }}>Plan foliar applications around rain windows. Avoid spraying 24h before predicted rainfall.</span></div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(46,125,50,0.08)' }}>
              <Sun size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div><span className="text-sm font-medium text-green-700">General:</span> <span className="text-sm" style={{ color: textColor }}>Current conditions are suitable for field operations. Best spray window: early morning or late afternoon.</span></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

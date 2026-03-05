import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Tractor, MapPin, Cloud, Droplets, TrendingUp, Calendar,
  Package, Target, Activity, Leaf, Thermometer, Wind, Sun,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import type { Profile } from '../lib/auth';
import { getOrCreateFarmerByEmail, listFarms, listFields } from '../lib/farming';
import { atList } from '../lib/airtable';
import { getWeather, type WeatherData } from '../lib/weather';

interface Props {
  dark: boolean;
  profile: Profile;
}

export function FarmerDashboard({ dark, profile }: Props) {
  const [stats, setStats] = useState({ farms: 0, fields: 0, totalHa: 0, activeProgrammes: 0 });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const farmer = await getOrCreateFarmerByEmail(profile.email, profile.full_name || 'Farmer');
      const farms = await listFarms(`SEARCH('${farmer.id}', ARRAYJOIN({Farmer}))`);
      const farmIds = farms.map((f) => f.id);

      let allFields: any[] = [];
      for (const fid of farmIds) {
        const fields = await listFields(`{Farm} = '${fid}'`);
        allFields = allFields.concat(fields);
      }

      const totalHa = allFields.reduce((sum, f) => sum + (f['Field Size (ha)'] || 0), 0);

      const programRes = await atList('Programs', { maxRecords: 50 }).catch(() => ({ records: [] }));
      const activeProgrammes = (programRes.records || []).filter((r) => r.fields.Active === true).length;

      setStats({ farms: farms.length, fields: allFields.length, totalHa: Math.round(totalHa), activeProgrammes });

      const visitsRes = await atList('Field Visits', {
        sort: [{ field: 'Visit Date', direction: 'desc' }],
        maxRecords: 5,
      }).catch(() => ({ records: [] }));
      setRecentVisits(visitsRes.records || []);

      const tasksRes = await atList('Tasks', {
        filterByFormula: `AND(SEARCH('${farmer.id}', ARRAYJOIN({Farmer})), OR({Status}='Pending', {Status}='In Progress'))`,
        sort: [{ field: 'Due Date', direction: 'asc' }],
        maxRecords: 10,
      }).catch(() => ({ records: [] }));
      setTasks(tasksRes.records || []);

      const w = await getWeather().catch(() => null);
      setWeather(w);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  const statCards = [
    { label: 'Total Farms', value: stats.farms, icon: <Tractor size={20} />, color: '#2E7D32', bg: 'rgba(46,125,50,0.1)' },
    { label: 'Total Fields', value: stats.fields, icon: <MapPin size={20} />, color: '#1565C0', bg: 'rgba(21,101,192,0.1)' },
    { label: 'Hectares', value: `${stats.totalHa} ha`, icon: <Target size={20} />, color: '#E65100', bg: 'rgba(230,81,0,0.1)' },
    { label: 'Active Programmes', value: stats.activeProgrammes, icon: <Leaf size={20} />, color: '#6A1B9A', bg: 'rgba(106,27,154,0.1)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: bg }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p style={{ color: mutedColor }} className="text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-full" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: textColor }}>
            Welcome back, {profile.full_name?.split(' ')[0] || 'Farmer'}
          </h1>
          <p className="text-sm mt-1" style={{ color: mutedColor }}>
            Your SureWay farming overview for {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
              style={{ background: cardBg, border: `1px solid ${borderColor}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: textColor }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: mutedColor }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weather Card */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)',
                boxShadow: '0 8px 32px rgba(27,94,32,0.2)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FFD54F, transparent)' }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Current Weather</p>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-5xl font-bold text-white">{weather.temperature}°</span>
                    <span className="text-green-100 text-lg mb-1">C</span>
                  </div>
                  <p className="text-green-100 text-sm mt-1">{weather.description}</p>
                  <p className="text-green-200/60 text-xs mt-1">{weather.location}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2 text-green-100 text-sm">
                    <Droplets size={14} /> {weather.humidity}%
                  </div>
                  <div className="flex items-center gap-2 text-green-100 text-sm">
                    <Wind size={14} /> {weather.windSpeed} km/h
                  </div>
                </div>
              </div>

              {/* Forecast Row */}
              <div className="mt-6 grid grid-cols-7 gap-2">
                {weather.forecast.map((d, i) => (
                  <div key={i} className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-[10px] text-green-200/60">
                      {new Date(d.date).toLocaleDateString('en-ZA', { weekday: 'short' })}
                    </div>
                    <div className="text-white text-sm font-semibold mt-1">{d.tempMax}°</div>
                    <div className="text-green-200/60 text-xs">{d.tempMin}°</div>
                    {d.rain > 0 && (
                      <div className="text-blue-200 text-[10px] mt-1">{d.rain}mm</div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="font-semibold mb-4" style={{ color: textColor }}>SureWay Steps</h3>
            <div className="space-y-3">
              {[
                { step: 1, label: 'Soil Analysis', desc: 'Know your soil', color: '#8D6E63' },
                { step: 2, label: 'Crop Planning', desc: 'Plan your season', color: '#2E7D32' },
                { step: 3, label: 'Nutrition Programme', desc: 'Right product, right time', color: '#1565C0' },
                { step: 4, label: 'Monitor & Adjust', desc: 'Track progress', color: '#E65100' },
                { step: 5, label: 'Harvest & Review', desc: 'Measure results', color: '#6A1B9A' },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                  style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: s.color }}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: textColor }}>{s.label}</div>
                    <div className="text-xs" style={{ color: mutedColor }}>{s.desc}</div>
                  </div>
                  <ArrowUpRight size={14} style={{ color: mutedColor }} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Tasks & Visits */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="font-semibold mb-4" style={{ color: textColor }}>Upcoming Tasks</h3>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm" style={{ color: mutedColor }}>No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <div className={`w-2 h-2 rounded-full ${t.fields.Status === 'In Progress' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: textColor }}>{t.fields['Task Name'] || t.fields.Name || 'Task'}</div>
                      <div className="text-xs" style={{ color: mutedColor }}>
                        {t.fields['Due Date'] ? new Date(t.fields['Due Date'] as string).toLocaleDateString('en-ZA') : 'No due date'}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{
                        background: t.fields.Status === 'In Progress' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)',
                        color: t.fields.Status === 'In Progress' ? '#D97706' : '#6B7280',
                      }}>
                      {(t.fields.Status as string) || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="font-semibold mb-4" style={{ color: textColor }}>Recent Field Visits</h3>
            {recentVisits.length === 0 ? (
              <div className="text-center py-8">
                <Eye size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm" style={{ color: mutedColor }}>No recent visits</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentVisits.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(46,125,50,0.1)' }}>
                      <Activity size={16} className="text-damara-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: textColor }}>
                        {(v.fields['Visit Type'] as string) || 'Field Visit'}
                      </div>
                      <div className="text-xs" style={{ color: mutedColor }}>
                        {v.fields['Visit Date'] ? new Date(v.fields['Visit Date'] as string).toLocaleDateString('en-ZA') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

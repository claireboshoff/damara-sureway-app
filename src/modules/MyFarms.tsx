import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tractor, MapPin, Plus, ChevronRight, Layers, Leaf,
  Microscope, Eye, FlaskConical, FileText, X, Calendar
} from 'lucide-react';
import type { Profile } from '../lib/auth';
import { getOrCreateFarmerByEmail, listFarms, listFields, type Farm, type Field } from '../lib/farming';
import {
  getSoilSamplesByFarm, getLeafSamplesByFarm, getProgramsByFarm,
  getFieldVisitsByFarm, getTrialsByFarm, getDecisionsByFarm, type AirtableRecord
} from '../lib/airtable';

interface Props { dark: boolean; profile: Profile; }

export function MyFarms({ dark, profile }: Props) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [soilSamples, setSoilSamples] = useState<AirtableRecord[]>([]);
  const [leafSamples, setLeafSamples] = useState<AirtableRecord[]>([]);
  const [programs, setPrograms] = useState<AirtableRecord[]>([]);
  const [visits, setVisits] = useState<AirtableRecord[]>([]);
  const [trials, setTrials] = useState<AirtableRecord[]>([]);
  const [decisions, setDecisions] = useState<AirtableRecord[]>([]);
  const [activeTab, setActiveTab] = useState('fields');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  useEffect(() => { loadFarms(); }, []);

  async function loadFarms() {
    try {
      const farmer = await getOrCreateFarmerByEmail(profile.email, profile.full_name || 'Farmer');
      const farmsData = await listFarms(`SEARCH('${farmer.id}', ARRAYJOIN({Farmer}))`);
      setFarms(farmsData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function selectFarm(farm: Farm) {
    setSelectedFarm(farm);
    setDetailLoading(true);
    setActiveTab('fields');
    try {
      const [f, s, l, p, v, t, d] = await Promise.allSettled([
        listFields(`{Farm} = '${farm.id}'`),
        getSoilSamplesByFarm(farm.id),
        getLeafSamplesByFarm(farm.id),
        getProgramsByFarm(farm.id),
        getFieldVisitsByFarm(farm.id),
        getTrialsByFarm(farm.id),
        getDecisionsByFarm(farm.id),
      ]);
      if (f.status === 'fulfilled') setFields(f.value);
      if (s.status === 'fulfilled') setSoilSamples(s.value);
      if (l.status === 'fulfilled') setLeafSamples(l.value);
      if (p.status === 'fulfilled') setPrograms(p.value);
      if (v.status === 'fulfilled') setVisits(v.value);
      if (t.status === 'fulfilled') setTrials(t.value);
      if (d.status === 'fulfilled') setDecisions(d.value);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  }

  const tabs = [
    { key: 'fields', label: 'Fields', icon: <Layers size={14} />, count: fields.length },
    { key: 'soil', label: 'Soil Samples', icon: <Microscope size={14} />, count: soilSamples.length },
    { key: 'leaf', label: 'Leaf Samples', icon: <Leaf size={14} />, count: leafSamples.length },
    { key: 'programs', label: 'Programmes', icon: <FileText size={14} />, count: programs.length },
    { key: 'visits', label: 'Visits', icon: <Eye size={14} />, count: visits.length },
    { key: 'trials', label: 'Trials', icon: <FlaskConical size={14} />, count: trials.length },
    { key: 'decisions', label: 'Decisions', icon: <Calendar size={14} />, count: decisions.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: bg }}>
        <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-full" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>My Farms</h1>
            <p className="text-sm" style={{ color: mutedColor }}>{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>

        {!selectedFarm ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm, i) => (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => selectFarm(farm)}
                className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] group"
                style={{ background: cardBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(46,125,50,0.1)' }}>
                    <Tractor size={24} className="text-damara-500" />
                  </div>
                  <ChevronRight size={18} style={{ color: mutedColor }} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg" style={{ color: textColor }}>{farm['Farm Name'] || 'Unnamed Farm'}</h3>
                {farm.Location && (
                  <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: mutedColor }}>
                    <MapPin size={12} /> {farm.Location}
                  </div>
                )}
                {farm['Farm Size (ha)'] && (
                  <div className="mt-3 text-sm font-medium" style={{ color: '#2E7D32' }}>
                    {farm['Farm Size (ha)']} hectares
                  </div>
                )}
                <div className="mt-3 text-xs" style={{ color: mutedColor }}>
                  {(farm.Fields || []).length} field{(farm.Fields || []).length !== 1 ? 's' : ''}
                </div>
              </motion.div>
            ))}
            {farms.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Tractor size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium" style={{ color: textColor }}>No farms found</p>
                <p className="text-sm mt-1" style={{ color: mutedColor }}>Contact your agent to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Back button */}
            <button
              onClick={() => setSelectedFarm(null)}
              className="flex items-center gap-2 text-sm mb-4 px-3 py-1.5 rounded-lg transition"
              style={{ color: '#2E7D32', background: 'rgba(46,125,50,0.08)' }}
            >
              <X size={14} /> Back to farms
            </button>

            {/* Farm Header */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
              <h2 className="text-xl font-bold" style={{ color: textColor }}>{selectedFarm['Farm Name']}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm" style={{ color: mutedColor }}>
                {selectedFarm.Location && <span className="flex items-center gap-1"><MapPin size={14} /> {selectedFarm.Location}</span>}
                {selectedFarm['Farm Size (ha)'] && <span>{selectedFarm['Farm Size (ha)']} ha</span>}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: activeTab === t.key ? 'rgba(46,125,50,0.1)' : dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: activeTab === t.key ? '#2E7D32' : mutedColor,
                    fontWeight: activeTab === t.key ? 600 : 400,
                    border: activeTab === t.key ? '1px solid rgba(46,125,50,0.2)' : '1px solid transparent',
                  }}
                >
                  {t.icon} {t.label}
                  <span className="text-xs opacity-60">({t.count})</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {detailLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-damara-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                {activeTab === 'fields' && <DataTable records={fields.map(f => ({ id: f.id, createdTime: '', fields: f as any }))} columns={['Field Name', 'Crop Type', 'Field Size (ha)']} dark={dark} emptyMsg="No fields" />}
                {activeTab === 'soil' && <DataTable records={soilSamples} columns={['Sample ID', 'Sample Date', 'pH', 'Organic Matter %', 'P (mg/kg)', 'K (mg/kg)']} dark={dark} emptyMsg="No soil samples" />}
                {activeTab === 'leaf' && <DataTable records={leafSamples} columns={['Sample ID', 'Sample Date', 'Growth Stage', 'N %', 'P %', 'K %']} dark={dark} emptyMsg="No leaf samples" />}
                {activeTab === 'programs' && <DataTable records={programs} columns={['Program Name', 'Crop Type', 'Active']} dark={dark} emptyMsg="No programmes" />}
                {activeTab === 'visits' && <DataTable records={visits} columns={['Visit Date', 'Visit Type', 'Notes']} dark={dark} emptyMsg="No visits" />}
                {activeTab === 'trials' && <DataTable records={trials} columns={['Trial Name', 'Start Date', 'Status']} dark={dark} emptyMsg="No trials" />}
                {activeTab === 'decisions' && <DataTable records={decisions} columns={['Decision', 'Date', 'Status']} dark={dark} emptyMsg="No decisions" />}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DataTable({ records, columns, dark, emptyMsg }: { records: AirtableRecord[]; columns: string[]; dark: boolean; emptyMsg: string }) {
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';
  const headerBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  if (records.length === 0) {
    return <div className="text-center py-8 text-sm" style={{ color: mutedColor }}>{emptyMsg}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: mutedColor, background: headerBg }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: dark ? '#2D3748' : '#F0F0F0' }}>
              {columns.map((col) => {
                const val = r.fields[col];
                const display = val === true ? 'Yes' : val === false ? 'No' : Array.isArray(val) ? val.join(', ') : String(val ?? '-');
                return (
                  <td key={col} className="px-4 py-3 text-sm" style={{ color: textColor }}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

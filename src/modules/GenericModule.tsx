import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';
import { atList, type AirtableRecord } from '../lib/airtable';
import type { Profile } from '../lib/auth';

interface GenericModuleProps {
  dark: boolean;
  profile: Profile;
  title: string;
  subtitle?: string;
  table: string;
  columns: string[];
  icon: React.ReactNode;
  maxRecords?: number;
  filter?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  searchField?: string;
  emptyIcon?: React.ReactNode;
  emptyMsg?: string;
}

export function GenericModule({
  dark, profile, title, subtitle, table, columns, icon,
  maxRecords = 100, filter, sort, searchField, emptyIcon, emptyMsg
}: GenericModuleProps) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  async function load() {
    setLoading(true);
    try {
      const res = await atList(table, { maxRecords, filterByFormula: filter, sort });
      setRecords(res.records || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = search && searchField
    ? records.filter(r => String(r.fields[searchField] || '').toLowerCase().includes(search.toLowerCase()))
    : records;

  return (
    <div className="p-4 lg:p-8 min-h-full" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(46,125,50,0.1)' }}>
              <span className="text-damara-500">{icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: textColor }}>{title}</h1>
              {subtitle && <p className="text-sm" style={{ color: mutedColor }}>{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32' }}>
              {filtered.length} records
            </span>
            <button onClick={load} className="p-2 rounded-lg hover:bg-black/5 transition" title="Refresh">
              <RefreshCw size={16} style={{ color: mutedColor }} />
            </button>
          </div>
        </div>

        {searchField && (
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: mutedColor }} />
            <input
              type="text"
              placeholder={`Search by ${searchField}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-damara-500/30"
              style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textColor }}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            {emptyIcon || icon}
            <p className="font-medium mt-3" style={{ color: textColor }}>{emptyMsg || 'No records found'}</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                        style={{ color: mutedColor, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t" style={{ borderColor: dark ? '#2D3748' : '#F0F0F0' }}>
                      {columns.map(col => {
                        const val = r.fields[col];
                        let display = '-';
                        if (val === true) display = 'Yes';
                        else if (val === false) display = 'No';
                        else if (Array.isArray(val)) display = val.join(', ');
                        else if (val != null) display = String(val);
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
          </div>
        )}
      </motion.div>
    </div>
  );
}

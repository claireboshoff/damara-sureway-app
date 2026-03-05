import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, ChevronDown, Leaf, Droplets, FlaskConical } from 'lucide-react';
import type { Profile } from '../lib/auth';
import { atList, type AirtableRecord } from '../lib/airtable';

interface Props { dark: boolean; profile: Profile; }

export function ProductCatalog({ dark, profile }: Props) {
  const [products, setProducts] = useState<AirtableRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  useEffect(() => {
    atList('tbl8Qto6jldltw6Yr', { maxRecords: 200 })
      .then((res) => setProducts(res.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const name = ((p.fields.Name || p.fields.Product || p.fields['Product Name'] || '') as string).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ background: bg }}>
      <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-8 min-h-full" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>Product Catalogue</h1>
            <p className="text-sm" style={{ color: mutedColor }}>Damara Bio-Agri product range</p>
          </div>
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32' }}>
            {products.length} products
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: mutedColor }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-damara-500/30"
            style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textColor }}
          />
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const name = (p.fields.Name || p.fields.Product || p.fields['Product Name'] || 'Product') as string;
            const desc = (p.fields.Description || p.fields.Notes || '') as string;
            const category = (p.fields.Category || p.fields.Type || '') as string;
            const unit = (p.fields.Unit || p.fields['Pack Size'] || '') as string;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
                style={{ background: cardBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(46,125,50,0.1)' }}>
                    <Leaf size={20} className="text-damara-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: textColor }}>{name}</h3>
                    {category && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
                        style={{ background: 'rgba(46,125,50,0.08)', color: '#2E7D32' }}>
                        {category}
                      </span>
                    )}
                    {desc && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: mutedColor }}>{desc}</p>
                    )}
                    {unit && (
                      <p className="text-xs mt-2 font-medium" style={{ color: textColor }}>{unit}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium" style={{ color: textColor }}>No products found</p>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              {search ? 'Try a different search term' : 'No products in the catalogue yet'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Package, ShoppingCart, MessageSquare, ClipboardCheck,
  TrendingUp, AlertCircle, Warehouse, Truck, ArrowUpRight
} from 'lucide-react';
import { atList, type AirtableRecord } from '../lib/airtable';
import { listFarmers, type Farmer } from '../lib/farming';
import type { Profile } from '../lib/auth';

interface Props {
  dark: boolean;
  profile: Profile;
}

function esc(v: string) { return (v || '').replace(/'/g, "\\'"); }

export function AgentDashboard({ dark, profile }: Props) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [orders, setOrders] = useState<AirtableRecord[]>([]);
  const [inventory, setInventory] = useState<AirtableRecord[]>([]);
  const [stockTakes, setStockTakes] = useState<AirtableRecord[]>([]);
  const [blendOrders, setBlendOrders] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [farmersRes, ordersRes, invRes, stockRes, blendRes] = await Promise.allSettled([
        listFarmers(),
        atList('Orders', { sort: [{ field: 'Created', direction: 'desc' }], maxRecords: 50 }),
        atList('Inventory', { maxRecords: 100 }),
        atList('Stock Takes', { sort: [{ field: 'Date', direction: 'desc' }], maxRecords: 20 }),
        atList('Blending Orders', { maxRecords: 20 }),
      ]);

      if (farmersRes.status === 'fulfilled') setFarmers(farmersRes.value);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.records || []);
      if (invRes.status === 'fulfilled') setInventory(invRes.value.records || []);
      if (stockRes.status === 'fulfilled') setStockTakes(stockRes.value.records || []);
      if (blendRes.status === 'fulfilled') setBlendOrders(blendRes.value.records || []);
    } catch (err) {
      console.error('Agent dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }

  const bg = dark ? '#0F1419' : '#F8FAFB';
  const cardBg = dark ? '#1A2332' : '#FFFFFF';
  const borderColor = dark ? '#2D3748' : '#E8ECF0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#718096' : '#718096';

  const pendingOrders = orders.filter((o) => {
    const s = (o.fields.Status as string || '').toLowerCase();
    return s === 'pending' || s === 'new' || s === 'processing';
  }).length;

  const lowStockItems = inventory.filter((i) => {
    const qty = (i.fields.Quantity as number) || 0;
    const min = (i.fields['Min Stock'] as number) || 10;
    return qty < min;
  }).length;

  const statCards = [
    { label: 'Total Farmers', value: farmers.length, icon: <Users size={20} />, color: '#2E7D32', bg: 'rgba(46,125,50,0.1)' },
    { label: 'Pending Orders', value: pendingOrders, icon: <ShoppingCart size={20} />, color: '#E65100', bg: 'rgba(230,81,0,0.1)' },
    { label: 'Inventory Items', value: inventory.length, icon: <Package size={20} />, color: '#1565C0', bg: 'rgba(21,101,192,0.1)' },
    { label: 'Low Stock Alerts', value: lowStockItems, icon: <AlertCircle size={20} />, color: lowStockItems > 0 ? '#C62828' : '#4CAF50', bg: lowStockItems > 0 ? 'rgba(198,40,40,0.1)' : 'rgba(76,175,80,0.1)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: bg }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-damara-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p style={{ color: mutedColor }} className="text-sm">Loading agent dashboard...</p>
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
            Agent Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: mutedColor }}>
            Hello {profile.full_name?.split(' ')[0] || 'Agent'} — here's your operational overview
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: textColor }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: mutedColor }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="font-semibold mb-4 flex items-center justify-between" style={{ color: textColor }}>
              <span>Recent Orders</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32' }}>
                {orders.length} total
              </span>
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm" style={{ color: mutedColor }}>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 6).map((o) => {
                  const status = (o.fields.Status as string) || 'Unknown';
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    Pending: { bg: 'rgba(245,158,11,0.1)', text: '#D97706' },
                    Processing: { bg: 'rgba(59,130,246,0.1)', text: '#2563EB' },
                    Shipped: { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
                    Delivered: { bg: 'rgba(46,125,50,0.1)', text: '#2E7D32' },
                    Cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
                  };
                  const sc = statusColors[status] || { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' };
                  return (
                    <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: sc.bg }}>
                        <Truck size={16} style={{ color: sc.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: textColor }}>
                          {(o.fields['Order Number'] as string) || (o.fields.Name as string) || `Order ${o.id.slice(0, 6)}`}
                        </div>
                        <div className="text-xs" style={{ color: mutedColor }}>
                          {o.createdTime ? new Date(o.createdTime).toLocaleDateString('en-ZA') : ''}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap" style={{ background: sc.bg, color: sc.text }}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Farmer List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="font-semibold mb-4 flex items-center justify-between" style={{ color: textColor }}>
              <span>Your Farmers</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(46,125,50,0.1)', color: '#2E7D32' }}>
                {farmers.length} total
              </span>
            </h3>
            {farmers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm" style={{ color: mutedColor }}>No farmers assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {farmers.slice(0, 8).map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: '#2E7D32' }}>
                      {(f['Farmer Name'] || 'F')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: textColor }}>{f['Farmer Name'] || 'Unknown'}</div>
                      <div className="text-xs truncate" style={{ color: mutedColor }}>
                        {f['Region / Area'] || f.Email || ''}
                      </div>
                    </div>
                    <ArrowUpRight size={14} style={{ color: mutedColor }} />
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

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Tractor, Cloud, Sprout, Microscope, TrendingUp,
  Calculator, ShoppingCart, DollarSign, MessageSquare, Users, Package,
  Warehouse, ClipboardList, FilePlus2, Truck, Beaker, BookOpen,
  Sun, Moon, LogOut, Menu, X, ChevronDown, Leaf, Globe, Bell
} from 'lucide-react';
import type { Profile } from '../lib/auth';

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  profile: Profile;
  open: boolean;
  setOpen: (o: boolean) => void;
  onLogout: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  section: string;
}

export function Sidebar({ active, setActive, dark, setDark, profile, open, setOpen, onLogout }: SidebarProps) {
  const farmerMenu: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'SureWay' },
    { key: 'farms', label: 'My Farms', icon: <Tractor size={18} />, section: 'SureWay' },
    { key: 'weather', label: 'Weather Intel', icon: <Cloud size={18} />, section: 'SureWay' },
    { key: 'soil', label: 'Soil Analysis', icon: <Microscope size={18} />, section: 'SureWay' },
    { key: 'fertilizer', label: 'Nutrition Planner', icon: <Sprout size={18} />, section: 'SureWay' },
    { key: 'yield', label: 'Yield Tracker', icon: <TrendingUp size={18} />, section: 'SureWay' },
    { key: 'profitability', label: 'Profitability', icon: <Calculator size={18} />, section: 'SureWay' },
    { key: 'products', label: 'Product Catalogue', icon: <ShoppingCart size={18} />, section: 'Market' },
    { key: 'market', label: 'Market Prices', icon: <DollarSign size={18} />, section: 'Market' },
    { key: 'community', label: 'Community', icon: <MessageSquare size={18} />, section: 'Market' },
  ];

  const agentMenu: MenuItem[] = [
    { key: 'agent-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'Agent Hub' },
    { key: 'my-farmers', label: 'My Farmers', icon: <Users size={18} />, section: 'Agent Hub' },
    { key: 'discovery', label: 'Discover Farmers', icon: <Globe size={18} />, section: 'Agent Hub' },
    { key: 'inventory', label: 'Inventory', icon: <Package size={18} />, section: 'Operations' },
    { key: 'warehouses', label: 'Warehouses', icon: <Warehouse size={18} />, section: 'Operations' },
    { key: 'stock', label: 'Stock Take', icon: <ClipboardList size={18} />, section: 'Operations' },
    { key: 'orders', label: 'Orders', icon: <FilePlus2 size={18} />, section: 'Operations' },
    { key: 'progress', label: 'Deliveries', icon: <Truck size={18} />, section: 'Operations' },
    { key: 'blending', label: 'Blending Guide', icon: <Beaker size={18} />, section: 'Operations' },
    { key: 'training', label: 'Training', icon: <BookOpen size={18} />, section: 'Operations' },
  ];

  const adminMenu: MenuItem[] = [
    { key: 'users', label: 'User Management', icon: <Users size={18} />, section: 'Admin' },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={18} />, section: 'Admin' },
  ];

  let menu: MenuItem[] = [];
  if (profile.role === 'farmer') {
    menu = farmerMenu;
  } else if (profile.role === 'agent') {
    menu = [...agentMenu, ...farmerMenu];
  } else {
    menu = [...agentMenu, ...farmerMenu, ...adminMenu];
  }

  const sections = [...new Set(menu.map((m) => m.section))];

  const bg = dark ? '#0F1419' : '#FFFFFF';
  const borderColor = dark ? '#1E2A3A' : '#F0F0F0';
  const textColor = dark ? '#E2E8F0' : '#1A202C';
  const mutedColor = dark ? '#64748B' : '#94A3B8';
  const hoverBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const activeBg = dark ? 'rgba(27,94,32,0.2)' : 'rgba(27,94,32,0.08)';
  const activeText = '#2E7D32';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: 280,
          background: bg,
          borderRight: `1px solid ${borderColor}`,
          color: textColor,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
              <Leaf size={20} className="text-gold-400" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: textColor }}>Damara SureWay</div>
              <div className="text-xs capitalize" style={{ color: mutedColor }}>
                {profile.role} Portal
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-black/5">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-auto py-3 px-3">
          {sections.map((section) => (
            <div key={section} className="mb-2">
              <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-2" style={{ color: mutedColor }}>
                {section}
              </div>
              {menu
                .filter((m) => m.section === section)
                .map((m) => {
                  const isActive = active === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => {
                        setActive(m.key);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
                      style={{
                        background: isActive ? activeBg : 'transparent',
                        color: isActive ? activeText : textColor,
                        fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ color: isActive ? activeText : mutedColor }}>{m.icon}</span>
                      {m.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#FFD54F' }} />
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 space-y-2" style={{ borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition"
            style={{ color: mutedColor }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition text-red-400 hover:text-red-300"
          >
            <LogOut size={16} /> Sign Out
          </button>
          <div className="px-3 pt-1">
            <div className="text-xs font-medium truncate" style={{ color: textColor }}>{profile.full_name}</div>
            <div className="text-[11px] truncate" style={{ color: mutedColor }}>{profile.email}</div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: dark ? '#0F1419' : '#FFFFFF',
        borderBottom: `1px solid ${dark ? '#1E2A3A' : '#F0F0F0'}`,
      }}
    >
      <button onClick={onToggle} className="p-2 rounded-lg">
        <Menu size={22} style={{ color: dark ? '#E2E8F0' : '#1A202C' }} />
      </button>
      <div className="flex items-center gap-2">
        <Leaf size={18} className="text-damara-500" />
        <span className="text-sm font-bold" style={{ color: dark ? '#E2E8F0' : '#1A202C' }}>
          Damara SureWay
        </span>
      </div>
      <div className="w-8" />
    </div>
  );
}

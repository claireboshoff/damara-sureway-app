import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Microscope, Sprout, TrendingUp, Calculator, DollarSign,
  MessageSquare, Users, Package, Warehouse, ClipboardList,
  FilePlus2, Truck, Beaker, BookOpen, Bell, Globe
} from 'lucide-react';
import { getCurrentProfile, signOut, type Profile } from './lib/auth';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, MobileHeader } from './components/Sidebar';
import { FarmerDashboard } from './modules/FarmerDashboard';
import { AgentDashboard } from './modules/AgentDashboard';
import { MyFarms } from './modules/MyFarms';
import { WeatherIntel } from './modules/WeatherIntel';
import { ProductCatalog } from './modules/ProductCatalog';
import { GenericModule } from './modules/GenericModule';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [active, setActive] = useState('');
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getCurrentProfile();
    setProfile(p);
    if (p && !active) {
      setActive(p.role === 'farmer' ? 'dashboard' : 'agent-dashboard');
    }
    setLoading(false);
  }, []);

  function handleLogin(p: Profile) {
    setProfile(p);
    setActive(p.role === 'farmer' ? 'dashboard' : 'agent-dashboard');
  }

  function handleLogout() {
    signOut();
    setProfile(null);
    setActive('');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0A3A0A, #1B5E20)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-200 text-sm">Loading Damara SureWay...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex relative" style={{ background: dark ? '#0F1419' : '#F8FAFB', color: dark ? '#E2E8F0' : '#1A202C' }}>
      <Sidebar
        active={active}
        setActive={setActive}
        dark={dark}
        setDark={setDark}
        profile={profile}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <MobileHeader dark={dark} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="lg:hidden h-14" />
        <AnimatePresence mode="wait">
          {active === 'dashboard' && <FarmerDashboard key="d" dark={dark} profile={profile} />}
          {active === 'agent-dashboard' && <AgentDashboard key="ad" dark={dark} profile={profile} />}
          {active === 'farms' && <MyFarms key="f" dark={dark} profile={profile} />}
          {active === 'weather' && <WeatherIntel key="w" dark={dark} profile={profile} />}
          {active === 'products' && <ProductCatalog key="pc" dark={dark} profile={profile} />}

          {active === 'soil' && (
            <GenericModule key="soil" dark={dark} profile={profile}
              title="Soil Analysis" subtitle="Track soil health across your fields"
              table="Soil Samples" columns={['Sample ID', 'Sample Date', 'pH', 'Organic Matter %', 'P (mg/kg)', 'K (mg/kg)', 'Ca (mg/kg)', 'Mg (mg/kg)']}
              icon={<Microscope size={20} />} searchField="Sample ID"
              sort={[{ field: 'Sample Date', direction: 'desc' }]}
            />
          )}
          {active === 'fertilizer' && (
            <GenericModule key="fert" dark={dark} profile={profile}
              title="Nutrition Planner" subtitle="SureWay crop nutrition programmes"
              table="Programs" columns={['Program Name', 'Crop Type', 'Description', 'Active']}
              icon={<Sprout size={20} />} searchField="Program Name"
            />
          )}
          {active === 'yield' && (
            <GenericModule key="yield" dark={dark} profile={profile}
              title="Yield Tracker" subtitle="Monitor crop performance and yields"
              table="Trials" columns={['Trial Name', 'Start Date', 'Status', 'Notes']}
              icon={<TrendingUp size={20} />} searchField="Trial Name"
            />
          )}
          {active === 'profitability' && (
            <GenericModule key="prof" dark={dark} profile={profile}
              title="Profitability" subtitle="Track costs and returns per field"
              table="Decisions" columns={['Decision', 'Date', 'Status', 'Notes']}
              icon={<Calculator size={20} />}
            />
          )}
          {active === 'market' && (
            <GenericModule key="market" dark={dark} profile={profile}
              title="Market Prices" subtitle="Current commodity prices and trends"
              table="tbl8Qto6jldltw6Yr" columns={['Name', 'Category', 'Unit']}
              icon={<DollarSign size={20} />} searchField="Name"
            />
          )}
          {active === 'community' && (
            <GenericModule key="comm" dark={dark} profile={profile}
              title="Community" subtitle="Connect with other SureWay farmers"
              table="Messages" columns={['Subject', 'From', 'Date', 'Status']}
              icon={<MessageSquare size={20} />} emptyMsg="No community messages yet"
            />
          )}
          {active === 'my-farmers' && (
            <GenericModule key="mf" dark={dark} profile={profile}
              title="My Farmers" subtitle="Farmers assigned to you"
              table="Farmers" columns={['Farmer Name', 'Phone Number', 'Email', 'Region / Area']}
              icon={<Users size={20} />} searchField="Farmer Name"
            />
          )}
          {active === 'discovery' && (
            <GenericModule key="disc" dark={dark} profile={profile}
              title="Discover Farmers" subtitle="Find and onboard new farmers"
              table="Farmers" columns={['Farmer Name', 'Phone Number', 'Email', 'Region / Area']}
              icon={<Globe size={20} />} searchField="Farmer Name"
            />
          )}
          {active === 'inventory' && (
            <GenericModule key="inv" dark={dark} profile={profile}
              title="Inventory" subtitle="Product stock levels"
              table="Inventory" columns={['Product', 'Quantity', 'Warehouse', 'Last Updated']}
              icon={<Package size={20} />} searchField="Product"
            />
          )}
          {active === 'warehouses' && (
            <GenericModule key="wh" dark={dark} profile={profile}
              title="Warehouses" subtitle="Warehouse locations and capacity"
              table="Warehouses" columns={['Name', 'Location', 'Capacity', 'Status']}
              icon={<Warehouse size={20} />} searchField="Name"
            />
          )}
          {active === 'stock' && (
            <GenericModule key="st" dark={dark} profile={profile}
              title="Stock Take" subtitle="Physical stock count records"
              table="Stock Takes" columns={['Date', 'Product', 'Expected', 'Actual', 'Variance']}
              icon={<ClipboardList size={20} />}
              sort={[{ field: 'Date', direction: 'desc' }]}
            />
          )}
          {active === 'orders' && (
            <GenericModule key="ord" dark={dark} profile={profile}
              title="Orders" subtitle="Order management"
              table="Orders" columns={['Order Number', 'Customer', 'Status', 'Total', 'Date']}
              icon={<FilePlus2 size={20} />} searchField="Order Number"
              sort={[{ field: 'Created', direction: 'desc' }]}
            />
          )}
          {active === 'progress' && (
            <GenericModule key="prog" dark={dark} profile={profile}
              title="Deliveries" subtitle="Track order deliveries"
              table="Orders" columns={['Order Number', 'Status', 'Delivery Date', 'Notes']}
              icon={<Truck size={20} />}
              filter="OR({Status}='Shipped', {Status}='In Transit', {Status}='Delivered')"
            />
          )}
          {active === 'blending' && (
            <GenericModule key="blend" dark={dark} profile={profile}
              title="Blending Guide" subtitle="Custom blend formulations"
              table="Blend Recipes" columns={['Name', 'Components', 'Ratio', 'Notes']}
              icon={<Beaker size={20} />} searchField="Name"
            />
          )}
          {active === 'training' && (
            <GenericModule key="train" dark={dark} profile={profile}
              title="Training" subtitle="Agent training modules"
              table="Training" columns={['Title', 'Department', 'Duration', 'Status']}
              icon={<BookOpen size={20} />} searchField="Title"
            />
          )}
          {active === 'users' && (
            <GenericModule key="users" dark={dark} profile={profile}
              title="User Management" subtitle="Manage system users"
              table="Users" columns={['Full Name', 'Email', 'Role', 'Active']}
              icon={<Users size={20} />} searchField="Full Name"
            />
          )}
          {active === 'notifications' && (
            <GenericModule key="notif" dark={dark} profile={profile}
              title="Notifications" subtitle="System notifications"
              table="Notifications" columns={['Title', 'Message', 'Type', 'Date', 'Read']}
              icon={<Bell size={20} />}
              sort={[{ field: 'Date', direction: 'desc' }]}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

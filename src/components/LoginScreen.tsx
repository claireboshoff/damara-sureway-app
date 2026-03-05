import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { signIn, signUp, type Profile } from '../lib/auth';

interface Props {
  onLogin: (profile: Profile) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let profile: Profile;
      if (mode === 'login') {
        profile = await signIn(email, password);
      } else {
        profile = await signUp(email, password, name, phone);
      }
      onLogin(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A3A0A 0%, #1B5E20 40%, #2E7D32 70%, #1B5E20 100%)',
      }}>
      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FFD54F, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #81C784, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'rgba(255,213,79,0.15)', border: '2px solid rgba(255,213,79,0.3)' }}>
            <Leaf size={40} className="text-gold-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Damara SureWay</h1>
          <p className="text-sm text-green-200 mt-1">Precision Agriculture Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}>
          {/* Tabs */}
          <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'text-white' : 'text-green-300 hover:text-white'
              }`}
              style={mode === 'login' ? { background: 'rgba(255,213,79,0.2)', borderBottom: '2px solid #FFD54F' } : {}}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'signup' ? 'text-white' : 'text-green-300 hover:text-white'
              }`}
              style={mode === 'signup' ? { background: 'rgba(255,213,79,0.2)', borderBottom: '2px solid #FFD54F' } : {}}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-green-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-green-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-green-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-green-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 pr-12"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300 hover:text-white transition"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-300 text-sm text-center py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FFD54F, #FFB300)',
                color: '#1B5E20',
                boxShadow: '0 4px 14px rgba(255,213,79,0.3)',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-green-300/50 text-xs mt-6">
          Damara Bio-Agri &copy; {new Date().getFullYear()} &mdash; Sustainable Farming Solutions
        </p>
      </motion.div>
    </div>
  );
}

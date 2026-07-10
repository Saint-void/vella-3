import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BarChart2,
  Bot,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { clearAuthSession, getAccessToken, getAuthEmail } from '../lib/authSession';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: MessageSquare, label: 'Chatbots', active: false },
  { icon: BarChart2, label: 'Analytics', active: false },
  { icon: Users, label: 'Leads', active: false },
];

const stats = [
  { label: 'Messages', value: '0', detail: 'No live chatbot traffic yet' },
  { label: 'Leads', value: '0', detail: 'Captured leads will appear here' },
  { label: 'Chatbots', value: '0', detail: 'Create your first AI employee' },
];

function initials(profile: Profile | null, email?: string) {
  const first = profile?.first_name?.trim()[0];
  const last = profile?.last_name?.trim()[0];
  const fallback = email?.trim()[0] ?? 'U';
  return `${first ?? fallback}${last ?? ''}`.toUpperCase();
}

export function Dashboard() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (token: string) => {
    setError(null);
    const data = await apiRequest<Profile>('/api/v1/auth/me', token);
    setProfile(data);
    setFirstName(data.first_name ?? '');
    setLastName(data.last_name ?? '');
  };

  useEffect(() => {
    let isMounted = true;

    async function bootDashboard() {
      const token = getAccessToken();

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      if (!isMounted) return;

      setAccessToken(token);
      setEmail(getAuthEmail());

      try {
        await loadProfile(token);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load your profile.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    bootDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const data = await apiRequest<Profile>('/api/v1/auth/me', accessToken, {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        }),
      });
      setProfile(data);
      setFirstName(data.first_name ?? '');
      setLastName(data.last_name ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'New founder';

  return (
    <div className="min-h-screen bg-vella-black text-vella-white flex flex-col w-full relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 w-[calc(100%-2rem)] max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5 backdrop-blur-md bg-vella-darker/60 border border-white/10 rounded-full shadow-2xl"
      >
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-vella-white">
          <img src="/logo.png" alt="Vella Logo" className="h-10 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="text-white/60 hover:text-white transition-colors p-2" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="text-white/60 hover:text-white transition-colors p-2"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium border border-white/10">
            {initials(profile, email)}
          </div>
        </div>
      </motion.nav>

      <div className="flex-1 flex max-w-[1400px] w-full mx-auto relative z-10 pt-[100px] px-4 md:px-6 pb-6 gap-6">
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-64 shrink-0 hidden lg:flex flex-col bg-[#1c1c1c]/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    link.active
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </motion.aside>

        <main className="flex-1 flex flex-col min-h-[620px] gap-6">
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <p className="text-sm text-white/40">Dashboard</p>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">Welcome, {displayName}</h1>
                  <p className="text-white/50 mt-3 max-w-xl">
                    Your backend profile is connected. This is where chatbots, conversations, and customer insights can grow next.
                  </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-vella-black bg-vella-white rounded-full transition-all hover:scale-105 active:scale-95 self-start">
                  <Plus className="w-4 h-4" />
                  Create Chatbot
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-sm text-white/45">{stat.label}</p>
                    <p className="text-3xl font-semibold text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-white/35 mt-3">{stat.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 min-h-[220px] rounded-2xl border border-white/10 bg-black/20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <Bot className="w-7 h-7 text-white/30" />
                </div>
                <h2 className="text-xl font-medium text-white/80">No chatbot here yet</h2>
                <p className="text-sm text-white/40 mt-2 max-w-md">Create your first AI employee when you are ready to connect knowledge, channels, and analytics.</p>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/40">Profile</p>
                  <h2 className="text-xl font-semibold text-white mt-1">Account details</h2>
                </div>
                {isLoading && <Loader2 className="w-5 h-5 text-white/50 animate-spin" />}
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <p>{error}</p>
                    {accessToken && (
                      <button
                        type="button"
                        onClick={() => loadProfile(accessToken).catch((err) => setError(err instanceof Error ? err.message : 'Could not load your profile.'))}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
                <label className="block">
                  <span className="text-xs font-medium text-white/45">First name</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    disabled={isLoading}
                    className="mt-2 w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
                    placeholder="First name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-white/45">Last name</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    disabled={isLoading}
                    className="mt-2 w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
                    placeholder="Last name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-white/45">Email</span>
                  <input
                    value={email ?? ''}
                    disabled
                    className="mt-2 w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 disabled:opacity-70"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading || isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </form>

              {profile && (
                <p className="text-xs text-white/35 mt-5">
                  Profile created {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(profile.created_at))}
                </p>
              )}
            </motion.aside>
          </section>
        </main>
      </div>
    </div>
  );
}

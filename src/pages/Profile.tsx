import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { clearAuthSession, getAccessToken, getAuthEmail } from '../lib/authSession';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

const inputClass =
  'mt-2 w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50';

function initials(profile: Profile | null, email?: string) {
  const first = profile?.first_name?.trim()[0];
  const last = profile?.last_name?.trim()[0];
  const fallback = email?.trim()[0] ?? 'U';
  return `${first ?? fallback}${last ?? ''}`.toUpperCase();
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    setAccessToken(token);
    setEmail(getAuthEmail() ?? undefined);

    const loadProfile = async () => {
      try {
        const data = await apiRequest<Profile>('/api/v1/profile', token);
        setProfile(data);
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
      } catch {
        setError('Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [navigate]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await apiRequest<Profile>('/api/v1/profile', accessToken, {
        method: 'PATCH',
        body: JSON.stringify({ first_name: firstName.trim() || null, last_name: lastName.trim() || null }),
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-vella-black text-vella-white flex flex-col w-full relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full max-w-[800px] mx-auto px-4 md:px-6 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-medium border border-white/10">
                  {initials(profile, email)}
                </div>
                <div>
                  <p className="text-sm text-white/40">Profile</p>
                  <h1 className="text-2xl font-semibold text-white mt-1">Account</h1>
                </div>
                {isLoading && <Loader2 className="w-5 h-5 text-white/50 animate-spin ml-auto" />}
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
                  <p>{error}</p>
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSaveProfile}>
                <label className="block">
                  <span className="text-xs font-medium text-white/45">First name</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    disabled={isLoading}
                    className={inputClass}
                    placeholder="First name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-white/45">Last name</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    disabled={isLoading}
                    className={inputClass}
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white/70 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

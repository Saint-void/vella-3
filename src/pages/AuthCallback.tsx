import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthSession, clearAuthSession, saveAuthSession } from '../lib/authSession';

function readOAuthSession(): AuthSession | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');

  if (!accessToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: params.get('refresh_token'),
    token_type: params.get('token_type'),
    expires_in: Number(params.get('expires_in')) || null,
    user: null,
    message: null,
  };
}

export function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    const error = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('error_description');

    if (error) {
      clearAuthSession();
      setMessage(error);
      return;
    }

    const session = readOAuthSession();

    if (!session) {
      clearAuthSession();
      setMessage('Could not finish sign in. Please try again.');
      return;
    }

    clearAuthSession();
    saveAuthSession(session);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <main className="min-h-screen w-full bg-vella-black text-vella-white flex items-center justify-center px-6">
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </main>
  );
}

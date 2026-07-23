import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BarChart2,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import {
  Chatbot,
  ChatbotPayload,
  createChatbot,
  deleteChatbot,
  deleteChatbotLogo,
  listChatbots,
  uploadChatbotLogo,
  updateChatbot,
} from '../lib/chatbots';
import { clearAuthSession, getAccessToken, getAuthEmail } from '../lib/authSession';
import { useLogoAsset } from '../lib/useLogoAsset';
import {
  KnowledgeDocument,
  createTextKnowledgeDocument,
  deleteKnowledgeDocument,
  listKnowledgeDocuments,
  reprocessKnowledgeDocument,
  uploadKnowledgeDocument,
  uploadKnowledgeDocumentWithProgress,
} from '../lib/knowledge';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

type ChatbotForm = {
  name: string;
  business_name: string;
  industry: string;
  support_goal: string;
  website_domain: string;
  tone: string;
  greeting_message: string;
  brand_color: string;
  logo_url: string;
  handoff_email: string;
  status: Chatbot['status'];
};

type KnowledgeTextForm = {
  name: string;
  content: string;
};

type DashboardView = 'overview' | 'chatbots' | 'analytics' | 'leads';
type EditorTab = 'settings' |'knowledge' | 'publish';

const sidebarLinks: Array<{ id: DashboardView; icon: typeof LayoutDashboard; label: string }> = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'chatbots', icon: MessageSquare, label: 'Chatbots' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'leads', icon: Users, label: 'Leads' },
];

const editorTabs: Array<{ id: EditorTab; icon: typeof Settings; label: string }> = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'knowledge', icon: FileText, label: 'Knowledge' },
  { id: 'publish', icon: Globe, label: 'Publish' },
];

const inputClass =
  'mt-2 w-full bg-[#101010] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50';
const textareaClass = `${inputClass} min-h-[104px] resize-y`;

const emptyChatbotForm: ChatbotForm = {
  name: '',
  business_name: '',
  industry: '',
  support_goal: '',
  website_domain: '',
  tone: 'friendly',
  greeting_message: 'Hi! How can I help you today?',
  brand_color: '#111111',
  logo_url: '',
  handoff_email: '',
  status: 'draft',
};

const emptyKnowledgeTextForm: KnowledgeTextForm = {
  name: '',
  content: '',
};

function initials(profile: Profile | null, email?: string) {
  const first = profile?.first_name?.trim()[0];
  const last = profile?.last_name?.trim()[0];
  const fallback = email?.trim()[0] ?? 'U';
  return `${first ?? fallback}${last ?? ''}`.toUpperCase();
}

function chatbotToForm(chatbot: Chatbot): ChatbotForm {
  return {
    name: chatbot.name,
    business_name: chatbot.business_name,
    industry: chatbot.industry ?? '',
    support_goal: chatbot.support_goal ?? '',
    website_domain: chatbot.website_domain ?? '',
    tone: chatbot.tone,
    greeting_message: chatbot.greeting_message,
    brand_color: chatbot.brand_color,
    logo_url: chatbot.logo_url ?? '',
    handoff_email: chatbot.handoff_email ?? '',
    status: chatbot.status,
  };
}

function chatbotPayloadFromForm(form: ChatbotForm): ChatbotPayload {
  return {
    name: form.name.trim(),
    business_name: form.business_name.trim(),
    industry: form.industry.trim() || null,
    support_goal: form.support_goal.trim() || null,
    website_domain: form.website_domain.trim() || null,
    tone: form.tone.trim() || 'friendly',
    greeting_message: form.greeting_message.trim(),
    brand_color: form.brand_color.trim() || '#111111',
    logo_url: form.logo_url.trim() || null,
    handoff_email: form.handoff_email.trim() || null,
  };
}

function statusClass(status: Chatbot['status']) {
  if (status === 'active') return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200';
  if (status === 'paused') return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
  if (status === 'archived') return 'border-white/10 bg-white/5 text-white/45';
  return 'border-sky-400/20 bg-sky-500/10 text-sky-100';
}

function knowledgeStatusClass(status: KnowledgeDocument['status']) {
  if (status === 'ready') return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200';
  if (status === 'failed') return 'border-red-400/20 bg-red-500/10 text-red-100';
  if (status === 'processing') return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
  return 'border-sky-400/20 bg-sky-500/10 text-sky-100';
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function colorInputValue(color: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#111111';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [isChatbotEditorOpen, setIsChatbotEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('settings');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [chatbotForm, setChatbotForm] = useState<ChatbotForm>(emptyChatbotForm);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [knowledgeTextForm, setKnowledgeTextForm] = useState<KnowledgeTextForm>(emptyKnowledgeTextForm);
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingChatbot, setIsSavingChatbot] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatbotError, setChatbotError] = useState<string | null>(null);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);

  const selectedChatbot = chatbots.find((chatbot) => chatbot.id === selectedChatbotId) ?? null;
  const logoPreviewUrl = useLogoAsset(chatbotForm.logo_url);
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'New founder';
  const isCreatingChatbot = selectedChatbot === null;
  const canPublishWidget = selectedChatbot?.status === 'active' && Boolean(selectedChatbot.website_domain?.trim());
  const widgetLoaderUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/widget-loader.js`;
  const widgetSnippet = selectedChatbot && canPublishWidget
    ? `<script async src="${widgetLoaderUrl}" data-vella-chatbot-id="${selectedChatbot.id}"></script>`
    : '';

  const loadProfile = async (token: string) => {
    const data = await apiRequest<Profile>('/api/v1/auth/me', token);
    setProfile(data);
    setFirstName(data.first_name ?? '');
    setLastName(data.last_name ?? '');
    return data;
  };

  const loadChatbots = async (token: string) => {
    const rows = await listChatbots(token);
    setChatbots(rows);

    if (rows.length > 0) {
      setSelectedChatbotId(rows[0].id);
      setChatbotForm(chatbotToForm(rows[0]));
    } else {
      setSelectedChatbotId(null);
      setChatbotForm(emptyChatbotForm);
    }

    return rows;
  };

  const loadKnowledgeDocuments = async (token: string, chatbotId: string) => {
    const rows = await listKnowledgeDocuments(token, chatbotId);
    setKnowledgeDocuments(rows);
    return rows;
  };

  const refreshKnowledgeDocuments = async () => {
    if (!accessToken || !selectedChatbot) return;

    setIsLoadingKnowledge(true);
    setKnowledgeError(null);

    try {
      await loadKnowledgeDocuments(accessToken, selectedChatbot.id);
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not load knowledge documents.');
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const copyWidgetSnippet = async () => {
    if (!widgetSnippet) return;

    try {
      await navigator.clipboard.writeText(widgetSnippet);
      setCopiedSnippet(true);
      window.setTimeout(() => setCopiedSnippet(false), 1800);
    } catch {
      setCopiedSnippet(false);
    }
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
        await Promise.all([loadProfile(token), loadChatbots(token)]);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load your dashboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    bootDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadKnowledge() {
      if (!accessToken || !selectedChatbotId || !isChatbotEditorOpen) {
        setKnowledgeDocuments([]);
        setKnowledgeError(null);
        return;
      }

      setIsLoadingKnowledge(true);
      setKnowledgeError(null);

      try {
        const rows = await listKnowledgeDocuments(accessToken, selectedChatbotId);
        if (isMounted) setKnowledgeDocuments(rows);
      } catch (err) {
        if (isMounted) setKnowledgeError(err instanceof Error ? err.message : 'Could not load knowledge documents.');
      } finally {
        if (isMounted) setIsLoadingKnowledge(false);
      }
    }

    loadKnowledge();

    return () => {
      isMounted = false;
    };
  }, [accessToken, selectedChatbotId, isChatbotEditorOpen]);

  const handleChangeView = (view: DashboardView) => {
    setActiveView(view);
    setChatbotError(null);
  };

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setActiveView('chatbots');
    setSelectedChatbotId(chatbot.id);
    setChatbotForm(chatbotToForm(chatbot));
    setIsChatbotEditorOpen(true);
    setEditorTab('settings');
    setChatbotError(null);
    setKnowledgeError(null);
    setKnowledgeTextForm(emptyKnowledgeTextForm);
    setKnowledgeFile(null);
  };

  const handleStartNewChatbot = () => {
    setActiveView('chatbots');
    setSelectedChatbotId(null);
    setChatbotForm(emptyChatbotForm);
    setKnowledgeDocuments([]);
    setIsChatbotEditorOpen(true);
    setEditorTab('settings');
    setChatbotError(null);
    setKnowledgeError(null);
    setKnowledgeTextForm(emptyKnowledgeTextForm);
    setKnowledgeFile(null);
  };

  const handleCloseChatbotEditor = () => {
    setIsChatbotEditorOpen(false);
    setChatbotError(null);
    setKnowledgeError(null);
    setKnowledgeTextForm(emptyKnowledgeTextForm);
    setKnowledgeFile(null);
    if (selectedChatbot) {
      setChatbotForm(chatbotToForm(selectedChatbot));
    } else if (chatbots[0]) {
      setSelectedChatbotId(chatbots[0].id);
      setChatbotForm(chatbotToForm(chatbots[0]));
    } else {
      setChatbotForm(emptyChatbotForm);
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setIsSavingProfile(true);
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
      setIsSavingProfile(false);
    }
  };

  const handleSaveChatbot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    const payload = chatbotPayloadFromForm(chatbotForm);
    if (!payload.name || !payload.business_name || !payload.greeting_message) {
      setChatbotError('Chatbot name, business name, and greeting message are required.');
      return;
    }

    setIsSavingChatbot(true);
    setChatbotError(null);

    try {
      if (selectedChatbot) {
        const updated = await updateChatbot(accessToken, selectedChatbot.id, {
          ...payload,
          status: chatbotForm.status,
        });
        setChatbots((current) => current.map((chatbot) => (chatbot.id === updated.id ? updated : chatbot)));
        setChatbotForm(chatbotToForm(updated));
        return;
      }

      const created = await createChatbot(accessToken, payload);
      setChatbots((current) => [created, ...current]);
      setSelectedChatbotId(created.id);
      setChatbotForm(chatbotToForm(created));
    } catch (err) {
      setChatbotError(err instanceof Error ? err.message : 'Could not save chatbot.');
    } finally {
      setIsSavingChatbot(false);
    }
  };

  const handleDeleteChatbot = async () => {
    if (!accessToken || !selectedChatbot) return;
    if (!window.confirm(`Delete ${selectedChatbot.name}`)) return;

    setIsSavingChatbot(true);
    setChatbotError(null);

    try {
      await deleteChatbot(accessToken, selectedChatbot.id);
      const remaining = chatbots.filter((chatbot) => chatbot.id !== selectedChatbot.id);
      setChatbots(remaining);
      if (remaining[0]) {
        setSelectedChatbotId(remaining[0].id);
        setChatbotForm(chatbotToForm(remaining[0]));
      } else {
        setSelectedChatbotId(null);
        setChatbotForm(emptyChatbotForm);
        setKnowledgeDocuments([]);
        setIsChatbotEditorOpen(false);
      }
    } catch (err) {
      setChatbotError(err instanceof Error ? err.message : 'Could not delete chatbot.');
    } finally {
      setIsSavingChatbot(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!accessToken || !selectedChatbot || !file) return;

    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
    if (!allowedTypes.has(file.type)) {
      setChatbotError('Upload a PNG, JPEG, WebP, or GIF logo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setChatbotError('Logo must be smaller than 2 MB.');
      return;
    }

    setIsUploadingLogo(true);
    setChatbotError(null);
    console.log(`📤 Uploading logo for chatbot ${selectedChatbot.id}:`, file.name, file.type, file.size);
    try {
      const updated = await uploadChatbotLogo(accessToken, selectedChatbot.id, file);
      console.log('✓ Logo uploaded successfully, logo_url:', updated.logo_url);
      setChatbots((current) => current.map((chatbot) => (chatbot.id === updated.id ? updated : chatbot)));
      setChatbotForm(chatbotToForm(updated));
    } catch (err) {
      console.error('✗ Logo upload failed:', err);
      setChatbotError(err instanceof Error ? err.message : 'Could not upload logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!accessToken || !selectedChatbot) return;
    setIsUploadingLogo(true);
    setChatbotError(null);
    try {
      const updated = await deleteChatbotLogo(accessToken, selectedChatbot.id);
      setChatbots((current) => current.map((chatbot) => (chatbot.id === updated.id ? updated : chatbot)));
      setChatbotForm(chatbotToForm(updated));
    } catch (err) {
      setChatbotError(err instanceof Error ? err.message : 'Could not remove logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCreateTextKnowledge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !selectedChatbot) return;

    const payload = {
      name: knowledgeTextForm.name.trim(),
      content: knowledgeTextForm.content.trim(),
    };

    if (!payload.name || !payload.content) {
      setKnowledgeError('Knowledge name and content are required.');
      return;
    }

    setIsSavingKnowledge(true);
    setKnowledgeError(null);

    try {
      const created = await createTextKnowledgeDocument(accessToken, selectedChatbot.id, payload);
      setKnowledgeDocuments((current) => [created, ...current]);
      setKnowledgeTextForm(emptyKnowledgeTextForm);
      window.setTimeout(() => {
        void refreshKnowledgeDocuments();
      }, 1500);
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not add knowledge text.');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleUploadKnowledge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !selectedChatbot) return;

    if (!knowledgeFile) {
      setKnowledgeError('Choose a PDF, DOCX, or TXT file first.');
      return;
    }

    setIsSavingKnowledge(true);
    setKnowledgeError(null);
    setUploadProgress(0);

    try {
      const created = await uploadKnowledgeDocumentWithProgress(
        accessToken,
        selectedChatbot.id,
        knowledgeFile,
        (progress) => setUploadProgress(progress)
      );
      setKnowledgeDocuments((current) => [created, ...current]);
      setKnowledgeFile(null);
      setUploadProgress(null);
      window.setTimeout(() => {
        void refreshKnowledgeDocuments();
      }, 1500);
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not upload knowledge file.');
      setUploadProgress(null);
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setKnowledgeFile(file);
      } else {
        setKnowledgeError('Only PDF, DOCX, and TXT files are supported');
      }
    }
  };

  const handleReprocessKnowledge = async (document: KnowledgeDocument) => {
    if (!accessToken || !selectedChatbot) return;

    setIsSavingKnowledge(true);
    setKnowledgeError(null);

    try {
      const updated = await reprocessKnowledgeDocument(accessToken, selectedChatbot.id, document.id);
      setKnowledgeDocuments((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      window.setTimeout(() => {
        void refreshKnowledgeDocuments();
      }, 1500);
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not reprocess document.');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async (document: KnowledgeDocument) => {
    if (!accessToken || !selectedChatbot) return;
    if (!window.confirm(`Delete ${document.name}? This removes its generated chunks too.`)) return;

    setIsSavingKnowledge(true);
    setKnowledgeError(null);

    try {
      await deleteKnowledgeDocument(accessToken, selectedChatbot.id, document.id);
      setKnowledgeDocuments((current) => current.filter((row) => row.id !== document.id));
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not delete document.');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleRetry = () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    Promise.all([loadProfile(accessToken), loadChatbots(accessToken)])
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your dashboard.'))
      .finally(() => setIsLoading(false));
  };

  const handleSignOut = async () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const activeChatbots = chatbots.filter((chatbot) => chatbot.status === 'active').length;
  const pageTitle = activeView === 'overview' ? 'Overview' : sidebarLinks.find((link) => link.id === activeView)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-vella-black text-vella-white flex flex-col w-full relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 w-[calc(100%-2rem)] max-w-[2000px] mx-auto flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5 backdrop-blur-md bg-vella-darker/60 rounded-full shadow-2xl"
      >
        <Link to="/" className="flex items-center gap-2 text-4xl font-bold text-vella-white">
          <img src="/logo.png" alt="Vella Logo" className="h-15 w-auto object-contain brightness-0 invert" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
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
          <Link
            to="/dashboard/profile"
            className="h-15 w-15  rounded-full bg-white/10 flex items-center justify-center text-sm font-medium  hover:bg-white/20 transition-colors"
          >
            {initials(profile, email)}
          </Link>
        </div>
      </motion.nav>

      <div className="flex-1 flex max-w-[2000px] w-full mx-auto relative z-10 pt-[130px] px-4 md:px-6 pb-6 gap-6">
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-64 shrink-0 hidden lg:flex flex-col bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleChangeView(link.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
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
          <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleChangeView(link.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-sm ${
                    activeView === link.id
                      ? 'bg-white text-vella-black border-white'
                      : 'bg-[#1c1c1c]/40 text-white/60 border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                {accessToken && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {activeView === 'overview' && (
            <section className="space-y-6">
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="xbg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white">Welcome, {displayName}</h1>
                    <p className="text-white/50 mt-3 max-w-2xl">
                      {chatbots.length === 0
                        ? 'Get started by creating your first AI employee to handle customer support.'
                        : `${chatbots.length} chatbot${chatbots.length !== 1 ? 's' : ''} — ${activeChatbots} active and handling conversations.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartNewChatbot}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-vella-black bg-vella-white rounded-full transition-all hover:scale-105 active:scale-95 self-start disabled:opacity-60"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    New Chatbot
                  </button>
                </div>
              </motion.div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <Bot className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white">{chatbots.length}</p>
                      <p className="text-xs text-white/45">Chatbot{chatbots.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {chatbots.length > 0 && (
                    <p className="mt-3 text-xs text-white/35">
                      {activeChatbots} active · {chatbots.length - activeChatbots} draft{chatbots.length - activeChatbots !== 1 ? 's' : ''}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <MessageSquare className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white">0</p>
                      <p className="text-xs text-white/45">Conversations</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/35">Widget chat history opens later</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <FileText className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white">0</p>
                      <p className="text-xs text-white/45">Knowledge Sources</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/35">Upload documents to train chatbots</p>
                </motion.div>
              </div>

              {/* Getting Started Checklist */}
              {chatbots.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <h2 className="text-sm font-medium text-white/70">Getting Started</h2>
                    <span className="text-xs text-white/40">0 of 3 complete</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
                    <div className="bg-white/20 h-1.5 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 mt-0.5">
                        <span className="text-xs text-white/40">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">Create your first chatbot</p>
                        <p className="text-xs text-white/40 mt-1">Set up an AI employee with your business details and tone.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 mt-0.5">
                        <span className="text-xs text-white/40">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">Add knowledge sources</p>
                        <p className="text-xs text-white/40 mt-1">Upload documents or add Q&A pairs so your chatbot knows your business.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 mt-0.5">
                        <span className="text-xs text-white/40">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">Activate & publish</p>
                        <p className="text-xs text-white/40 mt-1">Set status to active, add your domain, and install the widget.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chatbots List */}
              {chatbots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <h2 className="text-sm font-medium text-white/70">Your Chatbots</h2>
                    <button
                      type="button"
                      onClick={handleStartNewChatbot}
                      className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New
                    </button>
                  </div>
                  <div className="space-y-2">
                    {chatbots.map((chatbot) => (
                      <button
                        key={chatbot.id}
                        type="button"
                        onClick={() => handleSelectChatbot(chatbot)}
                        className="w-full text-left rounded-xl bg-[#101010] p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          <Bot className="w-5 h-5 text-white/55" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-white truncate">{chatbot.name}</p>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusClass(chatbot.status)}`}>
                              {chatbot.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mt-1 truncate">{chatbot.business_name}</p>
                        </div>
                        <p className="text-xs text-white/30 shrink-0 hidden sm:block">Updated {shortDate(chatbot.updated_at)}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </section>
          )}

          {activeView === 'chatbots' && (
            <section className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div>
                    <p className="text-sm text-white/40">Chatbots</p>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">Manage AI employees</h1>
                    <p className="text-white/50 mt-3 max-w-2xl">
                      Select a chatbot to configure settings and manual Q&A, or create a new one when you are ready.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartNewChatbot}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-vella-black bg-vella-white rounded-full transition-all hover:scale-105 active:scale-95 self-start disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" />
                    New Chatbot
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-8">
                  {chatbots.map((chatbot) => (
                    <button
                      key={chatbot.id}
                      type="button"
                      onClick={() => handleSelectChatbot(chatbot)}
                      className={`text-left rounded-2xl border p-4 transition-colors ${
                        chatbot.id === selectedChatbotId && isChatbotEditorOpen
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/10 bg-black/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{chatbot.name}</p>
                          <p className="text-xs text-white/40 mt-1">{chatbot.business_name}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-full border capitalize ${statusClass(chatbot.status)}`}>
                          {chatbot.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 mt-3">Updated {shortDate(chatbot.updated_at)}</p>
                    </button>
                  ))}

                  {chatbots.length === 0 && !isLoading && (
                    <div className="md:col-span-2 xl:col-span-3 min-h-[220px] rounded-2xl border border-dashed border-white/10 bg-black/20 flex flex-col items-center justify-center text-center px-6">
                      <Bot className="w-9 h-9 text-white/25" />
                      <h3 className="text-lg font-medium text-white/75 mt-4">No chatbot yet</h3>
                      <p className="text-sm text-white/40 mt-2 max-w-md">Click New Chatbot to open the setup section.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {!isChatbotEditorOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="min-h-[260px] rounded-3xl border border-dashed border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                >
                  <Settings className="w-10 h-10 text-white/25" />
                  <h2 className="text-xl font-semibold text-white/75 mt-4">Nothing open</h2>
                  <p className="text-sm text-white/40 mt-2 max-w-md">Select a chatbot to configure it, or use New Chatbot to reveal the creation form.</p>
                </motion.div>
              ) : (
                <section>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/40">{isCreatingChatbot ? 'Create chatbot' : 'Chatbot settings'}</p>
                        <h2 className="text-2xl font-semibold text-white mt-1">
                          {isCreatingChatbot ? 'Business setup' : selectedChatbot?.name}
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleCloseChatbotEditor}
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white/70 rounded-xl hover:bg-white/5"
                        >
                          Close
                        </button>
                        {selectedChatbot && (
                          <button
                            type="button"
                            onClick={handleDeleteChatbot}
                            disabled={isSavingChatbot}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-100 border border-red-400/20 bg-red-500/10 rounded-xl hover:bg-red-500/20 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {chatbotError && (
                      <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{chatbotError}</p>
                      </div>
                    )}

                    {/* Tab Bar */}
                    <div className="mt-6 flex gap-1 p-1 bg-white/5 rounded-xl">
                      {editorTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setEditorTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              editorTab === tab.id
                                ? 'bg-vella-white text-vella-black'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Tab Content */}
                  <div className="mt-6">
                    {editorTab === 'settings' && (
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
                      >
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveChatbot}>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Chatbot name</span>
                            <input
                              value={chatbotForm.name}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, name: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                              placeholder="Support Assistant"
                            />
                          </label>
                          <div className="block md:col-span-2">
                            <span className="text-xs font-medium text-white/45">Chatbot logo</span>
                            <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 sm:flex-row sm:items-center">
                              <div
                                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                style={{ backgroundColor: colorInputValue(chatbotForm.brand_color) }}
                              >
                                {logoPreviewUrl ? (
                                  <img src={logoPreviewUrl} alt="Chatbot logo preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : null}
                                {!logoPreviewUrl && <Bot className="h-5 w-5 text-white" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white/75">{chatbotForm.logo_url ? 'Custom logo uploaded' : 'Use your business logo in the widget header.'}</p>
                                <p className="mt-1 text-xs text-white/40">PNG, JPEG, WebP, or GIF · maximum 2 MB</p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-vella-black transition-colors hover:bg-gray-200 ${(!selectedChatbot || isUploadingLogo) ? 'pointer-events-none opacity-50' : ''}`}>
                                  {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                                  {chatbotForm.logo_url ? 'Replace' : 'Upload logo'}
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    onChange={handleLogoUpload}
                                    disabled={!selectedChatbot || isUploadingLogo}
                                    className="sr-only"
                                  />
                                </label>
                                {chatbotForm.logo_url && (
                                  <button
                                    type="button"
                                    onClick={handleDeleteLogo}
                                    disabled={isUploadingLogo}
                                    className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                            {!selectedChatbot && <p className="mt-2 text-xs text-white/35">Save this chatbot before uploading its logo.</p>}
                          </div>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Business name</span>
                            <input
                              value={chatbotForm.business_name}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, business_name: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                              placeholder="Acme Stores"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Industry</span>
                            <input
                              value={chatbotForm.industry}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, industry: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                              placeholder="Ecommerce, healthcare, education"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Website domain</span>
                            <input
                              value={chatbotForm.website_domain}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, website_domain: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                              placeholder="example.com"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Tone</span>
                            <select
                              value={chatbotForm.tone}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, tone: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                            >
                              <option value="friendly">Friendly</option>
                              <option value="professional">Professional</option>
                              <option value="concise">Concise</option>
                              <option value="warm">Warm</option>
                              <option value="luxury">Luxury</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Status</span>
                            <select
                              value={chatbotForm.status}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, status: event.target.value as Chatbot['status'] }))}
                              disabled={isSavingChatbot || isCreatingChatbot}
                              className={inputClass}
                            >
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="archived">Archived</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Brand color</span>
                            <div className="mt-2 flex gap-3">
                              <input
                                type="color"
                                value={colorInputValue(chatbotForm.brand_color)}
                                onChange={(event) => setChatbotForm((form) => ({ ...form, brand_color: event.target.value }))}
                                disabled={isSavingChatbot}
                                className="h-[46px] w-14 rounded-xl bg-[#101010] p-1 disabled:opacity-50"
                              />
                              <input
                                value={chatbotForm.brand_color}
                                onChange={(event) => setChatbotForm((form) => ({ ...form, brand_color: event.target.value }))}
                                disabled={isSavingChatbot}
                                className={inputClass.replace('mt-2 ', '')}
                                placeholder="#111111"
                              />
                            </div>
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Handoff email</span>
                            <input
                              value={chatbotForm.handoff_email}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, handoff_email: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={inputClass}
                              placeholder="support@example.com"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-medium text-white/45">Support goal</span>
                            <textarea
                              value={chatbotForm.support_goal}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, support_goal: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={textareaClass}
                              placeholder="Help customers choose products, answer delivery questions, and collect leads when support is offline."
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-medium text-white/45">Greeting message</span>
                            <textarea
                              value={chatbotForm.greeting_message}
                              onChange={(event) => setChatbotForm((form) => ({ ...form, greeting_message: event.target.value }))}
                              disabled={isSavingChatbot}
                              className={textareaClass}
                              placeholder="Hi! How can I help you today?"
                            />
                          </label>
                          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-white/45">
                              {selectedChatbot ? `Created ${shortDate(selectedChatbot.created_at)}` : 'This will create a draft chatbot.'}
                            </div>
                            <button
                              type="submit"
                              disabled={isSavingChatbot || isLoading}
                              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                            >
                              {isSavingChatbot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              {isCreatingChatbot ? 'Create Chatbot' : 'Save Settings'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {editorTab === 'knowledge' && !isCreatingChatbot && selectedChatbot && (
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-white/40">Knowledge upload</p>
                            <h2 className="text-xl font-semibold text-white mt-1">Documents</h2>
                          </div>
                          <button
                            type="button"
                            onClick={refreshKnowledgeDocuments}
                            disabled={isLoadingKnowledge}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
                            aria-label="Refresh documents"
                            title="Refresh documents"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingKnowledge ? 'animate-spin' : ''}`} />
                          </button>
                        </div>

                        {knowledgeError && (
                          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{knowledgeError}</p>
                          </div>
                        )}

                        <form 
                          className={`mt-6 rounded-2xl border p-4 transition-all duration-300 ${
                            isDragging 
                              ? 'border-vella-white/50 bg-vella-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)]' 
                              : 'border-white/10 bg-black/20'
                          }`}
                          onSubmit={handleUploadKnowledge}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          {!knowledgeFile && !uploadProgress ? (
                            <label className="block cursor-pointer">
                              <span className="text-xs font-medium text-white/45">Upload PDF, DOCX, or TXT</span>
                              <div className={`mt-2 w-full rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
                                isDragging 
                                  ? 'border-vella-white/50 bg-vella-white/5' 
                                  : 'border-white/10 bg-[#101010] hover:border-white/20'
                              }`}>
                                <UploadCloud className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragging ? 'text-vella-white' : 'text-white/40'}`} />
                                <p className="text-sm text-white/55">
                                  {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-xs text-white/35 mt-1">PDF, DOCX, or TXT up to 10MB</p>
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  onChange={(event) => setKnowledgeFile(event.target.files?.[0] ?? null)}
                                  disabled={isSavingKnowledge}
                                  className="hidden"
                                />
                              </div>
                            </label>
                          ) : knowledgeFile ? (
                            <div className="rounded-xl bg-[#101010] p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-white/55 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white truncate">{knowledgeFile.name}</p>
                                  <p className="text-xs text-white/40">{(knowledgeFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setKnowledgeFile(null)}
                                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {uploadProgress !== null && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-white/55 mb-2">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div 
                                  className="bg-vella-white h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isSavingKnowledge || !knowledgeFile}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                          >
                            {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Upload File
                          </button>
                        </form>

                        <form className="mt-4 rounded-2xl bg-black/20 p-4" onSubmit={handleCreateTextKnowledge}>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Text source name</span>
                            <input
                              value={knowledgeTextForm.name}
                              onChange={(event) => setKnowledgeTextForm((form) => ({ ...form, name: event.target.value }))}
                              disabled={isSavingKnowledge}
                              className={inputClass}
                              placeholder="Shipping policy"
                            />
                          </label>
                          <label className="mt-3 block">
                            <span className="text-xs font-medium text-white/45">Knowledge text</span>
                            <textarea
                              value={knowledgeTextForm.content}
                              onChange={(event) => setKnowledgeTextForm((form) => ({ ...form, content: event.target.value }))}
                              disabled={isSavingKnowledge}
                              className={`${textareaClass} min-h-[130px]`}
                              placeholder="Paste policy details, product notes, onboarding steps, or any business answer source."
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={isSavingKnowledge}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-60"
                          >
                            {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Add Text Source
                          </button>
                        </form>

                        <div className="mt-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">Sources</p>
                            {isLoadingKnowledge && <Loader2 className="w-4 h-4 text-white/45 animate-spin" />}
                          </div>

                          <div className="mt-3 space-y-3">
                            {knowledgeDocuments.map((document) => (
                              <div key={document.id} className="rounded-2xl bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                                      {document.mime_type?.includes('pdf') ? (
                                        <FileText className="w-4 h-4 text-red-400" />
                                      ) : document.mime_type?.includes('wordprocessingml') || document.mime_type?.includes('docx') ? (
                                        <FileText className="w-4 h-4 text-blue-400" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-white/55" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-white">{document.name}</p>
                                      <p className="mt-1 text-xs text-white/35">
                                        {document.source_type === 'text' ? 'Text source' : document.mime_type ?? 'Upload'} - {formatFileSize(document.file_size)} - {shortDate(document.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`shrink-0 text-[11px] px-2 py-1 rounded-full border capitalize ${knowledgeStatusClass(document.status)}`}>
                                    {document.status}
                                  </span>
                                </div>

                                {document.error_message && (
                                  <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                                    {document.error_message}
                                  </p>
                                )}

                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleReprocessKnowledge(document)}
                                    disabled={isSavingKnowledge || document.status === 'processing'}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-50"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Reprocess
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteKnowledge(document)}
                                    disabled={isSavingKnowledge}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/20 text-xs text-red-100/80 hover:bg-red-500/10 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}

                            {knowledgeDocuments.length === 0 && !isLoadingKnowledge && (
                              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                                <FileText className="w-8 h-8 text-white/25 mx-auto" />
                                <p className="text-sm text-white/55 mt-3">No documents yet</p>
                                <p className="text-xs text-white/35 mt-1">Upload or paste a source to train this chatbot.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {editorTab === 'publish' && !isCreatingChatbot && selectedChatbot && (
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-white/40">Preview</p>
                            <h2 className="text-xl font-semibold text-white mt-1">Widget install</h2>
                          </div>
                          <button
                            type="button"
                            onClick={copyWidgetSnippet}
                            disabled={!widgetSnippet}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedSnippet ? 'Copied' : 'Copy snippet'}
                          </button>
                        </div>

                        <div className="mt-6 rounded-2xl bg-[#101010] p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full"
                              style={{ backgroundColor: colorInputValue(chatbotForm.brand_color) }}
                            >
                              {logoPreviewUrl ? (
                                <img src={logoPreviewUrl} alt={`${chatbotForm.business_name || 'Chatbot'} logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              ) : null}
                              {!logoPreviewUrl && <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{chatbotForm.name || 'Support Assistant'}</p>
                              <p className="text-xs text-white/35">{chatbotForm.tone || 'friendly'} tone</p>
                            </div>
                          </div>
                          <p className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/65">
                            {chatbotForm.greeting_message || 'Hi! How can I help you today?'}
                          </p>
                        </div>

                        <div className="mt-4 rounded-2xl bg-black/20 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">Embed code</p>
                          {widgetSnippet ? (
                            <pre className="mt-3 overflow-x-auto rounded-xl bg-black/40 p-4 text-[11px] leading-relaxed text-white/70">{widgetSnippet}</pre>
                          ) : (
                            <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                              Set a website domain and mark this chatbot active to generate the install snippet.
                            </div>
                          )}
                          <p className="mt-3 text-xs leading-relaxed text-white/35">
                            The backend only serves active widgets from their configured website domain.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {(editorTab === 'knowledge' || editorTab === 'publish') && isCreatingChatbot && (
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl text-center"
                      >
                        <Settings className="w-10 h-10 text-white/25 mx-auto" />
                        <h2 className="text-xl font-semibold text-white/75 mt-4">Save your chatbot first</h2>
                        <p className="text-sm text-white/40 mt-2 max-w-md mx-auto">
                          Create the chatbot to access {editorTab === 'knowledge' ? 'Knowledge' : 'Publish'} features.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </section>
              )}
            </section>
          )}

          {(activeView === 'analytics' || activeView === 'leads') && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-[520px] bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center"
            >
              {activeView === 'analytics' ? <BarChart2 className="w-12 h-12 text-white/25" /> : <Users className="w-12 h-12 text-white/25" />}
              <h1 className="text-2xl font-semibold text-white mt-5">{pageTitle}</h1>
              <p className="text-sm text-white/45 mt-2 max-w-md">
                This page will populate when widget conversations and lead capture are wired into the backend.
              </p>
            </motion.section>
          )}
        </main>
      </div>
    </div>
  );
}

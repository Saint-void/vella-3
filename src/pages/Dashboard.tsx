import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BarChart2,
  Bot,
  CheckCircle2,
  Copy,
  FileText,
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
  ChatbotFAQ,
  ChatbotFAQPayload,
  ChatbotPayload,
  createChatbot,
  createChatbotFaq,
  deleteChatbot,
  deleteChatbotFaq,
  listChatbotFaqs,
  listChatbots,
  updateChatbot,
  updateChatbotFaq,
} from '../lib/chatbots';
import { clearAuthSession, getAccessToken, getAuthEmail } from '../lib/authSession';
import {
  KnowledgeDocument,
  createTextKnowledgeDocument,
  deleteKnowledgeDocument,
  listKnowledgeDocuments,
  reprocessKnowledgeDocument,
  uploadKnowledgeDocument,
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

const sidebarLinks: Array<{ id: DashboardView; icon: typeof LayoutDashboard; label: string }> = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'chatbots', icon: MessageSquare, label: 'Chatbots' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'leads', icon: Users, label: 'Leads' },
];

const inputClass =
  'mt-2 w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50';
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

const emptyFaqForm: ChatbotFAQPayload = {
  question: '',
  answer: '',
  is_enabled: true,
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

function colorInputValue(color: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#111111';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [isChatbotEditorOpen, setIsChatbotEditorOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [chatbotForm, setChatbotForm] = useState<ChatbotForm>(emptyChatbotForm);
  const [faqs, setFaqs] = useState<ChatbotFAQ[]>([]);
  const [faqForm, setFaqForm] = useState<ChatbotFAQPayload>(emptyFaqForm);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqForm, setEditingFaqForm] = useState<ChatbotFAQPayload>(emptyFaqForm);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [knowledgeTextForm, setKnowledgeTextForm] = useState<KnowledgeTextForm>(emptyKnowledgeTextForm);
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingChatbot, setIsSavingChatbot] = useState(false);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatbotError, setChatbotError] = useState<string | null>(null);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);

  const selectedChatbot = chatbots.find((chatbot) => chatbot.id === selectedChatbotId) ?? null;
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

    async function loadFaqs() {
      if (!accessToken || !selectedChatbotId || !isChatbotEditorOpen) {
        setFaqs([]);
        return;
      }

      setIsLoadingFaqs(true);
      setFaqError(null);

      try {
        const rows = await listChatbotFaqs(accessToken, selectedChatbotId);
        if (isMounted) setFaqs(rows);
      } catch (err) {
        if (isMounted) setFaqError(err instanceof Error ? err.message : 'Could not load Q&A pairs.');
      } finally {
        if (isMounted) setIsLoadingFaqs(false);
      }
    }

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, [accessToken, selectedChatbotId, isChatbotEditorOpen]);

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
    setFaqError(null);
  };

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setActiveView('chatbots');
    setSelectedChatbotId(chatbot.id);
    setChatbotForm(chatbotToForm(chatbot));
    setIsChatbotEditorOpen(true);
    setChatbotError(null);
    setFaqError(null);
    setKnowledgeError(null);
    setEditingFaqId(null);
    setKnowledgeTextForm(emptyKnowledgeTextForm);
    setKnowledgeFile(null);
  };

  const handleStartNewChatbot = () => {
    setActiveView('chatbots');
    setSelectedChatbotId(null);
    setChatbotForm(emptyChatbotForm);
    setFaqs([]);
    setKnowledgeDocuments([]);
    setIsChatbotEditorOpen(true);
    setChatbotError(null);
    setFaqError(null);
    setKnowledgeError(null);
    setEditingFaqId(null);
    setKnowledgeTextForm(emptyKnowledgeTextForm);
    setKnowledgeFile(null);
  };

  const handleCloseChatbotEditor = () => {
    setIsChatbotEditorOpen(false);
    setChatbotError(null);
    setFaqError(null);
    setKnowledgeError(null);
    setEditingFaqId(null);
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
    if (!window.confirm(`Delete ${selectedChatbot.name}? This removes its manual Q&A too.`)) return;

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
        setFaqs([]);
        setKnowledgeDocuments([]);
        setIsChatbotEditorOpen(false);
      }
    } catch (err) {
      setChatbotError(err instanceof Error ? err.message : 'Could not delete chatbot.');
    } finally {
      setIsSavingChatbot(false);
    }
  };

  const handleCreateFaq = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !selectedChatbot) return;

    const payload = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      is_enabled: faqForm.is_enabled,
    };

    if (!payload.question || !payload.answer) {
      setFaqError('Question and answer are required.');
      return;
    }

    setIsSavingFaq(true);
    setFaqError(null);

    try {
      const created = await createChatbotFaq(accessToken, selectedChatbot.id, payload);
      setFaqs((current) => [created, ...current]);
      setFaqForm(emptyFaqForm);
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'Could not add Q&A.');
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleStartEditFaq = (faq: ChatbotFAQ) => {
    setEditingFaqId(faq.id);
    setEditingFaqForm({
      question: faq.question,
      answer: faq.answer,
      is_enabled: faq.is_enabled,
    });
  };

  const handleSaveFaqEdit = async (faqId: string) => {
    if (!accessToken || !selectedChatbot) return;

    const payload = {
      question: editingFaqForm.question.trim(),
      answer: editingFaqForm.answer.trim(),
      is_enabled: editingFaqForm.is_enabled,
    };

    if (!payload.question || !payload.answer) {
      setFaqError('Question and answer are required.');
      return;
    }

    setIsSavingFaq(true);
    setFaqError(null);

    try {
      const updated = await updateChatbotFaq(accessToken, selectedChatbot.id, faqId, payload);
      setFaqs((current) => current.map((faq) => (faq.id === updated.id ? updated : faq)));
      setEditingFaqId(null);
      setEditingFaqForm(emptyFaqForm);
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'Could not update Q&A.');
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleToggleFaq = async (faq: ChatbotFAQ) => {
    if (!accessToken || !selectedChatbot) return;

    try {
      const updated = await updateChatbotFaq(accessToken, selectedChatbot.id, faq.id, {
        is_enabled: !faq.is_enabled,
      });
      setFaqs((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'Could not update Q&A.');
    }
  };

  const handleDeleteFaq = async (faq: ChatbotFAQ) => {
    if (!accessToken || !selectedChatbot) return;

    try {
      await deleteChatbotFaq(accessToken, selectedChatbot.id, faq.id);
      setFaqs((current) => current.filter((row) => row.id !== faq.id));
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'Could not delete Q&A.');
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

    try {
      const created = await uploadKnowledgeDocument(accessToken, selectedChatbot.id, knowledgeFile);
      setKnowledgeDocuments((current) => [created, ...current]);
      setKnowledgeFile(null);
      event.currentTarget.reset();
      window.setTimeout(() => {
        void refreshKnowledgeDocuments();
      }, 1500);
    } catch (err) {
      setKnowledgeError(err instanceof Error ? err.message : 'Could not upload knowledge file.');
    } finally {
      setIsSavingKnowledge(false);
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

  const overviewStats = [
    { label: 'Chatbots', value: String(chatbots.length), detail: chatbots.length === 1 ? 'One AI employee created' : 'AI employees created' },
    { label: 'Conversations', value: '0', detail: 'Widget chat history opens later' },
    { label: 'Manual Q&A', value: '0', detail: 'Open a chatbot to manage answers' },
  ];

  const activeChatbots = chatbots.filter((chatbot) => chatbot.status === 'active').length;
  const pageTitle = activeView === 'overview' ? 'Overview' : sidebarLinks.find((link) => link.id === activeView)?.label ?? 'Dashboard';

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
          <img src="/logo.png" alt="Vella Logo" className="h-10 w-auto object-contain brightness-0 invert" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
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
            <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div>
                    <p className="text-sm text-white/40">{pageTitle}</p>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">Welcome, {displayName}</h1>
                    <p className="text-white/50 mt-3 max-w-2xl">
                      See what exists, what is ready, and where to continue setting up Vella for your business.
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
                  {overviewStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-sm text-white/45">{stat.label}</p>
                      <p className="text-3xl font-semibold text-white mt-2 capitalize">{stat.value}</p>
                      <p className="text-xs text-white/35 mt-3">{stat.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/40">Created chatbots</p>
                      <h2 className="text-xl font-semibold text-white mt-1">Current workspace</h2>
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50">
                      {activeChatbots} active
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chatbots.slice(0, 4).map((chatbot) => (
                      <button
                        key={chatbot.id}
                        type="button"
                        onClick={() => handleSelectChatbot(chatbot)}
                        className="text-left rounded-2xl border border-white/10 bg-[#101010] p-4 hover:bg-white/5 transition-colors"
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
                      <div className="md:col-span-2 min-h-[220px] rounded-2xl border border-dashed border-white/10 bg-[#101010] flex flex-col items-center justify-center text-center px-6">
                        <Bot className="w-9 h-9 text-white/25" />
                        <h3 className="text-lg font-medium text-white/75 mt-4">No chatbot yet</h3>
                        <p className="text-sm text-white/40 mt-2 max-w-md">Create the first support agent from the button above.</p>
                      </div>
                    )}
                  </div>
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
                    <h2 className="text-xl font-semibold text-white mt-1">Account</h2>
                  </div>
                  {isLoading && <Loader2 className="w-5 h-5 text-white/50 animate-spin" />}
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
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

                  <button
                    type="submit"
                    disabled={isLoading || isSavingProfile}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile
                  </button>
                </form>
              </motion.aside>
            </section>
          )}

          {activeView === 'chatbots' && (
            <section className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl"
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
                <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
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
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-xl hover:bg-white/5"
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

                    <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveChatbot}>
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
                            className="h-[46px] w-14 rounded-xl bg-[#101010] border border-white/10 p-1 disabled:opacity-50"
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
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/45">
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

                  <motion.aside
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/40">Preview</p>
                        <h2 className="text-xl font-semibold text-white mt-1">Widget install</h2>
                      </div>
                      {selectedChatbot && (
                        <button
                          type="button"
                          onClick={copyWidgetSnippet}
                          disabled={!widgetSnippet}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedSnippet ? 'Copied' : 'Copy snippet'}
                        </button>
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
                          style={{ backgroundColor: colorInputValue(chatbotForm.brand_color) }}
                        >
                          <Bot className="w-4 h-4 text-white" />
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

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">Embed code</p>
                      {widgetSnippet ? (
                        <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-[11px] leading-relaxed text-white/70">{widgetSnippet}</pre>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                          {selectedChatbot
                            ? 'Set a website domain and mark this chatbot active to generate the install snippet.'
                            : 'Save a chatbot to generate its install snippet.'}
                        </div>
                      )}
                      <p className="mt-3 text-xs leading-relaxed text-white/35">
                        The backend only serves active widgets from their configured website domain.
                      </p>
                    </div>
                  </motion.aside>

                  {!isCreatingChatbot && selectedChatbot && (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                      className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6"
                    >
                      <div className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <p className="text-sm text-white/40">Manual knowledge</p>
                            <h2 className="text-2xl font-semibold text-white mt-1">Questions and answers</h2>
                            <p className="text-sm text-white/45 mt-2 max-w-2xl">
                              Add answers this chatbot should know before document training opens up.
                            </p>
                          </div>
                          {isLoadingFaqs && <Loader2 className="w-5 h-5 text-white/50 animate-spin" />}
                        </div>

                        {faqError && (
                          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{faqError}</p>
                          </div>
                        )}

                        <form className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end" onSubmit={handleCreateFaq}>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Question</span>
                            <textarea
                              value={faqForm.question}
                              onChange={(event) => setFaqForm((form) => ({ ...form, question: event.target.value }))}
                              disabled={isSavingFaq}
                              className={`${textareaClass} min-h-[88px]`}
                              placeholder="What are your delivery options?"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Answer</span>
                            <textarea
                              value={faqForm.answer}
                              onChange={(event) => setFaqForm((form) => ({ ...form, answer: event.target.value }))}
                              disabled={isSavingFaq}
                              className={`${textareaClass} min-h-[88px]`}
                              placeholder="We deliver nationwide within 2-5 business days."
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={isSavingFaq}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                          >
                            {isSavingFaq ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add
                          </button>
                        </form>

                        <div className="mt-6 space-y-3">
                          {faqs.map((faq) => (
                            <div key={faq.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              {editingFaqId === faq.id ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  <textarea
                                    value={editingFaqForm.question}
                                    onChange={(event) => setEditingFaqForm((form) => ({ ...form, question: event.target.value }))}
                                    className={`${textareaClass} min-h-[84px]`}
                                  />
                                  <textarea
                                    value={editingFaqForm.answer}
                                    onChange={(event) => setEditingFaqForm((form) => ({ ...form, answer: event.target.value }))}
                                    className={`${textareaClass} min-h-[84px]`}
                                  />
                                  <div className="lg:col-span-2 flex flex-wrap gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setEditingFaqId(null)}
                                      className="px-4 py-2 text-sm font-medium text-white/70 border border-white/10 rounded-xl hover:bg-white/5"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveFaqEdit(faq.id)}
                                      disabled={isSavingFaq}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 disabled:opacity-60"
                                    >
                                      <Save className="w-4 h-4" />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-white">{faq.question}</p>
                                      <p className="text-sm text-white/50 mt-2">{faq.answer}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFaq(faq)}
                                      className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
                                        faq.is_enabled
                                          ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                                          : 'border-white/10 bg-white/5 text-white/40'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      {faq.is_enabled ? 'Enabled' : 'Off'}
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 text-xs text-white/35">
                                    <span>Updated {shortDate(faq.updated_at)}</span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditFaq(faq)}
                                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteFaq(faq)}
                                        className="px-3 py-1.5 rounded-lg border border-red-400/20 text-red-100/80 hover:bg-red-500/10"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {faqs.length === 0 && !isLoadingFaqs && (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                              <MessageSquare className="w-8 h-8 text-white/25 mx-auto" />
                              <p className="text-sm text-white/55 mt-3">No Q&A pairs yet</p>
                              <p className="text-xs text-white/35 mt-1">Seed common answers before training from documents.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <aside className="border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-white/40">Knowledge upload</p>
                            <h2 className="text-xl font-semibold text-white mt-1">Documents</h2>
                          </div>
                          <button
                            type="button"
                            onClick={refreshKnowledgeDocuments}
                            disabled={isLoadingKnowledge}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
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

                        <form className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4" onSubmit={handleUploadKnowledge}>
                          <label className="block">
                            <span className="text-xs font-medium text-white/45">Upload PDF, DOCX, or TXT</span>
                            <input
                              type="file"
                              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(event) => setKnowledgeFile(event.target.files?.[0] ?? null)}
                              disabled={isSavingKnowledge}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-white/15 disabled:opacity-50"
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={isSavingKnowledge || !knowledgeFile}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-vella-black bg-vella-white rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                          >
                            {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Upload File
                          </button>
                        </form>

                        <form className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4" onSubmit={handleCreateTextKnowledge}>
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
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-60"
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
                              <div key={document.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                      <FileText className="w-4 h-4 text-white/55" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-white">{document.name}</p>
                                      <p className="mt-1 text-xs text-white/35">
                                        {document.source_type === 'text' ? 'Text source' : document.mime_type ?? 'Upload'} - {document.chunk_count} chunks - {shortDate(document.created_at)}
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-50"
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
                      </aside>
                    </motion.div>
                  )}
                </section>
              )}
            </section>
          )}

          {(activeView === 'analytics' || activeView === 'leads') && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-[520px] border border-white/10 bg-[#1c1c1c]/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center"
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

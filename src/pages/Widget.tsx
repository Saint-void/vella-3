import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, CheckCircle2, ChevronDown, Loader2, MessageCircle, Send, Sparkles, RotateCw } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  createWidgetConversation,
  getWidgetConfig,
  getWidgetConversation,
  sendWidgetMessage,
  type WidgetConfig,
  type WidgetConversation,
  type WidgetMessage,
} from '../lib/widget';

type ResizeState = {
  width: number;
  height: number;
};

const CLOSED_SIZE: ResizeState = { width: 64, height: 64 };
const OPEN_SIZE: ResizeState = { width: 420, height: 640 };

function formatWidgetMessage(message: WidgetMessage) {
  return {
    ...message,
    created_at: message.created_at,
  };
}

function storageKey(chatbotId: string, siteOrigin: string) {
  return `vella-widget:${chatbotId}:${siteOrigin}`;
}

function visitorKey(chatbotId: string, siteOrigin: string) {
  return `vella-widget-visitor:${chatbotId}:${siteOrigin}`;
}

function fallbackGreeting(config: WidgetConfig) {
  return {
    id: `greeting-${config.chatbot_id}`,
    role: 'assistant' as const,
    content: config.greeting_message,
    matched_faq_id: null,
    created_at: new Date().toISOString(),
  };
}

function createVisitorId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isFatalWidgetError(message: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('chatbot not found') ||
    lower.includes('not allowed on that domain') ||
    lower.includes('not allowed on this domain') ||
    lower.includes('domain not allowed') ||
    lower.includes('chatbot not allowed') ||
    lower.includes('forbidden') && lower.includes('domain')
  );
}

function resolveSiteOrigin(queryOrigin: string | null) {
  try {
    if (document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch {
    // Fall through to query/window origin.
  }

  return queryOrigin?.trim() || window.location.origin;
}

export function Widget() {
  const { chatbotId } = useParams();
  const [searchParams] = useSearchParams();
  const siteOrigin = resolveSiteOrigin(searchParams.get('site_origin'));

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFatalError, setIsFatalError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ensureVisitorId = () => {
    if (visitorId) return visitorId;

    if (!chatbotId) {
      throw new Error('Missing chatbot id.');
    }

    const storedVisitorId = window.localStorage.getItem(visitorKey(chatbotId, siteOrigin));
    const nextVisitorId = storedVisitorId || createVisitorId();
    window.localStorage.setItem(visitorKey(chatbotId, siteOrigin), nextVisitorId);
    setVisitorId(nextVisitorId);
    return nextVisitorId;
  };

  const createConversation = async (currentVisitorId: string) => {
    if (!chatbotId) {
      throw new Error('Missing chatbot id.');
    }

    const conversation = await createWidgetConversation(chatbotId, {
      site_origin: siteOrigin,
      visitor_id: currentVisitorId,
    });

    window.localStorage.setItem(storageKey(chatbotId, siteOrigin), conversation.id);
    setConversationId(conversation.id);
    setMessages((current) => {
      if (current.length > 0) return current;
      if (conversation.messages.length > 0) return conversation.messages.map(formatWidgetMessage);
      return config ? [fallbackGreeting(config)] : [];
    });

    return conversation.id;
  };

  const panelSize = useMemo(
    () => ({
      width: isFatalError ? CLOSED_SIZE.width : isOpen ? OPEN_SIZE.width : CLOSED_SIZE.width,
      height: isFatalError ? CLOSED_SIZE.height : isOpen ? OPEN_SIZE.height : CLOSED_SIZE.height,
    }),
    [isFatalError, isOpen],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'vella-widget-resize',
        chatbotId,
        width: panelSize.width,
        height: panelSize.height,
      },
      '*',
    );
  }, [chatbotId, panelSize.height, panelSize.width]);

  useEffect(() => {
    let isMounted = true;

    async function bootWidget() {
      if (!chatbotId) {
        setError('Missing chatbot id.');
        setIsBooting(false);
        return;
      }

      try {
        setIsBooting(true);
        const widgetConfig = await getWidgetConfig(chatbotId, siteOrigin);
        if (!isMounted) return;

        setConfig(widgetConfig);

        const storedVisitorId = window.localStorage.getItem(visitorKey(chatbotId, siteOrigin));
        const nextVisitorId = storedVisitorId || createVisitorId();
        window.localStorage.setItem(visitorKey(chatbotId, siteOrigin), nextVisitorId);
        if (!isMounted) return;
        setVisitorId(nextVisitorId);

        const savedConversationId = window.localStorage.getItem(storageKey(chatbotId, siteOrigin));
        let conversation: WidgetConversation | null = null;

        if (savedConversationId) {
          try {
            conversation = await getWidgetConversation(chatbotId, savedConversationId, siteOrigin, nextVisitorId);
          } catch {
            window.localStorage.removeItem(storageKey(chatbotId, siteOrigin));
          }
        }

        if (!conversation) {
          conversation = await createWidgetConversation(chatbotId, {
            site_origin: siteOrigin,
            visitor_id: nextVisitorId,
          });
          window.localStorage.setItem(storageKey(chatbotId, siteOrigin), conversation.id);
        }

        if (!isMounted) return;

        setConversationId(conversation.id);
        setMessages(
          conversation.messages.length > 0
            ? conversation.messages.map(formatWidgetMessage)
            : [fallbackGreeting(widgetConfig)],
        );
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'We could not load this chatbot right now.';
        console.error(`[Vella Widget] ${message}`, err);
        setError(message);
        if (isFatalWidgetError(message)) {
          setIsFatalError(true);
        }
      } finally {
        if (isMounted) {
          setIsBooting(false);
        }
      }
      
    }

    void bootWidget();

    return () => {
      isMounted = false;
    };
  }, [chatbotId, siteOrigin]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!chatbotId || !input.trim() || isSending) return;

  const content = input.trim();
  setInput('');
  setIsSending(true);

  // Show the visitor's bubble immediately, before the network call
  // resolves. Temp id lets us swap it for the real persisted message
  // once the server responds, without waiting on it to render.
  const optimisticId = `optimistic-${Date.now()}`;
  const optimisticMessage: WidgetMessage = {
    id: optimisticId,
    role: 'visitor',
    content,
    matched_faq_id: null,
    created_at: new Date().toISOString(),
  };
  setMessages((current) => [...current, optimisticMessage]);

  try {
    const currentVisitorId = ensureVisitorId();
    let currentConversationId = conversationId || await createConversation(currentVisitorId);

    let response;
    try {
      response = await sendWidgetMessage(chatbotId, currentConversationId, {
        site_origin: siteOrigin,
        content,
        visitor_id: currentVisitorId,
      });
    } catch {
      window.localStorage.removeItem(storageKey(chatbotId, siteOrigin));
      currentConversationId = await createConversation(currentVisitorId);
      response = await sendWidgetMessage(chatbotId, currentConversationId, {
        site_origin: siteOrigin,
        content,
        visitor_id: currentVisitorId,
      });
    }

    // Swap the optimistic bubble for the real one (correct id/timestamp
    // from the DB) and append the assistant's reply next to it.
    setMessages((current) => [
      ...current.filter((message) => message.id !== optimisticId),
      response.visitor_message,
      response.assistant_message,
    ]);
    setError(null);
    window.localStorage.setItem(storageKey(chatbotId, siteOrigin), response.conversation_id);
  } catch (err) {
    // Send failed -- pull the optimistic bubble back out and give the
    // typed text back to the input so nothing gets lost.
    setMessages((current) => current.filter((message) => message.id !== optimisticId));
    setInput(content);
    setError(err instanceof Error ? err.message : 'Your message could not be sent.');
  } finally {
    setIsSending(false);
  }
};

  const openWidget = () => {
    setIsOpen(true);
    setError(null);
  };

  const handleStartNewChat = async () => {
    try {
      if (!chatbotId) return;
      
      // Clear everything immediately for instant feedback
      setMessages([]);
      setInput('');
      setError(null);
      
      const currentVisitorId = ensureVisitorId();
      await createConversation(currentVisitorId);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to start new chat:', err);
      setError(err instanceof Error ? err.message : 'Could not start new conversation');
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  const brandColor = config?.brand_color || '#111111';
  const assistantName = config?.name || 'Support assistant';
  const businessName = config?.business_name || 'Vella';
  const greeting = config?.greeting_message || 'Hi! How can I help you today?';

  const fatalLine = useMemo(
    () =>
      isFatalError
        ? {
            background: `linear-gradient(to bottom left, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)`,
          }
        : undefined,
    [isFatalError],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent">
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[28px]"
        style={fatalLine}
      />
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="launcher"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{
              opacity: isFatalError ? 0.35 : 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={isFatalError ? undefined : openWidget}
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[#0f0f0f] text-white shadow-2xl shadow-black/40"
            style={{
              width: CLOSED_SIZE.width,
              height: CLOSED_SIZE.height,
              boxShadow: isFatalError
                ? 'none'
                : `0 18px 50px color-mix(in srgb, ${brandColor} 32%, transparent)`,
              cursor: isFatalError ? 'default' : 'pointer',
              filter: isFatalError ? 'grayscale(1) opacity(0.35)' : undefined,
            }}
            aria-label="Open chat widget"
          >
            {isBooting ? <Loader2 className="h-5 w-5 animate-spin text-white/80" /> : <MessageCircle className="h-6 w-6" />}
          </motion.button>
        ) : (
          <motion.section
            key="panel"
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            animate={{
              opacity: isFatalError ? 0.35 : 1,
              scale: 1,
              y: 0,
              filter: isFatalError ? 'grayscale(1)' : undefined,
            }}
            exit={{ opacity: 0, scale: 0.98, y: 18 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 flex h-full w-full justify-end"
          >
            <div
              className="flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-[#0d0d0d] text-white "
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${brandColor} 12%, #111111) 0%, #0b0b0b 52%, #090909 100%)`,
              }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/10"
                    style={{ backgroundColor: brandColor }}
                  >
                    {config?.logo_url ? (
                      <img
                        src={config.logo_url}
                        alt={assistantName}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-white">{assistantName}</h2>
                      {config && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-100">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/45">{businessName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className="rounded-full bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    title="Start new conversation"
                    aria-label="Start new conversation"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeWidget}
                    className="rounded-full bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Minimize widget"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {isBooting && (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/60">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading your assistant...
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {error}
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === 'visitor'
                            ? 'rounded-br-sm bg-white text-[#111111]'
                            : 'rounded-bl-sm bg-black/25 text-white/90'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-black/25 px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
                      </div>
                    </div>
                  )}

                  {!messages.length && !isBooting && (
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70">
                      {greeting}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-white/10 bg-black/20 px-4 py-4">
                {config?.suggested_questions?.length ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {config.suggested_questions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full bg-white/5 px-3 py-2 text-left text-[11px] text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5 text-white/50" />
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-full bg-[#121212] py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                    aria-label="Send message"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

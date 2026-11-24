'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  getSupportChatThread,
  sendSupportChatMessage,
  markSupportChatRead,
} from '@/lib/api';

const QUICK_FAQS = [
  {
    id: 'audio',
    question: '🔊 Audio not playing in mock test?',
    answer:
      'In JFT-Basic & SSW Listening sections, make sure your device volume is up and tap the Play button once. Just like the real Prometric CBT exam, each question audio plays up to 2 times. If audio fails to load on slow networks, refresh the page—your answers are auto-saved!',
  },
  {
    id: 'scoring',
    question: '🏆 How does the 250-point score work?',
    answer:
      'Official JFT-Basic uses a 0–250 scaled score across 4 sections (Script & Vocab, Conversation & Expression, Listening, Reading). Scoring 200 / 250 (80%) or higher earns the CEFR-J A2 Passing Certificate required for Japan visa eligibility.',
  },
  {
    id: 'seat',
    question: '📅 Prometric seat booking & exam help?',
    answer:
      'You can check our Notices page for live Prometric BDJ01/BDJ02 Dhaka seat alerts and registration guides, or send us a message below and our support team will guide you personally.',
  },
];

function formatMessageTime(isoString) {
  if (!isoString) return '';
  try {
    const dt = new Date(isoString);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatMessageDate(isoString) {
  if (!isoString) return '';
  try {
    const dt = new Date(isoString);
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function SupportChatWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 'closed' | 'popup' | 'fullscreen'
  const [viewMode, setViewMode] = useState('closed');
  const [messages, setMessages] = useState([]);
  const [threadStatus, setThreadStatus] = useState('none');
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [activeFaqId, setActiveFaqId] = useState(null);
  const [historySearch, setHistorySearch] = useState('');

  const messagesEndRef = useRef(null);
  const hasLoadedFullHistoryRef = useRef(false);

  // Hide widget on active CBT exam screens and inside active arcade games
  const isHiddenRoute = useMemo(() => {
    if (!pathname) return false;
    if (pathname.startsWith('/test/') || pathname.startsWith('/ssw-test/')) return true;
    if (pathname.startsWith('/game-zone/') && pathname !== '/game-zone') return true;
    return false;
  }, [pathname]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 60);
  }, []);

  // Reset state on logout or user switch
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setThreadStatus('none');
      setUnreadCount(0);
      hasLoadedFullHistoryRef.current = false;
    }
  }, [isAuthenticated, user?.id]);

  // 1) Initial lightweight summary check + 60s background check when closed
  useEffect(() => {
    if (authLoading || !isAuthenticated || isHiddenRoute) return;

    let cancelled = false;

    const checkUnreadSummary = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (viewMode !== 'closed') return;
      const data = await getSupportChatThread({ summaryOnly: true });
      if (!cancelled && data) {
        setUnreadCount(Number(data.unread_count || 0));
        if (data.status) setThreadStatus(data.status);
      }
    };

    checkUnreadSummary();
    const intervalId = setInterval(checkUnreadSummary, 60000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authLoading, isAuthenticated, isHiddenRoute, viewMode]);

  // 2) Load full history when opening popup or fullscreen, and poll delta every 10s while open
  useEffect(() => {
    if (authLoading || !isAuthenticated || viewMode === 'closed' || isHiddenRoute) return;

    let cancelled = false;

    const loadInitialOrDelta = async (isInitial = false) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      if (isInitial && !hasLoadedFullHistoryRef.current) {
        setLoadingHistory(true);
      }

      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      const useDelta = hasLoadedFullHistoryRef.current && lastMsg?.id;

      const data = await getSupportChatThread({
        afterId: useDelta ? lastMsg.id : null,
        markRead: true,
      });

      if (cancelled || !data) {
        setLoadingHistory(false);
        return;
      }

      setUnreadCount(0);
      if (data.status) setThreadStatus(data.status);

      if (Array.isArray(data.messages)) {
        if (useDelta) {
          if (data.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const incoming = data.messages.filter((m) => !existingIds.has(m.id));
              return incoming.length > 0 ? [...prev, ...incoming] : prev;
            });
            scrollToBottom('smooth');
          }
        } else {
          setMessages(data.messages);
          hasLoadedFullHistoryRef.current = true;
          scrollToBottom('auto');
        }
      }
      setLoadingHistory(false);
    };

    loadInitialOrDelta(true);
    const pollId = setInterval(() => loadInitialOrDelta(false), 10000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [authLoading, isAuthenticated, viewMode, isHiddenRoute, messages, scrollToBottom]);

  const handleOpenPopup = () => {
    setViewMode('popup');
    setErrorBanner('');
    if (unreadCount > 0 && isAuthenticated) {
      setUnreadCount(0);
      markSupportChatRead();
    }
    scrollToBottom('auto');
  };

  const handleToggleFullscreen = () => {
    setViewMode((prev) => (prev === 'fullscreen' ? 'popup' : 'fullscreen'));
    setErrorBanner('');
    scrollToBottom('auto');
  };

  const handleClose = () => {
    setViewMode('closed');
    setErrorBanner('');
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    if (trimmed.length > 1000) {
      setErrorBanner('Message is too long (max 1,000 characters).');
      return;
    }

    setSending(true);
    setErrorBanner('');

    try {
      const res = await sendSupportChatMessage(trimmed);
      setInputText('');
      if (res?.status) setThreadStatus(res.status);
      if (Array.isArray(res?.new_messages) && res.new_messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const toAdd = res.new_messages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...toAdd];
        });
        hasLoadedFullHistoryRef.current = true;
        scrollToBottom('smooth');
      }
    } catch (err) {
      setErrorBanner(
        err?.message || 'Could not send message right now. Please check your connection and try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredMessages = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        (m.body && m.body.toLowerCase().includes(q)) ||
        (m.sender_name && m.sender_name.toLowerCase().includes(q))
    );
  }, [messages, historySearch]);

  if (isHiddenRoute) return null;

  const statusBadgeInfo = (() => {
    if (threadStatus === 'replied') {
      return {
        label: 'Support Replied',
        dot: 'bg-emerald-400',
        pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      };
    }
    if (threadStatus === 'needs_reply') {
      return {
        label: 'Awaiting Support Reply',
        dot: 'bg-amber-400',
        pill: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      };
    }
    if (threadStatus === 'resolved') {
      return {
        label: 'Resolved',
        dot: 'bg-sky-400',
        pill: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      };
    }
    return {
      label: 'Support Desk Online',
      dot: 'bg-emerald-400',
      pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    };
  })();

  // ============================================================================
  // STATE 1: FLOATING TRIGGER BUTTON (BOTTOM-RIGHT)
  // ============================================================================
  if (viewMode === 'closed') {
    return (
      <div className="fixed bottom-[70px] right-3 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={handleOpenPopup}
          aria-label="Open Candidate Support Chat"
          className="group relative flex items-center justify-center sm:gap-2 rounded-full bg-[#DB1A1A] hover:bg-[#B81515] text-white w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-3 shadow-lg shadow-[#DB1A1A]/30 hover:scale-[1.03] active:scale-95 transition-all duration-200 border border-white/25 cursor-pointer"
        >
          {/* Live Online Dot */}
          <span className="absolute -top-0.5 -left-0.5 sm:static flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 ring-2 ring-white sm:ring-0" />
          </span>

          {/* Chat Icon */}
          <svg
            className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-rotate-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>

          <span className="hidden sm:inline text-sm font-extrabold tracking-tight">
            Support Chat
          </span>

          {/* Unread Admin Reply Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#2C687B] text-white font-black text-[10px] flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ============================================================================
  // SHARED MESSAGE LIST RENDERER (Used in both Popup & Fullscreen)
  // ============================================================================
  const renderMessageList = (isFullScreen = false) => {
    const listToRender = isFullScreen ? filteredMessages : messages;

    return (
      <div className="space-y-3">
        {/* Welcome Card & Quick-Help FAQ Chips */}
        <div className="rounded-2xl p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              校
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Gakkou Support Desk
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ● Direct Admin Line
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Konnichiwa! Have a question about JFT-Basic, SSW mock exams, audio, or seat booking? Tap a quick answer below or send us a direct message.
              </p>
            </div>
          </div>

          {/* Quick FAQ Chips */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
              Instant Answers:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FAQS.map((faq) => {
                const isSelected = activeFaqId === faq.id;
                return (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => setActiveFaqId(isSelected ? null : faq.id)}
                    className={`text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-[#E11D48]/50'
                    }`}
                  >
                    {faq.question}
                  </button>
                );
              })}
            </div>

            {activeFaqId && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {QUICK_FAQS.find((f) => f.id === activeFaqId)?.answer}
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loadingHistory && messages.length === 0 && (
          <div className="py-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Loading your conversation history...
            </p>
          </div>
        )}

        {/* Empty state for logged-in user with no messages yet */}
        {!loadingHistory && isAuthenticated && listToRender.length === 0 && (
          <div className="py-6 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {historySearch
                ? `No messages matching "${historySearch}"`
                : 'No messages yet — start a conversation below!'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Every message and instructor reply is saved to your account so you can view it anytime.
            </p>
          </div>
        )}

        {/* Conversation Messages */}
        {listToRender.map((msg, idx) => {
          const isUser = msg.sender_type === 'user';
          const isAdmin = msg.sender_type === 'admin';
          const isSystem = msg.sender_type === 'system';

          const prevMsg = idx > 0 ? listToRender[idx - 1] : null;
          const currentDateLabel = formatMessageDate(msg.created_at);
          const prevDateLabel = prevMsg ? formatMessageDate(prevMsg.created_at) : '';
          const showDateHeader = currentDateLabel && currentDateLabel !== prevDateLabel;

          return (
            <React.Fragment key={msg.id || idx}>
              {showDateHeader && (
                <div className="flex justify-center my-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {currentDateLabel}
                  </span>
                </div>
              )}

              {isSystem ? (
                <div className="flex justify-center my-1.5">
                  <div className="max-w-[92%] rounded-xl px-3 py-2 text-[11px] font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 text-center leading-relaxed">
                    {msg.body}
                  </div>
                </div>
              ) : isUser ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      You • {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={`${
                      isFullScreen ? 'max-w-[75%] sm:max-w-[65%]' : 'max-w-[85%]'
                    } rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap break-words`}
                  >
                    {msg.body}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                      🛡️ {msg.sender_name || 'Gakkou Support Team'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      • {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={`${
                      isFullScreen ? 'max-w-[75%] sm:max-w-[65%]' : 'max-w-[85%]'
                    } rounded-2xl rounded-bl-xs px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-sky-200/80 dark:border-sky-500/30 text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap break-words`}
                  >
                    {msg.body}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    );
  };

  // ============================================================================
  // SHARED COMPOSER OR GUEST SIGN-IN PROMPT
  // ============================================================================
  const renderComposerArea = (isFullScreen = false) => {
    if (!isAuthenticated) {
      return (
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 text-center">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              🔒 Sign in to message Gakkou Support
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Your chat history and admin replies are saved directly to your candidate account.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-2">
              <Link
                href="/accounts/login"
                onClick={handleClose}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-extrabold text-xs shadow-xs hover:opacity-95 transition"
              >
                Sign In to Chat
              </Link>
              <Link
                href="/accounts/signup"
                onClick={handleClose}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:border-[#E11D48] transition"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      >
        {errorBanner && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold text-rose-600 dark:text-rose-300 flex items-center justify-between">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner('')}
              className="ml-2 text-rose-400 hover:text-rose-600"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              rows={isFullScreen ? 2 : 1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              placeholder="Write your message to Gakkou Support... (Press Enter to send)"
              className="w-full resize-none rounded-xl bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20 transition max-h-28"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="shrink-0 h-10 px-4 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:opacity-95 disabled:opacity-45 disabled:cursor-not-allowed transition"
          >
            {sending ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
          <span>
            Signed in as <strong className="text-slate-600 dark:text-slate-300">@{user?.username}</strong>
          </span>
          <div className="flex items-center gap-2">
            {viewMode === 'popup' && (
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="font-bold text-[#E11D48] dark:text-rose-400 hover:underline"
              >
                ⤢ Full Screen & History
              </button>
            )}
            <span>{inputText.length}/1000</span>
          </div>
        </div>
      </form>
    );
  };

  // ============================================================================
  // STATE 2: COMPACT FLOATING POPUP WINDOW
  // ============================================================================
  if (viewMode === 'popup') {
    return (
      <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        {/* Popup Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              💬
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
                Gakkou Support Chat
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeInfo.dot}`} />
                <span className="truncate">{statusBadgeInfo.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Expand to Full-Screen History Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title="Expand to Full Screen & View Complete History"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1 text-xs font-bold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
              </svg>
              <span className="hidden sm:inline text-[11px]">Full Screen</span>
            </button>

            {/* Close Popup Button */}
            <button
              type="button"
              onClick={handleClose}
              title="Minimize Chat"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Messages Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/90 dark:bg-[#0B1120]">
          {renderMessageList(false)}
        </div>

        {/* Bottom Composer / Sign-in Prompt */}
        {renderComposerArea(false)}
      </div>
    );
  }

  // ============================================================================
  // STATE 3: FULL-SCREEN MESSENGER & HISTORY VIEW
  // ============================================================================
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-white">
      {/* Full-Screen Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
            校
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                Gakkou Support & Candidate Help Center
              </h2>
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeInfo.pill}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadgeInfo.dot}`} />
                {statusBadgeInfo.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Full Conversation History • Synced with your candidate account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9H4V4M15 9h5V4M9 15H4v5M15 15h5v5" />
            </svg>
            <span>Compact Popup</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center gap-1 transition"
          >
            <span>✕ Close</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Body */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Left Sidebar (Desktop): Search History, Account Status & Quick Links */}
        <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-5 overflow-y-auto space-y-5">
          {/* Search Conversation History */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Search Chat History
            </label>
            <div className="relative">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Filter messages..."
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#E11D48]"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Thread Summary Box */}
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              📋 Conversation Details
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Candidate:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {isAuthenticated ? `@${user?.username}` : 'Guest Visitor'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Messages:</span>
              <span className="font-bold text-slate-900 dark:text-white">{messages.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Status:</span>
              <span className="font-bold text-[#E11D48] dark:text-rose-400">
                {statusBadgeInfo.label}
              </span>
            </div>
          </div>

          {/* Quick Topic Starters */}
          {isAuthenticated && (
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Message Templates
              </div>
              {[
                'Hi Support! I have a question about a JFT-Basic mock test question.',
                'Hello! I need help with Prometric exam registration in Dhaka.',
                'Hi team! I noticed an issue with audio or translation in a test.',
              ].map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(template)}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-[#E11D48] text-slate-700 dark:text-slate-200 transition"
                >
                  “{template}”
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main Full-Screen Conversation Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Search Bar inside Full-Screen */}
          <div className="lg:hidden px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="🔍 Search your conversation history..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#E11D48]"
            />
            {historySearch && (
              <button
                type="button"
                onClick={() => setHistorySearch('')}
                className="text-xs font-bold text-slate-500 px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-[#070B14]">
            <div className="max-w-3xl mx-auto">
              {renderMessageList(true)}
            </div>
          </div>

          {/* Full-Screen Composer */}
          <div className="max-w-3xl w-full mx-auto">
            {renderComposerArea(true)}
          </div>
        </div>
      </div>
    </div>
  );
}


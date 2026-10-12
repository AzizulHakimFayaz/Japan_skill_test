'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Search,
  CheckCircle2,
  HelpCircle,
  Headphones,
  Sliders,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { getBookDetail } from '@/lib/api';

export default function InteractiveBookReaderPage({ params }) {
  const unwrappedParams = use(params);
  const bookId = unwrappedParams.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'questions'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Audio Player State
  const [activeAudioItem, setActiveAudioItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef(null);

  // Fetch book and its topics/questions
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getBookDetail(bookId);
        if (isMounted) {
          setBook(data);
          // Default to first topic page if available
          if (data.topics && data.topics.length > 0) {
            setCurrentPage(data.topics[0].page_number || 1);
            setPageInput(String(data.topics[0].page_number || 1));
          }
        }
      } catch (err) {
        console.error('Failed to load book:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [bookId]);

  // Audio helper: play pre-recorded MP3 or fallback to Web Speech API
  const handlePlayAudio = (item) => {
    if (activeAudioItem?.id === item.id && isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // Also auto-jump PDF to this topic's page
    if (item.page_number) {
      jumpToPage(item.page_number);
    }

    setActiveAudioItem(item);

    if (item.audio_file_url) {
      // Pre-recorded / generated Edge-TTS neural audio
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.src = item.audio_file_url;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play error, falling back to Web Speech:', err);
          speakWithWebSpeech(item.japanese_script || item.title_ja || item.title);
        });
      }
    } else {
      // Client-side Web Speech fallback
      speakWithWebSpeech(item.japanese_script || item.title_ja || item.title);
    }
  };

  const speakWithWebSpeech = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = playbackSpeed === 0.8 ? 0.8 : 0.95;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !activeAudioItem) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const jumpToPage = (pageNum) => {
    const total = book?.total_pages || 120;
    const clamped = Math.max(1, Math.min(pageNum, total));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(pageInput, 10);
    if (!isNaN(num)) {
      jumpToPage(num);
    }
  };

  const toggleAnswer = (itemId) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Filter topics and questions
  const topicsList = useMemo(() => {
    if (!book?.topics) return [];
    return book.topics.filter((t) => t.topic_type !== 'question');
  }, [book]);

  const questionsList = useMemo(() => {
    if (!book?.topics) return [];
    return book.topics.filter((t) => t.topic_type === 'question');
  }, [book]);

  const filteredTopics = useMemo(() => {
    if (!searchTopicQuery.trim()) return topicsList;
    const q = searchTopicQuery.toLowerCase();
    return topicsList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.title_ja && t.title_ja.toLowerCase().includes(q)) ||
        (t.summary_text && t.summary_text.toLowerCase().includes(q))
    );
  }, [topicsList, searchTopicQuery]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading textbook and audio tracks...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Book not found</h2>
        <p className="text-sm text-slate-500">The textbook you requested could not be located.</p>
        <Link href="/books" className="inline-block px-5 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl">
          Back to Books
        </Link>
      </div>
    );
  }

  const pdfUrlWithPage = `${book.pdf_download_url}#page=${currentPage}&view=FitH`;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-[#070b14]">
      {/* Hidden audio element for pre-recorded Edge-TTS tracks */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setAudioProgress(0);
        }}
      />

      {/* Top Reader Navigation Bar */}
      <header className="h-14 sm:h-16 bg-white dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 shadow-xs">
        {/* Left Side: Back & Book Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/books"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Back to all books"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer md:hidden"
            title="Toggle Study Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                {book.title}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-japan-red text-[10px] font-bold border border-rose-200/60 shrink-0">
                {book.language_flag} {book.language_name}
              </span>
            </div>
            {book.title_ja && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate hidden sm:block">
                {book.title_ja}
              </p>
            )}
          </div>
        </div>

        {/* Center & Right: Page Navigator & Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => jumpToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 px-1">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Page</span>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageInputSubmit}
                className="w-10 sm:w-12 text-center text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md py-0.5 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-japan-red"
              />
              <span className="text-xs font-bold text-slate-400">/ {book.total_pages}</span>
            </form>

            <button
              onClick={() => jumpToPage(currentPage + 1)}
              disabled={currentPage >= (book.total_pages || 120)}
              className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Buttons (Hidden on tiny screens) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1 min-w-[36px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Download Original PDF */}
          {book.pdf_download_url && (
            <a
              href={book.pdf_download_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              title="Download Full PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Workspace (Split Screen) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT STUDY COMPANION SIDEBAR */}
        <aside
          className={`absolute md:relative inset-y-0 left-0 z-30 w-full sm:w-96 md:w-[380px] lg:w-[420px] bg-white dark:bg-[#0b101f] border-r border-slate-200 dark:border-slate-800/90 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
          }`}
        >
          {/* Sidebar Tabs: Topics vs Questions */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-900/40">
            <div className="grid grid-cols-2 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('topics')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'topics'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-japan-red" />
                <span>Key Topics ({topicsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'questions'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Exam Q&amp;A ({questionsList.length})</span>
              </button>
            </div>

            {/* Quick search inside topics */}
            {activeTab === 'topics' && (
              <div className="relative mt-2.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter topics &amp; chapters..."
                  value={searchTopicQuery}
                  onChange={(e) => setSearchTopicQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-japan-red"
                />
              </div>
            )}
          </div>

          {/* Sidebar Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/50">
            {activeTab === 'topics' ? (
              filteredTopics.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No matching topics found.
                </div>
              ) : (
                filteredTopics.map((item) => {
                  const isCurrent = currentPage === item.page_number;
                  const isThisAudioPlaying = activeAudioItem?.id === item.id && isPlaying;

                  return (
                    <div
                      key={item.id}
                      className={`pt-2.5 first:pt-0 p-3 rounded-xl transition-all border ${
                        isCurrent
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-japan-red/30 shadow-xs'
                          : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                              P.{item.page_number}
                            </span>
                            {item.topic_type === 'safety' && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                安全・心得
                              </span>
                            )}
                            {item.topic_type === 'chapter' && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                主要章
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>

                          {item.title_ja && (
                            <p className="text-[11px] text-japan-red dark:text-rose-400 font-medium">
                              {item.title_ja}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handlePlayAudio(item)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isThisAudioPlaying
                                ? 'bg-japan-red text-white animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-japan-red'
                            }`}
                            title={isThisAudioPlaying ? 'Pause Audio' : 'Play Japanese Pronunciation'}
                          >
                            {isThisAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => jumpToPage(item.page_number)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            title={`Jump to Page ${item.page_number}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.summary_text && (
                        <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                          {item.summary_text}
                        </p>
                      )}
                    </div>
                  );
                })
              )
            ) : questionsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No exam questions available for this book.
              </div>
            ) : (
              questionsList.map((q) => {
                const isRevealed = revealedAnswers[q.id];
                const isAudioPlaying = activeAudioItem?.id === q.id && isPlaying;

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-200/60">
                        Exam Practice (Page {q.page_number})
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePlayAudio(q)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isAudioPlaying
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600'
                          }`}
                          title="Listen to Japanese question"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => jumpToPage(q.page_number)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-japan-red cursor-pointer"
                          title="Jump to book page"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {q.title}
                    </h4>

                    {q.question_options && q.question_options.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {q.question_options.map((opt, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Reveal Button */}
                    <div className="pt-1">
                      {isRevealed ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct Answer: {q.correct_answer}</span>
                          </div>
                          {q.summary_text && (
                            <p className="text-[11px] font-normal text-slate-600 dark:text-slate-300 pt-1">
                              {q.summary_text}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="w-full py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Show Solution &amp; Furigana
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Audio Dock */}
          {activeAudioItem && (
            <div className="p-3 bg-slate-900 text-white border-t border-slate-800 space-y-2 shrink-0 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-rose-300">
                    🔊 {activeAudioItem.title_ja || activeAudioItem.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatTime(audioProgress)} / {formatTime(audioDuration || 30)} (Page {activeAudioItem.page_number})
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleSpeedChange(playbackSpeed === 1.0 ? 0.8 : playbackSpeed === 0.8 ? 1.2 : 1.0)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-300 hover:bg-slate-700 transition-colors"
                    title="Toggle Speed (0.8x for slow Japanese listening)"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-xl bg-japan-red hover:bg-rose-700 text-white transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-rose-500 to-amber-400 transition-all duration-150"
                  style={{
                    width: `${audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN PDF VIEWER AREA */}
        <main className="flex-1 flex flex-col bg-slate-200 dark:bg-slate-950 overflow-hidden relative">
          {/* PDF Viewer Frame */}
          <div className="flex-1 w-full h-full relative overflow-auto flex items-center justify-center p-2 sm:p-4">
            <div
              className="w-full h-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-300 dark:border-slate-800 flex flex-col"
              style={{
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
                transformOrigin: 'top center',
              }}
            >
              {book.pdf_download_url ? (
                <iframe
                  key={currentPage}
                  src={pdfUrlWithPage}
                  title={`${book.title} - Page ${currentPage}`}
                  className="w-full h-full border-none"
                  loading="lazy"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-slate-400" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    PDF document stream is loading.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

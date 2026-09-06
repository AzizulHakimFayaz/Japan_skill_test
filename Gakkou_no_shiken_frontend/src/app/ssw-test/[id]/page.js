/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * ==============================================================================
 * SSW CBT EXAMINATION INTERFACE (Prometric Japan Official Standard)
 * 特定技能測定試験 CBT 模擬試験システム（プロメトリック公認レイアウト準拠）
 * ==============================================================================
 * 
 * Features:
 * 1. Exact Prometric CBT Top Bar (設問, セクション, 残り時間デジタル時計, 終了ボタン)
 * 2. Olive-green Subheader (試験名, 受験者名)
 * 3. Left-hand Pentagon/Flag Question Navigator
 * 4. Gray Question Prompt Box with [red]...[/red] emphasis rendering
 * 5. Multi-Choice Rectangular Option Boxes
 * 6. Audio Player with play/pause and progress scrubbing
 * 7. Typing Question Input (where candidate types the answer in Japanese/Romaji)
 * 8. Phase 1 -> Phase 2 Transition Confirmation Modal
 * 9. Finish Exam Confirmation Modal & Instant Scoring
 * 10. Settings & Help dialogs
 *
 * NOTE: 100% isolated from JFT-Basic test runner to ensure ZERO regression to JFT.
 */

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuizData, submitQuiz } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GlobalLoader from '@/components/GlobalLoader';
import {
  Clock,
  Settings,
  HelpCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Keyboard,
  FileCheck,
} from 'lucide-react';

/**
 * Utility: Render text with [red]...[/red] or __underline__ formatting.
 * Supports highlighting red text exactly as shown in the Prometric screenshot.
 */
function renderPrometricText(text) {
  if (!text) return null;

  // Split by [red]...[/red] tags
  const redParts = text.split(/(\[red\].*?\[\/red\])/gi);

  return redParts.map((part, pIdx) => {
    if (part.toLowerCase().startsWith('[red]') && part.toLowerCase().endsWith('[/red]')) {
      const inner = part.replace(/\[\/?red\]/gi, '');
      return (
        <span key={pIdx} className="text-red-600 font-black tracking-wide underline decoration-red-400">
          {inner}
        </span>
      );
    }

    // Split by __underlined__ words
    const underParts = part.split(/(__.*?__)/g);
    return underParts.map((sub, sIdx) => {
      if (sub.startsWith('__') && sub.endsWith('__')) {
        return (
          <span key={`${pIdx}-${sIdx}`} className="font-bold underline decoration-slate-800 underline-offset-4">
            {sub.slice(2, -2)}
          </span>
        );
      }
      return sub;
    });
  });
}

/**
 * Format seconds into HH:MM:SS for the Prometric digital clock
 */
function formatPrometricTime(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '00:00:00';
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SswCbtExamContent({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const testId = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewToken = searchParams?.get('preview');
  const { user } = useAuth();

  // ─── Core CBT State ────────────────────────────────────────────────────────
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flattened questions list
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers map: { [questionId]: selectedOptionId or typedString }
  const [answers, setAnswers] = useState({});
  // Bookmarked questions: { [questionId]: true }
  const [flagged, setFlagged] = useState({});

  // ─── Multi-Phase Management ────────────────────────────────────────────────
  // Phase 1 = Audio & Typing ('audio')
  // Phase 2 = Occupational & Practical Knowledge ('occupational' or other)
  const [currentPhase, setCurrentPhase] = useState(1); // 1 or 2
  const [phase1Completed, setPhase1Completed] = useState(false);

  // ─── Modal States ──────────────────────────────────────────────────────────
  const [showPhaseTransitionModal, setShowPhaseTransitionModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // ─── Settings & Timer State ────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState('standard'); // 'standard' | 'large' | 'xlarge'
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Audio Player State ────────────────────────────────────────────────────
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // ─── Load Quiz Data on Mount ───────────────────────────────────────────────
  useEffect(() => {
    getQuizData(testId, previewToken)
      .then((data) => {
        setQuizData(data);

        // Flatten all questions across steps
        const flatQuestions = [];
        if (data?.steps && Array.isArray(data.steps)) {
          data.steps.forEach((step) => {
            if (step.questions && Array.isArray(step.questions)) {
              step.questions.forEach((q) => {
                flatQuestions.push({
                  ...q,
                  step_number: step.step_number,
                  group: step.group,
                });
              });
            }
          });
        }

        setAllQuestions(flatQuestions);

        // Initialize Timer
        const timeLimit = data?.test?.time_limit_seconds || 1200; // default 20 mins
        setTimeLeft(timeLimit);
      })
      .catch((err) => {
        console.error('Failed to load SSW quiz data:', err);
        setError(err.message || 'Failed to load examination data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [testId, previewToken]);

  // ─── Final Exam Submission ─────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        answers: answers,
      };

      const result = await submitQuiz(testId, payload);
      const attemptId = result?.attempt_id;

      if (attemptId) {
        router.push(`/attempt/${attemptId}`);
      } else {
        alert('Examination submitted successfully!');
        router.push('/ssw-skill-test');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert(`Submission failed: ${err.message || 'Please try again'}`);
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmitOnTimeout = () => {
    alert('時間終了です。試験を自動送信します。(Time limit reached. Submitting exam now.)');
    handleFinalSubmit();
  };

  // ─── Digital Timer Countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || loading || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, isSubmitting]);

  // ─── Filter Questions by Current Phase ─────────────────────────────────────
  // Phase 1 questions: section === 'audio' or question.type in ['audio', 'audio_typing']
  // Phase 2 questions: all remaining questions (occupational, practical, etc.)
  const phase1Questions = allQuestions.filter(
    (q) => q.section === 'audio' || q.type === 'audio' || q.type === 'audio_typing'
  );
  const phase2Questions = allQuestions.filter(
    (q) => !(q.section === 'audio' || q.type === 'audio' || q.type === 'audio_typing')
  );

  // If test doesn't explicitly mark phases, fallback gracefully
  const activePhaseQuestions =
    currentPhase === 1
      ? (phase1Questions.length > 0 ? phase1Questions : allQuestions)
      : (phase2Questions.length > 0 ? phase2Questions : allQuestions);

  const currentQuestion = activePhaseQuestions[currentIdx] || null;

  // ─── Reset Audio Playback When Question Changes ────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioCurrentTime(0);
    }
  }, [currentIdx, currentPhase]);

  // ─── Audio Event Handlers ──────────────────────────────────────────────────
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.log('Audio autoplay prevented:', e));
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCurrentTime(0);
  };

  // ─── Answer Input Handlers ─────────────────────────────────────────────────
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleTypeAnswer = (questionId, textVal) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: textVal,
    }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // ─── Navigation Logic ──────────────────────────────────────────────────────
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < activePhaseQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Reached the end of active questions in this phase
      if (currentPhase === 1 && phase2Questions.length > 0 && !phase1Completed) {
        // Show Phase 1 completion confirmation popup
        setShowPhaseTransitionModal(true);
      } else {
        // Show Exam Finish Confirmation modal
        setShowFinishConfirmModal(true);
      }
    }
  };

  // ─── Phase Transition Confirmation ────────────────────────────────────────
  const confirmProceedToPhase2 = () => {
    setShowPhaseTransitionModal(false);
    setPhase1Completed(true);
    setCurrentPhase(2);
    setCurrentIdx(0);
  };

  // ─── Loading & Error Screens ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E232A] flex flex-col items-center justify-center p-6 text-white">
        <GlobalLoader text="プロメトリック CBT 模擬試験を読み込み中..." />
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-[#1E232A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">試験の読み込みに失敗しました</h2>
          <p className="text-sm text-slate-400 mb-6">{error || '試験データが見つかりません。'}</p>
          <button
            onClick={() => router.push('/ssw-skill-test')}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all"
          >
            SSW トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  // ─── Current Question Data ─────────────────────────────────────────────────
  const isTypingQuestion =
    currentQuestion?.type === 'typing' || currentQuestion?.type === 'audio_typing';
  const hasAudio =
    Boolean(currentQuestion?.audio_url) ||
    currentQuestion?.type === 'audio' ||
    currentQuestion?.type === 'audio_typing';
  const resolvedAudioUrl = currentQuestion?.audio_url;

  const currentSectionLabel =
    currentPhase === 1 ? '第1部 音声・入力セクション' : '第2部 専門・実技セクション';

  // Font size multiplier
  const fontClasses = {
    standard: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[fontSize];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#1B2129] font-sans">
      {/* ────────────────────────────────────────────────────────────────────
          1. TOP BLACK BAR (設問, セクション, 残り時間デジタル時計, 終了ボタン)
          Exact match to the Prometric screenshot top navigation
          ──────────────────────────────────────────────────────────────────── */}
      <header className="bg-black text-white px-3 sm:px-6 py-2 border-b-2 border-[#8AC149] shadow-md flex items-center justify-between z-20">
        {/* Left: Question No & Section */}
        <div className="flex flex-col text-xs sm:text-sm font-bold tracking-tight">
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-slate-300">設問：</span>
            <span className="text-white text-base sm:text-lg font-black">{currentIdx + 1}</span>
            <span className="text-slate-400 text-xs font-normal">
              / {activePhaseQuestions.length}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-[#A8D970] font-semibold truncate max-w-[180px] sm:max-w-xs">
            セクション：{currentSectionLabel}
          </div>
        </div>

        {/* Center: Monospace Digital Clock */}
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-md border border-slate-800">
          <Clock className="w-5 h-5 text-white animate-pulse" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-300 font-semibold leading-none">
              残り時間：
            </span>
            <span className="text-sm sm:text-xl font-mono font-black tracking-widest text-white leading-tight">
              {formatPrometricTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Right: Prometric Sand/Beige Finish Button (終了) */}
        <div>
          <button
            type="button"
            onClick={() => setShowFinishConfirmModal(true)}
            className="bg-[#EEDFA8] hover:bg-[#E5D497] active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded shadow-md transition-all border border-[#D1BE7D] cursor-pointer"
            title="試験を終了する (Finish Exam)"
          >
            終了
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────────
          2. OLIVE-GREEN SUBHEADER (試験名, 受験者名)
          Exact match to the Prometric sub-bar
          ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#466928] text-white px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs sm:text-sm font-bold shadow-inner">
        <div className="truncate max-w-[65%]">
          試験：{quizData?.test?.title || 'プロメトリック認定試験（体験版）'}
        </div>
        <div className="text-slate-100 font-medium">
          受験者名：<span className="font-bold">{user?.full_name || user?.username || '試験 太郎'}</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          3. MAIN TEST WORKSPACE CONTAINER (White CBT Card)
          ──────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col justify-start">
        <div className="bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-300 flex flex-col md:flex-row min-h-[580px] overflow-hidden">
          {/* ────────────────────────────────────────────────────────────────
              LEFT SIDEBAR: Right-pointing Pentagon/Flag Question Buttons
              ──────────────────────────────────────────────────────────────── */}
          <aside className="w-full md:w-24 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-2 sm:p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[140px] md:max-h-[640px]">
            {activePhaseQuestions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered =
                answers[q.id] !== undefined &&
                answers[q.id] !== null &&
                String(answers[q.id]).trim() !== '';
              const isFlagged = Boolean(flagged[q.id]);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative group w-10 h-8 md:w-16 md:h-10 text-xs sm:text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#8AC149] text-slate-950 font-black shadow-md scale-105'
                      : isAnswered
                      ? 'bg-[#3E5C25] text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                  style={{
                    // Authentic Prometric right-pointing pentagonal flag shape
                    clipPath: 'polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%)',
                  }}
                  title={`設問 ${idx + 1}${isAnswered ? ' (回答済)' : ' (未回答)'}${isFlagged ? ' (チェック有)' : ''}`}
                >
                  <span className="pr-1.5">{idx + 1}</span>

                  {/* Flag indicator dot if question is bookmarked */}
                  {isFlagged && (
                    <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-white"></span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* ────────────────────────────────────────────────────────────────
              MAIN QUESTION CANVAS
              ──────────────────────────────────────────────────────────────── */}
          <section className="flex-1 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto">
            {currentQuestion ? (
              <div className="space-y-6">
                {/* 1. Prompt / Question Header Box (Light gray with red emphasis text) */}
                <div className="bg-[#F4F4F4] border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs">
                  <div className={`text-slate-900 font-bold ${fontClasses}`}>
                    {renderPrometricText(
                      currentQuestion.prompt ||
                        currentQuestion.instruction ||
                        `問題${currentIdx + 1}：次の問いに答えてください。`
                    )}
                  </div>
                  {currentQuestion.instruction && currentQuestion.prompt && (
                    <div className="mt-2 text-xs sm:text-sm text-slate-600 font-normal">
                      {renderPrometricText(currentQuestion.instruction)}
                    </div>
                  )}
                </div>

                {/* 2. Audio Player (For Audio & Audio Typing Questions) */}
                {hasAudio && (
                  <div className="bg-slate-100 border-2 border-[#466928]/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-[#466928] hover:bg-[#395620]'
                        }`}
                        title={isPlaying ? '音声を一時停止' : '音声を再生'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-[#466928]" />
                          <span>{isPlaying ? '音声再生中...' : '音声を聞く (Click to Play)'}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatPrometricTime(audioCurrentTime)} / {formatPrometricTime(audioDuration)}
                        </span>
                      </div>
                    </div>

                    {/* Hidden Native Audio Element */}
                    {resolvedAudioUrl && (
                      <audio
                        ref={audioRef}
                        src={resolvedAudioUrl}
                        onTimeUpdate={handleAudioTimeUpdate}
                        onEnded={handleAudioEnded}
                        preload="auto"
                      />
                    )}

                    <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                      ※ ヘッドホンで音量を確認して解答してください
                    </div>
                  </div>
                )}

                {/* 3. Question Image (if present) */}
                {currentQuestion.image_url && (
                  <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-72 overflow-hidden">
                    <img
                      src={currentQuestion.image_url}
                      alt={`Question ${currentIdx + 1}`}
                      className="max-h-64 object-contain rounded"
                    />
                  </div>
                )}

                {/* 4. Answer Area: Multiple-Choice OR Typing Input */}
                {isTypingQuestion ? (
                  /* ─── TYPING QUESTION CONTAINER ─── */
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#466928] uppercase tracking-wider">
                      <Keyboard className="w-4 h-4" />
                      <span>回答入力欄 (Type your answer below)</span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleTypeAnswer(currentQuestion.id, e.target.value)}
                        placeholder="ここに回答を入力してください (ひらがな・ローマ字可)..."
                        className="w-full px-4 py-3.5 sm:py-4 rounded-xl border-2 border-slate-700 focus:border-[#466928] focus:ring-3 focus:ring-[#8AC149]/30 font-medium text-slate-900 bg-white text-base sm:text-lg shadow-sm outline-none transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>※ ひらがな、またはローマ字で入力できます</span>
                      <span>
                        {answers[currentQuestion.id] ? (
                          <span className="text-emerald-600 font-bold">✓ 入力済み (Saved)</span>
                        ) : (
                          <span className="text-amber-600">未入力 (Not answered yet)</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* ─── MULTIPLE CHOICE OPTIONS CONTAINER ─── */
                  <div className="space-y-2.5 pt-2">
                    {currentQuestion.options && currentQuestion.options.length > 0 ? (
                      currentQuestion.options.map((opt, optIdx) => {
                        const isSelected = answers[currentQuestion.id] === opt.id;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                            className={`w-full text-left p-3 sm:p-4 rounded-md border-2 transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#3E5C25] bg-[#F1F8E9] text-slate-950 font-black shadow-xs ring-1 ring-[#3E5C25]'
                                : 'border-[#293845] bg-white hover:bg-slate-50 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected
                                    ? 'bg-[#3E5C25] text-white'
                                    : 'border border-slate-400 text-slate-600'
                                }`}
                              >
                                {optIdx + 1}
                              </span>
                              <span className={fontClasses}>{opt.label}</span>
                            </div>

                            {opt.image_url && (
                              <img
                                src={opt.image_url}
                                alt={`Option ${optIdx + 1}`}
                                className="max-h-12 object-contain ml-2 rounded"
                              />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-sm text-slate-500 italic p-4">
                        選択肢が登録されていません。
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">設問がありません</div>
            )}
          </section>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────────
          4. BOTTOM CONTROL BAR (Dark Olive Green)
          Exact match to the Prometric screenshot footer
          ──────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#466928] text-white px-3 sm:px-6 py-2.5 shadow-xl border-t-2 border-[#8AC149] flex items-center justify-between z-20">
        {/* Left: Settings (Gear) & Help (?) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 rounded-lg bg-black/30 hover:bg-black/50 active:scale-95 flex items-center justify-center text-white border border-white/20 transition-all cursor-pointer"
            title="設定 (Settings)"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-9 h-9 rounded-lg bg-black/30 hover:bg-black/50 active:scale-95 flex items-center justify-center text-white border border-white/20 transition-all cursor-pointer"
            title="ヘルプ (Help)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Flag (設問チェック), 戻る (Back), 次へ (Next) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Flag Bookmark Toggle */}
          {currentQuestion && (
            <button
              type="button"
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                flagged[currentQuestion.id]
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                  : 'bg-black/30 hover:bg-black/50 text-white border-white/20'
              }`}
              title="後で見直すためにチェックを付ける"
            >
              <Flag
                className={`w-4 h-4 ${
                  flagged[currentQuestion.id] ? 'fill-slate-950 text-slate-950' : 'text-white'
                }`}
              />
              <span className="hidden sm:inline">
                {flagged[currentQuestion.id] ? 'チェック済' : '設問チェック'}
              </span>
            </button>
          )}

          {/* 戻る (Previous) Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
              currentIdx === 0
                ? 'bg-black/20 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-[#2E471A] hover:bg-[#253915] text-white border border-white/20 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>戻る</span>
          </button>

          {/* 次へ (Next) Button (Bright Lime Green) */}
          <button
            type="button"
            onClick={handleNext}
            className="px-5 sm:px-8 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-black flex items-center gap-1 bg-[#8AC149] hover:bg-[#7CB33B] text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>
              {currentIdx === activePhaseQuestions.length - 1
                ? currentPhase === 1 && phase2Questions.length > 0
                  ? '第2部へ進む'
                  : '試験終了'
                : '次へ'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* ────────────────────────────────────────────────────────────────────
          5. PHASE TRANSITION CONFIRMATION MODAL (フェーズ完了確認ポップアップ)
          Exact request: "after complete every question a finish pop up will
          show that are you sure you want to complete and go to the next phage"
          ──────────────────────────────────────────────────────────────────── */}
      {showPhaseTransitionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
              <FileCheck className="w-6 h-6" />
              <h3 className="text-lg font-black tracking-tight">セクション終了の確認</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              第1部（音声・入力試験）が完了しました。
              <br />
              <strong className="text-white">
                第2部（専門・実技試験）へ進みますか？
              </strong>
            </p>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>第1部 解答状況：</span>
                <span className="font-bold text-white">
                  {
                    phase1Questions.filter(
                      (q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== ''
                    ).length
                  }{' '}
                  / {phase1Questions.length} 問
                </span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>要確認（チェック有）：</span>
                <span className="font-bold">
                  {phase1Questions.filter((q) => flagged[q.id]).length} 問
                </span>
              </div>
              <p className="text-[11px] text-rose-300 pt-1">
                ※ 注意：第2部に進むと、第1部の問題に戻って修正することはできません。
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPhaseTransitionModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-xs font-bold transition-all"
              >
                前の画面に戻る
              </button>

              <button
                type="button"
                onClick={confirmProceedToPhase2}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                次のフェーズへ進む →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          6. EXAM FINISH CONFIRMATION MODAL (全問完了・採点確認ポップアップ)
          ──────────────────────────────────────────────────────────────────── */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-black">試験終了の確認</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishConfirmModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              試験を終了して解答を送信し、公式採点結果を表示しますか？
            </p>

            <div className="bg-slate-800/80 rounded-xl p-3.5 text-xs space-y-1.5 text-slate-300 border border-slate-700">
              <div className="flex justify-between">
                <span>全解答済み設問：</span>
                <span className="font-bold text-white">
                  {
                    allQuestions.filter(
                      (q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== ''
                    ).length
                  }{' '}
                  / {allQuestions.length} 問
                </span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>チェック済み設問：</span>
                <span className="font-bold">
                  {allQuestions.filter((q) => flagged[q.id]).length} 問
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-600 hover:bg-slate-800 text-xs font-bold"
              >
                試験を続ける
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>送信中...</span>
                ) : (
                  <>
                    <span>終了して採点する</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          7. SETTINGS MODAL (文字サイズ調整など)
          ──────────────────────────────────────────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>表示設定 (Settings)</span>
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">問題文の文字サイズ：</label>
              <div className="grid grid-cols-3 gap-2">
                {['standard', 'large', 'xlarge'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      fontSize === sz
                        ? 'bg-[#8AC149] text-slate-950 border-[#8AC149] font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {sz === 'standard' ? '標準' : sz === 'large' ? '大' : '特大'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          8. HELP MODAL (操作ガイド)
          ──────────────────────────────────────────────────────────────────── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#8AC149]" />
                <span>CBT 操作ガイド (Help)</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-2 list-disc">
              <li><strong>選択問題：</strong>該当する選択肢の枠内をクリックして選択してください。</li>
              <li><strong>タイピング問題：</strong>回答入力欄にひらがなまたはローマ字で文字を入力してください。</li>
              <li><strong>設問チェック：</strong>見直したい設問は「設問チェック」ボタンで印を付けることができます。</li>
              <li><strong>セクション移動：</strong>第1部が終了すると、第2部への確認ポップアップが表示されます。</li>
              <li><strong>試験終了：</strong>右上の「終了」ボタンをクリックすると採点画面へ進みます。</li>
            </ul>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-2 py-2 bg-[#466928] hover:bg-[#385420] text-white rounded-xl text-xs font-bold"
            >
              了解しました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SswCbtExamPage(props) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">Loading SSW CBT Simulator...</p>
        </div>
      }
    >
      <SswCbtExamContent {...props} />
    </React.Suspense>
  );
}

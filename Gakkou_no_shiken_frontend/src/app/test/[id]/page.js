'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuizData, submitQuiz } from '@/lib/api';
import { formatPrompt, renderUnderline } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';
import GlobalLoader from '@/components/GlobalLoader';

const ORDERED_SECTION_KEYS = ['script_vocab', 'conversation', 'listening', 'reading'];
const SECTION_LABELS = {
  script_vocab: 'Script and Vocabulary',
  conversation: 'Conversation and Expression',
  listening: 'Listening Comprehension',
  reading: 'Reading Comprehension',
};

const SECTION_SHORT_LABELS = {
  script_vocab: 'Scri...',
  conversation: 'Co...',
  listening: 'List...',
  reading: 'Read...',
};

const LANGUAGES_LIST = [
  { key: 'Bengali', altKey: 'Bangla', label: 'Bengali (বাংলা)' },
  { key: 'English', label: 'English' },
  { key: 'Chinese', label: 'Chinese (中文)' },
  { key: 'Indonesian', label: 'Indonesian (Bahasa)' },
  { key: 'Khmer', label: 'Khmer (ភាសាខ្មែរ)' },
  { key: 'Mongolian', label: 'Mongolian (Монгол)' },
  { key: 'Myanmar', label: 'Myanmar (မြန်မာ)' },
  { key: 'Nepali', label: 'Nepali (नेपाली)' },
  { key: 'Thai', label: 'Thai (ไทย)' },
  { key: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)' },
];

export default function QuizPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewToken = searchParams?.get('preview');
  const { user } = useAuth();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CBT State
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({}); // { q1: 10, q2: null }
  const [flagged, setFlagged] = useState({}); // { q1: true }
  const [completedSections, setCompletedSections] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingOverlayText, setLoadingOverlayText] = useState(null);

  // Modals
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    getQuizData(params.id, previewToken)
      .then((data) => {
        setQuizData(data);
        const isDemo = Boolean(data.test?.is_actual_exam_demo);
        setCurrentStep(isDemo ? 0 : 1);
        if (data.test?.time_limit_seconds) {
          setTimeLeft(data.test.time_limit_seconds);
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          router.push(`/accounts/login?next=/test/${params.id}`);
        } else {
          setError(err.message || 'Failed to load test');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, previewToken, router]);


  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, isSubmitting]);

  const test = quizData?.test;
  const steps = quizData?.steps || [];
  const totalSteps = quizData?.total_steps || steps.length;
  const totalQuestions = quizData?.total_questions || 0;

  // Active step & section calculation
  const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null;

  const activeSectionKey =
    currentStep === 0
      ? 'intro'
      : currentStepData?.section || 'script_vocab';

  const activeSectionName =
    currentStep === 0
      ? 'Introduction'
      : SECTION_LABELS[activeSectionKey] || 'Script & Vocabulary';

  const currentQuestionTranslations =
    currentStep > 0 && currentStepData?.questions?.[0]?.translations
      ? currentStepData.questions[0].translations
      : {};

  const pauseAllAudio = () => {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('audio').forEach((audio) => audio.pause());
    }
  };

  const getFirstStepForSection = (secKey) => {
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].section === secKey) {
        return i + 1; // 1-based step index
      }
    }
    return null;
  };

  const getLastStepForSection = (secKey) => {
    let lastStep = null;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].section === secKey) {
        lastStep = i + 1;
      }
    }
    return lastStep;
  };

  const getSectionFill = (secKey) => {
    let totalInSec = 0;
    let answeredInSec = 0;

    steps.forEach((step) => {
      if (step.section === secKey) {
        step.questions.forEach((q) => {
          totalInSec++;
          if (answers[`q${q.id}`] !== undefined && answers[`q${q.id}`] !== null) {
            answeredInSec++;
          }
        });
      }
    });

    if (totalInSec === 0) return 0;
    return Math.round((answeredInSec / totalInSec) * 100);
  };

  const isSectionCompleted = (secKey) => {
    return completedSections.includes(secKey);
  };

  const answeredCount = Object.values(answers).filter((val) => val !== null && val !== undefined).length;

  const handleSelectOption = (questionId, optionId) => {
    if (isSectionCompleted(activeSectionKey)) return;
    setAnswers((prev) => ({
      ...prev,
      [`q${questionId}`]: optionId,
    }));
  };

  const toggleFlag = (stepNum) => {
    if (stepNum === 0) return;
    setFlagged((prev) => ({
      ...prev,
      [`q${stepNum}`]: !prev[`q${stepNum}`],
    }));
  };

  const goToStep = (stepNum) => {
    if (stepNum === 0) {
      pauseAllAudio();
      setCurrentStep(0);
      return;
    }
    const targetStep = steps[stepNum - 1];
    if (targetStep && targetStep.section === activeSectionKey && !isSectionCompleted(targetStep.section)) {
      pauseAllAudio();
      setCurrentStep(stepNum);
    }
  };

  const finishCurrentSection = () => {
    const currentSec = activeSectionKey;
    if (currentSec && currentSec !== 'intro' && !completedSections.includes(currentSec)) {
      setCompletedSections((prev) => [...prev, currentSec]);
    }

    const currentIdx = ORDERED_SECTION_KEYS.indexOf(currentSec);
    let nextStep = null;
    if (currentIdx !== -1) {
      for (let i = currentIdx + 1; i < ORDERED_SECTION_KEYS.length; i++) {
        const secKey = ORDERED_SECTION_KEYS[i];
        const step = getFirstStepForSection(secKey);
        if (step !== null) {
          nextStep = step;
          break;
        }
      }
    }

    if (nextStep !== null) {
      pauseAllAudio();
      setCurrentStep(nextStep);
    } else {
      setShowUnansweredModal(true);
    }
  };

  const nextStep = () => {
    pauseAllAudio();
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const currentSec = activeSectionKey;
    const lastStepInSec = getLastStepForSection(currentSec);

    if (lastStepInSec !== null && currentStep === lastStepInSec) {
      finishCurrentSection();
    } else if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    pauseAllAudio();
    const currentSec = activeSectionKey;
    const firstStepInSec = getFirstStepForSection(currentSec);

    if (firstStepInSec !== null && currentStep > firstStepInSec) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    pauseAllAudio();
    executeSubmission('Time Expired - Evaluating Results...');
  };

  const handleManualSubmit = () => {
    setShowUnansweredModal(false);
    pauseAllAudio();
    executeSubmission('Evaluating Exam Results...');
  };

  const executeSubmission = async (loadingMessage) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoadingOverlayText(loadingMessage || 'Evaluating Exam Results...');

    // Convert answers format from { q12: 45 } to { '12': 45 }
    const cleanedAnswers = {};
    Object.entries(answers).forEach(([k, v]) => {
      const qId = k.replace('q', '');
      if (v !== null && v !== undefined) {
        cleanedAnswers[qId] = v;
      }
    });

    try {
      const res = await submitQuiz(params.id, cleanedAnswers);
      if (res?.attempt_id) {
        router.push(`/attempt/${res.attempt_id}`);
      }
    } catch (err) {
      alert(err.message || 'Submission failed. Please try again.');
      setIsSubmitting(false);
      setLoadingOverlayText(null);
    }
  };

  const formatTimer = (seconds) => {
    if (seconds === null) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">Loading CBT Examination...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          ⚠
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Test not found'}</h2>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl"
        >
          Back to Portal
        </button>
      </div>
    );
  }

  const activeSectionSteps = steps.filter((s) => s.section === activeSectionKey);
  const currentSectionStepNum = currentStepData
    ? activeSectionSteps.findIndex((s) => s === currentStepData) + 1
    : 1;
  const totalStepsInSection = activeSectionSteps.length;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen m-0 p-0 overflow-hidden font-sans text-slate-900 bg-white flex flex-col justify-between select-none">
      {/* ==========================================
           TOP HEADER 1: BLACK BAR (Section & Timer)
           ========================================== */}
      <header className="bg-black text-white min-h-[2.5rem] py-1.5 px-3 sm:px-4 flex items-center justify-between gap-2 border-b border-slate-800 text-xs font-sans flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="font-bold whitespace-nowrap bg-slate-800 px-2 py-0.5 rounded text-[11px] sm:text-xs">
            Q {currentStep === 0 ? 'Intro' : `${currentSectionStepNum}/${totalStepsInSection}`}
          </span>
          <span className="truncate text-slate-200 text-[11px] sm:text-xs">
            Sec: <span className="font-bold text-white">{activeSectionName}</span>
          </span>
        </div>


        {/* Timer & Section Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
            <svg
              className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-mono font-bold text-white">{formatTimer(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={finishCurrentSection}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded text-[10px] sm:text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Finish Sec
          </button>
        </div>
      </header>

      {/* ==========================================
           TOP HEADER 2: OLIVE GREEN BAR (Test Title & Candidate)
           ========================================== */}
      <div className="bg-[#6B9E2B] text-white min-h-[1.75rem] py-1 px-3 sm:px-4 flex items-center justify-between text-[11px] sm:text-xs font-bold flex-shrink-0 truncate shadow-xs">
        <div className="truncate mr-2 flex items-center gap-1.5">
          <span className="truncate font-semibold">{test.title}</span>
          {test.is_published === false && (
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] uppercase font-black rounded flex-shrink-0 shadow-xs border border-amber-500">
              🔒 Draft Preview (Staff Only)
            </span>
          )}
          {test.is_actual_exam_demo && (
            <span className="px-1.5 py-0.5 bg-white text-slate-900 text-[9px] sm:text-[10px] uppercase font-extrabold rounded flex-shrink-0">
              Demo
            </span>
          )}
        </div>
        <div className="whitespace-nowrap text-[10px] sm:text-xs text-lime-100">
          <span className="font-semibold">{user?.username || 'Candidate'}</span>
        </div>
      </div>


      {/* ==========================================
           MAIN CONTENT AREA: RESPONSIVE SIDEBAR + CANVAS
           ========================================== */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <aside className="w-24 sm:w-36 bg-white border-r border-[#E2E8F0] h-full flex flex-row p-1 sm:p-1.5 gap-1 sm:gap-1.5 flex-shrink-0 select-none overflow-hidden">
          {/* Sub-Column 1: Section Tabs with vertical progress fill */}
          <div className="w-8 sm:w-11 h-full flex flex-col justify-between gap-1 sm:gap-1.5 flex-shrink-0 font-sans py-0.5">
            {/* Section 0: Intro (Visible in Actual Exam Demo) */}
            {test.is_actual_exam_demo && (
              <div
                onClick={() => goToStep(0)}
                className={`flex-1 bg-white border p-0.5 sm:p-1 flex flex-col items-center justify-between text-[9px] sm:text-[11px] text-slate-800 transition-colors cursor-pointer ${
                  currentStep === 0 ? 'border-2 border-[#6B9E2B] font-bold shadow-xs' : 'border-[#C5C5C5]'
                }`}
              >
                <span className="leading-none pt-0.5 font-semibold text-center">Intro</span>
                <div className="w-2 sm:w-2.5 flex-1 my-1 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-[#6B9E2B] transition-all duration-300"
                    style={{ height: currentStep === 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            )}

            {/* Section 1: Script and Vocabulary */}
            <div
              className={`flex-1 bg-white border p-0.5 sm:p-1 flex flex-col items-center justify-between text-[9px] sm:text-[11px] text-slate-800 transition-colors relative ${
                activeSectionKey === 'script_vocab' ? 'border-2 border-[#6B9E2B] font-bold shadow-xs' : 'border-[#C5C5C5]'
              }`}
            >
              <span className="leading-none pt-0.5 text-center">{SECTION_SHORT_LABELS.script_vocab}</span>
              {isSectionCompleted('script_vocab') && (
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold" title="Section Locked">
                  🔒
                </span>
              )}
              <div className="w-2 sm:w-2.5 flex-1 my-1 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-[#6B9E2B] transition-all duration-300"
                  style={{ height: `${getSectionFill('script_vocab')}%` }}
                ></div>
              </div>
            </div>

            {/* Section 2: Conversation and Expression */}
            <div
              className={`flex-1 bg-white border p-0.5 sm:p-1 flex flex-col items-center justify-between text-[9px] sm:text-[11px] text-slate-800 transition-colors relative ${
                activeSectionKey === 'conversation' ? 'border-2 border-[#6B9E2B] font-bold shadow-xs' : 'border-[#C5C5C5]'
              }`}
            >
              <span className="leading-none pt-0.5 text-center">{SECTION_SHORT_LABELS.conversation}</span>
              {isSectionCompleted('conversation') && (
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold" title="Section Locked">
                  🔒
                </span>
              )}
              <div className="w-2 sm:w-2.5 flex-1 my-1 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-[#6B9E2B] transition-all duration-300"
                  style={{ height: `${getSectionFill('conversation')}%` }}
                ></div>
              </div>
            </div>

            {/* Section 3: Listening Comprehension */}
            <div
              className={`flex-1 bg-white border p-0.5 sm:p-1 flex flex-col items-center justify-between text-[9px] sm:text-[11px] text-slate-800 transition-colors relative ${
                activeSectionKey === 'listening' ? 'border-2 border-[#6B9E2B] font-bold shadow-xs' : 'border-[#C5C5C5]'
              }`}
            >
              <span className="leading-none pt-0.5 text-center">{SECTION_SHORT_LABELS.listening}</span>
              {isSectionCompleted('listening') && (
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold" title="Section Locked">
                  🔒
                </span>
              )}
              <div className="w-2 sm:w-2.5 flex-1 my-1 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-[#6B9E2B] transition-all duration-300"
                  style={{ height: `${getSectionFill('listening')}%` }}
                ></div>
              </div>
            </div>

            {/* Section 4: Reading Comprehension */}
            <div
              className={`flex-1 bg-white border p-0.5 sm:p-1 flex flex-col items-center justify-between text-[9px] sm:text-[11px] text-slate-800 transition-colors relative ${
                activeSectionKey === 'reading' ? 'border-2 border-[#6B9E2B] font-bold shadow-xs' : 'border-[#C5C5C5]'
              }`}
            >
              <span className="leading-none pt-0.5 text-center">{SECTION_SHORT_LABELS.reading}</span>
              {isSectionCompleted('reading') && (
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold" title="Section Locked">
                  🔒
                </span>
              )}
              <div className="w-2 sm:w-2.5 flex-1 my-1 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-[#6B9E2B] transition-all duration-300"
                  style={{ height: `${getSectionFill('reading')}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sub-Column 2: Question List for Active Section */}
          <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-0.5">
            {/* Section 0: Intro Tab */}
            {test.is_actual_exam_demo && activeSectionKey === 'intro' && (
              <button
                type="button"
                onClick={() => goToStep(0)}
                className={`w-full h-8 text-[11px] font-bold flex items-center justify-center border transition-colors shadow-2xs cursor-pointer ${
                  currentStep === 0
                    ? 'cbt-chevron-tab'
                    : 'bg-white text-slate-800 border-[#CCCCCC] hover:bg-slate-50'
                }`}
              >
                Intro
              </button>
            )}

            {/* Dynamic Question Step Tabs for Active Section (Starting from 1 in each section) */}
            {(() => {
              const activeSectionSteps = steps.filter((s) => s.section === activeSectionKey);
              return activeSectionSteps.map((step, sectionIdx) => {
                const globalStepNum = steps.indexOf(step) + 1;
                const sectionStepNum = sectionIdx + 1;

                const isAnswered = step.questions.every(
                  (q) => answers[`q${q.id}`] !== undefined && answers[`q${q.id}`] !== null
                );
                const isActive = currentStep === globalStepNum;
                const isLocked = isSectionCompleted(step.section);

                return (
                  <button
                    key={globalStepNum}
                    type="button"
                    onClick={() => goToStep(globalStepNum)}
                    disabled={isLocked}
                    className={`w-full h-7 sm:h-8 text-xs font-black flex items-center justify-between px-1.5 transition-all shadow-2xs relative disabled:opacity-50 cursor-pointer ${
                      isActive
                        ? 'cbt-chevron-tab'
                        : 'cbt-tab-green opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span className="flex items-center gap-0.5">
                      <span>{sectionStepNum}</span>
                    </span>
                    {isAnswered && <span className="text-[10px] font-extrabold text-amber-300">✓</span>}
                  </button>
                );
              });
            })()}
          </div>
        </aside>


        {/* Right Main Canvas Area */}
        <main className="flex-1 bg-white h-full overflow-y-auto p-3 sm:p-6 text-slate-900 font-sans">
          {/* SECTION 0: INTRO CANVAS (Demo only) */}
          {test.is_actual_exam_demo && currentStep === 0 && (
            <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
              <div className="border-2 border-black p-4 sm:p-6 bg-slate-50 space-y-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-300 pb-2">
                  Welcome to Japan Foundation Test for Basic Japanese (JFT-Basic) CBT Simulation
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-800">
                  This simulated CBT exam strictly follows official Prometric testing standards. You will complete 4 sections in sequential order.
                </p>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      pauseAllAudio();
                      setCurrentStep(1);
                    }}
                    className="bg-[#6B9E2B] hover:bg-[#5A8226] text-white font-extrabold px-6 py-2.5 rounded shadow-sm text-sm active:scale-95 cursor-pointer"
                  >
                    Start Examination &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTIONS 1..4 QUESTION CANVASES */}
          {currentStep > 0 && currentStepData && (
            <div className="max-w-4xl mx-auto space-y-4 pb-12 sm:pb-0 animate-fade-in">
              {/* Official Light-Blue Prompt Box Container */}
              <div className="bg-[#EBF6FF] border border-[#C5E1F5] p-4 sm:p-6 rounded-xs space-y-3 shadow-2xs">
                {currentStepData.group?.instruction && (
                  <div
                    className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderUnderline(currentStepData.group.instruction) }}
                  />
                )}
                {!currentStepData.group && currentStepData.questions[0]?.resolved_instruction && (
                  <div
                    className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderUnderline(currentStepData.questions[0].resolved_instruction),
                    }}
                  />
                )}
                {!currentStepData.group && currentStepData.questions[0]?.prompt && (
                  <div
                    className="text-lg sm:text-2xl font-bold text-slate-950 leading-relaxed font-sans tracking-wide"
                    dangerouslySetInnerHTML={{ __html: formatPrompt(currentStepData.questions[0].prompt) }}
                  />
                )}
              </div>

              {/* Translation Helper Button */}
              <div className="flex items-center gap-2.5 my-2">
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(true)}
                  className="inline-flex items-center justify-between gap-3 text-xs font-semibold bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#A0A0A0] text-slate-900 px-3 py-1.5 rounded-xs shadow-2xs cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-xs">🌐</span>
                    <span>Your Language</span>
                  </span>
                  <span className="text-slate-600 text-xs">↗</span>
                </button>
              </div>

              {/* Shared Group Image or Standalone Question Image */}
              {currentStepData.group?.image_url ? (
                <div className="my-3 sm:my-4 flex justify-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentStepData.group.image_url}
                    alt="Shared passage illustration"
                    className="max-h-64 sm:max-h-96 w-auto object-contain rounded border border-slate-300 shadow-xs"
                  />
                </div>
              ) : currentStepData.questions[0]?.image_url ? (
                <div className="my-3 sm:my-4 flex justify-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentStepData.questions[0].image_url}
                    alt="Question illustration"
                    className="max-h-56 sm:max-h-80 w-auto object-contain rounded border border-slate-200 shadow-xs"
                  />
                </div>
              ) : null}

              {/* Shared Group Audio or Standalone Question Audio */}
              {currentStepData.group?.audio_url ? (
                <div className="my-3 sm:my-4 p-3 bg-slate-900 text-white rounded-xl max-w-md shadow-xs">
                  <audio controls src={currentStepData.group.audio_url} className="w-full h-9"></audio>
                </div>
              ) : currentStepData.questions[0]?.audio_url ? (
                <div className="my-3 sm:my-4 p-3 bg-slate-900 text-white rounded-xl max-w-md shadow-xs">
                  <audio controls src={currentStepData.questions[0].audio_url} className="w-full h-9"></audio>
                </div>
              ) : null}

              {/* Sub-Questions List & Options */}
              <div className="space-y-6 pt-2">
                {currentStepData.questions.map((question, qIdx) => (
                  <div key={question.id} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                    {currentStepData.group && question.prompt && (
                      <div className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed font-sans border-b border-slate-200/60 pb-2">
                        {currentStepData.questions.length > 1 && (
                          <span className="inline-block bg-[#6B9E2B] text-white text-xs px-2 py-0.5 rounded font-extrabold mr-2">
                            Question {qIdx + 1}
                          </span>
                        )}
                        <span dangerouslySetInnerHTML={{ __html: formatPrompt(question.prompt) }} />
                      </div>
                    )}

                    {/* Choice Boxes */}
                    <div className="space-y-3 pt-1">
                      {question.options.map((option) => {
                        const isSelected = answers[`q${question.id}`] === option.id;
                        const isLocked = isSectionCompleted(question.section);

                        return (
                          <label
                            key={option.id}
                            onClick={() => handleSelectOption(question.id, option.id)}
                            className={`cbt-choice-box block relative rounded-xl transition-all ${
                              isLocked ? 'pointer-events-none opacity-80' : 'cursor-pointer'
                            }`}
                            style={
                              isSelected
                                ? { backgroundColor: '#FFE6D5', borderColor: '#D97706', borderWidth: '2px' }
                                : {}
                            }
                          >
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option.id}
                              checked={isSelected}
                              onChange={() => handleSelectOption(question.id, option.id)}
                              className="sr-only"
                            />
                            <div className="w-full h-full font-bold flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {option.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={option.image_url}
                                  alt="Option illustration"
                                  className="max-h-28 sm:max-h-36 w-auto object-contain rounded border border-slate-300 bg-white p-1 flex-shrink-0"
                                />
                              )}
                              {option.label && <span className="leading-snug">{option.label}</span>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
           BOTTOM CONTROL FOOTER: BLACK BAR
           ========================================== */}
      <footer className="bg-black text-white min-h-[3.25rem] py-1.5 px-3 sm:px-4 flex items-center justify-between border-t border-black text-xs font-bold flex-shrink-0 select-none z-30">
        {/* Left: CBT Control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">CBT Control</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Flag Button */}
          <button
            type="button"
            onClick={() => toggleFlag(currentStep)}
            className="bg-[#6B9E2B] hover:bg-[#5A8226] text-white px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-lg flex items-center gap-1 shadow-xs text-xs font-extrabold active:scale-95 whitespace-nowrap cursor-pointer"
          >
            🚩 <span>{flagged[`q${currentStep}`] ? 'Flagged' : 'Flag'}</span>
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={
              currentStep === 0 ||
              (getFirstStepForSection(activeSectionKey) !== null &&
                currentStep === getFirstStepForSection(activeSectionKey))
            }
            className="bg-[#6B9E2B] hover:bg-[#5A8226] text-white px-3.5 py-2 sm:px-4 sm:py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-40 shadow-xs text-xs font-extrabold active:scale-95 whitespace-nowrap cursor-pointer"
          >
            &lt; Back
          </button>

          {/* Next Button */}
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={nextStep}
              className="bg-[#6B9E2B] hover:bg-[#5A8226] text-white px-4 py-2 sm:px-5 sm:py-1.5 rounded-lg flex items-center gap-1 shadow-xs text-xs font-extrabold active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <span>
                {currentStep === 0
                  ? 'Start Exam >'
                  : currentStep === getLastStepForSection(activeSectionKey)
                  ? 'Finish Sec >'
                  : 'Next >'}
              </span>
            </button>
          )}

          {/* Finish / Submit Button */}
          {currentStep === totalSteps && (
            <button
              type="button"
              onClick={() => setShowUnansweredModal(true)}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-black px-4 py-2 sm:px-5 sm:py-1.5 rounded-lg flex items-center gap-1 shadow-xs text-xs active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Finish &gt;
            </button>
          )}
        </div>
      </footer>

      {/* =========================================================================
           MULTI-LANGUAGE TRANSLATION MODAL OVERLAY (10 LANGUAGES)
           ========================================================================= */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 bg-black/60 animate-fade-in">
          <div className="bg-white max-w-2xl sm:max-w-3xl w-full border-2 border-black shadow-2xl overflow-hidden font-sans text-slate-900">
            {/* Modal Black Title Bar */}
            <div className="bg-black text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between select-none">
              <h3 className="text-xs sm:text-sm font-bold tracking-wide">Your Language Instructions</h3>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="text-white hover:text-amber-300 font-bold text-base px-2 py-0.5 cursor-pointer"
              >
                ✖
              </button>
            </div>

            {/* Multi-Language Translation Table */}
            <div className="p-0 overflow-x-auto max-h-[75vh]">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <tbody>
                  {LANGUAGES_LIST.map((langItem) => {
                    const text =
                      currentQuestionTranslations[langItem.key] ||
                      (langItem.altKey && currentQuestionTranslations[langItem.altKey]) ||
                      '—';
                    return (
                      <tr key={langItem.key} className="border-b border-slate-300 hover:bg-slate-50">
                        <td className="w-28 sm:w-40 p-2 sm:p-3 font-bold text-slate-900 bg-slate-100 border-r border-slate-300 align-top">
                          {langItem.label}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-800 leading-relaxed align-top">{text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Close Action */}
            <div className="p-2.5 sm:p-3 bg-slate-100 border-t border-slate-300 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           UNANSWERED QUESTIONS ALERT MODAL
           ========================================================================= */}
      {showUnansweredModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl border border-slate-400 font-sans">
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Finish Exam &amp; Submit</h3>
              {totalQuestions - answeredCount > 0 ? (
                <p className="text-xs text-slate-700 leading-relaxed">
                  You have{' '}
                  <span className="font-bold text-red-600">{totalQuestions - answeredCount}</span>{' '}
                  unanswered question(s) remaining out of{' '}
                  <span className="font-bold">{totalQuestions}</span> total questions. Do you want to finish and submit your exam results now?
                </p>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed">
                  You have answered all <span className="font-bold text-emerald-600">{totalQuestions}</span> questions! Are you sure you want to finish and submit your exam results now?
                </p>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnansweredModal(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 rounded cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="flex-1 py-2 bg-[#6B9E2B] text-white font-bold text-xs hover:bg-[#5A8226] rounded cursor-pointer"
              >
                Finish &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Animated Evaluation Loading Overlay */}
      <GlobalLoader
        visible={Boolean(loadingOverlayText)}
        title={loadingOverlayText || 'Evaluating Exam Results...'}
        subtitle="Submitting your answers, calculating official scale scores and performance breakdown..."
      />
    </div>
  );
}


'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Bell,
  Calendar,
  User,
  Settings,
  Search,
  Play,
  PlayCircle,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Send,
  GraduationCap,
  Award,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Building2,
  FileText,
  Video,
  Menu,
  X,
  LogIn,
  ShieldCheck,
  Loader2,
  Trophy,
  Eye,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import {
  getStudentPortal,
  getMyResults,
  updateStudentLessonProgress,
  getCourseDiscussions,
  postCourseDiscussion,
  updateUserProfile,
} from '@/lib/api';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'results', label: 'Exam Results', icon: Award },
  { id: 'resources', label: 'Resources', icon: Bookmark },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'notices', label: 'Academy Notices', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TARGET_EXAM_OPTIONS = [
  { value: 'jft_basic', label: 'JFT-Basic (A2 Standard)' },
  { value: 'ssw_nursing', label: 'SSW: Nursing Care (介護)' },
  { value: 'ssw_food', label: 'SSW: Food Service (外食業)' },
  { value: 'ssw_agriculture', label: 'SSW: Agriculture (農業)' },
  { value: 'ssw_construction', label: 'SSW: Construction (建設業)' },
  { value: 'ssw_manufacturing', label: 'SSW: Manufacturing (製造業)' },
  { value: 'ssw_accommodation', label: 'SSW: Accommodation (宿泊業)' },
  { value: 'jlpt_n4', label: 'JLPT N4' },
  { value: 'jlpt_n3', label: 'JLPT N3' },
  { value: 'other', label: 'Other Examination' },
];

const JAPANESE_LEVEL_OPTIONS = [
  { value: 'n5', label: 'Beginner (N5 / A1)' },
  { value: 'n4', label: 'Elementary (N4 / A2)' },
  { value: 'n3', label: 'Intermediate (N3 / B1)' },
  { value: 'n2', label: 'Upper Intermediate (N2 / B2)' },
  { value: 'n1', label: 'Advanced (N1 / C1)' },
];

const STUDY_LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ne', label: 'नेपाली (Nepali)' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'tl', label: 'Tagalog' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

function formatDuration(mins) {
  const m = Number(mins || 0);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function UnenrolledNoticeCard({ title, message, compact = false }) {
  return (
    <div
      className={`rounded-2xl bg-[#EAF4F4]/55 dark:bg-slate-900/80 border border-dashed border-[#8CC7C4] dark:border-slate-700 text-center ${
        compact ? 'p-5 space-y-2.5' : 'p-8 sm:p-10 space-y-3.5'
      }`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-[#2C687B] dark:text-[#8CC7C4] flex items-center justify-center mx-auto shadow-2xs">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
          {title || 'Not Connected to an Academy Yet'}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {message ||
            'You have not purchased any academy course or connected with a Sensei yet. Join a partner Japanese academy to unlock video courses, live class schedules, and Sensei study materials — or practice for free using Gakkou Mock Tests & Lessons.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <Link
          href="/partners"
          className="px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black transition inline-flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" /> Browse Partner Academies
        </Link>
        <Link
          href="/lessons"
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-[#2C687B] dark:text-[#8CC7C4] hover:bg-[#EAF4F4] text-xs font-black transition"
        >
          Explore Free Lessons
        </Link>
        <Link
          href="/jft-basic"
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-black transition"
        >
          Free JFT Mock Tests
        </Link>
      </div>
    </div>
  );
}

export default function StudentPortalPage() {
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();

  const [portal, setPortal] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'courses') setSelectedCourseId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tabId && tabId !== 'dashboard') {
        url.searchParams.set('tab', tabId);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Support deep linking via ?tab=profile|results|courses|resources|schedule|notices|settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const tab = (sp.get('tab') || '').toLowerCase();
    const valid = SIDEBAR_ITEMS.map((i) => i.id);
    if (valid.includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Dashboard course filter
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'ongoing' | 'completed'
  const [courseCatFilter, setCourseCatFilter] = useState('all');

  // Video Course Player state
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [playerSubTab, setPlayerSubTab] = useState('overview'); // 'overview' | 'resources' | 'discussion'
  const [discussions, setDiscussions] = useState([]);
  const [discussionInput, setDiscussionInput] = useState('');
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [progressBusy, setProgressBusy] = useState(false);

  // Resources state
  const [resourceCat, setResourceCat] = useState('all');
  const [activeNoteModal, setActiveNoteModal] = useState(null);

  // Calendar & Personal Study Tasks (localStorage)
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [personalTasks, setPersonalTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('08:00 PM');

  // Profile Edit state
  const [profUsername, setProfUsername] = useState('');
  const [profFirst, setProfFirst] = useState('');
  const [profLast, setProfLast] = useState('');
  const [profCountry, setProfCountry] = useState('');
  const [profLocation, setProfLocation] = useState('');
  const [profTargetExam, setProfTargetExam] = useState('jft_basic');
  const [profJpLevel, setProfJpLevel] = useState('n4');
  const [profBio, setProfBio] = useState('');
  const [profSaving, setProfSaving] = useState(false);

  // Settings state (localStorage)
  const [settingsSubTab, setSettingsSubTab] = useState('notifications');
  const [prefs, setPrefs] = useState({
    studyLang: 'en',
    examNotices: true,
    senseiAnnouncements: true,
    dailyReminder: true,
    courseUpdates: true,
  });

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  // Load saved personal tasks & settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTasks = JSON.parse(localStorage.getItem('gns_portal_personal_tasks') || '[]');
      if (Array.isArray(savedTasks)) setPersonalTasks(savedTasks);
      const savedPrefs = JSON.parse(localStorage.getItem('gns_portal_prefs') || 'null');
      if (savedPrefs && typeof savedPrefs === 'object') {
        setPrefs((p) => ({ ...p, ...savedPrefs }));
      }
      const savedLang = localStorage.getItem('gns_study_lang');
      if (savedLang) setPrefs((p) => ({ ...p, studyLang: savedLang }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadPortal = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [res, myRes] = await Promise.all([
        getStudentPortal(),
        getMyResults().catch(() => null),
      ]);
      setPortal(res);
      if (myRes) setResultsData(myRes);
      if (res?.student) {
        setProfUsername(res.student.username || '');
        setProfFirst(res.student.first_name || '');
        setProfLast(res.student.last_name || '');
        setProfCountry(res.student.country || '');
        setProfLocation(res.student.location || '');
        setProfTargetExam(res.student.target_exam || 'jft_basic');
        setProfJpLevel(res.student.japanese_level || 'n4');
        setProfBio(res.student.bio || '');
      }
    } catch {
      setPortal(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadPortal();
    }
  }, [authLoading, isAuthenticated, loadPortal]);

  const courses = useMemo(() => portal?.courses || [], [portal]);
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  // Flat lessons of selected course
  const flatLessons = useMemo(() => {
    if (!selectedCourse) return [];
    const list = [];
    for (const m of selectedCourse.modules || []) {
      for (const l of m.lessons || []) {
        list.push({ ...l, moduleTitle: m.title });
      }
    }
    return list;
  }, [selectedCourse]);

  const activeLesson = useMemo(
    () => flatLessons.find((l) => l.id === activeLessonId) || flatLessons[0] || null,
    [flatLessons, activeLessonId]
  );

  // Load discussions when opening a course
  useEffect(() => {
    if (!selectedCourse?.id) return;
    getCourseDiscussions(selectedCourse.id)
      .then((res) => setDiscussions(res?.discussions || []))
      .catch(() => setDiscussions([]));
  }, [selectedCourse?.id]);

  const openCoursePlayer = (course) => {
    setSelectedCourseId(course.id);
    setActiveTab('courses');
    setPlayerSubTab('overview');
    const firstMod = course.modules?.[0];
    if (firstMod) {
      setExpandedModules({ [firstMod.id]: true });
      const firstUnfinished = (course.modules || [])
        .flatMap((m) => m.lessons || [])
        .find((l) => !l.is_completed);
      setActiveLessonId(firstUnfinished?.id || firstMod.lessons?.[0]?.id || null);
    } else {
      setActiveLessonId(null);
    }
  };

  const handleToggleLessonComplete = async (lesson) => {
    if (!lesson || progressBusy) return;
    setProgressBusy(true);
    try {
      const nextDone = !lesson.is_completed;
      await updateStudentLessonProgress(lesson.id, { isCompleted: nextDone });
      showToast(nextDone ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.');
      await loadPortal(true);
    } catch (err) {
      showToast(err?.message || 'Could not update progress.');
    } finally {
      setProgressBusy(false);
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !discussionInput.trim() || postingDiscussion) return;
    setPostingDiscussion(true);
    try {
      const created = await postCourseDiscussion(selectedCourse.id, {
        message: discussionInput.trim(),
        lessonId: activeLesson?.id || null,
      });
      setDiscussions((prev) => [created, ...prev]);
      setDiscussionInput('');
      showToast('Question posted to course discussion!');
    } catch (err) {
      showToast(err?.message || 'Unable to post message.');
    } finally {
      setPostingDiscussion(false);
    }
  };

  const handleAddPersonalTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      time: newTaskTime.trim() || '08:00 PM',
      done: false,
    };
    const next = [item, ...personalTasks].slice(0, 20);
    setPersonalTasks(next);
    setNewTaskTitle('');
    try {
      localStorage.setItem('gns_portal_personal_tasks', JSON.stringify(next));
    } catch {}
    showToast('Personal study task added!');
  };

  const handleDeletePersonalTask = (id) => {
    const next = personalTasks.filter((t) => t.id !== id);
    setPersonalTasks(next);
    try {
      localStorage.setItem('gns_portal_personal_tasks', JSON.stringify(next));
    } catch {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfSaving(true);
    try {
      await updateUserProfile({
        username: profUsername.trim(),
        first_name: profFirst.trim(),
        last_name: profLast.trim(),
        country: profCountry.trim(),
        location: profLocation.trim(),
        target_exam: profTargetExam,
        japanese_level: profJpLevel,
        bio: profBio.trim(),
      });
      if (refreshUser) await refreshUser();
      await loadPortal(true);
      showToast('Profile saved successfully!');
    } catch (err) {
      showToast(err?.message || 'Failed to save profile.');
    } finally {
      setProfSaving(false);
    }
  };

  const savePref = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      localStorage.setItem('gns_portal_prefs', JSON.stringify(next));
      if (patch.studyLang) localStorage.setItem('gns_study_lang', patch.studyLang);
    } catch {}
    showToast('Settings saved.');
  };

  // Calendar grid helper
  const calendarData = useMemo(() => {
    const y = calMonth.getFullYear();
    const m = calMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const eventDates = new Set((portal?.schedule || []).map((ev) => ev.event_date));
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, iso, hasEvent: eventDates.has(iso) });
    }
    return {
      monthLabel: calMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      todayIso: new Date().toISOString().slice(0, 10),
      cells,
    };
  }, [calMonth, portal?.schedule]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      if (courseFilter === 'ongoing' && c.status === 'completed') return false;
      if (courseFilter === 'completed' && c.status !== 'completed') return false;
      if (courseCatFilter !== 'all' && c.category !== courseCatFilter) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.instructor_name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [courses, courseFilter, courseCatFilter, searchQuery]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    const list = portal?.resources || [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((r) => {
      if (resourceCat !== 'all' && r.category !== resourceCat) return false;
      if (q && !r.title.toLowerCase().includes(q) && !(r.content || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [portal?.resources, resourceCat, searchQuery]);

  // SVG Wave chart path from 7-day weekly_activity
  const waveChart = useMemo(() => {
    const pts = portal?.stats?.weekly_activity || [
      { day: 'Sat', tasks: 0 },
      { day: 'Sun', tasks: 0 },
      { day: 'Mon', tasks: 0 },
      { day: 'Tue', tasks: 0 },
      { day: 'Wed', tasks: 0 },
      { day: 'Thu', tasks: 0 },
      { day: 'Fri', tasks: 0 },
    ];
    const maxVal = Math.max(4, ...pts.map((p) => p.tasks));
    const width = 320;
    const height = 110;
    const coords = pts.map((p, idx) => {
      const x = 16 + (idx * (width - 32)) / Math.max(1, pts.length - 1);
      const y = height - 18 - (p.tasks / maxVal) * (height - 36);
      return { x, y, ...p };
    });
    let d = '';
    coords.forEach((pt, idx) => {
      if (idx === 0) {
        d += `M ${pt.x} ${pt.y}`;
      } else {
        const prev = coords[idx - 1];
        const cx = (prev.x + pt.x) / 2;
        d += ` C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
      }
    });
    const peak = coords.reduce((best, cur) => (cur.tasks >= best.tasks ? cur : best), coords[0]);
    return { coords, d, peak, width, height };
  }, [portal?.stats?.weekly_activity]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] bg-[#FFFFFF] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#DB1A1A] mx-auto" />
          <p className="text-sm font-black text-slate-700 dark:text-slate-300">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  // Guest / Not Logged In State
  if (!portal?.authenticated) {
    return (
      <div className="min-h-[80vh] bg-[#FFFFFF] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#CBE5E3] dark:border-slate-800 p-8 text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] text-[#DB1A1A] flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[11px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
              Gakkou Student Portal
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Sign In to Open Your Student Portal
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Watch your academy&apos;s video courses, track your weekly study activity, view live class schedules, and access Sensei resources in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/accounts/login?next=/student-portal"
              className="px-6 py-3 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-sm font-black inline-flex items-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
            <Link
              href="/accounts/signup"
              className="px-6 py-3 rounded-xl bg-[#EAF4F4] hover:bg-[#CBE5E3]/70 text-[#2C687B] text-sm font-black transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEnrolled = Boolean(portal.is_enrolled);
  const student = portal.student || {};
  const stats = portal.stats || {};
  const school = portal.school || null;
  const initials = (student.full_name || student.username || 'S')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#060913] text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#8CC7C4]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Resource Note Reader Modal */}
      {activeNoteModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveNoteModal(null)}
        >
          <div
            className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#EAF4F4] text-[#2C687B] text-[10px] font-black uppercase">
                  {activeNoteModal.category_label}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeNoteModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {activeNoteModal.content || 'Open the attached external study resource below.'}
            </div>
            {activeNoteModal.external_url && (
              <a
                href={activeNoteModal.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black"
              >
                Open Attached Resource <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto flex min-h-screen">
        {/* ===================================================================
            LEFT SIDEBAR (Desktop Sticky + Mobile Drawer)
           =================================================================== */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden lg:flex'
          } w-64 shrink-0 bg-[#FFFFFF] dark:bg-[#0b1120] border-r border-[#CBE5E3] dark:border-slate-800 flex-col justify-between p-5`}
        >
          <div className="space-y-6">
            {/* Portal Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DB1A1A] text-white flex items-center justify-center font-black shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    Gakkou Portal
                  </div>
                  <div className="text-[10px] font-bold text-[#2C687B] dark:text-[#8CC7C4]">
                    {isEnrolled && school ? school.name : 'Student Workspace'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      switchTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      active
                        ? 'bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A] border-l-4 border-[#DB1A1A]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.id === 'notices' && (portal.notices || []).length > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#DB1A1A] text-white text-[10px] font-black">
                        {portal.notices.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Academy Status Card */}
          <div className="rounded-2xl bg-[#EAF4F4]/70 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 p-4 space-y-2.5 mt-6">
            {isEnrolled && school ? (
              <>
                <div className="flex items-center gap-2 text-[#2C687B] dark:text-[#8CC7C4] text-[11px] font-black uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#DB1A1A]" /> Connected Academy
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                  {school.name}
                </div>
                {student.partner_batch && (
                  <div className="text-[11px] font-semibold text-slate-500">
                    Batch: {student.partner_batch}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  Not in an Academy?
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Connect with a Sensei or Partner School to unlock structured video courses.
                </p>
                <Link
                  href="/partners"
                  className="block text-center w-full py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black transition"
                >
                  Browse Academies
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* ===================================================================
            MAIN CONTENT AREA
           =================================================================== */}
        <main className="flex-1 min-w-0 px-3.5 pt-4 pb-24 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Top Portal Header */}
          <header className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4] lg:hidden truncate">
                {isEnrolled && school ? school.name : 'Gakkou Student Portal'}
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative hidden sm:block w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses or notes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 text-xs font-semibold outline-none focus:border-[#DB1A1A]"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className="hidden sm:inline-flex relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#DB1A1A] cursor-pointer"
                title="Academy Notices"
              >
                <Bell className="w-4 h-4" />
                {(portal.notices || []).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#DB1A1A] absolute top-2 right-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#2C687B] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 max-w-[110px] truncate hidden sm:inline">
                  {student.full_name}
                </span>
              </button>
            </div>
          </header>

          {/* Mobile 1-Tap Horizontal Portal Tabs (replaces duplicate hamburger on mobile) */}
          <nav className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-3.5 px-3.5 scrollbar-none">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap border transition cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#DB1A1A] text-white border-[#DB1A1A] shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'notices' && (portal.notices || []).length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        active ? 'bg-white text-[#DB1A1A]' : 'bg-[#DB1A1A] text-white'
                      }`}
                    >
                      {portal.notices.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Pending Academy Approval Banner (if student applied to a school) */}
          {portal.partner_status === 'pending' && school && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
              <span>
                ⏳ Your enrollment request for <strong>{school.name}</strong> is pending Sensei approval. Once approved, your academy courses and videos will unlock automatically!
              </span>
            </div>
          )}

          {/* =================================================================
              TAB 1: DASHBOARD (Estudy Layout in Gakkou Colors)
             ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Center Main Column */}
              <div className="xl:col-span-8 space-y-6">
                {/* Welcome Hero Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-[#2C687B] via-[#2C687B] to-[#DB1A1A] text-white p-6 sm:p-7 shadow-md relative overflow-hidden">
                  <div className="relative z-10 max-w-lg space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />{' '}
                      {isEnrolled && school ? school.name : 'Independent Learner Mode'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                      Hi, {student.first_name || student.username}!
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                      {isEnrolled
                        ? `You have completed ${stats.completed_lessons || 0} video lesson(s) and ${stats.total_attempts || 0} mock test(s). Keep your Japanese streak alive today!`
                        : `You have completed ${stats.total_attempts || 0} mock test(s) so far. Connect with a Partner Academy to unlock Sensei video courses, or continue practicing free exams!`}
                    </p>
                  </div>
                </div>

                {/* Stats Row: Horizontal Swipe Carousel on Mobile, 2-Col Grid on Desktop */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 -mx-3.5 px-3.5 pb-1 md:grid md:grid-cols-2 md:gap-5 md:mx-0 md:px-0 md:overflow-visible scrollbar-none">
                  {/* Learning Time Donut */}
                  <div className="min-w-[82vw] sm:min-w-[300px] md:min-w-0 snap-center rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 sm:p-5 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Learning Time</h3>
                      <span className="text-[11px] font-bold text-[#2C687B] dark:text-[#8CC7C4]">All Time</span>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="46" fill="none" stroke="#EAF4F4" strokeWidth="12" />
                          <circle
                            cx="60"
                            cy="60"
                            r="46"
                            fill="none"
                            stroke="#DB1A1A"
                            strokeWidth="12"
                            strokeDasharray="289"
                            strokeDashoffset={Math.max(40, 289 - Math.min(249, (stats.learning_time_minutes || 15) * 1.2))}
                            strokeLinecap="round"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="46"
                            fill="none"
                            stroke="#8CC7C4"
                            strokeWidth="12"
                            strokeDasharray="70 289"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {formatDuration(stats.learning_time_minutes || 0)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Logged</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#EAF4F4] dark:border-slate-800">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">Video</div>
                        <div className="text-xs font-black text-[#DB1A1A]">
                          {formatDuration(stats.time_breakdown?.video || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">Mock Tests</div>
                        <div className="text-xs font-black text-[#2C687B] dark:text-[#8CC7C4]">
                          {formatDuration(stats.time_breakdown?.mock_tests || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">Vocab</div>
                        <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                          {formatDuration(stats.time_breakdown?.vocab || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Activity Weekly Wave Chart */}
                  <div className="min-w-[82vw] sm:min-w-[300px] md:min-w-0 snap-center rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">My Activity</h3>
                      <span className="text-[11px] font-bold text-[#2C687B] dark:text-[#8CC7C4]">Last 7 Days</span>
                    </div>
                    <svg viewBox={`0 0 ${waveChart.width} ${waveChart.height}`} className="w-full h-32">
                      <path
                        d={waveChart.d}
                        fill="none"
                        stroke="#2C687B"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {waveChart.coords.map((pt) => (
                        <g key={pt.day}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.day === waveChart.peak?.day ? 5 : 3}
                            fill={pt.day === waveChart.peak?.day ? '#DB1A1A' : '#8CC7C4'}
                          />
                          <text
                            x={pt.x}
                            y={waveChart.height - 2}
                            textAnchor="middle"
                            className="fill-slate-400 text-[10px] font-bold"
                          >
                            {pt.day}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1 border-t border-[#EAF4F4] dark:border-slate-800">
                      <span>Avg Score: <strong className="text-[#DB1A1A]">{stats.avg_score_pct || 0}%</strong></span>
                      <span>Streak: <strong className="text-[#2C687B] dark:text-[#8CC7C4]">{student.game_streak || 0}d</strong></span>
                    </div>
                  </div>
                </div>

                {/* Assigned Academy Mock Exams (if Sensei assigned exams) */}
                {isEnrolled && (portal.assigned_exams || []).length > 0 && (
                  <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Assigned Academy Mock Exams ({portal.assigned_exams.length})
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EAF4F4] text-[#2C687B]">
                        From Sensei
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {portal.assigned_exams.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3.5 rounded-2xl bg-[#EAF4F4]/45 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {ex.title}
                            </div>
                            {ex.scheduled_date_label && (
                              <div className="text-[10px] font-semibold text-slate-500">
                                {ex.scheduled_date_label}
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/test/${ex.test_id}`}
                            className="px-3 py-1.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-[11px] font-black shrink-0"
                          >
                            Start Exam →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* My Courses List Card */}
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">My Courses</h3>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      {['all', 'ongoing', 'completed'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setCourseFilter(f)}
                          className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer ${
                            courseFilter === f
                              ? 'bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A]'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isEnrolled ? (
                    <UnenrolledNoticeCard
                      compact
                      title="No Enrolled Academy Courses Yet"
                      message="You have not bought any course or connected with any Japanese academy yet. Once your Sensei enrolls you, all structured video courses will appear right here."
                    />
                  ) : filteredCourses.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      Your Sensei hasn&apos;t published any courses in this filter yet. Check back soon!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredCourses.slice(0, 5).map((course) => (
                        <div
                          key={course.id}
                          className="rounded-2xl bg-[#F9FCFC] dark:bg-slate-900/70 border border-[#CBE5E3]/80 dark:border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A] flex items-center justify-center shrink-0">
                              <Video className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {course.title}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500">
                                By {course.instructor_name} • {course.lesson_count} Videos
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                                <span>Progress</span>
                                <span>{course.progress_pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#DB1A1A]"
                                  style={{ width: `${course.progress_pct}%` }}
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => openCoursePlayer(course)}
                              className="px-3.5 py-2 rounded-xl border border-[#CBE5E3] dark:border-slate-700 hover:bg-[#DB1A1A] hover:text-white hover:border-[#DB1A1A] text-xs font-black text-[#2C687B] dark:text-[#8CC7C4] transition cursor-pointer"
                            >
                              View Course
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Rail: Calendar + Upcoming Tasks + Recent Exam Scores */}
              <div className="xl:col-span-4 space-y-5">
                {/* Mini Calendar */}
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {calendarData.monthLabel}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                        className="p-1 rounded-lg hover:bg-[#EAF4F4] text-slate-500 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                        className="p-1 rounded-lg hover:bg-[#EAF4F4] text-slate-500 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[10px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
                    {calendarData.cells.map((cell, idx) =>
                      cell ? (
                        <div
                          key={cell.iso}
                          className={`py-1.5 rounded-xl relative ${
                            cell.iso === calendarData.todayIso
                              ? 'bg-[#DB1A1A] text-white font-black'
                              : cell.hasEvent
                              ? 'bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] font-black'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cell.day}
                          {cell.hasEvent && cell.iso !== calendarData.todayIso && (
                            <span className="w-1 h-1 rounded-full bg-[#DB1A1A] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
                          )}
                        </div>
                      ) : (
                        <div key={`empty-${idx}`} />
                      )
                    )}
                  </div>
                </div>

                {/* Upcoming Tasks & Classes */}
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Upcoming Schedule</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      className="text-[11px] font-extrabold text-[#DB1A1A] cursor-pointer"
                    >
                      See all
                    </button>
                  </div>
                  {!isEnrolled && personalTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      No academy classes scheduled yet (not connected to an academy). You can add personal study tasks in the Schedule tab.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {(portal.schedule || []).slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-2xl bg-[#EAF4F4]/50 dark:bg-slate-900 border border-[#CBE5E3]/70 dark:border-slate-800 flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#2C687B] text-white flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {ev.title}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              {ev.event_date} • {ev.start_time_label}
                            </div>
                          </div>
                        </div>
                      ))}
                      {personalTasks.slice(0, 2).map((tk) => (
                        <div
                          key={tk.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#DB1A1A]/10 text-[#DB1A1A] flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {tk.title}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              Personal Task • {tk.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Mock Exam Scores (Replaces Payment History) */}
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Exam Scores</h3>
                    <button
                      type="button"
                      onClick={() => switchTab('results')}
                      className="text-[11px] font-extrabold text-[#DB1A1A] cursor-pointer"
                    >
                      See all
                    </button>
                  </div>
                  {(portal.recent_exams || []).length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No mock exams attempted yet. Try a{' '}
                      <Link href="/jft-basic" className="text-[#DB1A1A] font-bold underline">
                        JFT-Basic Mock Test
                      </Link>
                      !
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {portal.recent_exams.slice(0, 4).map((ex) => (
                        <Link
                          key={ex.id}
                          href={ex.href}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-[#EAF4F4]/60 transition"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {ex.title}
                          </span>
                          <span className="text-xs font-black text-[#2C687B] dark:text-[#8CC7C4] shrink-0">
                            {ex.score_label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: MY COURSES (Grid View + Full Video Course Player)
             ================================================================= */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {!isEnrolled ? (
                <UnenrolledNoticeCard
                  title="You Have Not Enrolled in Any Academy Course Yet"
                  message="This section shows all video courses, modules, and recorded lectures uploaded by your Sensei. You are not currently connected with any academy — browse Partner Academies to join one, or study free JFT/JLPT lessons right now."
                />
              ) : selectedCourse ? (
                /* FULL VIDEO COURSE PLAYER (Screenshots 4–7) */
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#2C687B] dark:text-[#8CC7C4] hover:text-[#DB1A1A] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to My Courses
                  </button>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left: Video Player + Info Tabs */}
                    <div className="xl:col-span-8 space-y-5">
                      {/* Video Player Box */}
                      <div className="rounded-3xl bg-slate-950 overflow-hidden border border-[#CBE5E3] dark:border-slate-800 shadow-lg">
                        <div className="aspect-video w-full bg-slate-950 flex items-center justify-center">
                          {!activeLesson || activeLesson.video_type === 'none' ? (
                            <div className="text-center text-slate-400 p-6 space-y-2">
                              <Video className="w-10 h-10 mx-auto text-[#8CC7C4]" />
                              <p className="text-xs font-bold">
                                {activeLesson
                                  ? 'No video attached to this lesson yet — read the lesson notes below.'
                                  : 'Select a lesson from Course Content on the right.'}
                              </p>
                            </div>
                          ) : activeLesson.video_type === 'file' ? (
                            <video
                              key={activeLesson.id}
                              src={activeLesson.embed_url}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                          ) : activeLesson.video_type === 'youtube' ||
                            activeLesson.video_type === 'vimeo' ||
                            activeLesson.video_type === 'iframe' ? (
                            <iframe
                              key={activeLesson.id}
                              src={activeLesson.embed_url}
                              title={activeLesson.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="text-center p-6 space-y-3">
                              <Video className="w-10 h-10 text-[#8CC7C4] mx-auto" />
                              <a
                                href={activeLesson.embed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DB1A1A] text-white text-xs font-black"
                              >
                                Open Video Lesson <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lesson Title + Complete Toggle */}
                      <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {activeLesson ? activeLesson.title : selectedCourse.title}
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                              {selectedCourse.instructor_name} • {selectedCourse.category_label} •{' '}
                              {selectedCourse.progress_pct}% completed
                            </p>
                          </div>
                          {activeLesson && (
                            <button
                              type="button"
                              disabled={progressBusy}
                              onClick={() => handleToggleLessonComplete(activeLesson)}
                              className={`px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition ${
                                activeLesson.is_completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#DB1A1A] hover:bg-[#B81515] text-white'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {activeLesson.is_completed ? 'Completed' : 'Mark Lesson Complete'}
                            </button>
                          )}
                        </div>

                        {/* Sub-Tabs: Overview | Resources | Discussion */}
                        <div className="flex items-center gap-5 border-b border-[#EAF4F4] dark:border-slate-800 text-xs font-extrabold">
                          {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'resources', label: 'Lesson Resources' },
                            { id: 'discussion', label: `Discussion (${discussions.length})` },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setPlayerSubTab(t.id)}
                              className={`pb-2.5 border-b-2 transition cursor-pointer ${
                                playerSubTab === t.id
                                  ? 'border-[#DB1A1A] text-[#DB1A1A]'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {playerSubTab === 'overview' && (
                          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {activeLesson?.description && (
                              <div className="p-4 rounded-2xl bg-[#EAF4F4]/50 dark:bg-slate-900 border border-[#CBE5E3]/70 dark:border-slate-800">
                                <div className="text-xs font-black text-[#2C687B] dark:text-[#8CC7C4] mb-1">
                                  Lesson Notes
                                </div>
                                <p className="whitespace-pre-wrap">{activeLesson.description}</p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                                Course Description
                              </h4>
                              <p>{selectedCourse.description || 'Structured Japanese academy course.'}</p>
                            </div>
                            {(selectedCourse.outcomes || []).length > 0 && (
                              <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                                  Course Outcomes
                                </h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {selectedCourse.outcomes.map((o, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs">
                                      <CheckCircle2 className="w-4 h-4 text-[#2C687B] shrink-0 mt-0.5" />
                                      <span>{o}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedCourse.audience_text && (
                              <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                                  Audience
                                </h4>
                                <p>{selectedCourse.audience_text}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {playerSubTab === 'resources' && (
                          <div className="space-y-3">
                            {activeLesson?.resource_url ? (
                              <a
                                href={activeLesson.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-2xl bg-[#EAF4F4]/60 dark:bg-slate-900 border border-[#CBE5E3] hover:border-[#DB1A1A] transition"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-[#DB1A1A]" />
                                  <div>
                                    <div className="text-xs font-black text-slate-900 dark:text-white">
                                      Attached Lesson Worksheet / PDF
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                      {activeLesson.resource_url}
                                    </div>
                                  </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#2C687B]" />
                              </a>
                            ) : (
                              <p className="text-xs text-slate-500 py-4 text-center">
                                No downloadable file attached to this specific lesson. Check the <strong>Resources</strong> tab in the sidebar for all academy notes!
                              </p>
                            )}
                          </div>
                        )}

                        {playerSubTab === 'discussion' && (
                          <div className="space-y-4">
                            <form onSubmit={handlePostDiscussion} className="flex gap-2">
                              <input
                                type="text"
                                value={discussionInput}
                                onChange={(e) => setDiscussionInput(e.target.value)}
                                placeholder="Ask your Sensei or classmates a question..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none focus:border-[#DB1A1A]"
                              />
                              <button
                                type="submit"
                                disabled={postingDiscussion}
                                className="px-4 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" /> Post
                              </button>
                            </form>

                            {discussions.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-4">
                                No questions yet. Be the first to ask your Sensei!
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {discussions.map((d) => (
                                  <div
                                    key={d.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-black text-slate-900 dark:text-white">
                                        {d.author_name}{' '}
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                                            d.author_role === 'sensei'
                                              ? 'bg-[#DB1A1A] text-white'
                                              : 'bg-[#EAF4F4] text-[#2C687B]'
                                          }`}
                                        >
                                          {d.author_role}
                                        </span>
                                      </span>
                                      {d.lesson_title && (
                                        <span className="text-slate-400 truncate max-w-[140px]">
                                          {d.lesson_title}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300">{d.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Course Content Accordion */}
                    <div className="xl:col-span-4">
                      <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4 sticky top-6">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            Course Content
                          </h3>
                          <p className="text-[11px] font-bold text-slate-500">
                            {selectedCourse.lesson_count} Lectures • Total {formatDuration(selectedCourse.total_duration_minutes)}
                          </p>
                        </div>

                        <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
                          {(selectedCourse.modules || []).map((mod, idx) => {
                            const isOpen = expandedModules[mod.id] ?? idx === 0;
                            return (
                              <div
                                key={mod.id}
                                className="rounded-2xl border border-[#CBE5E3]/80 dark:border-slate-800 overflow-hidden"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedModules((p) => ({ ...p, [mod.id]: !isOpen }))
                                  }
                                  className="w-full px-3.5 py-3 bg-[#EAF4F4]/50 dark:bg-slate-900 flex items-center justify-between gap-2 text-left cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                      Module {idx + 1}: {mod.title}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500">
                                      {mod.completed_count}/{mod.lesson_count} done • {mod.duration_minutes}m
                                    </div>
                                  </div>
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-[#2C687B] shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[#2C687B] shrink-0" />
                                  )}
                                </button>

                                {isOpen && (
                                  <div className="p-2 space-y-1 bg-white dark:bg-[#0f1629]">
                                    {(mod.lessons || []).map((les) => {
                                      const isCur = activeLesson?.id === les.id;
                                      return (
                                        <button
                                          key={les.id}
                                          type="button"
                                          onClick={() => setActiveLessonId(les.id)}
                                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition cursor-pointer ${
                                            isCur
                                              ? 'bg-[#EAF4F4] dark:bg-slate-800 border border-[#8CC7C4]'
                                              : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                                          }`}
                                        >
                                          {les.is_completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                          ) : isCur ? (
                                            <PlayCircle className="w-4 h-4 text-[#DB1A1A] shrink-0 mt-0.5" />
                                          ) : (
                                            <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <div
                                              className={`text-xs font-bold leading-snug ${
                                                isCur
                                                  ? 'text-[#DB1A1A]'
                                                  : 'text-slate-800 dark:text-slate-200'
                                              }`}
                                            >
                                              {les.title}
                                            </div>
                                            <div className="text-[10px] font-semibold text-slate-400">
                                              Video • {les.duration_minutes} min
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* MY COURSES GRID VIEW (Screenshot 3) */
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'All Categories' },
                        { id: 'jft_basic', label: 'JFT-Basic' },
                        { id: 'jlpt', label: 'JLPT' },
                        { id: 'ssw', label: 'SSW' },
                        { id: 'conversation', label: 'Conversation' },
                        { id: 'kanji', label: 'Kanji' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCourseCatFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border cursor-pointer ${
                            courseCatFilter === cat.id
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] p-10 text-center space-y-2">
                      <BookOpen className="w-10 h-10 text-[#8CC7C4] mx-auto" />
                      <h3 className="text-base font-black">No Courses Published Yet</h3>
                      <p className="text-xs text-slate-500">
                        Your Sensei at <strong>{school?.name}</strong> hasn&apos;t uploaded courses here yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => openCoursePlayer(course)}
                          className="group rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#DB1A1A] p-5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="w-11 h-11 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A] flex items-center justify-center group-hover:bg-[#DB1A1A] group-hover:text-white transition">
                                <Play className="w-5 h-5" />
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 text-[10px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                                {course.level_badge}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition">
                                {course.title}
                              </h3>
                              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                {course.instructor_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                              <span>{course.lesson_count} Lessons</span>
                              <span>•</span>
                              <span>{formatDuration(course.total_duration_minutes)}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-[#EAF4F4] dark:border-slate-800">
                            <div className="flex items-center justify-between text-[11px] font-black">
                              <span className={course.status === 'completed' ? 'text-emerald-600' : 'text-[#2C687B] dark:text-[#8CC7C4]'}>
                                {course.status === 'completed' ? '✓ Completed' : `${course.progress_pct}% Complete`}
                              </span>
                              <span className="text-[#DB1A1A]">Watch →</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${course.status === 'completed' ? 'bg-emerald-500' : 'bg-[#DB1A1A]'}`}
                                style={{ width: `${course.progress_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB: EXAM RESULTS & CBT DIAGNOSTICS (Unified Scorecard)
             ================================================================= */}
          {activeTab === 'results' && (
            <div className="space-y-5 sm:space-y-6">
              {/* 4 CBT KPIs (Horizontal Swipe Strip on Mobile, 4-Col Grid on Desktop) */}
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-3.5 px-3.5 pb-1 md:grid md:grid-cols-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-none">
                <div className="min-w-[165px] md:min-w-0 snap-start rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Exams</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {resultsData?.total_attempts ?? stats.total_attempts ?? 0}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Completed CBT</div>
                </div>
                <div className="min-w-[165px] md:min-w-0 snap-start rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pass Rate</span>
                  <div className="text-2xl font-black text-emerald-600">
                    {resultsData?.pass_rate ?? 0}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {resultsData?.passed_attempts ?? 0} of {resultsData?.total_attempts ?? 0} passed
                  </div>
                </div>
                <div className="min-w-[165px] md:min-w-0 snap-start rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Max Score</span>
                  <div className="text-2xl font-black text-[#2C687B] dark:text-[#8CC7C4]">
                    {resultsData?.highest_scaled_score ?? 0}
                    <span className="text-xs font-bold text-slate-400"> / 250</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Avg: {resultsData?.avg_scaled_score ?? 0} pts
                  </div>
                </div>
                <div className="min-w-[165px] md:min-w-0 snap-start rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 p-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#DB1A1A]">CEFR Level</span>
                  <div className="text-2xl font-black text-[#DB1A1A]">
                    {resultsData?.highest_level || 'Below A1'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">JFT Standard</div>
                </div>
              </div>

              {/* Cumulative 4-Section JFT Diagnostic Breakdown */}
              {(resultsData?.section_stats || []).length > 0 && (
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#DB1A1A]">
                      Diagnostic Analysis
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Cumulative Section Performance
                    </h2>
                    <p className="text-xs text-slate-500">
                      Accuracy breakdown across all 4 official JFT-Basic exam sections.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {resultsData.section_stats.map((sec) => (
                      <div
                        key={sec.key}
                        className="p-4 rounded-2xl bg-[#F9FCFC] dark:bg-slate-900 border border-[#CBE5E3]/80 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {sec.name_en}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">{sec.name_ja}</div>
                          </div>
                          <span className="text-base font-black text-[#2C687B] dark:text-[#8CC7C4]">
                            {sec.pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EAF4F4] dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#DB1A1A] transition-all"
                            style={{ width: `${sec.pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>{sec.correct} of {sec.total} correct</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Pass: 80%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Exam Attempt History */}
              <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#EAF4F4] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Exam Attempt History
                    </h2>
                    <p className="text-xs text-slate-500">All completed CBT mock tests and detailed scorecards.</p>
                  </div>
                  <Link
                    href="/jft-basic"
                    className="px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center gap-1.5"
                  >
                    Take New Mock Exam <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {(resultsData?.attempts || []).length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <FileText className="w-10 h-10 text-[#8CC7C4] mx-auto" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      No Exam Attempts Recorded Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Take your first JFT-Basic or SSW practice exam to unlock your 4-section diagnostic scorecard.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EAF4F4]/60 dark:bg-slate-900 text-[#2C687B] dark:text-[#8CC7C4] uppercase text-[10px] font-black border-b border-[#CBE5E3] dark:border-slate-800">
                          <tr>
                            <th className="px-5 py-3.5">Exam Title</th>
                            <th className="px-5 py-3.5">Date</th>
                            <th className="px-5 py-3.5">Scaled Score</th>
                            <th className="px-5 py-3.5">CEFR</th>
                            <th className="px-5 py-3.5">Result</th>
                            <th className="px-5 py-3.5 text-right">Scorecard</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAF4F4] dark:divide-slate-800">
                          {resultsData.attempts.map((a) => (
                            <tr key={a.id} className="hover:bg-[#EAF4F4]/30 dark:hover:bg-slate-900/60">
                              <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                                {a.test_title}
                              </td>
                              <td className="px-5 py-3.5 font-mono text-slate-500">
                                {new Date(a.completed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-5 py-3.5 font-mono font-black text-slate-900 dark:text-white">
                                {a.scaled_score} <span className="text-slate-400 font-normal">/ 250</span>
                              </td>
                              <td className="px-5 py-3.5 font-extrabold text-[#DB1A1A]">
                                {a.assessment_level}
                              </td>
                              <td className="px-5 py-3.5">
                                {a.passed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                                    <Check className="w-3 h-3" /> PASS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#DB1A1A] border border-rose-200 text-[10px] font-black">
                                    <X className="w-3 h-3" /> NO PASS
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <Link
                                  href={`/attempt/${a.id}`}
                                  className="text-xs font-black text-[#DB1A1A] hover:underline inline-flex items-center gap-1"
                                >
                                  View Scorecard <ArrowRight className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden divide-y divide-[#EAF4F4] dark:divide-slate-800">
                      {resultsData.attempts.map((a) => (
                        <div key={a.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-black text-slate-900 dark:text-white">
                                {a.test_title}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {new Date(a.completed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                a.passed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-[#DB1A1A] border border-rose-200'
                              }`}
                            >
                              {a.passed ? 'PASS' : 'NO PASS'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                              {a.scaled_score} / 250 • {a.assessment_level}
                            </span>
                            <Link
                              href={`/attempt/${a.id}`}
                              className="text-xs font-black text-[#DB1A1A] inline-flex items-center gap-1"
                            >
                              Scorecard <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: RESOURCES (Sensei Notes & PDFs)
             ================================================================= */}
          {activeTab === 'resources' && (
            <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">My Academy Resources</h2>
                  <p className="text-xs text-slate-500">
                    Study sheets, PDFs, vocabulary lists, and links shared by your Sensei.
                  </p>
                </div>
                <Link
                  href="/books"
                  className="px-3.5 py-2 rounded-xl bg-[#EAF4F4] text-[#2C687B] text-xs font-black"
                >
                  Free Gakkou Textbooks →
                </Link>
              </div>

              {!isEnrolled ? (
                <UnenrolledNoticeCard
                  title="No Academy Resources Available"
                  message="You are not connected with any academy yet. Once enrolled, your Sensei's PDFs, vocabulary sheets, and class routines will appear here."
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#EAF4F4] dark:border-slate-800">
                    {[
                      { id: 'all', label: 'All Resources' },
                      { id: 'vocabulary', label: 'Vocabulary & Kanji' },
                      { id: 'grammar', label: 'Grammar' },
                      { id: 'listening', label: 'Listening' },
                      { id: 'ssw_skill', label: 'SSW Material' },
                      { id: 'routine', label: 'Class Routine' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setResourceCat(c.id)}
                        className={`pb-2 px-2 text-xs font-extrabold whitespace-nowrap border-b-2 cursor-pointer ${
                          resourceCat === c.id
                            ? 'border-[#DB1A1A] text-[#DB1A1A]'
                            : 'border-transparent text-slate-500'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {filteredResources.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">
                      No resources uploaded in this category yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#EAF4F4] dark:divide-slate-800">
                      {filteredResources.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => setActiveNoteModal(res)}
                          className="py-3.5 px-2 hover:bg-[#EAF4F4]/40 dark:hover:bg-slate-900 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {res.title}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500">
                                {res.category_label}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#DB1A1A] shrink-0">Open →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 4: SCHEDULE (Sensei Classes + Personal Study Tasks)
             ================================================================= */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-5">
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Academy Live Classes &amp; Exam Schedule
                  </h2>
                  {!isEnrolled ? (
                    <UnenrolledNoticeCard
                      compact
                      title="No Academy Schedule Connected"
                      message="You have not joined an academy yet. Once enrolled, your Sensei's live Zoom/Meet classes and exam dates will sync here automatically."
                    />
                  ) : (portal.schedule || []).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      Your Sensei hasn&apos;t added upcoming class events yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {portal.schedule.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-2xl bg-[#EAF4F4]/50 dark:bg-slate-900 border-l-4 border-[#DB1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#2C687B] dark:text-[#8CC7C4]">
                              {ev.event_type_label}
                            </span>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {ev.title}
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              {ev.event_date} • {ev.start_time_label}
                              {ev.end_time_label ? ` – ${ev.end_time_label}` : ''}
                            </div>
                          </div>
                          {ev.meeting_url && (
                            <a
                              href={ev.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center gap-1.5 shrink-0"
                            >
                              Join Class <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Personal Study Planner (Works for everyone!) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Personal Study Tasks
                  </h3>
                  <form onSubmit={handleAddPersonalTask} className="space-y-2.5">
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Practice 20 Kanji & JFT Listening"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        placeholder="08:00 PM"
                        className="w-28 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                      />
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add New Task
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {personalTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">No personal tasks added yet.</p>
                    ) : (
                      personalTasks.map((tk) => (
                        <div
                          key={tk.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {tk.title}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">{tk.time}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePersonalTask(tk.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 5: ACADEMY NOTICES
             ================================================================= */}
          {activeTab === 'notices' && (
            <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Academy Announcements &amp; Sensei Notices
              </h2>
              {!isEnrolled ? (
                <UnenrolledNoticeCard
                  title="No Academy Notices"
                  message="You are not connected with any Sensei or academy yet. Announcements from your Sensei will appear here once you enroll."
                />
              ) : (portal.notices || []).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No announcements from {school?.name} yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {portal.notices.map((nt) => (
                    <div
                      key={nt.id}
                      className={`p-4 rounded-2xl border ${
                        nt.priority === 'urgent'
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                          : 'bg-[#EAF4F4]/40 dark:bg-slate-900 border-[#CBE5E3] dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{nt.title}</h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[#2C687B]">
                          {nt.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-wrap">
                        {nt.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 6: PROFILE (Screenshot 9)
             ================================================================= */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Summary Card */}
              <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-6 text-center space-y-5">
                <div className="space-y-2">
                  <div className="w-20 h-20 rounded-full bg-[#2C687B] text-white text-2xl font-black flex items-center justify-center mx-auto">
                    {initials}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{student.full_name}</h2>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[11px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                    {isEnrolled && school ? school.name : 'Independent Learner'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#EAF4F4]/60 dark:bg-slate-900">
                    <div className="text-xl font-black text-[#2C687B] dark:text-[#8CC7C4]">
                      {stats.courses_in_progress || 0}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">Courses Ongoing</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                    <div className="text-xl font-black text-emerald-600">
                      {stats.courses_completed || 0}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">Courses Complete</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAF4F4] dark:border-slate-800 space-y-2 text-left">
                  <div className="text-xs font-black text-slate-900 dark:text-white">Achievements</div>
                  <div className="flex items-center justify-around py-2">
                    <div className="text-center">
                      <Award className="w-6 h-6 text-[#DB1A1A] mx-auto" />
                      <span className="text-[10px] font-bold text-slate-500">Lv.{student.game_level || 1}</span>
                    </div>
                    <div className="text-center">
                      <Sparkles className="w-6 h-6 text-[#2C687B] mx-auto" />
                      <span className="text-[10px] font-bold text-slate-500">{student.game_xp || 0} XP</span>
                    </div>
                    <div className="text-center">
                      <GraduationCap className="w-6 h-6 text-emerald-600 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-500">{stats.total_attempts || 0} Exams</span>
                    </div>
                  </div>
                </div>

                {/* Quick Public Profile & Leaderboard Links */}
                <div className="pt-3 border-t border-[#EAF4F4] dark:border-slate-800 flex flex-col gap-2">
                  {student.username && (
                    <Link
                      href={`/profile/${encodeURIComponent(student.username)}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 hover:bg-[#CBE5E3]/70 text-[#2C687B] dark:text-[#8CC7C4] text-xs font-black inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Public Profile ↗
                    </Link>
                  )}
                  <Link
                    href="/leaderboard"
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-black inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Global Leaderboard
                  </Link>
                </div>
              </div>

              {/* Right Edit Form (Unified Candidate Profile Settings) */}
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Profile Settings</h3>
                  <span className="text-[11px] font-mono text-slate-400">@{student.username}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Username</label>
                    <input
                      type="text"
                      value={profUsername}
                      onChange={(e) => setProfUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">First Name</label>
                    <input
                      type="text"
                      value={profFirst}
                      onChange={(e) => setProfFirst(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profLast}
                      onChange={(e) => setProfLast(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Target Exam</label>
                    <select
                      value={profTargetExam}
                      onChange={(e) => setProfTargetExam(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    >
                      {TARGET_EXAM_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Japanese Level</label>
                    <select
                      value={profJpLevel}
                      onChange={(e) => setProfJpLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    >
                      {JAPANESE_LEVEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={profCountry}
                      onChange={(e) => setProfCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={profLocation}
                      onChange={(e) => setProfLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Learning Goal / Bio</label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={profSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  {profSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* =================================================================
              TAB 7: SETTINGS (Screenshot 12)
             ================================================================= */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-4 space-y-2">
                {[
                  { id: 'notifications', label: 'Notifications & Alerts' },
                  { id: 'language', label: 'Preferred Study Language' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSettingsSubTab(s.id)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs font-black cursor-pointer transition ${
                      settingsSubTab === s.id
                        ? 'bg-[#DB1A1A] text-white border-[#DB1A1A]'
                        : 'bg-white dark:bg-[#0f1629] text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-8 rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-6 space-y-4">
                {settingsSubTab === 'notifications' ? (
                  <>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Notification Preferences
                    </h3>
                    {[
                      { key: 'senseiAnnouncements', label: 'Announcements from your Sensei / Academy' },
                      { key: 'examNotices', label: 'JFT-Basic, JLPT & SSW Examination Notices' },
                      { key: 'courseUpdates', label: 'New video lesson uploads in enrolled courses' },
                      { key: 'dailyReminder', label: 'Daily Japanese study reminder' },
                    ].map((opt) => (
                      <div
                        key={opt.key}
                        className="flex items-center justify-between py-2.5 border-b border-[#EAF4F4] dark:border-slate-800"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {opt.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => savePref({ [opt.key]: !prefs[opt.key] })}
                          className={`w-11 h-6 rounded-full transition cursor-pointer p-0.5 ${
                            prefs[opt.key] ? 'bg-[#DB1A1A]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              prefs[opt.key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Preferred Study &amp; Meaning Language
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {STUDY_LANG_OPTIONS.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => savePref({ studyLang: l.code })}
                          className={`p-3 rounded-xl border text-xs font-extrabold cursor-pointer transition ${
                            prefs.studyLang === l.code
                              ? 'bg-[#DB1A1A] text-white border-[#DB1A1A]'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import {
  getPartnerDashboard,
  getPartnerDashboardCsvUrl,
  managePartnerSchool,
  getPartnerClassroom,
  postPartnerClassroomAction,
  joinPartnerSchool,
} from '@/lib/api';
import {
  GraduationCap,
  KeyRound,
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Award,
  AlertTriangle,
  Clock,
  Lock,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  ClipboardCheck,
  Bell,
  ShieldCheck,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Rocket,
  ChevronRight,
  Eye,
  Play,
  X,
  Edit3,
  LogIn,
} from 'lucide-react';

const NOTE_CATEGORY_META = {
  vocab: { label: 'Vocabulary & Kanji', icon: '🈯', bg: 'bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300' },
  grammar: { label: 'Grammar & Expression', icon: '📘', bg: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300' },
  listening: { label: 'Listening & Audio Tips', icon: '🎧', bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300' },
  ssw: { label: 'SSW / Tokutei Ginou', icon: '🏢', bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300' },
  routine: { label: 'Class Routine & Syllabus', icon: '🗓️', bg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300' },
  general: { label: 'General Study Material', icon: '📄', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
};

const SECTION_RING_COLORS = ['#7C3AED', '#F59E0B', '#10B981', '#EC4899'];

export default function PartnerSchoolDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [accessKey, setAccessKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyReady, setKeyReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingAdminApproval, setPendingAdminApproval] = useState(null);
  const [toast, setToast] = useState('');
  const [data, setData] = useState(null);

  // Student classroom mode (for enrolled students or Sensei preview)
  const [viewMode, setViewMode] = useState('sensei'); // 'sensei' | 'classroom'
  const [classroomData, setClassroomData] = useState(null);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomError, setClassroomError] = useState('');
  const [examPinInputs, setExamPinInputs] = useState({});
  const [examPinError, setExamPinError] = useState('');
  const [joinBatchInput, setJoinBatchInput] = useState('');
  const [joinRollInput, setJoinRollInput] = useState('');
  const [joinPinInput, setJoinPinInput] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);

  // Schoooli Navigation & Filters
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'exams' | 'library' | 'students' | 'attempts' | 'notices' | 'security'
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedDays, setSelectedDays] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'

  // Custom invite link builder
  const [inviteBatchInput, setInviteBatchInput] = useState('');
  const [copiedType, setCopiedType] = useState('');

  // Assign Exam Form
  const [assignTestId, setAssignTestId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignBatch, setAssignBatch] = useState('');
  const [assignSchedule, setAssignSchedule] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignPin, setAssignPin] = useState('');
  const [assignRequirePin, setAssignRequirePin] = useState(true);

  // Study Note Form & Reader Modal
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('vocab');
  const [noteBatch, setNoteBatch] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteUrl, setNoteUrl] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  const [activeNoteModal, setActiveNoteModal] = useState(null);

  // Notification Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticePriority, setNoticePriority] = useState('normal');
  const [noticeBatch, setNoticeBatch] = useState('');

  // Inline student batch/ID editor modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentBatch, setEditStudentBatch] = useState('');
  const [editStudentRoll, setEditStudentRoll] = useState('');

  // Security settings form state
  const [secRequirePin, setSecRequirePin] = useState(false);
  const [secRequireApproval, setSecRequireApproval] = useState(false);
  const [secLocked, setSecLocked] = useState(false);
  const [secWelcomeMsg, setSecWelcomeMsg] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  }, []);

  // Initialize key from URL (?key=...) or sessionStorage
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const urlKey = (sp.get('key') || '').trim();
    const modeParam = (sp.get('mode') || '').trim();
    const tabParam = (sp.get('tab') || '').trim();
    const storageKey = `gns_sensei_key_${slug}`;
    const savedKey = sessionStorage.getItem(storageKey) || '';

    const resolvedKey = urlKey || savedKey;
    if (urlKey) {
      sessionStorage.setItem(storageKey, urlKey);
    }
    if (modeParam === 'classroom') {
      setViewMode('classroom');
    }
    if (['dashboard', 'students', 'exams', 'library', 'notices', 'attempts', 'security'].includes(tabParam)) {
      setActiveNav(tabParam);
    }
    setAccessKey(resolvedKey);
    setKeyInput(resolvedKey);
    setKeyReady(true);
  }, [slug]);

  const fetchDashboard = useCallback(
    async (overrideKey, silent = false) => {
      const effectiveKey = typeof overrideKey === 'string' ? overrideKey : accessKey;
      if (!slug) return;
      if (!silent) setLoading(true);
      setError('');
      try {
        const res = await getPartnerDashboard(slug, {
          key: effectiveKey,
          batch: selectedBatch === 'all' ? '' : selectedBatch,
          testId: selectedTestId,
          days: selectedDays === 'all' ? '' : selectedDays,
        });
        setData(res);
        if (res?.school) {
          setSecRequirePin(Boolean(res.school.require_join_pin));
          setSecRequireApproval(Boolean(res.school.require_approval));
          setSecLocked(Boolean(res.school.enrollment_locked));
          setSecWelcomeMsg(res.school.welcome_message || '');
        }
        if (effectiveKey && typeof window !== 'undefined') {
          sessionStorage.setItem(`gns_sensei_key_${slug}`, effectiveKey);
        }
      } catch (err) {
        setData(null);
        if (err?.data?.code === 'school_pending_admin_approval') {
          setPendingAdminApproval({
            school_name: err.data.school_name || slug,
            detail: err.data.detail,
          });
          setError('');
        } else {
          setPendingAdminApproval(null);
          if (effectiveKey) {
            setError(
              err?.message ||
                'Invalid Sensei access key or unauthorized account. Please verify your key or sign in with your linked School Owner account.'
            );
          }
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [slug, accessKey, selectedBatch, selectedTestId, selectedDays]
  );

  const fetchClassroom = useCallback(async () => {
    if (!slug) return;
    setClassroomLoading(true);
    setClassroomError('');
    try {
      const res = await getPartnerClassroom(slug, { key: accessKey });
      setClassroomData(res);
    } catch (err) {
      setClassroomError(err?.message || 'Unable to load classroom feed.');
    } finally {
      setClassroomLoading(false);
    }
  }, [slug, accessKey]);

  // Auto-fetch Sensei dashboard when key is present OR user is logged in as school owner/staff
  useEffect(() => {
    if (!keyReady || !slug || authLoading) return;
    const isOwnerOrStaff =
      isAuthenticated &&
      user &&
      (user.is_staff ||
        user.is_superuser ||
        user.owned_partner_school?.slug === slug);

    if (accessKey || isOwnerOrStaff) {
      fetchDashboard(accessKey);
    } else if (
      isAuthenticated &&
      user?.profile?.partner_school?.slug === slug &&
      !accessKey
    ) {
      setViewMode('classroom');
    }
  }, [keyReady, slug, authLoading, accessKey, isAuthenticated, user, fetchDashboard]);

  useEffect(() => {
    if (viewMode === 'classroom' && slug) {
      fetchClassroom();
    }
  }, [viewMode, slug, fetchClassroom]);

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError('Please enter your Sensei access key.');
      return;
    }
    setAccessKey(trimmed);
    setViewMode('sensei');
    fetchDashboard(trimmed);
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`gns_sensei_key_${slug}`);
    }
    setAccessKey('');
    setKeyInput('');
    setData(null);
    setError('');
  };

  const runManageAction = async (payload, successMsg) => {
    setActionBusy(true);
    try {
      await managePartnerSchool(slug, payload, { key: accessKey });
      if (successMsg) showToast(successMsg);
      await fetchDashboard(accessKey, true);
      return true;
    } catch (err) {
      showToast(err?.message || 'Action failed. Please try again.');
      return false;
    } finally {
      setActionBusy(false);
    }
  };

  const handleAssignExamSubmit = async (e) => {
    e.preventDefault();
    if (!assignTestId) {
      showToast('Please select a Mock Exam to assign.');
      return;
    }
    const ok = await runManageAction(
      {
        action: 'assign_exam',
        test_id: Number(assignTestId),
        title_override: assignTitle.trim(),
        target_batch: assignBatch.trim(),
        schedule_label: assignSchedule.trim(),
        instructions: assignInstructions.trim(),
        attendance_pin: assignPin.trim(),
        require_pin: assignRequirePin,
      },
      'Mock Exam assigned to classroom!'
    );
    if (ok) {
      setAssignTitle('');
      setAssignSchedule('');
      setAssignInstructions('');
      setAssignPin('');
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Please enter a study note title.');
      return;
    }
    const ok = await runManageAction(
      {
        action: 'create_note',
        title: noteTitle.trim(),
        category: noteCategory,
        target_batch: noteBatch.trim(),
        content: noteContent.trim(),
        external_url: noteUrl.trim(),
        is_pinned: notePinned,
      },
      'Study note shared with students!'
    );
    if (ok) {
      setNoteTitle('');
      setNoteContent('');
      setNoteUrl('');
      setNotePinned(false);
    }
  };

  const handleCreateNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      showToast('Title and announcement message are required.');
      return;
    }
    const ok = await runManageAction(
      {
        action: 'create_notification',
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        priority: noticePriority,
        target_batch: noticeBatch.trim(),
      },
      'Notification broadcasted to students!'
    );
    if (ok) {
      setNoticeTitle('');
      setNoticeMessage('');
      setNoticePriority('normal');
    }
  };

  const handleSaveSecurity = async (e) => {
    if (e) e.preventDefault();
    await runManageAction(
      {
        action: 'update_security',
        require_join_pin: secRequirePin,
        require_approval: secRequireApproval,
        enrollment_locked: secLocked,
        welcome_message: secWelcomeMsg,
      },
      'Classroom security & gate settings saved!'
    );
  };

  const handleStudentLaunchExam = async (exam) => {
    setExamPinError('');
    const pinVal = (examPinInputs[exam.id] || '').trim();
    if (exam.require_pin && !pinVal) {
      setExamPinError(`Please enter the 4-digit Live Attendance PIN for "${exam.title}".`);
      return;
    }
    try {
      const res = await postPartnerClassroomAction(slug, {
        action: 'verify_exam_pin',
        assigned_exam_id: exam.id,
        pin: pinVal,
      });
      const routePrefix = res.test_category?.startsWith('ssw_') ? '/ssw-test' : '/test';
      router.push(`${routePrefix}/${res.test_id}`);
    } catch (err) {
      setExamPinError(err?.message || 'Invalid Attendance PIN.');
    }
  };

  const handleOpenNote = async (note) => {
    setActiveNoteModal(note);
    if (viewMode === 'classroom') {
      try {
        await postPartnerClassroomAction(slug, {
          action: 'view_note',
          note_id: note.id,
        });
      } catch {}
    }
  };

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://gakkou-no-shiken.vercel.app';

  const generatedInviteUrl = useMemo(() => {
    const base = `${origin}/?partner=${encodeURIComponent(slug)}`;
    const trimmedBatch = inviteBatchInput.trim();
    return trimmedBatch ? `${base}&batch=${encodeURIComponent(trimmedBatch)}` : base;
  }, [origin, slug, inviteBatchInput]);

  const handleCopy = async (type, customText = '') => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const schoolName = data?.school?.name || slug;
    const joinPin = data?.school?.join_code || '';
    const pinLine = joinPin ? `\n🔐 *Class Join PIN:* ${joinPin}` : '';
    const text =
      customText ||
      (type === 'whatsapp'
        ? `🏫 *${schoolName} JFT-Basic & SSW CBT Classroom*\n\n1️⃣ Click the link below & sign in with your *Full Name*:${pinLine}\n👉 ${generatedInviteUrl}\n\n2️⃣ Open your classroom to check Assigned Mock Exams, Sensei Study Notes, and Announcements!`
        : type === 'pin'
        ? joinPin
        : generatedInviteUrl);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      showToast('Copied to clipboard!');
      setTimeout(() => setCopiedType(''), 2200);
    } catch {}
  };

  const filteredStudents = useMemo(() => {
    const list = data?.students || [];
    return list.filter((s) => {
      if (studentStatusFilter !== 'all' && (s.partner_status || 'approved') !== studentStatusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.username || '').toLowerCase().includes(q) ||
        (s.batch || '').toLowerCase().includes(q) ||
        (s.student_roll_or_id || '').toLowerCase().includes(q)
      );
    });
  }, [data?.students, searchQuery, studentStatusFilter]);

  const pendingStudentsList = useMemo(
    () => (data?.students || []).filter((s) => s.partner_status === 'pending'),
    [data?.students]
  );

  const starStudents = useMemo(() => {
    const list = (data?.students || []).filter(
      (s) => (s.partner_status || 'approved') === 'approved'
    );
    return [...list]
      .sort((a, b) => (b.best_score || 0) - (a.best_score || 0))
      .slice(0, 5);
  }, [data?.students]);

  const filteredAttempts = useMemo(() => {
    const list = data?.recent_attempts || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (a) =>
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.username || '').toLowerCase().includes(q) ||
        (a.batch || '').toLowerCase().includes(q) ||
        (a.test_title || '').toLowerCase().includes(q) ||
        (a.student_roll_or_id || '').toLowerCase().includes(q)
    );
  }, [data?.recent_attempts, searchQuery]);

  // Compute batch or top performer capsule bars for Schoooli "Best Performers" card
  const batchPerformanceBars = useMemo(() => {
    const students = (data?.students || []).filter((s) => s.best_pct !== null);
    const byBatch = {};
    students.forEach((s) => {
      const b = s.batch || 'General Batch';
      if (!byBatch[b]) byBatch[b] = { batch: b, totalPct: 0, count: 0, members: [] };
      byBatch[b].totalPct += s.best_pct || 0;
      byBatch[b].count += 1;
      if (byBatch[b].members.length < 3) {
        byBatch[b].members.push((s.full_name || s.username || 'S').slice(0, 1).toUpperCase());
      }
    });
    const entries = Object.values(byBatch).map((item) => ({
      label: item.batch,
      pct: Math.round(item.totalPct / item.count),
      count: item.count,
      members: item.members,
    }));
    if (entries.length > 0) return entries.slice(0, 4);

    // Fallback to section accuracy bars if no batch breakdown yet
    return (data?.section_analytics || []).slice(0, 4).map((sec) => ({
      label: sec.label.split('(')[0].trim(),
      pct: Math.round(sec.accuracy_pct || 0),
      count: sec.total || 0,
      members: ['J', 'F', 'T'],
    }));
  }, [data?.students, data?.section_analytics]);

  // SVG Donut chart segments for Schoooli "Course Statistics" card
  const donutStats = useMemo(() => {
    const sections = data?.section_analytics || [];
    const totalAnswered = sections.reduce((acc, s) => acc + (s.total || 0), 0);
    const radius = 58;
    const circumference = 2 * Math.PI * radius;

    if (!sections.length || totalAnswered === 0) {
      return { totalAnswered: 0, circumference, radius, segments: [] };
    }

    let accumulatedRatio = 0;
    const segments = sections.slice(0, 4).map((sec, idx) => {
      const weight = Math.max(sec.total || 1, 1);
      const weightSum = sections.slice(0, 4).reduce((sum, item) => sum + Math.max(item.total || 1, 1), 0);
      const ratio = weight / weightSum;
      const dashLength = Math.max(ratio * circumference - 6, 4);
      const dashOffset = -accumulatedRatio * circumference;
      accumulatedRatio += ratio;
      return {
        ...sec,
        color: SECTION_RING_COLORS[idx % SECTION_RING_COLORS.length],
        dashArray: `${dashLength} ${circumference}`,
        dashOffset,
      };
    });

    return { totalAnswered, circumference, radius, segments };
  }, [data?.section_analytics]);

  const csvDownloadUrl = getPartnerDashboardCsvUrl(slug, {
    key: accessKey,
    batch: selectedBatch === 'all' ? '' : selectedBatch,
    testId: selectedTestId,
    days: selectedDays === 'all' ? '' : selectedDays,
  });

  // --- STUDENT CLASSROOM VIEW MODE ---
  if (viewMode === 'classroom') {
    const cSchool = classroomData?.school || data?.school;
    const cExams = classroomData?.assigned_exams || [];
    const cNotes = classroomData?.study_notes || [];
    const cNotices = classroomData?.notifications || [];

    return (
      <div className="max-w-6xl mx-auto py-6 px-3 sm:px-6 space-y-6 animate-fade-in">
        {/* Top Classroom Header */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Student Classroom Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <span>{cSchool?.flag || '🏫'}</span>
              <span>{cSchool?.name || slug}</span>
            </h1>
            <p className="text-xs sm:text-sm text-violet-100">
              {classroomData?.student_batch
                ? `Enrolled Batch: ${classroomData.student_batch}`
                : 'Official Assigned Mock Exams, Sensei Study Notes & Class Notices'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchClassroom}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${classroomLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {data && (
              <button
                type="button"
                onClick={() => setViewMode('sensei')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
              >
                ← Back to Sensei Dashboard
              </button>
            )}
          </div>
        </div>

        {classroomData?.membership_status === 'none' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-violet-200 dark:border-violet-800 p-5 sm:p-6 shadow-md space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-violet-600" />
                <span>🎒 Join {cSchool?.name || slug} Classroom</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAuthenticated
                  ? 'Enter your Batch Name and 6-Digit Class Join PIN from your Sensei to unlock assigned mock exams, study notes, and notifications.'
                  : 'Please sign in with your Candidate account first to join this school classroom.'}
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/accounts/login?next=${encodeURIComponent(`/partner/${slug}?mode=classroom`)}`}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black"
                >
                  Sign In as Candidate
                </Link>
                <Link
                  href={`/accounts/signup?next=${encodeURIComponent(`/partner/${slug}?mode=classroom`)}`}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Create Student Account
                </Link>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setJoinBusy(true);
                  setExamPinError('');
                  try {
                    await joinPartnerSchool({
                      slug,
                      batch: joinBatchInput.trim(),
                      student_id: joinRollInput.trim(),
                      join_code: joinPinInput.trim(),
                      first_name: user?.first_name || user?.username || 'Student',
                      last_name: user?.last_name || '',
                    });
                    showToast('Joined school classroom!');
                    await fetchClassroom();
                  } catch (err) {
                    setExamPinError(err?.message || 'Could not join classroom. Please check your 6-digit Join PIN.');
                  } finally {
                    setJoinBusy(false);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2.5"
              >
                <input
                  type="text"
                  value={joinBatchInput}
                  onChange={(e) => setJoinBatchInput(e.target.value)}
                  placeholder="Batch (e.g. Batch-14)"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={joinRollInput}
                  onChange={(e) => setJoinRollInput(e.target.value)}
                  placeholder="Roll / Student ID (Optional)"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
                <input
                  type="text"
                  maxLength={8}
                  value={joinPinInput}
                  onChange={(e) => setJoinPinInput(e.target.value)}
                  placeholder="6-Digit Class Join PIN"
                  className="px-3.5 py-2.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 text-xs font-mono font-black tracking-widest"
                />
                <button
                  type="submit"
                  disabled={joinBusy}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  {joinBusy ? 'Joining...' : 'Join Classroom →'}
                </button>
              </form>
            )}
          </div>
        )}

        {classroomData?.membership_status === 'pending' && (
          <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                ⏳ Pending Sensei Approval
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Your enrollment request has been received. As soon as your Sensei approves your account, your batch&apos;s assigned exams, study notes, and notifications will appear below.
              </p>
            </div>
          </div>
        )}

        {classroomError ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 p-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Classroom Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {classroomError}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href={`/?partner=${encodeURIComponent(slug)}`}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black"
              >
                Join or Check Enrollment Status
              </Link>
              <button
                type="button"
                onClick={() => setViewMode('sensei')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Sensei Login
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Assigned Exams Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-violet-600" />
                    <span>Assigned Mock Exams ({cExams.length})</span>
                  </h2>
                </div>

                {examPinError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {examPinError}
                  </div>
                )}

                {cExams.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No active mock exams assigned to your batch right now.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cExams.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-black">
                                {ex.schedule_label || 'Assigned Mock Test'}
                              </span>
                              {ex.target_batch && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                  Batch: {ex.target_batch}
                                </span>
                              )}
                              {ex.has_attended && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                                  ✓ Attendance Verified
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                              {ex.title}
                            </h3>
                            {ex.instructions && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                {ex.instructions}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          {ex.require_pin && (
                            <input
                              type="text"
                              maxLength={8}
                              value={examPinInputs[ex.id] || ''}
                              onChange={(e) =>
                                setExamPinInputs((prev) => ({ ...prev, [ex.id]: e.target.value }))
                              }
                              placeholder="Enter 4-Digit Room PIN..."
                              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleStudentLaunchExam(ex)}
                            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-500/20"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>
                              {ex.require_pin ? 'Verify PIN & Start Exam' : 'Attend & Start Exam'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Notes Library */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-500" />
                  <span>Sensei Library &amp; Study Notes ({cNotes.length})</span>
                </h2>
                {cNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No study notes uploaded for your batch yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {cNotes.map((note) => {
                      const meta = NOTE_CATEGORY_META[note.category] || NOTE_CATEGORY_META.general;
                      return (
                        <div
                          key={note.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.bg}`}>
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {note.is_pinned ? '📌 ' : ''}
                                {note.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {meta.label} • {note.views_count} reads
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenNote(note)}
                            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:bg-violet-50 cursor-pointer shrink-0"
                          >
                            Read Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Notifications Column */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span>School Notifications ({cNotices.length})</span>
                </h2>
                {cNotices.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No announcements posted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cNotices.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-2xl border space-y-1.5 ${
                          n.priority === 'urgent'
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                            : n.priority === 'important'
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            {n.priority.toUpperCase()} {n.target_batch ? `• ${n.target_batch}` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {n.created_at ? n.created_at.slice(0, 10) : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Note Reader Modal */}
        {activeNoteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    {NOTE_CATEGORY_META[activeNoteModal.category]?.label || 'Study Note'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
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
              {activeNoteModal.content && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {activeNoteModal.content}
                </div>
              )}
              {activeNoteModal.external_url && (
                <a
                  href={activeNoteModal.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black"
                >
                  <span>Open Attached Document / PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SENSEI LOGIN / UNLOCK SCREEN ---
  if (!data) {
    const enrolledInThisSchool =
      isAuthenticated && user?.profile?.partner_school?.slug === slug;
    const isPendingOwner =
      pendingAdminApproval ||
      (isAuthenticated &&
        user?.owned_partner_school?.slug === slug &&
        user?.owned_partner_school?.is_active === false &&
        !user?.is_staff);

    if (isPendingOwner) {
      const pendingName =
        pendingAdminApproval?.school_name || user?.owned_partner_school?.name || slug;
      return (
        <div className="max-w-xl mx-auto py-10 px-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-300 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                ⏳ Pending Platform Admin Approval
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {pendingName}
              </h1>
              <p className="text-xs font-mono text-slate-400">School Code: {slug}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              Your school registration has been received and is awaiting <strong>Platform Admin verification</strong>. As soon as our team approves your training center in the backend, your Schoooli Sensei LMS Dashboard, 6-Digit Class Join PIN, and Student Invite Links will unlock automatically.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchDashboard(accessKey)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Checking Status...' : 'Check Approval Status'}</span>
              </button>
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                School &amp; Sensei LMS Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {slug} Classroom Login
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Log in with your <strong>Sensei Access Key</strong> or sign in with your linked <strong>School Owner website account</strong> to assign tests, share study notes, post announcements, and approve students.
          </p>

          {enrolledInThisSchool && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                  🎒 You are enrolled as a student in {user.profile.partner_school.name}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Open your Student Classroom to take assigned tests &amp; read Sensei notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('classroom')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shrink-0 cursor-pointer"
              >
                Open Classroom →
              </button>
            </div>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sensei Access Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste private Sensei access key..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? 'Unlocking Sensei LMS...' : 'Unlock Sensei Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {!isAuthenticated ? (
              <Link
                href="/accounts/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold hover:bg-slate-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Website Account</span>
              </Link>
            ) : (
              <span className="text-slate-500">
                Signed in as <strong>@{user?.username}</strong>
              </span>
            )}
            <button
              type="button"
              onClick={() => setViewMode('classroom')}
              className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              Switch to Student Classroom View →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    school,
    kpis,
    section_analytics = [],
    batches = [],
    available_tests = [],
    assigned_exams = [],
    study_notes = [],
    notifications = [],
  } = data;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students & Gate', icon: Users, badge: kpis.pending_students || 0 },
    { id: 'exams', label: 'Exam & Routine', icon: ClipboardCheck, count: assigned_exams.length },
    { id: 'library', label: 'Library & Notes', icon: BookOpen, count: study_notes.length },
    { id: 'notices', label: 'Notice Board', icon: Bell, count: notifications.length },
    { id: 'attempts', label: 'Attendance & Scores', icon: Award },
    { id: 'security', label: 'Anti-Leak & PIN', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-[85vh] bg-[#F8F7FC] dark:bg-slate-950 rounded-[32px] border border-slate-200/80 dark:border-slate-800/90 shadow-xl overflow-hidden flex flex-col lg:flex-row animate-fade-in mb-10">
      {/* Toast feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Schoooli Design) */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Schoooli Brand Header */}
          <div className="flex items-center justify-between lg:justify-start gap-3 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-black tracking-tight text-violet-700 dark:text-violet-300 truncate">
                  {school.flag || '🏫'} {school.name}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sensei LMS Portal
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('classroom')}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[11px] font-black cursor-pointer"
            >
              Student View
            </button>
          </div>

          {/* Sidebar Nav List */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EDE9FE] dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[10px] font-bold text-slate-400">{item.count}</span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 hidden lg:block ${isActive ? 'text-violet-500' : 'text-slate-300 dark:text-slate-700'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Schoooli Purple Rocket Card: Smart Anti-Leak Class PIN */}
        <div className="hidden lg:block mt-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-5 shadow-xl relative overflow-hidden space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6 text-amber-300" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-200">
              Anti-Leak Class Join PIN
            </div>
            <div className="text-2xl font-black tracking-widest font-mono">
              {school.join_code || '------'}
            </div>
            <p className="text-[11px] text-violet-100 leading-snug">
              {school.require_join_pin ? 'PIN Gate Active' : 'PIN Optional'} •{' '}
              {school.require_approval ? 'Approval Queue ON' : 'Auto-Approve'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleCopy('whatsapp')}
              className="w-full py-2 px-3 rounded-xl bg-white text-violet-700 font-black text-xs shadow-sm hover:bg-violet-50 cursor-pointer transition-all"
            >
              {copiedType === 'whatsapp' ? 'Copied Invite + PIN!' : 'Copy Invite + PIN'}
            </button>
            <button
              type="button"
              onClick={() => runManageAction({ action: 'regenerate_join_code' }, 'New 6-digit Class Join PIN generated!')}
              disabled={actionBusy}
              className="w-full py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] cursor-pointer"
            >
              Rotate 6-Digit PIN
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Top Search & Utility Bar (Schoooli Topbar) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-violet-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, roll ID, batch, or exam..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Batches ({batches.length})</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  Batch: {b}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setViewMode('classroom')}
              className="px-3.5 py-2 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              title="Preview what enrolled students see"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Student View</span>
            </button>

            <a
              href={csvDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </a>

            <button
              type="button"
              onClick={() => fetchDashboard(accessKey)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleClearKey}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 cursor-pointer"
              title="Lock / Switch Key"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Welcome Header + Pending Approvals Alert */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Navigate the future of Japanese CBT training with <strong>{school.name}</strong>.
            </p>
          </div>

          {kpis.pending_students > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                <strong>{kpis.pending_students}</strong> student(s) waiting for Sensei approval
              </span>
              <button
                type="button"
                onClick={() => {
                  setStudentStatusFilter('pending');
                  setActiveNav('students');
                }}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black cursor-pointer"
              >
                Approve Now
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: SCHOOOLI BENTO DASHBOARD                              */}
        {/* ============================================================ */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6">
            {/* ROW 1: 3 Pastel KPI Cards (Schoooli Students / Teachers-Exams / Awards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lavender Card: Students */}
              <div className="rounded-3xl bg-[#F3EEFF] dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/50 p-5 sm:p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-violet-300">
                    Students
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {kpis.total_students}
                  </div>
                  <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                    {kpis.tested_students} tested • {kpis.pending_students || 0} pending
                  </p>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-300">
                  <GraduationCap className="w-7 h-7" />
                </div>
              </div>

              {/* Sky Blue Card: Assigned Exams & Attempts */}
              <div className="rounded-3xl bg-[#EAF6FF] dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/50 p-5 sm:p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-sky-300">
                    Assigned Exams
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {assigned_exams.length}
                  </div>
                  <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                    {kpis.total_attempts} completed attempts
                  </p>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-300">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
              </div>

              {/* Soft Peach Card: Awards / CEFR A2 Pass Rate */}
              <div className="rounded-3xl bg-[#FFF3E8] dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 p-5 sm:p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-amber-300">
                    Awards &amp; Pass Rate
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {kpis.pass_rate_pct}%
                  </div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    Avg Scaled Score: {kpis.avg_scaled_score}/250
                  </p>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-300">
                  <Award className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* ROW 2: Class Exam Routine (5 cols) + Library (4 cols) + Course Statistics Donut (3 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Class Routine Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Class Exam Routine
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Live mock tests with 4-digit room attendance PIN
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('exams')}
                    className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    + Assign Exam
                  </button>
                </div>

                {assigned_exams.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No exams assigned yet. Schedule a Friday mock exam with a 4-digit attendance PIN.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveNav('exams')}
                      className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-black cursor-pointer"
                    >
                      Assign First Mock Exam
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {assigned_exams.slice(0, 2).map((ex, idx) => {
                      const isFirst = idx === 0;
                      const attendedPct =
                        kpis.total_students > 0
                          ? Math.min(100, Math.round((ex.attended_count / kpis.total_students) * 100))
                          : 40;
                      return (
                        <div
                          key={ex.id}
                          className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                  isFirst
                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {ex.schedule_label || 'Active Routine'}
                              </span>
                              {ex.require_pin && (
                                <span className="font-mono text-[11px] font-black text-violet-600 dark:text-violet-300">
                                  PIN: {ex.attendance_pin}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                              {ex.title}
                            </h3>
                            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isFirst ? 'bg-sky-500' : 'bg-amber-500'}`}
                                style={{ width: `${attendedPct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {ex.attended_count} attended • {ex.submitted_count} submitted
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `exam_${ex.id}`,
                                `📝 *${ex.title}* (${school.name})\n🗓️ ${ex.schedule_label || 'Today'}\n🔐 Room Attendance PIN: *${ex.attendance_pin}*\n👉 Open Classroom: ${origin}/partner/${slug}?mode=classroom`
                              )
                            }
                            className={`w-full py-2 px-3 rounded-xl text-[11px] font-black text-white cursor-pointer transition-all ${
                              isFirst
                                ? 'bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-500/20'
                                : 'bg-slate-900 dark:bg-slate-700 hover:opacity-90'
                            }`}
                          >
                            Copy Exam &amp; PIN
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Library Card */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Library</h2>
                  <button
                    type="button"
                    onClick={() => setActiveNav('library')}
                    className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    + Share Note
                  </button>
                </div>

                {study_notes.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Share vocabulary sheets, grammar notes, or Google Drive PDFs with your students.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveNav('library')}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-black cursor-pointer"
                    >
                      Upload Study Note
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {study_notes.slice(0, 4).map((note) => {
                      const meta = NOTE_CATEGORY_META[note.category] || NOTE_CATEGORY_META.general;
                      return (
                        <div
                          key={note.id}
                          className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${meta.bg}`}>
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {note.title}
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {note.views_count} reads • {note.target_batch || 'All Batches'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenNote(note)}
                            className="text-[11px] font-bold text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 shrink-0 cursor-pointer"
                          >
                            Read now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Course Statistics Card (Schoooli Multi-Segment Donut Chart) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Course Statistics
                  </h2>
                </div>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r={donutStats.radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="14"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    {donutStats.segments.map((seg) => (
                      <circle
                        key={seg.key}
                        cx="70"
                        cy="70"
                        r={donutStats.radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400">Total Qs</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {donutStats.totalAnswered}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {(section_analytics.length ? section_analytics : [
                    { key: 's1', label: 'Vocab', accuracy_pct: 0 },
                    { key: 's2', label: 'Conv', accuracy_pct: 0 },
                    { key: 's3', label: 'Listening', accuracy_pct: 0 },
                    { key: 's4', label: 'Reading', accuracy_pct: 0 },
                  ])
                    .slice(0, 4)
                    .map((sec, idx) => (
                      <div key={sec.key} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: SECTION_RING_COLORS[idx % SECTION_RING_COLORS.length] }}
                        />
                        <span className="truncate">
                          {sec.label.split(' ')[0]} ({sec.accuracy_pct}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ROW 3: Star Students & Notifications (Left 6 cols) + Total Exams, Gate Card & Best Performers (Right 6 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 6 cols: Star Students + Notifications */}
              <div className="lg:col-span-6 space-y-5">
                {/* Star Students Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Star Students
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveNav('students')}
                      className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                    >
                      View All ({kpis.total_students})
                    </button>
                  </div>

                  {starStudents.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Students will appear here once enrolled and tested.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="py-2 pr-2">Name</th>
                            <th className="py-2 px-2">ID / Batch</th>
                            <th className="py-2 px-2">Marks</th>
                            <th className="py-2 pl-2 text-right">Percent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                          {starStudents.map((st, idx) => (
                            <tr
                              key={st.user_id}
                              className={idx === 0 ? 'bg-violet-50/60 dark:bg-violet-950/25' : ''}
                            >
                              <td className="py-2.5 pr-2">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                                      idx === 0
                                        ? 'bg-violet-600 text-white'
                                        : 'border border-slate-300 dark:border-slate-700 text-transparent'
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                                    {(st.full_name || st.username || 'S').slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">
                                    {st.full_name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">
                                {st.student_roll_or_id || st.batch || `ID-${st.user_id}`}
                              </td>
                              <td className="py-2.5 px-2 font-black text-slate-800 dark:text-slate-200">
                                {st.best_score !== null ? `${st.best_score}/250` : '—'}
                              </td>
                              <td className="py-2.5 pl-2 text-right font-black text-violet-600 dark:text-violet-400">
                                {st.best_pct !== null ? `${st.best_pct}%` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Notifications Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Notifications
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveNav('notices')}
                      className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                    >
                      + Post Notice
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No school notifications posted yet. Broadcast exam reminders or class closures.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {notifications.slice(0, 3).map((n) => (
                        <div
                          key={n.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  n.priority === 'urgent'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : n.priority === 'important'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                                }`}
                              >
                                {n.priority}
                              </span>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {n.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {n.created_at ? n.created_at.slice(0, 10) : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 6 cols: Total Exams + Smart Anti-Leak Gate Card + Best Performers */}
              <div className="lg:col-span-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Exams Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        Total Exams
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-[10px] font-black">
                        {kpis.pass_rate_pct}% Pass
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {kpis.total_attempts}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Total mock exam submissions across your batch.{' '}
                      <button
                        type="button"
                        onClick={() => setActiveNav('attempts')}
                        className="font-extrabold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                      >
                        view details
                      </button>
                    </p>
                  </div>

                  {/* Smart Anti-Leak Gate Card */}
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/50 dark:to-indigo-950/50 border border-violet-200/70 dark:border-violet-800/70 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300">
                        Smart Link Protection
                      </span>
                      <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        Join PIN: <span className="font-mono text-violet-700 dark:text-violet-300">{school.join_code}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Stop outsiders from using leaked student links.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('security')}
                      className="self-start px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black cursor-pointer"
                    >
                      Configure Gate
                    </button>
                  </div>
                </div>

                {/* Best Performers Card (Schoooli Capsule Progress Bars) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Best Performers
                    </h2>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500">
                      Batch &amp; Module Accuracy
                    </span>
                  </div>

                  {batchPerformanceBars.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Batch performance bars will appear after students complete mock exams.
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {batchPerformanceBars.map((item, idx) => {
                        const capsuleColors = [
                          { track: 'bg-violet-100 dark:bg-violet-950/60', fill: 'bg-violet-600' },
                          { track: 'bg-amber-100 dark:bg-amber-950/60', fill: 'bg-amber-500' },
                          { track: 'bg-sky-100 dark:bg-sky-950/60', fill: 'bg-sky-500' },
                          { track: 'bg-rose-100 dark:bg-rose-950/60', fill: 'bg-rose-500' },
                        ][idx % 4];

                        return (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-bold text-slate-500 dark:text-slate-400 truncate shrink-0">
                              {item.label}
                            </span>
                            <div className={`flex-1 h-9 rounded-full ${capsuleColors.track} p-1 flex items-center justify-between relative overflow-hidden`}>
                              <div
                                className={`h-full rounded-full ${capsuleColors.fill} text-white px-3 flex items-center gap-2 transition-all duration-500`}
                                style={{ width: `${Math.max(32, Math.min(100, item.pct))}%` }}
                              >
                                <div className="flex -space-x-1.5 shrink-0">
                                  {item.members.map((m, i) => (
                                    <span
                                      key={i}
                                      className="w-5 h-5 rounded-full bg-white/25 border border-white/60 text-[9px] font-black flex items-center justify-center"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[11px] font-extrabold truncate">
                                  {item.label}
                                </span>
                              </div>
                              <span className="pr-3 text-[11px] font-black text-slate-700 dark:text-slate-200 shrink-0">
                                {item.pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: STUDENTS & APPROVAL GATE                              */}
        {/* ============================================================ */}
        {activeNav === 'students' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Student Roster &amp; Approval Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Approve real students, reject unknown outsiders who clicked a shared link, or edit Roll IDs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {pendingStudentsList.length > 0 && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() =>
                        runManageAction(
                          { action: 'approve_all_pending' },
                          `Approved ${pendingStudentsList.length} pending student(s)!`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
                    >
                      ✓ Approve All Pending ({pendingStudentsList.length})
                    </button>
                  )}

                  {['all', 'approved', 'pending', 'rejected'].map((stKey) => (
                    <button
                      key={stKey}
                      type="button"
                      onClick={() => setStudentStatusFilter(stKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize cursor-pointer ${
                        studentStatusFilter === stKey
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {stKey}
                    </button>
                  ))}
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No students match this filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Batch &amp; Roll ID</th>
                        <th className="py-3 px-4">Access Gate</th>
                        <th className="py-3 px-4">1st → Best</th>
                        <th className="py-3 px-4 text-right">Sensei Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredStudents.map((st) => (
                        <tr key={st.user_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {st.full_name}
                            </div>
                            <div className="text-[11px] text-slate-400">@{st.username}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold">
                                {st.batch || 'General'}
                              </span>
                              {st.student_roll_or_id && (
                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                                  ID: {st.student_roll_or_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {st.partner_status === 'pending' ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                                ⏳ PENDING APPROVAL
                              </span>
                            ) : st.partner_status === 'rejected' ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                                ⛔ BLOCKED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                                ✓ APPROVED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                            {st.best_score !== null ? (
                              <span>
                                {st.first_score}/250 → <strong>{st.best_score}/250</strong> ({st.best_pct}%)
                              </span>
                            ) : (
                              <span className="text-slate-400">Not tested ({st.attempts_count} att)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {st.partner_status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    runManageAction(
                                      { action: 'approve_student', user_id: st.user_id },
                                      `Approved ${st.full_name}!`
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black cursor-pointer"
                                  title="Approve Student"
                                >
                                  Approve
                                </button>
                              )}
                              {st.partner_status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    runManageAction(
                                      { action: 'reject_student', user_id: st.user_id },
                                      `Blocked ${st.full_name} from classroom.`
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold cursor-pointer"
                                  title="Block / Hold Student"
                                >
                                  Block
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStudent(st);
                                  setEditStudentBatch(st.batch || '');
                                  setEditStudentRoll(st.student_roll_or_id || '');
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                title="Edit Batch or Roll ID"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  runManageAction(
                                    { action: 'remove_student', user_id: st.user_id },
                                    `Removed ${st.full_name} from school.`
                                  )
                                }
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 cursor-pointer"
                                title="Remove from School"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EXAM & ROUTINE (Assign Mock Tests & Attendance PINs)  */}
        {/* ============================================================ */}
        {activeNav === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Assign New Exam Form */}
            <form
              onSubmit={handleAssignExamSubmit}
              className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 self-start"
            >
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-600" />
                <span>Assign Mock Exam to Classroom</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Mock Exam *
                </label>
                <select
                  value={assignTestId}
                  onChange={(e) => setAssignTestId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose JFT-Basic / SSW Exam --</option>
                  {available_tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.partner_school_id ? '🏫 [School Exclusive] ' : ''}
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    value={assignBatch}
                    onChange={(e) => setAssignBatch(e.target.value)}
                    placeholder="All Batches (or Batch-14)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule / Routine Label
                  </label>
                  <input
                    type="text"
                    value={assignSchedule}
                    onChange={(e) => setAssignSchedule(e.target.value)}
                    placeholder="e.g. Friday 10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="e.g. Week 4 Final JFT Assessment"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sensei Instructions
                </label>
                <textarea
                  rows="2"
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="e.g. Headphones required. No dictionary allowed."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-violet-900 dark:text-violet-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignRequirePin}
                    onChange={(e) => setAssignRequirePin(e.target.checked)}
                    className="rounded text-violet-600"
                  />
                  <span>Require 4-Digit Live Exam Room Attendance PIN</span>
                </label>
                {assignRequirePin && (
                  <input
                    type="text"
                    maxLength={6}
                    value={assignPin}
                    onChange={(e) => setAssignPin(e.target.value)}
                    placeholder="Auto-generate 4-digit PIN (or type e.g. 4821)"
                    className="w-full px-3 py-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-md shadow-violet-500/20 cursor-pointer"
              >
                {actionBusy ? 'Assigning...' : 'Assign Exam to Classroom'}
              </button>
            </form>

            {/* Assigned Exams List */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Assigned Classroom Exams ({assigned_exams.length})
              </h2>

              {assigned_exams.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">
                  No mock exams assigned yet. Use the form on the left to assign a test.
                </p>
              ) : (
                <div className="space-y-3">
                  {assigned_exams.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              ex.is_active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ex.is_active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                          <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                            {ex.schedule_label || 'Ongoing'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • Batch: {ex.target_batch || 'All'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {ex.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Attendance Checked In: <strong>{ex.attended_count}</strong> • Completed Submissions:{' '}
                          <strong>{ex.submitted_count}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {ex.require_pin && (
                          <button
                            type="button"
                            onClick={() =>
                              runManageAction(
                                { action: 'rotate_exam_pin', exam_id: ex.id },
                                'New 4-digit Exam PIN generated!'
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200 font-mono text-xs font-black cursor-pointer"
                            title="Click to rotate 4-digit PIN"
                          >
                            PIN: {ex.attendance_pin} ↻
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            runManageAction(
                              { action: 'toggle_assigned_exam', exam_id: ex.id },
                              'Exam status updated!'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold cursor-pointer"
                        >
                          {ex.is_active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            runManageAction(
                              { action: 'delete_assigned_exam', exam_id: ex.id },
                              'Assigned exam removed.'
                            )
                          }
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: LIBRARY & STUDY NOTES                                 */}
        {/* ============================================================ */}
        {activeNav === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleCreateNoteSubmit}
              className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 self-start"
            >
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>Share Study Note / PDF Link</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Irodori A2 Lesson 12 Vocabulary Sheet"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {Object.entries(NOTE_CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.icon} {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    value={noteBatch}
                    onChange={(e) => setNoteBatch(e.target.value)}
                    placeholder="All Batches"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study Notes / Lesson Summary
                </label>
                <textarea
                  rows="5"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write kanji rules, grammar examples, or weekly homework instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  External PDF / Google Drive / YouTube Link (Optional)
                </label>
                <input
                  type="url"
                  value={noteUrl}
                  onChange={(e) => setNoteUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notePinned}
                  onChange={(e) => setNotePinned(e.target.checked)}
                />
                <span>📌 Pin to top of student library</span>
              </label>

              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black cursor-pointer"
              >
                {actionBusy ? 'Publishing...' : 'Publish Study Note'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Shared Library Materials ({study_notes.length})
              </h2>

              {study_notes.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">
                  No study materials shared yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {study_notes.map((note) => {
                    const meta = NOTE_CATEGORY_META[note.category] || NOTE_CATEGORY_META.general;
                    return (
                      <div
                        key={note.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.bg}`}>
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {note.is_pinned ? '📌 ' : ''}
                              {note.title}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {meta.label} • Batch: {note.target_batch || 'All'} • {note.views_count} student views
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveNoteModal(note)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              runManageAction(
                                { action: 'delete_note', note_id: note.id },
                                'Study note deleted.'
                              )
                            }
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: NOTICE BOARD (Broadcast Announcements)                */}
        {/* ============================================================ */}
        {activeNav === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleCreateNoticeSubmit}
              className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 self-start"
            >
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Post School Notification</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Friday Mock Test Starts at 10:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="normal">Normal Notice</option>
                    <option value="important">Important Reminder</option>
                    <option value="urgent">🚨 Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    value={noticeBatch}
                    onChange={(e) => setNoticeBatch(e.target.value)}
                    placeholder="All Batches"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  rows="4"
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Write announcement details for your students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer"
              >
                {actionBusy ? 'Posting...' : 'Broadcast Notification'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Active School Notifications ({notifications.length})
              </h2>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">
                  No notifications posted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase">
                            {n.priority}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Batch: {n.target_batch || 'All'} • {n.created_at ? n.created_at.slice(0, 10) : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          {n.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          runManageAction(
                            { action: 'delete_notification', notification_id: n.id },
                            'Notification removed.'
                          )
                        }
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ATTENDANCE & RECENT SCORES                            */}
        {/* ============================================================ */}
        {activeNav === 'attempts' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Recent Exam Submissions ({filteredAttempts.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Live feed of every mock exam completed by your approved students.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="">All Mock Exams</option>
                  {available_tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">
                No completed attempts found for this filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Exam</th>
                      <th className="py-3 px-4">Scaled Score</th>
                      <th className="py-3 px-4">Raw Accuracy</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredAttempts.map((att) => (
                      <tr key={att.attempt_id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{att.full_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {att.batch || 'General'} {att.student_roll_or_id ? `• ID: ${att.student_roll_or_id}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {att.test_title}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                          {att.scaled_score}/250
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {att.raw_score}/{att.total_questions} ({att.percentage}%)
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              att.passed
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {att.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {att.completed_at ? att.completed_at.slice(0, 10) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: ANTI-LEAK SECURITY & JOIN PIN                         */}
        {/* ============================================================ */}
        {activeNav === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 3-Layer Smart Protection Controls */}
            <form
              onSubmit={handleSaveSecurity}
              className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5"
            >
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-violet-600" />
                  <span>Anti-Link-Sharing &amp; Smart Enrollment Gate</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prevent students from forwarding your school invite link to friends outside your training center.
                </p>
              </div>

              {/* Rotating 6-Digit Class Join PIN Box */}
              <div className="p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300">
                    Active 6-Digit Class Join PIN
                  </span>
                  <div className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white mt-0.5">
                    {school.join_code || '------'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Rotate this PIN anytime after your batch finishes registering.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('pin')}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-700 text-xs font-black text-violet-700 dark:text-violet-300 cursor-pointer"
                  >
                    Copy PIN
                  </button>
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      runManageAction(
                        { action: 'regenerate_join_code' },
                        'Generated new 6-Digit Class Join PIN!'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black cursor-pointer"
                  >
                    Rotate PIN ↻
                  </button>
                </div>
              </div>

              {/* 3 Toggle Switches */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secRequirePin}
                    onChange={(e) => setSecRequirePin(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      1. Require 6-Digit Class Join PIN on Invite Links
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Even if a student shares your link on Facebook/WhatsApp, outsiders cannot join without entering the 6-digit PIN above.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secRequireApproval}
                    onChange={(e) => setSecRequireApproval(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      2. Hold New Students in Sensei Approval Queue
                    </div>
                    <p className="text-[11px] text-slate-500">
                      New students who join are placed in <strong>Pending</strong> status and cannot view your private exams, notes, or notices until you click Approve.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secLocked}
                    onChange={(e) => setSecLocked(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-xs font-black text-rose-900 dark:text-rose-200">
                      3. Lock New Enrollments Completely
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      Turn this ON once all your batch students have joined. Blocks all new signups while keeping existing students active.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Welcome Banner Message
                </label>
                <input
                  type="text"
                  value={secWelcomeMsg}
                  onChange={(e) => setSecWelcomeMsg(e.target.value)}
                  placeholder="e.g. Welcome to LPK Sakura Batch-14 Official Exam Portal!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={actionBusy}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black cursor-pointer"
              >
                {actionBusy ? 'Saving...' : 'Save Security & Gate Settings'}
              </button>
            </form>

            {/* Batch Invite Link & WhatsApp Builder */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 self-start">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Batch Invite Link &amp; WhatsApp Pitch</span>
              </h2>
              <p className="text-xs text-slate-500">
                Generate a batch-tagged link and copy a ready-to-paste WhatsApp message that includes your 6-digit Join PIN.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Tag (Optional)
                </label>
                <input
                  type="text"
                  value={inviteBatchInput}
                  onChange={(e) => setInviteBatchInput(e.target.value)}
                  placeholder="e.g. Batch-14-Morning"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] break-all text-slate-700 dark:text-slate-200">
                {generatedInviteUrl}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy('link')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedType === 'link' ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('whatsapp')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedType === 'whatsapp' ? 'WhatsApp Message Copied!' : 'Copy WhatsApp Invite + PIN'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Study Note Reader */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  {NOTE_CATEGORY_META[activeNoteModal.category]?.label || 'Study Note'}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
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
            {activeNoteModal.content && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {activeNoteModal.content}
              </div>
            )}
            {activeNoteModal.external_url && (
              <a
                href={activeNoteModal.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black"
              >
                <span>Open External PDF / Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Student Batch / Roll ID */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Edit {editingStudent.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Batch / Class Name
                </label>
                <input
                  type="text"
                  value={editStudentBatch}
                  onChange={(e) => setEditStudentBatch(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Student Roll / ID
                </label>
                <input
                  type="text"
                  value={editStudentRoll}
                  onChange={(e) => setEditStudentRoll(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
              <button
                type="button"
                disabled={actionBusy}
                onClick={async () => {
                  const ok = await runManageAction(
                    {
                      action: 'update_student_meta',
                      user_id: editingStudent.user_id,
                      batch: editStudentBatch.trim(),
                      student_roll_or_id: editStudentRoll.trim(),
                    },
                    'Updated student batch & roll ID!'
                  );
                  if (ok) setEditingStudent(null);
                }}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

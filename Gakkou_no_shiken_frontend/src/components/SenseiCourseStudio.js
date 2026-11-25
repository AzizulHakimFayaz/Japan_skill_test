'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Plus,
  Trash2,
  FolderPlus,
  PlayCircle,
  Upload,
  Link2,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getSenseiStudio, postSenseiStudioAction, uploadSenseiStudioWithProgress } from '@/lib/api';

const COURSE_CATEGORIES = [
  { value: 'jft_basic', label: 'JFT-Basic (A2)' },
  { value: 'jlpt', label: 'JLPT (N5–N1)' },
  { value: 'ssw', label: 'SSW / Tokutei Ginou' },
  { value: 'conversation', label: 'Japanese Conversation' },
  { value: 'kanji', label: 'Kanji & Vocabulary' },
  { value: 'general', label: 'General Course' },
];

const EVENT_TYPES = [
  { value: 'live_class', label: 'Live Class' },
  { value: 'mock_exam', label: 'Mock Exam' },
  { value: 'assignment', label: 'Assignment / Homework' },
  { value: 'reminder', label: 'Academy Reminder' },
];

export default function SenseiCourseStudio({ slug, accessKey, mode = 'courses', onToast }) {
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Selected course & expanded modules
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  // Create Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cCategory, setCCategory] = useState('jft_basic');
  const [cLevel, setCLevel] = useState('N5 • A2');
  const [cBatch, setCBatch] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cOutcomes, setCOutcomes] = useState('');
  const [cAudience, setCAudience] = useState('');

  // Add Module form
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');

  // Add Video Lesson form (per module)
  const [addingLessonForModule, setAddingLessonForModule] = useState(null);
  const [lTitle, setLTitle] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lDuration, setLDuration] = useState('15');
  const [lVideoMode, setLVideoMode] = useState('url'); // 'url' | 'file'
  const [lVideoUrl, setLVideoUrl] = useState('');
  const [lVideoFile, setLVideoFile] = useState(null);
  const [lResourceUrl, setLResourceUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null); // { percent, loadedMb, totalMb }

  // Schedule form
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState('live_class');
  const [evDate, setEvDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [evStart, setEvStart] = useState('08:00 PM');
  const [evEnd, setEvEnd] = useState('09:30 PM');
  const [evBatch, setEvBatch] = useState('');
  const [evMeetingUrl, setEvMeetingUrl] = useState('');
  const [evNotes, setEvNotes] = useState('');

  // Sensei reply to student discussion
  const [replyCourseId, setReplyCourseId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const notify = useCallback(
    (msg) => {
      if (onToast) onToast(msg);
    },
    [onToast]
  );

  const loadStudio = useCallback(
    async (silent = false) => {
      if (!slug) return;
      if (!silent) setLoading(true);
      setError('');
      try {
        const res = await getSenseiStudio(slug, { key: accessKey });
        setStudio(res);
        if (res?.courses?.length && !selectedCourseId) {
          setSelectedCourseId(res.courses[0].id);
        }
      } catch (err) {
        setError(err?.message || 'Unable to load Sensei Course Studio.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [slug, accessKey, selectedCourseId]
  );

  useEffect(() => {
    loadStudio();
  }, [loadStudio]);

  const activeCourse = (studio?.courses || []).find((c) => c.id === selectedCourseId) || studio?.courses?.[0] || null;

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!cTitle.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await postSenseiStudioAction(
        slug,
        {
          action: 'create_course',
          title: cTitle.trim(),
          category: cCategory,
          level_badge: cLevel.trim() || 'N5 • A2',
          target_batch: cBatch.trim(),
          description: cDesc.trim(),
          outcomes_text: cOutcomes.trim(),
          audience_text: cAudience.trim(),
        },
        { key: accessKey }
      );
      setCTitle('');
      setCDesc('');
      setCOutcomes('');
      setCAudience('');
      setCBatch('');
      setShowCourseForm(false);
      if (res?.course?.id) setSelectedCourseId(res.course.id);
      notify('Course created! Now add modules and video lessons.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to create course.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course along with all its modules and video lessons?')) return;
    setBusy(true);
    try {
      await postSenseiStudioAction(slug, { action: 'delete_course', course_id: courseId }, { key: accessKey });
      if (selectedCourseId === courseId) setSelectedCourseId(null);
      notify('Course deleted.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to delete course.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!activeCourse || !modTitle.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await postSenseiStudioAction(
        slug,
        {
          action: 'create_module',
          course_id: activeCourse.id,
          title: modTitle.trim(),
          description: modDesc.trim(),
        },
        { key: accessKey }
      );
      setModTitle('');
      setModDesc('');
      if (res?.module_id) {
        setExpandedModules((prev) => ({ ...prev, [res.module_id]: true }));
      }
      notify('Module added to course.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to add module.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and its video lessons?')) return;
    setBusy(true);
    try {
      await postSenseiStudioAction(slug, { action: 'delete_module', module_id: moduleId }, { key: accessKey });
      notify('Module removed.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to delete module.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    if (!lTitle.trim()) return;
    setBusy(true);
    setError('');
    setUploadProgress({ percent: 0, loadedMb: '0.0', totalMb: lVideoFile ? (lVideoFile.size / (1024 * 1024)).toFixed(1) : '0.0' });
    try {
      const fd = new FormData();
      fd.append('action', 'create_lesson');
      fd.append('module_id', String(moduleId));
      fd.append('title', lTitle.trim());
      fd.append('description', lDesc.trim());
      fd.append('duration_minutes', String(lDuration || '15'));
      fd.append('resource_url', lResourceUrl.trim());
      if (lVideoMode === 'file' && lVideoFile) {
        fd.append('video_file', lVideoFile);
      } else {
        fd.append('video_url', lVideoUrl.trim());
      }
      await uploadSenseiStudioWithProgress(slug, fd, {
        key: accessKey,
        onProgress: (info) => setUploadProgress(info),
      });
      setUploadProgress({ percent: 100, loadedMb: '100%', totalMb: '' });
      setLTitle('');
      setLDesc('');
      setLVideoUrl('');
      setLVideoFile(null);
      setLResourceUrl('');
      setAddingLessonForModule(null);
      notify('Video lesson published! Enrolled students can watch it now.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to add video lesson.');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this video lesson?')) return;
    setBusy(true);
    try {
      await postSenseiStudioAction(slug, { action: 'delete_lesson', lesson_id: lessonId }, { key: accessKey });
      notify('Lesson deleted.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to delete lesson.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate) return;
    setBusy(true);
    setError('');
    try {
      await postSenseiStudioAction(
        slug,
        {
          action: 'create_schedule',
          title: evTitle.trim(),
          event_type: evType,
          event_date: evDate,
          start_time_label: evStart.trim(),
          end_time_label: evEnd.trim(),
          target_batch: evBatch.trim(),
          meeting_url: evMeetingUrl.trim(),
          notes: evNotes.trim(),
        },
        { key: accessKey }
      );
      setEvTitle('');
      setEvMeetingUrl('');
      setEvNotes('');
      notify('Class / schedule event published to Student Portal!');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to add schedule event.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSchedule = async (eventId) => {
    setBusy(true);
    try {
      await postSenseiStudioAction(slug, { action: 'delete_schedule', event_id: eventId }, { key: accessKey });
      notify('Schedule event removed.');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to remove event.');
    } finally {
      setBusy(false);
    }
  };

  const handleReplyDiscussion = async (courseId) => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await postSenseiStudioAction(
        slug,
        { action: 'reply_discussion', course_id: courseId, message: replyText.trim() },
        { key: accessKey }
      );
      setReplyText('');
      setReplyCourseId(null);
      notify('Sensei reply posted to student course discussion!');
      await loadStudio(true);
    } catch (err) {
      setError(err?.message || 'Failed to post reply.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-10 text-center space-y-2">
        <Loader2 className="w-7 h-7 animate-spin text-[#DB1A1A] mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading Sensei Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================================
          MODE A: COURSES, MODULES & VIDEO LESSONS STUDIO
         ===================================================================== */}
      {mode === 'courses' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                <Video className="w-3 h-3 text-[#DB1A1A]" /> Live Syncs to Student Portal
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                Sensei Course &amp; Video Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create structured courses, organize modules, and upload videos (MP4/WebM or YouTube/Vimeo/Drive links). Changes appear live in your students&apos; portal.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/student-portal"
                className="px-3.5 py-2 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] hover:bg-[#CBE5E3]/70 text-xs font-black inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Student Portal
              </Link>
              <button
                type="button"
                onClick={() => setShowCourseForm((v) => !v)}
                className="px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Course
              </button>
            </div>
          </div>

          {/* Create Course Form */}
          {showCourseForm && (
            <form
              onSubmit={handleCreateCourse}
              className="rounded-2xl bg-white dark:bg-[#0f1629] border-2 border-[#8CC7C4] dark:border-slate-700 p-5 space-y-4"
            >
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Create New Academy Course</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="Course Title (e.g. JFT-Basic A2 Complete)"
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none focus:border-[#DB1A1A]"
                />
                <select
                  value={cCategory}
                  onChange={(e) => setCCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                >
                  {COURSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={cLevel}
                  onChange={(e) => setCLevel(e.target.value)}
                  placeholder="Badge (e.g. N5 • A2)"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={2}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Course description shown in the Student Portal Overview tab..."
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                />
                <textarea
                  rows={2}
                  value={cOutcomes}
                  onChange={(e) => setCOutcomes(e.target.value)}
                  placeholder="Learning outcomes (one per line, e.g. Pass JFT-Basic 200+ pts)"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cBatch}
                  onChange={(e) => setCBatch(e.target.value)}
                  placeholder="Target Batch (leave blank for All Batches)"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                />
                <input
                  type="text"
                  value={cAudience}
                  onChange={(e) => setCAudience(e.target.value)}
                  placeholder="Target Audience (e.g. Beginners preparing for Japan SSW)"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Creating...' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Courses Split View */}
          {(studio?.courses || []).length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-dashed border-[#8CC7C4] p-10 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#8CC7C4] mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">No Academy Courses Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>+ New Course</strong> above to build your first structured video course. Your enrolled students will see it immediately inside their Student Portal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Course List */}
              <div className="lg:col-span-4 space-y-2.5">
                {studio.courses.map((course) => {
                  const isSel = activeCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`rounded-2xl p-4 border-2 transition cursor-pointer ${
                        isSel
                          ? 'bg-[#EAF4F4]/70 dark:bg-slate-800/80 border-[#DB1A1A]'
                          : 'bg-white dark:bg-[#0f1629] border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-[10px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                            {course.level_badge} • {course.category_label}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                            {course.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                            {course.module_count} Modules • {course.lesson_count} Videos • {course.total_duration_minutes} min
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Module & Video Lesson Builder */}
              {activeCourse && (
                <div className="lg:col-span-8 space-y-4">
                  <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {activeCourse.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeCourse.description || 'Add modules and video lessons below.'}
                      </p>
                    </div>

                    {/* Add Module Inline Form */}
                    <form onSubmit={handleAddModule} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#EAF4F4] dark:border-slate-800">
                      <input
                        type="text"
                        required
                        value={modTitle}
                        onChange={(e) => setModTitle(e.target.value)}
                        placeholder="New Module Title (e.g. Module 1: Hiragana & Greetings)"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none focus:border-[#DB1A1A]"
                      />
                      <button
                        type="submit"
                        disabled={busy}
                        className="px-4 py-2 rounded-xl bg-[#2C687B] hover:bg-[#215262] text-white text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Add Module
                      </button>
                    </form>

                    {/* Modules Accordion */}
                    <div className="space-y-3">
                      {(activeCourse.modules || []).length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          No modules yet. Add your first module above to start uploading videos.
                        </p>
                      ) : (
                        activeCourse.modules.map((mod, idx) => {
                          const isOpen = expandedModules[mod.id] ?? true;
                          return (
                            <div
                              key={mod.id}
                              className="rounded-xl border border-[#CBE5E3] dark:border-slate-700 overflow-hidden"
                            >
                              <div
                                onClick={() =>
                                  setExpandedModules((prev) => ({ ...prev, [mod.id]: !isOpen }))
                                }
                                className="px-3.5 py-3 bg-[#EAF4F4]/60 dark:bg-slate-800/70 flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-[#2C687B]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-[#2C687B]" />
                                  )}
                                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                    Module {idx + 1}: {mod.title}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                    ({mod.lesson_count} videos • {mod.duration_minutes}m)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
                                      setAddingLessonForModule(
                                        addingLessonForModule === mod.id ? null : mod.id
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#DB1A1A] hover:bg-[#B81515] text-white text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Add Video
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteModule(mod.id);
                                    }}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isOpen && (
                                <div className="p-3.5 space-y-2.5 bg-white dark:bg-[#0f1629]">
                                  {/* Add Lesson Form */}
                                  {addingLessonForModule === mod.id && (
                                    <form
                                      onSubmit={(e) => handleAddLesson(e, mod.id)}
                                      className="rounded-xl bg-[#EAF4F4]/40 dark:bg-slate-900 border border-[#8CC7C4] p-4 space-y-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-[#2C687B] dark:text-[#8CC7C4]">
                                          Upload Video / Add Lesson
                                        </span>
                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-[#CBE5E3] dark:border-slate-700">
                                          <button
                                            type="button"
                                            onClick={() => setLVideoMode('url')}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                                              lVideoMode === 'url'
                                                ? 'bg-[#2C687B] text-white'
                                                : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                          >
                                            <Link2 className="w-3 h-3" /> Video Link
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setLVideoMode('file')}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                                              lVideoMode === 'file'
                                                ? 'bg-[#2C687B] text-white'
                                                : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                          >
                                            <Upload className="w-3 h-3" /> Upload MP4
                                          </button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <input
                                          type="text"
                                          required
                                          value={lTitle}
                                          onChange={(e) => setLTitle(e.target.value)}
                                          placeholder="Lesson Title (e.g. Lesson 1: Basic Greetings)"
                                          className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                                        />
                                        <input
                                          type="number"
                                          min="1"
                                          max="300"
                                          value={lDuration}
                                          onChange={(e) => setLDuration(e.target.value)}
                                          placeholder="Duration (min)"
                                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                                        />
                                      </div>

                                      {lVideoMode === 'url' ? (
                                        <input
                                          type="url"
                                          value={lVideoUrl}
                                          onChange={(e) => setLVideoUrl(e.target.value)}
                                          placeholder="YouTube, Vimeo, Google Drive share link, or direct .mp4 URL"
                                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                                        />
                                      ) : (
                                        <div className="space-y-1">
                                          <input
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={(e) => setLVideoFile(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold"
                                          />
                                          <p className="text-[10px] text-slate-500">
                                            Direct MP4/WebM upload (max 150 MB). For long 1-hour classes, YouTube Unlisted or Google Drive links stream fastest!
                                          </p>
                                        </div>
                                      )}

                                      <input
                                        type="url"
                                        value={lResourceUrl}
                                        onChange={(e) => setLResourceUrl(e.target.value)}
                                        placeholder="Optional PDF / Slide / Worksheet URL"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                                      />

                                      <textarea
                                        rows={2}
                                        value={lDesc}
                                        onChange={(e) => setLDesc(e.target.value)}
                                        placeholder="Lesson notes or key takeaways..."
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
                                      />

                                      <div className="flex flex-wrap items-center gap-2.5">
                                        <button
                                          type="submit"
                                          disabled={busy}
                                          className={`relative overflow-hidden min-w-[165px] px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                                            busy && uploadProgress
                                              ? 'bg-[#FEE2E2] dark:bg-rose-950/60 text-[#991B1B] dark:text-white border border-[#DB1A1A]/40'
                                              : 'bg-[#DB1A1A] hover:bg-[#B81515] text-white'
                                          }`}
                                        >
                                          {busy && uploadProgress && (
                                            <span
                                              className="absolute inset-y-0 left-0 bg-[#DB1A1A] transition-all duration-200 ease-out"
                                              style={{ width: `${uploadProgress.percent}%` }}
                                            />
                                          )}
                                          <span
                                            className={`relative z-10 inline-flex items-center gap-1.5 ${
                                              busy && uploadProgress && uploadProgress.percent >= 45
                                                ? 'text-white'
                                                : ''
                                            }`}
                                          >
                                            {busy && uploadProgress ? (
                                              uploadProgress.percent >= 100 ? (
                                                <>
                                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                  <span>Saving... 100%</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Upload className="w-3.5 h-3.5 animate-pulse" />
                                                  <span>Uploading {uploadProgress.percent}%</span>
                                                </>
                                              )
                                            ) : (
                                              'Save Video Lesson'
                                            )}
                                          </span>
                                        </button>

                                        {busy && uploadProgress && lVideoMode === 'file' && lVideoFile && (
                                          <span className="text-[11px] font-bold text-[#2C687B] dark:text-[#8CC7C4]">
                                            {uploadProgress.loadedMb} / {uploadProgress.totalMb} MB
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => setAddingLessonForModule(null)}
                                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 text-xs font-bold cursor-pointer disabled:opacity-40"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {/* Existing Lessons */}
                                  {(mod.lessons || []).length === 0 ? (
                                    <p className="text-[11px] text-slate-400 py-2 text-center">
                                      No video lessons in this module yet.
                                    </p>
                                  ) : (
                                    mod.lessons.map((les) => (
                                      <div
                                        key={les.id}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <PlayCircle className="w-4 h-4 text-[#DB1A1A] shrink-0" />
                                          <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                              {les.title}
                                            </div>
                                            <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                                              <span>{les.duration_minutes} min</span>
                                              <span>•</span>
                                              <span className="uppercase text-[#2C687B] dark:text-[#8CC7C4]">
                                                {les.video_type === 'none' ? 'Text Only' : les.video_type}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLesson(les.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Student Discussions / Q&A Feed */}
                  {(studio?.discussions || []).length > 0 && (
                    <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#DB1A1A]" /> Recent Student Course Q&amp;A
                      </h3>
                      <div className="space-y-2.5 max-h-72 overflow-y-auto">
                        {studio.discussions.slice(0, 10).map((d) => (
                          <div key={d.id} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 space-y-1">
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="font-black text-slate-800 dark:text-white">
                                {d.author_name}{' '}
                                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${d.author_role === 'sensei' ? 'bg-[#DB1A1A] text-white' : 'bg-[#EAF4F4] text-[#2C687B]'}`}>
                                  {d.author_role}
                                </span>
                              </span>
                              <span className="text-slate-400 truncate">{d.course_title}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{d.message}</p>
                            {d.author_role !== 'sensei' && (
                              <button
                                type="button"
                                onClick={() => setReplyCourseId(replyCourseId === d.course_id ? null : d.course_id)}
                                className="text-[11px] font-extrabold text-[#2C687B] hover:text-[#DB1A1A] cursor-pointer"
                              >
                                Reply as Sensei →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {replyCourseId && (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write Sensei reply..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] text-xs font-semibold outline-none"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleReplyDiscussion(replyCourseId)}
                            className="px-4 py-2 rounded-xl bg-[#DB1A1A] text-white text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Send
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODE B: CLASS & EXAM SCHEDULE MANAGER
         ===================================================================== */}
      {mode === 'schedule' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#DB1A1A]" /> Academy Class &amp; Exam Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Publish live classes (Zoom/Google Meet), mock test dates, or reminders. They appear immediately in your students&apos; Schedule calendar &amp; Upcoming Tasks.
              </p>
            </div>

            <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#EAF4F4] dark:border-slate-800">
              <input
                type="text"
                required
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                placeholder="Event Title (e.g. N5 Grammar Live Class)"
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <select
                value={evType}
                onChange={(e) => setEvType(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="date"
                required
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                value={evStart}
                onChange={(e) => setEvStart(e.target.value)}
                placeholder="Start (e.g. 08:00 PM)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                value={evEnd}
                onChange={(e) => setEvEnd(e.target.value)}
                placeholder="End (e.g. 09:30 PM)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <input
                type="url"
                value={evMeetingUrl}
                onChange={(e) => setEvMeetingUrl(e.target.value)}
                placeholder="Optional Zoom / Google Meet URL"
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                value={evBatch}
                onChange={(e) => setEvBatch(e.target.value)}
                placeholder="Target Batch (optional)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-xs font-semibold outline-none"
              />
              <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Publish Schedule Event
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Scheduled Events ({(studio?.schedule || []).length})
            </h3>
            {(studio?.schedule || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No scheduled events yet.</p>
            ) : (
              <div className="space-y-2.5">
                {studio.schedule.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#CBE5E3]/70 dark:border-slate-800"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-[10px] font-black uppercase">
                          {ev.event_type_label}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{ev.title}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{ev.event_date} • {ev.start_time_label}{ev.end_time_label ? ` – ${ev.end_time_label}` : ''}</span>
                        {ev.target_batch && <span>• Batch: {ev.target_batch}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ev.meeting_url && (
                        <a
                          href={ev.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#2C687B] text-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          Join Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(ev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
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
    </div>
  );
}

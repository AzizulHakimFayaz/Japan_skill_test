'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyResults, updateUserProfile } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
  Target,
  GraduationCap,
  MapPin,
  Eye,
  Edit3,
  Trophy,
  X,
  Check,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function MyResultsPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTargetExam, setEditTargetExam] = useState('jft_basic');
  const [editJapaneseLevel, setEditJapaneseLevel] = useState('n4');
  const [editLocation, setEditLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/accounts/login?next=/accounts/my-results');
      return;
    }

    if (isAuthenticated) {
      getMyResults()
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load test history');
        })
        .finally(() => {
          setLoading(false);
        });

      // Pre-fill profile state
      if (user) {
        setEditFirstName(user.first_name || '');
        setEditLastName(user.last_name || '');
        setEditBio(user.profile?.bio || '');
        setEditTargetExam(user.profile?.target_exam || 'jft_basic');
        setEditJapaneseLevel(user.profile?.japanese_level || 'n4');
        setEditLocation(user.profile?.location || '');
      }
    }
  }, [authLoading, isAuthenticated, router, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await updateUserProfile({
        first_name: editFirstName,
        last_name: editLastName,
        bio: editBio,
        target_exam: editTargetExam,
        japanese_level: editJapaneseLevel,
        location: editLocation,
      });
      if (res?.user) {
        if (setUser) setUser(res.user);
        setProfileSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setProfileSuccessMsg(null);
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">Loading Candidate Statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          <AlertCircle className="w-8 h-8 text-japan-red" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link href="/" className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl">
          Back to Portal
        </Link>
      </div>
    );
  }

  const {
    total_attempts = 0,
    passed_attempts = 0,
    pass_rate = 0,
    highest_scaled_score = 0,
    avg_scaled_score = 0,
    highest_level = 'Below A1',
    section_stats = [],
    attempts = [],
  } = data || {};

  const profile = user?.profile || {};
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username;

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Candidate Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-japan-navy to-slate-900 text-white p-6 sm:p-10 shadow-2xl shadow-slate-900/20 border border-slate-800/80 mobile-app-card">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Dynamic Initials Avatar */}
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl shadow-red-500/30 border-2 sm:border-4 border-white/20 flex-shrink-0">
              {fullName.slice(0, 1).toUpperCase()}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{fullName}</h1>
                <span className="text-slate-400 font-mono text-xs">(@{user?.username})</span>
                {user?.is_staff && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    Staff Admin
                  </span>
                )}
              </div>

              {/* Bio snippet */}
              {profile.bio ? (
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl line-clamp-2 italic">
                  &quot;{profile.bio}&quot;
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  No candidate bio set yet. Click Edit Profile below to add your goals.
                </p>
              )}

              {/* Badges: Target Exam, Level, Location */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {profile.target_exam_display && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[11px] font-bold">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{profile.target_exam_display}</span>
                  </span>
                )}
                {profile.japanese_level_display && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{profile.japanese_level_display}</span>
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {user?.username && (
              <Link
                href={`/profile/${encodeURIComponent(user.username)}`}
                className="inline-flex items-center justify-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-all text-xs sm:text-sm border border-rose-500/30 active:scale-95 shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>View Public Profile</span>
              </Link>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 cursor-pointer active:scale-95 shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-all text-xs sm:text-sm border border-amber-500/30 active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl transition-all shadow-lg shadow-red-500/20 text-xs sm:text-sm active:scale-95"
            >
              <span>Take Exam</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center text-slate-400 hover:text-white font-semibold px-3 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>

        </div>

        {/* Watermark */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-8xl sm:text-9xl tracking-tighter text-rose-300 pointer-events-none select-none">
          成績
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-japan-red" />
                <h3 className="text-lg font-black text-slate-900">Edit Candidate Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-japan-red"
                    placeholder="e.g. Kenji"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-japan-red"
                    placeholder="e.g. Tanaka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Candidate Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-japan-red"
                  placeholder="Share your goals (e.g. Preparing for JFT-Basic & SSW Nursing Care in Tokyo!)"
                />
                <span className="text-[10px] text-slate-400 float-right">{editBio.length}/500</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Target Examination</label>
                  <select
                    value={editTargetExam}
                    onChange={(e) => setEditTargetExam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-japan-red"
                  >
                    <option value="jft_basic">JFT-Basic (A2 Standard)</option>
                    <option value="ssw_nursing">SSW: Nursing Care (介護)</option>
                    <option value="ssw_food">SSW: Food Service (外食業)</option>
                    <option value="ssw_agriculture">SSW: Agriculture (農業)</option>
                    <option value="ssw_construction">SSW: Construction (建設業)</option>
                    <option value="ssw_manufacturing">SSW: Manufacturing (製造業)</option>
                    <option value="ssw_accommodation">SSW: Accommodation (宿泊業)</option>
                    <option value="jlpt_n4">JLPT N4</option>
                    <option value="jlpt_n3">JLPT N3</option>
                    <option value="other">Other Examination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Japanese Level</label>
                  <select
                    value={editJapaneseLevel}
                    onChange={(e) => setEditJapaneseLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-japan-red"
                  >
                    <option value="n5">Beginner (N5 / A1)</option>
                    <option value="n4">Elementary (N4 / A2)</option>
                    <option value="n3">Intermediate (N3 / B1)</option>
                    <option value="n2">Upper Intermediate (N2 / B2)</option>
                    <option value="n1">Advanced (N1 / C1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">Location / Country</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-japan-red"
                  placeholder="e.g. Dhaka, Bangladesh or Yangon, Myanmar"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {total_attempts > 0 ? (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-700 flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Exams</span>
                <strong className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block">{total_attempts}</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Completed CBT</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Pass Rate</span>
                <strong className="text-2xl sm:text-3xl font-black text-emerald-600 leading-none block">{pass_rate}%</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">{passed_attempts} of {total_attempts} passed</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Max Score</span>
                <strong className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block">
                  {highest_scaled_score} <span className="text-xs text-slate-400 font-normal">/ 250</span>
                </strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Avg: {avg_scaled_score} pts</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-japan-red flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-japan-red" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">CEFR Level</span>
                <strong className="text-xl sm:text-2xl font-black text-japan-red leading-none block">{highest_level}</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">JFT Standard</span>
              </div>
            </div>
          </div>

          {/* Section Competency Breakdown Bars */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-slate-200/80 p-4 sm:p-8 shadow-2xs space-y-4 sm:space-y-6 mobile-app-card">
            <div>
              <span className="text-[11px] sm:text-xs font-extrabold text-japan-red uppercase tracking-wider block mb-0.5">
                Diagnostic Analysis
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cumulative Section Performance</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Accuracy breakdown across all 4 JFT exam sections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {section_stats.map((sec) => (
                <div key={sec.key} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">{sec.name_en}</strong>
                      <span className="text-[11px] text-slate-400 font-medium">{sec.name_ja}</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-900">{sec.pct}%</span>
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        sec.color === 'rose'
                          ? 'bg-rose-500'
                          : sec.color === 'indigo'
                          ? 'bg-indigo-500'
                          : sec.color === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sec.pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
                    <span>
                      {sec.correct} of {sec.total} correct
                    </span>
                    <span className="font-bold text-slate-700">Pass: 80%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Attempt History List */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs overflow-hidden mobile-app-card">
            <div className="p-4 sm:p-8 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Exam Attempt History</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Record of completed practice tests.</p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-4">Exam Title</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Scaled Score</th>
                    <th className="px-6 py-4">CEFR Level</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{attempt.test_title}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold font-mono text-slate-900">
                        {attempt.scaled_score} <span className="text-xs text-slate-400 font-normal">/ 250</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-japan-red text-xs">{attempt.assessment_level}</td>
                      <td className="px-6 py-4">
                        {attempt.passed ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>PASS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            <span>NO PASS</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/attempt/${attempt.id}`}
                          className="text-xs font-bold text-japan-red hover:underline py-1 px-2 rounded hover:bg-red-50 inline-flex items-center gap-1"
                        >
                          <span>View Scorecard</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="p-4 space-y-3 btn-touch-active">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900 block leading-snug">{attempt.test_title}</strong>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {attempt.passed ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                        <X className="w-2.5 h-2.5 text-rose-600" />
                        <span>NO PASS</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400">Score: </span>
                      <strong className="text-slate-900 font-mono">{attempt.scaled_score} / 250</strong>
                    </div>
                    <Link href={`/attempt/${attempt.id}`} className="text-xs font-extrabold text-japan-red flex items-center gap-1">
                      <span>View Scorecard</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-japan-red flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-japan-red" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">No Exam Attempts Recorded Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Take your first JFT-Basic or SSW Skill practice mock exam to generate your score report and analyze your strengths.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md shadow-red-500/20 active:scale-95"
            >
              <span>Browse Practice Exams</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

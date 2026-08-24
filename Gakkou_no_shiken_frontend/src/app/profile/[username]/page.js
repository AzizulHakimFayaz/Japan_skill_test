'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCandidateProfile, updateUserProfile } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Target,
  MapPin,
  Edit3,
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  X,
  Check,
  Flame,
  Sparkles,
} from 'lucide-react';

export default function CandidatePublicProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile Modal (if viewing own profile)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTargetExam, setEditTargetExam] = useState('jft_basic');
  const [editJapaneseLevel, setEditJapaneseLevel] = useState('n4');
  const [editLocation, setEditLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);

  const isOwner = user && candidate && (user.id === candidate.id || user.username?.toLowerCase() === candidate.username?.toLowerCase());

  useEffect(() => {
    if (!params?.username) return;

    getCandidateProfile(params.username)
      .then((data) => {
        setCandidate(data);
        setEditUsername(data.username || '');
        setEditFirstName(data.first_name || '');
        setEditLastName(data.last_name || '');
        setEditBio(data.bio || '');
        setEditTargetExam(data.target_exam || 'jft_basic');
        setEditJapaneseLevel(data.japanese_level || 'n4');
        setEditLocation(data.location || '');
      })
      .catch((err) => {
        setError(err.message || 'Candidate not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params?.username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await updateUserProfile({
        username: editUsername,
        first_name: editFirstName,
        last_name: editLastName,
        bio: editBio,
        target_exam: editTargetExam,
        japanese_level: editJapaneseLevel,
        location: editLocation,
      });
      if (res?.user) {
        if (setUser) setUser(res.user);
        const newUsername = res.user.username || editUsername;
        if (newUsername !== candidate.username) {
          router.push(`/profile/${newUsername}`);
        } else {
          const updated = await getCandidateProfile(newUsername);
          setCandidate(updated);
        }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading Candidate Profile...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          <User className="w-8 h-8 text-japan-red" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Candidate Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          No registered examinee profile was found with the username &quot;@{params?.username}&quot;.
        </p>
        <Link href="/leaderboard" className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl shadow-md">
          Explore Leaderboard
        </Link>
      </div>
    );
  }

  const {
    full_name,
    username,
    bio,
    target_exam_display,
    japanese_level_display,
    location,
    date_joined,
    rank,
    total_candidates,
    is_staff,
    stats = {},
    achievements = [],
    recent_attempts = [],
  } = candidate;

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in pb-16">
      {/* 1. Ultra-Premium Candidate Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0d1627] to-slate-900 text-white p-6 sm:p-12 shadow-2xl border border-slate-800/80">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Candidate Avatar & Bio Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <div
                className={`w-20 h-20 sm:w-26 sm:h-26 rounded-3xl flex items-center justify-center text-white text-3xl sm:text-5xl font-black shadow-2xl border-4 ${
                  rank === 1
                    ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/50'
                    : rank === 2
                    ? 'bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 text-slate-950 border-slate-200 shadow-slate-400/40'
                    : rank === 3
                    ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white border-amber-500 shadow-amber-700/40'
                    : 'bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 text-white border-white/20 shadow-red-500/30'
                }`}
              >
                {full_name.slice(0, 1).toUpperCase()}
              </div>

              {/* Rank Badge Indicator */}
              {rank && rank === 1 ? (
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 border-2 border-white flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4" />
                </span>
              ) : rank && rank === 2 ? (
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 border-2 border-white flex items-center justify-center shadow-lg">
                  <Medal className="w-4 h-4" />
                </span>
              ) : rank && rank === 3 ? (
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white border-2 border-white flex items-center justify-center shadow-lg">
                  <Medal className="w-4 h-4" />
                </span>
              ) : rank ? (
                <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white border border-indigo-400 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                  #{rank}
                </span>
              ) : null}
            </div>

            {/* Candidate Metadata */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-none">
                  {full_name}
                </h1>
                <span className="text-slate-400 font-mono text-xs sm:text-sm">@{username}</span>

                {is_staff && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                    Staff Admin
                  </span>
                )}
              </div>

              {/* Japanese Calligraphy Quote Bio */}
              {bio ? (
                <div className="relative pl-3 border-l-2 border-japan-red/60 text-slate-200 text-xs sm:text-sm italic max-w-xl font-medium">
                  「 {bio} 」
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Passionate Japanese language candidate preparing for official examinations.
                </p>
              )}

              {/* Badges Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {target_exam_display && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-bold">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{target_exam_display}</span>
                  </span>
                )}
                {japanese_level_display && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{japanese_level_display}</span>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{location}</span>
                  </span>
                )}
                <span className="text-[11px] text-slate-400 ml-1 font-medium">
                  Member since {date_joined}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto self-end lg:self-center">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 cursor-pointer active:scale-95 shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <Link
                  href="/accounts/my-results"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  My Test Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-5 py-3 rounded-2xl transition-all text-xs sm:text-sm border border-amber-500/30 active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>View Leaderboard</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-500/25 text-xs sm:text-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>Take Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Japanese Watermark */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-8xl sm:text-9xl tracking-tighter text-rose-300 pointer-events-none select-none">
          受験生
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Metric 1: Leaderboard Standing */}
        <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ranking Standing
            </span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none">
              {rank ? `#${rank}` : 'Unranked'}
            </strong>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-1">
              {rank ? `Top candidate among ${total_candidates}` : 'Take exams to rank'}
            </span>
          </div>
        </div>

        {/* Metric 2: High Scaled Score */}
        <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Highest Score
            </span>
            <Target className="w-5 h-5 text-japan-red dark:text-rose-400" />
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-amber-500 leading-none">
              {stats.highest_scaled_score || 0}
              <span className="text-sm sm:text-base font-bold text-slate-400 ml-1">/ 250</span>
            </strong>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-1">
              Avg: {stats.avg_scaled_score || 0} pts
            </span>
          </div>
        </div>

        {/* Metric 3: Pass Rate */}
        <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exam Pass Rate
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {stats.pass_rate || 0}%
            </strong>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-1">
              {stats.passed_attempts || 0} of {stats.total_attempts || 0} passed
            </span>
          </div>
        </div>

        {/* Metric 4: CEFR Rating */}
        <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CEFR Level
            </span>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <strong className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none block">
              {stats.highest_level || 'Below A1'}
            </strong>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block mt-1">
              {stats.highest_scaled_score >= 200 ? 'Official Passing Standard' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Candidate Achievement Badges Wall */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>Candidate Achievement Badges</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Badges earned through examination performance and milestones.
            </p>
          </div>
          <span className="text-xs font-extrabold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-amber-400/60 hover:shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-xs ${
                  badge.unlocked
                    ? badge.tier === 'gold'
                      ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700'
                      : badge.tier === 'silver'
                      ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                      : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-200/70 dark:bg-slate-800 grayscale'
                }`}
              >
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {badge.title}
                  </h3>
                  {badge.unlocked && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>Earned</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Verified Exam Attempts */}
      {recent_attempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Recent Verified Mock Exams</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last 5 completed attempts</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {recent_attempts.map((att) => (
              <div
                key={att.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {att.test_title}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        att.test_category === 'skill'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800'
                      }`}
                    >
                      {att.test_category === 'skill' ? 'SSW Skill' : 'JFT-Basic'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Completed on {new Date(att.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {att.scaled_score} <span className="text-[10px] text-slate-400 font-normal">/ 250</span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                      {att.percentage}% accuracy
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                      att.passed
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                    }`}
                  >
                    {att.passed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Passed (A2)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                        <span>Not Passed</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-japan-red" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Candidate Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Candidate Username <span className="text-japan-red">*</span>
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
                  placeholder="e.g. kenji_tanaka"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
                    placeholder="e.g. Kenji"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
                    placeholder="e.g. Tanaka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Candidate Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
                  placeholder="Share your goals (e.g. Preparing for JFT-Basic & SSW Nursing Care in Tokyo!)"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 float-right">{editBio.length}/500</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Target Examination</label>
                  <select
                    value={editTargetExam}
                    onChange={(e) => setEditTargetExam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
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
                  <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Japanese Level</label>
                  <select
                    value={editJapaneseLevel}
                    onChange={(e) => setEditJapaneseLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
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
                <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Location / Country</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-japan-red dark:focus:border-rose-500"
                  placeholder="e.g. Dhaka, Bangladesh or Yangon, Myanmar"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
    </div>
  );
}

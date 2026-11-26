import csv
import datetime
from collections import Counter, defaultdict
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count
from accounts.models import UserProfile
from tests.models import Test, Attempt
from accounts.geolocation import get_country_flag

BDT_TZ = datetime.timezone(datetime.timedelta(hours=6))
MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


def _fmt_hour_label(h: int) -> str:
    if h == 0:
        return '12 AM'
    if h < 12:
        return f'{h} AM'
    if h == 12:
        return '12 PM'
    return f'{h - 12} PM'


@staff_member_required
def admin_statistics_view(request):
    """
    Comprehensive Live Statistics & Data-Mining Analytics Dashboard for Gakkou No Shiken Admin.
    Displays active users, registration trends, exam attempts, pass rates, country distribution,
    monthly/hourly/weekday peak exam mining, upcoming candidate exam-date forecast, and CSV export.
    """
    now = timezone.now()
    now_bdt = now.astimezone(BDT_TZ)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # 1. User Registration & Activity Metrics
    total_users = User.objects.count()
    registered_today = User.objects.filter(date_joined__gte=today_start).count()
    registered_this_week = User.objects.filter(date_joined__gte=week_start).count()
    registered_this_month = User.objects.filter(date_joined__gte=month_start).count()
    staff_count = User.objects.filter(is_staff=True).count()

    # 2. Exam Attempt Metrics
    total_attempts = Attempt.objects.count()
    attempts_today = Attempt.objects.filter(completed_at__gte=today_start).count()
    attempts_this_week = Attempt.objects.filter(completed_at__gte=week_start).count()
    attempts_this_month = Attempt.objects.filter(completed_at__gte=month_start).count()
    unique_candidates_attempted = Attempt.objects.filter(user__isnull=False).values('user').distinct().count()

    # Overall attempt stats + Data Mining time-series (single lightweight pass)
    all_attempts = list(Attempt.objects.only('id', 'score', 'total_questions', 'completed_at'))
    passed_count = 0
    scaled_scores = []

    # Data Mining accumulators (BDT / UTC+6 for Bangladesh-primary audience)
    month_attempts_counter: Counter = Counter()
    month_passed_counter: Counter = Counter()
    hour_counter: Counter = Counter()
    weekday_counter: Counter = Counter()
    time_block_counter: Counter = Counter()

    for a in all_attempts:
        is_pass = a.is_passed
        if is_pass:
            passed_count += 1
        scaled_scores.append(a.scaled_score)
        if a.completed_at:
            dt_bdt = a.completed_at.astimezone(BDT_TZ)
            ym = f'{dt_bdt.year:04d}-{dt_bdt.month:02d}'
            month_attempts_counter[ym] += 1
            if is_pass:
                month_passed_counter[ym] += 1
            hr = dt_bdt.hour
            hour_counter[hr] += 1
            weekday_counter[dt_bdt.weekday()] += 1
            if 6 <= hr < 12:
                time_block_counter['Morning (6AM–12PM)'] += 1
            elif 12 <= hr < 18:
                time_block_counter['Afternoon (12PM–6PM)'] += 1
            elif 18 <= hr < 24:
                time_block_counter['Evening (6PM–12AM)'] += 1
            else:
                time_block_counter['Late Night (12AM–6AM)'] += 1

    overall_pass_rate = round((passed_count / total_attempts * 100), 1) if total_attempts > 0 else 0
    avg_scaled_score = round(sum(scaled_scores) / len(scaled_scores), 1) if scaled_scores else 0
    max_scaled_score = max(scaled_scores) if scaled_scores else 0

    # Monthly Registration counts (last 12 months)
    month_reg_counter: Counter = Counter()
    for dj in User.objects.values_list('date_joined', flat=True):
        if dj:
            dj_bdt = dj.astimezone(BDT_TZ)
            month_reg_counter[f'{dj_bdt.year:04d}-{dj_bdt.month:02d}'] += 1

    # Build ordered Last 12 Months list
    last_12_months = []
    y, m = now_bdt.year, now_bdt.month
    for _ in range(12):
        last_12_months.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    last_12_months.reverse()

    max_month_attempts = max((month_attempts_counter.get(f'{yy:04d}-{mm:02d}', 0) for yy, mm in last_12_months), default=0)
    monthly_trends = []
    peak_month_row = None
    for yy, mm in last_12_months:
        ym = f'{yy:04d}-{mm:02d}'
        att_cnt = month_attempts_counter.get(ym, 0)
        reg_cnt = month_reg_counter.get(ym, 0)
        pass_cnt = month_passed_counter.get(ym, 0)
        p_rate = round((pass_cnt / att_cnt * 100), 1) if att_cnt > 0 else 0.0
        bar_pct = round((att_cnt / max_month_attempts * 100), 1) if max_month_attempts > 0 else 0
        row = {
            'ym': ym,
            'label': f'{MONTH_SHORT[mm - 1]} {str(yy)[2:]}',
            'full_label': f'{MONTH_SHORT[mm - 1]} {yy}',
            'attempts': att_cnt,
            'registrations': reg_cnt,
            'pass_rate': p_rate,
            'bar_pct': max(bar_pct, 4) if att_cnt > 0 else 0,
            'is_peak': att_cnt > 0 and att_cnt == max_month_attempts,
        }
        monthly_trends.append(row)
        if row['is_peak']:
            peak_month_row = row

    # 24-Hour Peak Distribution (BDT / UTC+6)
    max_hour_attempts = max(hour_counter.values(), default=0)
    peak_hour_num = max(hour_counter, key=lambda k: hour_counter[k]) if hour_counter else None
    hourly_distribution = []
    for hr in range(24):
        cnt = hour_counter.get(hr, 0)
        pct = round((cnt / total_attempts * 100), 1) if total_attempts > 0 else 0.0
        bar_pct = round((cnt / max_hour_attempts * 100), 1) if max_hour_attempts > 0 else 0
        hourly_distribution.append({
            'hour': hr,
            'short_label': f'{hr:02d}h',
            'label': f'{_fmt_hour_label(hr)} – {_fmt_hour_label((hr + 1) % 24)}',
            'count': cnt,
            'percentage': pct,
            'bar_pct': max(bar_pct, 5) if cnt > 0 else 0,
            'is_peak': cnt > 0 and cnt == max_hour_attempts,
        })

    # Time-of-day blocks
    time_block_order = [
        ('Morning (6AM–12PM)', '#0ea5e9', 'fa-sun'),
        ('Afternoon (12PM–6PM)', '#f59e0b', 'fa-cloud-sun'),
        ('Evening (6PM–12AM)', '#ef4444', 'fa-moon'),
        ('Late Night (12AM–6AM)', '#6366f1', 'fa-star'),
    ]
    time_blocks = []
    for name, color, icon in time_block_order:
        cnt = time_block_counter.get(name, 0)
        pct = round((cnt / total_attempts * 100), 1) if total_attempts > 0 else 0.0
        time_blocks.append({'name': name, 'count': cnt, 'percentage': pct, 'color': color, 'icon': icon})

    # Day-of-week distribution
    max_weekday_attempts = max(weekday_counter.values(), default=0)
    peak_weekday_name = None
    peak_weekday_pct = 0.0
    weekday_distribution = []
    for idx, day_name in enumerate(WEEKDAY_NAMES):
        cnt = weekday_counter.get(idx, 0)
        pct = round((cnt / total_attempts * 100), 1) if total_attempts > 0 else 0.0
        bar_pct = round((cnt / max_weekday_attempts * 100), 1) if max_weekday_attempts > 0 else 0
        is_peak = cnt > 0 and cnt == max_weekday_attempts
        if is_peak:
            peak_weekday_name = day_name
            peak_weekday_pct = pct
        weekday_distribution.append({
            'day': day_name,
            'short': day_name[:3],
            'count': cnt,
            'percentage': pct,
            'bar_pct': bar_pct,
            'is_peak': is_peak,
        })

    # Upcoming Candidate Exam Demand Forecast (from UserProfile.planned_exam_date)
    today_date = now_bdt.date()
    exam_date_profiles = UserProfile.objects.filter(planned_exam_date__isnull=False).values_list(
        'planned_exam_date', 'target_exam'
    )
    planned_total_users = 0
    planned_month_counts: Counter = Counter()
    planned_month_tracks: dict = defaultdict(Counter)
    target_exam_labels = dict(UserProfile.TargetExam.choices)

    for p_date, t_exam in exam_date_profiles:
        planned_total_users += 1
        if p_date >= today_date.replace(day=1):
            ym = f'{p_date.year:04d}-{p_date.month:02d}'
            planned_month_counts[ym] += 1
            planned_month_tracks[ym][target_exam_labels.get(t_exam, t_exam or 'Other')] += 1

    upcoming_exam_months = []
    max_planned = max(planned_month_counts.values(), default=0)
    top_upcoming_month = None
    for ym in sorted(planned_month_counts.keys())[:12]:
        yy, mm = int(ym[:4]), int(ym[5:7])
        cnt = planned_month_counts[ym]
        top_track = planned_month_tracks[ym].most_common(1)[0][0] if planned_month_tracks[ym] else 'JFT-Basic'
        bar_pct = round((cnt / max_planned * 100), 1) if max_planned > 0 else 0
        row = {
            'ym': ym,
            'label': f'{MONTH_SHORT[mm - 1]} {yy}',
            'count': cnt,
            'top_track': top_track,
            'bar_pct': bar_pct,
            'is_peak': cnt > 0 and cnt == max_planned,
        }
        upcoming_exam_months.append(row)
        if row['is_peak'] and top_upcoming_month is None:
            top_upcoming_month = row

    # Target Exam Track & Profile Adoption Metrics
    target_exam_qs = (
        UserProfile.objects.values('target_exam')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    target_exam_breakdown = []
    for item in target_exam_qs:
        code = item['target_exam'] or 'other'
        cnt = item['total']
        pct = round((cnt / total_users * 100), 1) if total_users > 0 else 0.0
        target_exam_breakdown.append({
            'code': code,
            'label': target_exam_labels.get(code, code),
            'count': cnt,
            'percentage': pct,
        })

    avatar_uploaded_count = UserProfile.objects.exclude(avatar='').exclude(avatar__isnull=True).count()
    avatar_adoption_pct = round((avatar_uploaded_count / total_users * 100), 1) if total_users > 0 else 0.0
    planned_date_adoption_pct = round((planned_total_users / total_users * 100), 1) if total_users > 0 else 0.0

    # Optional 1-Click CSV Data Mining Export
    if request.GET.get('export') == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="gakkou_data_mining_{now_bdt.strftime("%Y%m%d")}.csv"'
        writer = csv.writer(response)
        writer.writerow(['SECTION', 'KEY', 'METRIC_1', 'METRIC_2', 'METRIC_3'])
        for r in monthly_trends:
            writer.writerow(['MONTHLY_TREND', r['full_label'], f"Attempts={r['attempts']}", f"Registrations={r['registrations']}", f"PassRate={r['pass_rate']}%"])
        for h in hourly_distribution:
            writer.writerow(['HOURLY_BDT', h['label'], f"Attempts={h['count']}", f"Share={h['percentage']}%", ''])
        for d in weekday_distribution:
            writer.writerow(['WEEKDAY_BDT', d['day'], f"Attempts={d['count']}", f"Share={d['percentage']}%", ''])
        for u_m in upcoming_exam_months:
            writer.writerow(['UPCOMING_EXAM_DEMAND', u_m['label'], f"Candidates={u_m['count']}", f"TopTrack={u_m['top_track']}", ''])
        for te in target_exam_breakdown:
            writer.writerow(['TARGET_EXAM_TRACK', te['label'], f"Candidates={te['count']}", f"Share={te['percentage']}%", ''])
        return response

    # 3. Country Distribution Breakdown
    country_query = (
        UserProfile.objects.values('country')
        .annotate(total=Count('id'))
        .order_by('-total')
    )

    countries_data = []
    known_country_users = 0
    unspecified_count = 0

    for item in country_query:
        c_name = (item['country'] or '').strip()
        cnt = item['total']
        if not c_name:
            unspecified_count += cnt
        else:
            known_country_users += cnt
            pct = round((cnt / total_users * 100), 1) if total_users > 0 else 0
            countries_data.append({
                'name': c_name,
                'flag': get_country_flag(c_name),
                'count': cnt,
                'percentage': pct,
            })

    if unspecified_count > 0:
        unspecified_pct = round((unspecified_count / total_users * 100), 1) if total_users > 0 else 0
        countries_data.append({
            'name': 'Not Specified Yet',
            'flag': '🌐',
            'count': unspecified_count,
            'percentage': unspecified_pct,
        })

    # Country Source breakdown
    source_query = (
        UserProfile.objects.values('country_source')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    sources_data = {item['country_source'] or 'unknown': item['total'] for item in source_query}

    # 4. Per-Test Performance Breakdown
    tests = Test.objects.annotate(attempt_count=Count('attempts')).order_by('-attempt_count')
    tests_performance = []
    for test in tests:
        test_attempts = list(test.attempts.all())
        t_count = len(test_attempts)
        if t_count > 0:
            t_passed = sum(1 for a in test_attempts if a.is_passed)
            t_pass_rate = round((t_passed / t_count * 100), 1)
            t_scores = [a.scaled_score for a in test_attempts]
            t_avg_score = round(sum(t_scores) / len(t_scores), 1)
            t_max_score = max(t_scores)
        else:
            t_pass_rate = 0
            t_avg_score = 0
            t_max_score = 0

        tests_performance.append({
            'id': test.id,
            'title': test.title,
            'category': test.get_category_display(),
            'is_published': test.is_published,
            'attempt_count': t_count,
            'pass_rate': t_pass_rate,
            'avg_score': t_avg_score,
            'max_score': t_max_score,
        })

    # 5. Activity Feeds: Recent Registrations & Attempts
    recent_users = User.objects.select_related('profile').order_by('-date_joined')[:10]
    recent_users_list = []
    for u in recent_users:
        u_profile = getattr(u, 'profile', None)
        u_country = u_profile.country if u_profile and u_profile.country else 'Unknown'
        u_flag = get_country_flag(u_country)
        u_attempts = u.attempt_set.count() if hasattr(u, 'attempt_set') else 0
        u_avatar = u_profile.avatar.url if (u_profile and u_profile.avatar) else None
        u_exam_date = u_profile.planned_exam_date if u_profile else None
        recent_users_list.append({
            'id': u.id,
            'username': u.username,
            'full_name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'email': u.email or '—',
            'country': u_country,
            'flag': u_flag,
            'avatar_url': u_avatar,
            'planned_exam_date': u_exam_date,
            'date_joined': u.date_joined,
            'last_login': u.last_login,
            'attempts_count': u_attempts,
            'is_staff': u.is_staff,
        })

    recent_attempts_qs = Attempt.objects.select_related('test', 'user', 'user__profile').order_by('-completed_at')[:10]
    recent_attempts_list = []
    for att in recent_attempts_qs:
        candidate_name = "Anonymous"
        candidate_country = "—"
        candidate_flag = "🌐"
        if att.user:
            candidate_name = f"{att.user.first_name} {att.user.last_name}".strip() or att.user.username
            u_prof = getattr(att.user, 'profile', None)
            if u_prof and u_prof.country:
                candidate_country = u_prof.country
                candidate_flag = get_country_flag(u_prof.country)

        recent_attempts_list.append({
            'id': att.id,
            'test_title': att.test.title,
            'candidate_name': candidate_name,
            'candidate_country': candidate_country,
            'candidate_flag': candidate_flag,
            'raw_score': f"{att.score}/{att.total_questions}",
            'percentage': att.percentage,
            'scaled_score': att.scaled_score,
            'is_passed': att.is_passed,
            'completed_at': att.completed_at,
        })

    # 6. Game Zone & Arcade Platform Metrics
    game_profiles = UserProfile.objects.filter(game_xp__gt=0).select_related('user').order_by('-game_xp')
    total_gamers = game_profiles.count()
    total_game_xp = sum(p.game_xp for p in game_profiles)
    total_words_mastered = sum(p.game_words_mastered for p in game_profiles)
    avg_game_level = round(sum(p.game_level for p in game_profiles) / total_gamers, 1) if total_gamers > 0 else 1

    top_gamers_list = []
    for rank, p in enumerate(game_profiles[:10], start=1):
        c_flag = get_country_flag(p.country) if p.country else '🇧🇩'
        top_gamers_list.append({
            'rank': rank,
            'username': p.user.username,
            'full_name': f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username,
            'country': p.country or 'Bangladesh',
            'flag': c_flag,
            'xp': p.game_xp,
            'level': p.game_level,
            'streak': p.game_streak,
            'mastered': p.game_words_mastered,
            'last_played': p.game_last_played,
        })

    context = {
        'title': 'Live Statistics & Analytics',
        # User Stats
        'total_users': total_users,
        'registered_today': registered_today,
        'registered_this_week': registered_this_week,
        'registered_this_month': registered_this_month,
        'staff_count': staff_count,
        # Attempt Stats
        'total_attempts': total_attempts,
        'attempts_today': attempts_today,
        'attempts_this_week': attempts_this_week,
        'attempts_this_month': attempts_this_month,
        'unique_candidates_attempted': unique_candidates_attempted,
        'overall_pass_rate': overall_pass_rate,
        'avg_scaled_score': avg_scaled_score,
        'max_scaled_score': max_scaled_score,
        # Data Mining & Peak Time Analytics
        'monthly_trends': monthly_trends,
        'peak_month_row': peak_month_row,
        'hourly_distribution': hourly_distribution,
        'peak_hour_label': (
            f'{_fmt_hour_label(peak_hour_num)} – {_fmt_hour_label((peak_hour_num + 1) % 24)}'
            if peak_hour_num is not None
            else 'No data yet'
        ),
        'peak_hour_count': hour_counter.get(peak_hour_num, 0) if peak_hour_num is not None else 0,
        'time_blocks': time_blocks,
        'weekday_distribution': weekday_distribution,
        'peak_weekday_name': peak_weekday_name or 'No data yet',
        'peak_weekday_pct': peak_weekday_pct,
        'upcoming_exam_months': upcoming_exam_months,
        'top_upcoming_month': top_upcoming_month,
        'planned_total_users': planned_total_users,
        'planned_date_adoption_pct': planned_date_adoption_pct,
        'avatar_uploaded_count': avatar_uploaded_count,
        'avatar_adoption_pct': avatar_adoption_pct,
        'target_exam_breakdown': target_exam_breakdown,
        # Game Zone Stats
        'total_gamers': total_gamers,
        'total_game_xp': total_game_xp,
        'total_words_mastered': total_words_mastered,
        'avg_game_level': avg_game_level,
        'top_gamers': top_gamers_list,
        # Breakdown data
        'countries_data': countries_data,
        'sources_data': sources_data,
        'tests_performance': tests_performance,
        # Feeds
        'recent_users': recent_users_list,
        'recent_attempts': recent_attempts_list,
        'now': now,
    }

    return render(request, 'admin/statistics.html', context)

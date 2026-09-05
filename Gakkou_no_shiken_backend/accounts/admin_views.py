import datetime
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count, Avg, Max
from accounts.models import UserProfile
from tests.models import Test, Attempt

COUNTRY_FLAG_MAP = {
    'Bangladesh': '🇧🇩',
    'Nepal': '🇳🇵',
    'Vietnam': '🇻🇳',
    'Indonesia': '🇮🇩',
    'Japan': '🇯🇵',
    'India': '🇮🇳',
    'Myanmar': '🇲🇲',
    'Sri Lanka': '🇱🇰',
    'Philippines': '🇵🇭',
    'Pakistan': '🇵🇰',
    'Uzbekistan': '🇺🇿',
    'Mongolia': '🇲🇳',
    'Cambodia': '🇰🇭',
    'Thailand': '🇹🇭',
    'China': '🇨🇳',
    'Brazil': '🇧🇷',
    'Peru': '🇵🇪',
}

def get_country_flag(country_name):
    if not country_name:
        return '🌐'
    return COUNTRY_FLAG_MAP.get(country_name.strip(), '📍')


@staff_member_required
def admin_statistics_view(request):
    """
    Comprehensive Live Statistics & Analytics Dashboard for Gakkou No Shiken Admin.
    Displays active users, registration trends (today/week/month), exam attempts,
    pass rates, country distribution, and real-time activity feeds.
    """
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # 1. User Registration & Activity Metrics
    total_users = User.objects.count()
    registered_today = User.objects.filter(date_joined__gte=today_start).count()
    registered_this_week = User.objects.filter(date_joined__gte=week_start).count()
    registered_this_month = User.objects.filter(date_joined__gte=month_start).count()

    # Active / Online Users (recent login timestamps)
    active_24h = User.objects.filter(last_login__gte=now - datetime.timedelta(hours=24)).count()
    active_7d = User.objects.filter(last_login__gte=now - datetime.timedelta(days=7)).count()
    active_30d = User.objects.filter(last_login__gte=now - datetime.timedelta(days=30)).count()

    staff_count = User.objects.filter(is_staff=True).count()

    # 2. Exam Attempt Metrics
    total_attempts = Attempt.objects.count()
    attempts_today = Attempt.objects.filter(completed_at__gte=today_start).count()
    attempts_this_week = Attempt.objects.filter(completed_at__gte=week_start).count()
    attempts_this_month = Attempt.objects.filter(completed_at__gte=month_start).count()
    unique_candidates_attempted = Attempt.objects.filter(user__isnull=False).values('user').distinct().count()

    # Overall attempt stats
    all_attempts = Attempt.objects.all()
    passed_count = sum(1 for a in all_attempts if a.is_passed)
    overall_pass_rate = round((passed_count / total_attempts * 100), 1) if total_attempts > 0 else 0
    
    scaled_scores = [a.scaled_score for a in all_attempts]
    avg_scaled_score = round(sum(scaled_scores) / len(scaled_scores), 1) if scaled_scores else 0
    max_scaled_score = max(scaled_scores) if scaled_scores else 0

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
            t_passed = 0
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
        recent_users_list.append({
            'id': u.id,
            'username': u.username,
            'full_name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'email': u.email or '—',
            'country': u_country,
            'flag': u_flag,
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

    context = {
        'title': 'Live Statistics & Analytics',
        # User Stats
        'total_users': total_users,
        'registered_today': registered_today,
        'registered_this_week': registered_this_week,
        'registered_this_month': registered_this_month,
        'active_24h': active_24h,
        'active_7d': active_7d,
        'active_30d': active_30d,
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

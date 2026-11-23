from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """Template-side dict lookup: {{ mydict|get_item:key }}."""
    if dictionary is None:
        return None
    try:
        return dictionary[key]
    except (KeyError, TypeError, IndexError):
        return None


@register.filter
def category_chip_class(test_or_cat):
    """Return Tailwind chip classes for a Test or category string."""
    cat = (
        test_or_cat.category
        if hasattr(test_or_cat, "category")
        else test_or_cat
    )
    if cat == "skill":
        return "bg-amber-50 text-amber-700 border border-amber-100"
    return "bg-indigo-50 text-indigo-700 border border-indigo-100"


@register.filter
def category_label(test_or_cat):
    cat = (
        test_or_cat.category
        if hasattr(test_or_cat, "category")
        else test_or_cat
    )
    return "SSW Skill" if cat == "skill" else "JFT"


@register.filter
def format_time_limit(seconds):
    """Format time limit seconds into readable minutes/seconds."""
    if not seconds:
        return "Untimed Practice"
    try:
        seconds = int(seconds)
        mins = seconds // 60
        secs = seconds % 60
        if mins > 0 and secs == 0:
            return f"{mins} mins limit"
        elif mins > 0:
            return f"{mins}m {secs}s limit"
        return f"{secs}s limit"
    except (ValueError, TypeError):
        return "Untimed Practice"


SECTION_LABELS = {
    'script_vocab': 'Script and Vocabulary',
    'conversation': 'Conversation and Expression',
    'listening': 'Listening Comprehension',
    'reading': 'Reading Comprehension',
}


@register.filter
def section_label(sec_key):
    return SECTION_LABELS.get(sec_key, str(sec_key).replace('_', ' ').title())


@register.filter
def format_prompt(value):
    """Format question prompts, supporting multi-line CSV text, A: / B: speaker dialogues, and __underline__ markup."""
    if not value:
        return ""
    
    from django.utils.safestring import mark_safe
    from django.utils.html import escape
    import re

    val_str = str(value).replace("\r\n", "\n").replace("\r", "\n").strip()

    # First, escape HTML to prevent XSS, then apply __underline__ markup
    # We process underline AFTER escaping so user can't inject arbitrary HTML
    val_str = escape(val_str)
    val_str = re.sub(r'__((?:(?!__).)+?)__', r'<u>\1</u>', val_str)

    lines = [line.strip() for line in val_str.split("\n") if line.strip()]

    if not lines:
        return ""

    speaker_pattern = re.compile(r"^([A-Z0-9\u3000-\u30ff\uff00-\uffef\u4e00-\u9faf]+[:：])\s*(.*)", re.UNICODE | re.IGNORECASE)
    has_speakers = any(speaker_pattern.match(line) for line in lines)

    if has_speakers:
        html_lines = []
        for line in lines:
            match = speaker_pattern.match(line)
            if match:
                speaker, text = match.groups()
                html_lines.append(
                    f'<div class="flex items-start gap-2 py-0.5"><span class="font-black text-slate-900 flex-shrink-0">{speaker}</span><span class="flex-1">{text}</span></div>'
                )
            else:
                html_lines.append(f'<div class="py-0.5">{line}</div>')
        return mark_safe(f'<div class="space-y-1.5 my-1 font-sans">{ "".join(html_lines) }</div>')

    return mark_safe("<br>".join(lines))


@register.filter
def render_underline(value):
    """Render __word__ markup as <u>word</u> HTML tags for any text field (instructions, etc.)."""
    if not value:
        return ""
    
    from django.utils.safestring import mark_safe
    from django.utils.html import escape
    import re

    val_str = escape(str(value))
    val_str = re.sub(r'__((?:(?!__).)+?)__', r'<u>\1</u>', val_str)
    return mark_safe(val_str)


@register.simple_tag
def get_executive_dashboard_metrics():
    """
    Computes live executive KPIs, 7-day SVG chart series, top course/exam performance,
    country progress bars, recent attempts, and live activity feed for the DropX-style
    Admin Dashboard (templates/admin/index.html).
    """
    import datetime
    from django.contrib.auth.models import User
    from django.db.models import Count
    from django.utils import timezone
    from tests.models import Test, Question, Attempt, Notice, ExamBook, CurriculumLesson
    from accounts.models import UserProfile, SupportThread, PartnerSchool, PartnerApplication
    from accounts.geolocation import get_country_flag

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=6)
    month_start = today_start.replace(day=1)

    metrics = {
        'total_users': 0,
        'users_today': 0,
        'users_this_week': 0,
        'users_this_month': 0,
        'total_attempts': 0,
        'attempts_today': 0,
        'attempts_this_week': 0,
        'unique_candidates': 0,
        'overall_pass_rate': 0.0,
        'avg_scaled_score': 0,
        'passed_count': 0,
        'total_tests': 0,
        'published_tests': 0,
        'total_questions': 0,
        'total_books': 0,
        'total_lessons': 0,
        'total_notices': 0,
        'open_support_threads': 0,
        'total_support_threads': 0,
        'active_partner_schools': 0,
        'pending_partner_apps': 0,
        'chart_days': [],
        'line_svg_path': '',
        'area_svg_path': '',
        'reg_line_svg_path': '',
        'chart_points': [],
        'chart_max_y': 10,
        'chart_y_ticks': [10, 8, 5, 3, 0],
        'top_tests': [],
        'top_countries': [],
        'recent_attempts': [],
        'live_activity': [],
    }

    try:
        # 1. Core KPIs
        metrics['total_users'] = User.objects.count()
        metrics['users_today'] = User.objects.filter(date_joined__gte=today_start).count()
        metrics['users_this_week'] = User.objects.filter(date_joined__gte=week_start).count()
        metrics['users_this_month'] = User.objects.filter(date_joined__gte=month_start).count()

        metrics['total_tests'] = Test.objects.count()
        metrics['published_tests'] = Test.objects.filter(is_published=True).count()
        metrics['total_questions'] = Question.objects.count()
        metrics['total_books'] = ExamBook.objects.count()
        metrics['total_lessons'] = CurriculumLesson.objects.count()
        metrics['total_notices'] = Notice.objects.filter(is_active=True).count()

        metrics['open_support_threads'] = SupportThread.objects.filter(status='needs_reply').count()
        metrics['total_support_threads'] = SupportThread.objects.count()
        metrics['active_partner_schools'] = PartnerSchool.objects.filter(is_active=True).count()
        metrics['pending_partner_apps'] = PartnerApplication.objects.filter(status='pending').count()

        metrics['total_attempts'] = Attempt.objects.count()
        metrics['attempts_today'] = Attempt.objects.filter(completed_at__gte=today_start).count()
        metrics['attempts_this_week'] = Attempt.objects.filter(completed_at__gte=week_start).count()
        metrics['unique_candidates'] = (
            Attempt.objects.filter(user__isnull=False).values('user').distinct().count()
        )

        # Sample up to 2000 most recent attempts for fast pass-rate & avg score calculation
        recent_sample = list(
            Attempt.objects.select_related('test')
            .only('id', 'score', 'total_questions', 'completed_at', 'test__category')
            .order_by('-completed_at')[:2000]
        )
        if recent_sample:
            passed = sum(1 for a in recent_sample if a.is_passed)
            scores = [a.scaled_score for a in recent_sample]
            metrics['passed_count'] = passed
            metrics['overall_pass_rate'] = round((passed / len(recent_sample)) * 100, 1)
            metrics['avg_scaled_score'] = int(round(sum(scores) / len(scores)))

        # 2. 7-Day Trend Series (Attempts & Registrations)
        days_list = [today_start - datetime.timedelta(days=i) for i in range(6, -1, -1)]
        attempts_7d = list(
            Attempt.objects.filter(completed_at__gte=week_start).values_list('completed_at', flat=True)
        )
        users_7d = list(
            User.objects.filter(date_joined__gte=week_start).values_list('date_joined', flat=True)
        )

        att_by_date = {}
        reg_by_date = {}
        for dt in attempts_7d:
            if dt:
                d_key = timezone.localtime(dt).date() if timezone.is_aware(dt) else dt.date()
                att_by_date[d_key] = att_by_date.get(d_key, 0) + 1
        for dt in users_7d:
            if dt:
                d_key = timezone.localtime(dt).date() if timezone.is_aware(dt) else dt.date()
                reg_by_date[d_key] = reg_by_date.get(d_key, 0) + 1

        raw_days = []
        max_val = 4
        for d_dt in days_list:
            d_key = timezone.localtime(d_dt).date() if timezone.is_aware(d_dt) else d_dt.date()
            a_cnt = att_by_date.get(d_key, 0)
            r_cnt = reg_by_date.get(d_key, 0)
            if a_cnt > max_val:
                max_val = a_cnt
            if r_cnt > max_val:
                max_val = r_cnt
            raw_days.append({
                'day_short': d_key.strftime('%a'),
                'date_label': d_key.strftime('%b %d'),
                'attempts': a_cnt,
                'registrations': r_cnt,
            })

        # Round max_val up cleanly
        chart_max = max(5, int(((max_val + 3) // 4) * 4))
        metrics['chart_max_y'] = chart_max
        metrics['chart_y_ticks'] = [
            chart_max,
            int(round(chart_max * 0.75)),
            int(round(chart_max * 0.5)),
            int(round(chart_max * 0.25)),
            0,
        ]

        # Build SVG coordinates (viewBox 0 0 560 200; plot area x: 40..535, y: 20..168)
        x_start, x_end = 48.0, 532.0
        y_top, y_bottom = 22.0, 166.0
        plot_h = y_bottom - y_top
        step_x = (x_end - x_start) / 6.0

        pts = []
        reg_pts = []
        for idx, item in enumerate(raw_days):
            cx = round(x_start + idx * step_x, 1)
            cy = round(y_bottom - (item['attempts'] / chart_max) * plot_h, 1)
            rcy = round(y_bottom - (item['registrations'] / chart_max) * plot_h, 1)
            bar_pct = max(8, int(round((item['attempts'] / chart_max) * 100))) if item['attempts'] > 0 else 5
            reg_bar_pct = max(6, int(round((item['registrations'] / chart_max) * 100))) if item['registrations'] > 0 else 4
            item['bar_pct'] = bar_pct
            item['reg_bar_pct'] = reg_bar_pct
            item['cx'] = cx
            item['cy'] = cy
            item['rcy'] = rcy
            pts.append((cx, cy))
            reg_pts.append((cx, rcy))

        def _smooth_svg_path(points):
            if not points:
                return ''
            d = [f"M {points[0][0]},{points[0][1]}"]
            for i in range(len(points) - 1):
                x0, y0 = points[i]
                x1, y1 = points[i + 1]
                cpx1 = round(x0 + (x1 - x0) * 0.45, 1)
                cpx2 = round(x1 - (x1 - x0) * 0.45, 1)
                d.append(f"C {cpx1},{y0} {cpx2},{y1} {x1},{y1}")
            return " ".join(d)

        line_path = _smooth_svg_path(pts)
        area_path = f"{line_path} L {pts[-1][0]},{y_bottom} L {pts[0][0]},{y_bottom} Z" if line_path else ''
        reg_line_path = _smooth_svg_path(reg_pts)

        metrics['chart_days'] = raw_days
        metrics['line_svg_path'] = line_path
        metrics['area_svg_path'] = area_path
        metrics['reg_line_svg_path'] = reg_line_path

        # 3. Top Mock Tests Performance (Course Performance table)
        top_tests_qs = (
            Test.objects.annotate(
                attempt_count=Count('attempts', distinct=True),
                q_count=Count('questions', distinct=True),
            )
            .order_by('-attempt_count', '-created_at')[:6]
        )
        bar_palettes = ['#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6']
        top_tests_data = []
        for idx, t in enumerate(top_tests_qs):
            t_attempts = list(
                t.attempts.only('score', 'total_questions', 'test_id').order_by('-completed_at')[:300]
            )
            if t_attempts:
                t_pass = sum(
                    1
                    for a in t_attempts
                    if (
                        ((a.score / a.total_questions) * 100 >= 60.0)
                        if t.category == Test.Category.SKILL
                        else (int(round(10 + ((a.score / a.total_questions) * 240))) >= 200)
                    )
                    and a.total_questions > 0
                )
                pass_rate = round((t_pass / len(t_attempts)) * 100, 1)
                avg_sc = int(
                    round(
                        sum(
                            int(round(10 + ((a.score / a.total_questions) * 240)))
                            for a in t_attempts
                            if a.total_questions > 0
                        )
                        / max(1, len(t_attempts))
                    )
                )
            else:
                pass_rate = 0.0
                avg_sc = 0
            top_tests_data.append({
                'id': t.id,
                'title': t.title,
                'category': 'SSW Skill' if t.category == Test.Category.SKILL else 'JFT-Basic',
                'is_skill': t.category == Test.Category.SKILL,
                'is_published': t.is_published,
                'question_count': t.q_count,
                'attempt_count': t.attempt_count,
                'pass_rate': pass_rate,
                'avg_score': avg_sc,
                'color': bar_palettes[idx % len(bar_palettes)],
            })
        metrics['top_tests'] = top_tests_data

        # 4. Candidate Country Breakdown (Project Progress style bars)
        country_rows = (
            UserProfile.objects.exclude(country__isnull=True)
            .exclude(country__exact='')
            .values('country')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )
        progress_gradients = [
            'linear-gradient(90deg, #6366f1, #8b5cf6)',
            'linear-gradient(90deg, #10b981, #34d399)',
            'linear-gradient(90deg, #ec4899, #f43f5e)',
            'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            'linear-gradient(90deg, #f59e0b, #fbbf24)',
        ]
        total_u = max(1, metrics['total_users'])
        countries_list = []
        for idx, row in enumerate(country_rows):
            c_name = row['country']
            cnt = row['total']
            pct = min(100, max(4, int(round((cnt / total_u) * 100))))
            exact_pct = round((cnt / total_u) * 100, 1)
            countries_list.append({
                'name': c_name,
                'flag': get_country_flag(c_name),
                'count': cnt,
                'pct': exact_pct,
                'bar_width': pct,
                'gradient': progress_gradients[idx % len(progress_gradients)],
            })
        metrics['top_countries'] = countries_list

        # 5. Recent Exam Attempts (DropX Recent Orders style)
        avatar_colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
        recent_att_qs = (
            Attempt.objects.select_related('user', 'test')
            .order_by('-completed_at')[:6]
        )
        recent_att_list = []
        for idx, att in enumerate(recent_att_qs):
            uname = att.user.username if att.user else 'Anonymous'
            initials = (uname[:2] if len(uname) >= 2 else uname[:1] or 'CA').upper()
            recent_att_list.append({
                'id': att.id,
                'username': uname,
                'user_id': att.user_id,
                'initials': initials,
                'avatar_bg': avatar_colors[idx % len(avatar_colors)],
                'test_title': att.test.title if att.test else 'Mock Test',
                'score': att.score,
                'total_questions': att.total_questions,
                'scaled_score': att.scaled_score,
                'percentage': att.percentage,
                'is_passed': att.is_passed,
                'completed_at': att.completed_at,
            })
        metrics['recent_attempts'] = recent_att_list

        # 6. Live Activity Feed (Support Threads + New Candidates + Partner Inquiries)
        feed = []
        recent_threads = (
            SupportThread.objects.select_related('user')
            .order_by('-last_message_at')[:3]
        )
        for th in recent_threads:
            feed.append({
                'icon': 'fas fa-headset',
                'bg': 'rgba(236, 72, 153, 0.15)',
                'color': '#f472b6',
                'title': f"Support Chat: @{th.user.username} ({th.get_status_display()})",
                'subtitle': (th.last_message_preview or 'Open conversation')[:70],
                'timestamp': th.last_message_at or th.created_at,
                'url': f"/admin/accounts/supportthread/{th.id}/change/",
            })

        recent_users = User.objects.select_related('profile').order_by('-date_joined')[:3]
        for u in recent_users:
            country = getattr(getattr(u, 'profile', None), 'country', None) or 'Global'
            feed.append({
                'icon': 'fas fa-user-plus',
                'bg': 'rgba(16, 185, 129, 0.15)',
                'color': '#34d399',
                'title': f"New candidate registered: @{u.username}",
                'subtitle': f"Country: {country} • Joined platform",
                'timestamp': u.date_joined,
                'url': f"/admin/auth/user/{u.id}/change/",
            })

        feed.sort(key=lambda x: x['timestamp'] or now, reverse=True)
        metrics['live_activity'] = feed[:6]

    except Exception:
        pass

    return metrics


@register.simple_tag
def get_candidate_profile_overview(obj):
    """
    Given a User or UserProfile instance on the Admin Change Form, computes a comprehensive
    Candidate 360° profile summary (identity, tags, country, partner school, exam pass rate,
    semi-circular gauge SVG dasharray, per-test breakdown strips, and recent attempts).
    """
    from django.contrib.auth.models import User
    from accounts.models import UserProfile, SupportThread
    from accounts.geolocation import get_country_flag
    from tests.models import Attempt, Test

    if obj is None:
        return None

    user = obj if isinstance(obj, User) else getattr(obj, 'user', None)
    if user is None or not getattr(user, 'pk', None):
        return None

    profile = getattr(user, 'profile', None)
    if profile is None:
        profile = UserProfile.objects.filter(user=user).select_related('partner_school').first()

    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    initials = ((user.first_name[:1] + user.last_name[:1]) if (user.first_name and user.last_name) else user.username[:2]).upper() or 'CA'
    colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444']
    avatar_bg = colors[sum(ord(c) for c in user.username) % len(colors)]

    role_label = 'Super Admin' if user.is_superuser else ('Staff Reviewer' if user.is_staff else 'Candidate')
    country = (profile.country if profile and profile.country else '') or 'Not Specified'
    flag = get_country_flag(country) if country != 'Not Specified' else '🌐'
    location = (profile.location if profile and profile.location else '') or country
    country_source_raw = (profile.country_source if profile else '') or 'unknown'
    if country_source_raw in ('user', 'user_selected'):
        country_source_label = 'Verified by Candidate'
        is_verified = True
    elif country_source_raw in ('ip', 'ip_geolocation'):
        country_source_label = 'IP Geolocation'
        is_verified = True
    else:
        country_source_label = 'Unverified Location'
        is_verified = user.is_active

    target_exam = profile.get_target_exam_display() if (profile and profile.target_exam) else 'JFT-Basic (A2 Standard)'
    japanese_level = profile.get_japanese_level_display() if (profile and profile.japanese_level) else 'Elementary (N4 / A2)'
    partner_school = getattr(profile, 'partner_school', None) if profile else None
    partner_batch = (profile.partner_batch if profile and profile.partner_batch else '') or 'General Cohort'
    student_roll = (profile.student_roll_or_id if profile and profile.student_roll_or_id else '') or f"CAND-{user.id:04d}"

    game_xp = getattr(profile, 'game_xp', 0) or 0
    game_level = getattr(profile, 'game_level', 1) or 1
    game_streak = getattr(profile, 'game_streak', 0) or 0
    game_words = getattr(profile, 'game_words_mastered', 0) or 0
    last_ip = getattr(profile, 'last_known_ip', None) or 'Not recorded'
    bio = getattr(profile, 'bio', '') or ''

    # Exam attempts analytics
    attempts_qs = Attempt.objects.filter(user=user).select_related('test').order_by('-completed_at')
    all_attempts = list(attempts_qs[:200])
    total_attempts = len(all_attempts)

    passed_attempts = 0
    scaled_scores = []
    percentages = []
    recent_attempts = []
    per_test_map = {}

    logo_palettes = [
        ('#6366f1', 'rgba(99, 102, 241, 0.14)'),
        ('#10b981', 'rgba(16, 185, 129, 0.14)'),
        ('#0ea5e9', 'rgba(14, 165, 233, 0.14)'),
        ('#f59e0b', 'rgba(245, 158, 11, 0.14)'),
        ('#ec4899', 'rgba(236, 72, 153, 0.14)'),
    ]

    for idx, att in enumerate(all_attempts):
        sc = att.scaled_score
        pct = att.percentage
        passed = att.is_passed
        if passed:
            passed_attempts += 1
        scaled_scores.append(sc)
        percentages.append(pct)

        t_title = att.test.title if att.test else 'Mock Exam'
        t_cat = 'SSW' if (att.test and att.test.category == Test.Category.SKILL) else 'JFT'
        fg, bg = logo_palettes[idx % len(logo_palettes)]

        if idx < 5:
            recent_attempts.append({
                'id': att.id,
                'test_id': att.test_id,
                'test_title': t_title,
                'badge_code': t_cat,
                'fg': fg,
                'bg': bg,
                'scaled_score': sc,
                'raw_score': f"{att.score}/{att.total_questions}",
                'percentage': pct,
                'is_passed': passed,
                'completed_at': att.completed_at,
            })

        if att.test_id:
            entry = per_test_map.get(att.test_id)
            if not entry:
                entry = {
                    'test_id': att.test_id,
                    'test_title': t_title,
                    'category': 'SSW Skill Evaluation' if t_cat == 'SSW' else 'JFT-Basic CBT',
                    'total': 0,
                    'passed': 0,
                    'best_scaled': sc,
                    'latest_scaled': sc,
                }
                per_test_map[att.test_id] = entry
            entry['total'] += 1
            if passed:
                entry['passed'] += 1
            if sc > entry['best_scaled']:
                entry['best_scaled'] = sc

    avg_scaled_score = int(round(sum(scaled_scores) / total_attempts)) if total_attempts > 0 else 0
    best_scaled_score = max(scaled_scores) if scaled_scores else 0
    latest_scaled_score = scaled_scores[0] if scaled_scores else 0
    pass_rate = int(round((passed_attempts / total_attempts) * 100)) if total_attempts > 0 else 0
    avg_accuracy = int(round(sum(percentages) / total_attempts)) if total_attempts > 0 else 0

    # Semi-circle arc gauge calculation (radius = 76, arc length = pi * 76 ≈ 238.76)
    arc_len = 238.8
    gauge_ratio = min(1.0, max(0.04, avg_scaled_score / 250.0)) if total_attempts > 0 else 0.04
    filled_arc = round(arc_len * gauge_ratio, 1)
    gauge_dasharray = f"{filled_arc} {arc_len}"

    top_test_breakdowns = sorted(per_test_map.values(), key=lambda x: x['total'], reverse=True)[:2]

    support_thread = SupportThread.objects.filter(user=user).first()

    return {
        'user_id': user.id,
        'username': user.username,
        'full_name': full_name,
        'email': user.email or 'No email linked',
        'initials': initials,
        'avatar_bg': avatar_bg,
        'role_label': role_label,
        'is_active': user.is_active,
        'is_verified': is_verified,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
        'country': country,
        'flag': flag,
        'location': location,
        'country_source_label': country_source_label,
        'last_ip': last_ip,
        'bio': bio,
        'target_exam': target_exam,
        'japanese_level': japanese_level,
        'partner_school': partner_school,
        'partner_batch': partner_batch,
        'student_roll': student_roll,
        'game_xp': game_xp,
        'game_level': game_level,
        'game_streak': game_streak,
        'game_words': game_words,
        'total_attempts': total_attempts,
        'passed_attempts': passed_attempts,
        'failed_attempts': max(0, total_attempts - passed_attempts),
        'pass_rate': pass_rate,
        'avg_accuracy': avg_accuracy,
        'avg_scaled_score': avg_scaled_score,
        'best_scaled_score': best_scaled_score,
        'latest_scaled_score': latest_scaled_score,
        'last_attempt_date': all_attempts[0].completed_at if all_attempts else None,
        'gauge_dasharray': gauge_dasharray,
        'recent_attempts': recent_attempts,
        'top_test_breakdowns': top_test_breakdowns,
        'support_thread_id': support_thread.id if support_thread else None,
    }




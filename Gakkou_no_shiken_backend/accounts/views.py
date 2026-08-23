from collections import defaultdict
import json
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from tests.models import Attempt, Question, AnswerOption

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('landing_page')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Also save email if provided in a custom field or simply default form
            # Let's check if email was passed in post and save it
            email = request.POST.get('email', '')
            if email:
                user.email = email
                user.save()
            login(request, user)
            messages.success(request, f"Welcome to JFT Practice, {user.username}!")
            # Redirect to next parameter if present
            next_url = request.GET.get('next', 'landing_page')
            return redirect(next_url)
    else:
        form = UserCreationForm()
    
    return render(request, 'accounts/signup.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('landing_page')
        
    next_url = request.GET.get('next', 'landing_page')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username_or_email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            
            # Resolve username if email is entered
            username = username_or_email
            if '@' in username_or_email:
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    username = user_obj.username
                except User.DoesNotExist:
                    pass
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {user.username}!")
                return redirect(next_url)
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid credentials. Please check details and try again.")
    else:
        form = AuthenticationForm()
        
    return render(request, 'accounts/login.html', {'form': form, 'next': next_url})

def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('landing_page')

@login_required
def my_results_view(request):
    attempts = list(Attempt.objects.filter(user=request.user).select_related('test').order_by('-completed_at'))
    
    total_attempts = len(attempts)
    passed_attempts = 0
    total_scaled_scores = 0
    highest_scaled_score = 0
    highest_level = "Below A1"
    
    # Section performance counters
    section_totals = {
        'script_vocab': {'correct': 0, 'total': 0},
        'conversation': {'correct': 0, 'total': 0},
        'listening': {'correct': 0, 'total': 0},
        'reading': {'correct': 0, 'total': 0},
    }
    
    # Bulk-fetch all questions and correct answer option IDs in 2 fast queries (O(1) in-memory lookup)
    test_ids = {attempt.test_id for attempt in attempts}
    questions_by_test = defaultdict(list)
    correct_options_by_question = {}
    
    if test_ids:
        for q in Question.objects.filter(test_id__in=test_ids).only('id', 'test_id', 'section'):
            questions_by_test[q.test_id].append(q)
            
        correct_options_by_question = dict(
            AnswerOption.objects.filter(question__test_id__in=test_ids, is_correct=True).values_list('question_id', 'id')
        )
    
    for attempt in attempts:
        questions = questions_by_test.get(attempt.test_id, [])
        total_q = attempt.total_questions if attempt.total_questions > 0 else len(questions)
        pct = (attempt.score / total_q * 100.0) if total_q > 0 else 0.0
        scaled = int(round(10 + (pct / 100.0) * 240)) if total_q > 0 else 10
        
        if scaled >= 200:
            level = "A2.2 (A2)"
            passed_attempts += 1
        elif scaled >= 175:
            level = "A2.1"
        elif scaled >= 145:
            level = "A1"
        else:
            level = "Below A1"
            
        attempt.percentage = int(round(pct))
        attempt.scaled_score = scaled
        attempt.assessment_level = level
        attempt.passed = scaled >= 200
        
        total_scaled_scores += scaled
        if scaled > highest_scaled_score:
            highest_scaled_score = scaled
            highest_level = level

        # Calculate section breakdown for candidate stats in memory
        answers = attempt.answers or {}
        for q in questions:
            sec = q.section
            if sec in section_totals:
                section_totals[sec]['total'] += 1
                selected_opt_id = answers.get(str(q.id))
                if selected_opt_id:
                    correct_opt_id = correct_options_by_question.get(q.id)
                    if correct_opt_id is not None and correct_opt_id == int(selected_opt_id):
                        section_totals[sec]['correct'] += 1

    pass_rate = int(round((passed_attempts / total_attempts * 100))) if total_attempts > 0 else 0
    avg_scaled_score = int(round(total_scaled_scores / total_attempts)) if total_attempts > 0 else 0

    section_stats = []
    sec_names = {
        'script_vocab': ('Script & Vocabulary', '文字と語彙', 'rose'),
        'conversation': ('Conversation & Expression', '会話と表現', 'indigo'),
        'listening': ('Listening Comprehension', '聴解', 'amber'),
        'reading': ('Reading Comprehension', '読解', 'emerald'),
    }

    for sec_key, (name_en, name_ja, color) in sec_names.items():
        tot = section_totals[sec_key]['total']
        cor = section_totals[sec_key]['correct']
        pct = int(round((cor / tot * 100))) if tot > 0 else 0
        section_stats.append({
            'key': sec_key,
            'name_en': name_en,
            'name_ja': name_ja,
            'correct': cor,
            'total': tot,
            'pct': pct,
            'color': color
        })

    chart_attempts = list(reversed(attempts))
    chart_labels = [att.completed_at.strftime('%b %d, %H:%M') for att in chart_attempts]
    chart_scores = [att.scaled_score for att in chart_attempts]
    chart_titles = [att.test.title for att in chart_attempts]

    context = {
        'attempts': attempts,
        'total_attempts': total_attempts,
        'passed_attempts': passed_attempts,
        'pass_rate': pass_rate,
        'highest_scaled_score': highest_scaled_score,
        'avg_scaled_score': avg_scaled_score,
        'highest_level': highest_level,
        'section_stats': section_stats,
        'chart_labels_json': json.dumps(chart_labels),
        'chart_scores_json': json.dumps(chart_scores),
        'chart_titles_json': json.dumps(chart_titles),
    }
    return render(request, 'accounts/my_results.html', context)



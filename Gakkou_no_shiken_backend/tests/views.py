from collections import OrderedDict
import json

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponseForbidden
from django.urls import reverse
from django.views.decorators.cache import cache_page
from .models import Test, Question, AnswerOption, Attempt
from .data.jft_data import get_jft_info, get_jft_test_centers, get_jft_resources
from .data.ssw_data import get_ssw_info, get_ssw_sectors, get_ssw_test_centers

def landing_page_view(request):
    # Single query instead of 3 — critical for cold-start performance on Neon + Vercel
    all_tests = list(Test.objects.filter(is_published=True).order_by("category", "created_at"))
    tests_by_category = OrderedDict([
        (Test.Category.BASIC, [t for t in all_tests if t.category == Test.Category.BASIC]),
        (Test.Category.SKILL, [t for t in all_tests if t.category == Test.Category.SKILL]),
    ])
    # (category_value, display_label, chip_classes, icon_bg_class)
    section_specs = [
        (Test.Category.BASIC, "JFT Tests",
         "bg-indigo-50 text-indigo-700 border border-indigo-100",
         "bg-indigo-600"),
        (Test.Category.SKILL, "SSW Skill Tests",
         "bg-amber-50 text-amber-700 border border-amber-100",
         "bg-amber-500"),
    ]
    return render(
        request,
        'tests/landing.html',
        {
            'tests_by_category': tests_by_category,
            'section_specs': section_specs,
        },
    )

def jft_basic_info_view(request):
    """Renders the dedicated JFT-Basic overview, practice mock tests, test centers map, and resources page."""
    jft_info = get_jft_info()
    test_centers = get_jft_test_centers()
    resources = get_jft_resources()
    basic_tests = Test.objects.filter(is_published=True, category=Test.Category.BASIC).order_by('created_at')
    
    return render(
        request,
        'tests/jft_basic.html',
        {
            'jft_info': jft_info,
            'test_centers': test_centers,
            'centers_json': json.dumps(test_centers),
            'jft_resources': resources,
            'practice_tests': basic_tests,
        }
    )

def ssw_skill_test_info_view(request):
    """Renders the dedicated SSW Skill Test overview, practice mock tests, sectors, venues map, and preparation page."""
    ssw_info = get_ssw_info()
    sectors = get_ssw_sectors()
    test_centers = get_ssw_test_centers()
    skill_tests = Test.objects.filter(is_published=True, category=Test.Category.SKILL).order_by('created_at')
    
    return render(
        request,
        'tests/ssw_skill_test.html',
        {
            'ssw_info': ssw_info,
            'ssw_sectors': sectors,
            'test_centers': test_centers,
            'centers_json': json.dumps(test_centers),
            'practice_tests': skill_tests,
        }
    )


def quiz_page_view(request, pk):
    test = get_object_or_404(Test, pk=pk)
    
    preview_param = request.GET.get('preview')
    is_preview = (preview_param in ['admin', 'true', 'staff', 'preview'] or bool(preview_param))

    # Draft Access Check: Allow if published OR if staff OR if preview parameter is provided
    if not test.is_published:
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)
        if not (is_staff or is_preview):
            messages.warning(request, "This practice test is currently in Draft mode. Only staff can preview it.")
            return redirect('landing_page')

    # Enforce authentication server-side if requires_account is True
    if test.requires_account and not request.user.is_authenticated and not is_preview:
        messages.warning(request, "This practice test requires an account. Please sign in or register to continue.")
        return redirect(f"{reverse('login')}?next={request.path}")
    
    # Fetch questions and their answer options efficiently in section hierarchy order
    questions = list(test.get_ordered_questions())

    
    # Group questions by QuestionGroup for multi-question passage screens
    steps = []
    visited_group_ids = set()
    for question in questions:
        if question.group_id:
            if question.group_id not in visited_group_ids:
                visited_group_ids.add(question.group_id)
                group_questions = [q for q in questions if q.group_id == question.group_id]
                steps.append({
                    'group': question.group,
                    'section': question.section,
                    'questions': group_questions,
                })
        else:
            steps.append({
                'group': None,
                'section': question.section,
                'questions': [question],
            })
    
    return render(request, 'tests/quiz.html', {
        'test': test,
        'questions': questions,
        'steps': steps,
        'total_questions': len(questions),
        'total_steps': len(steps),
    })

def submit_quiz_view(request, pk):
    if request.method != 'POST':
        return redirect('landing_page')
        
    test = get_object_or_404(Test, pk=pk, is_published=True)
    
    # Enforce permissions on submission
    if test.requires_account and not request.user.is_authenticated:
        return HttpResponseForbidden("You must be logged in to submit this test.")
        
    questions = test.get_ordered_questions()
    
    answers = {}
    score = 0
    total_questions = questions.count()
    
    for question in questions:
        field_name = f"question_{question.id}"
        selected_option_id = request.POST.get(field_name)
        
        if selected_option_id:
            try:
                selected_option_id = int(selected_option_id)
                answers[str(question.id)] = selected_option_id
                
                # Check correctness
                option = question.options.filter(id=selected_option_id).first()
                if option and option.is_correct:
                    score += 1
            except ValueError:
                pass
        else:
            answers[str(question.id)] = None
            
    # Create the Attempt record
    attempt = Attempt.objects.create(
        test=test,
        user=request.user if request.user.is_authenticated else None,
        score=score,
        total_questions=total_questions,
        answers=answers
    )
    
    messages.success(request, "Quiz submitted successfully!")
    return redirect('attempt_results', pk=attempt.id)

def attempt_results_view(request, pk):
    attempt = get_object_or_404(Attempt, pk=pk)
    test = attempt.test
    
    if test.requires_account:
        if not request.user.is_authenticated or attempt.user != request.user:
            return HttpResponseForbidden("You do not have permission to view these results.")
            
    # Prefetch questions and options for display in correct section order
    questions = test.get_ordered_questions()
    
    # Add selected option status to questions for template rendering
    for question in questions:
        selected_option_id = attempt.answers.get(str(question.id))
        question.selected_option_id = int(selected_option_id) if selected_option_id else None
        
        # Check if the user's selected answer was correct
        question.is_answered_correctly = False
        if question.selected_option_id:
            opt = question.options.filter(id=question.selected_option_id).first()
            if opt and opt.is_correct:
                question.is_answered_correctly = True
                
    percentage = (attempt.score / attempt.total_questions * 100) if attempt.total_questions > 0 else 0
    passed = percentage >= 80.0 # JFT-Basic standard passing mark is generally 80% (200+ points)
    stroke_dashoffset = 389 - (389 * percentage / 100)
    
    # Official JFT-Basic Scaled Score (10 to 250 scale)
    scaled_score = int(round(10 + (percentage / 100.0) * 240)) if attempt.total_questions > 0 else 10
    
    # JFT-Basic Assessment Result level
    if scaled_score >= 200:
        assessment_level = "A2.2 (A2)"
    elif scaled_score >= 175:
        assessment_level = "A2.1"
    elif scaled_score >= 145:
        assessment_level = "A1"
    else:
        assessment_level = "Below A1"

    # Position percentage on score gauge scale (10 to 250)
    scaled_score_percent = min(100, max(0, ((scaled_score - 10) / 240.0) * 100))

    # Section-by-section breakdown calculations (Official equal-weighted ratio)
    section_breakdown = {
        'script_vocab': {'name_ja': '文字と語彙', 'name_en': 'Script and Vocabulary', 'correct': 0, 'total': 0, 'pct': 0},
        'conversation': {'name_ja': '会話と表現', 'name_en': 'Conversation and Expression', 'correct': 0, 'total': 0, 'pct': 0},
        'listening': {'name_ja': '聴解', 'name_en': 'Listening Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
        'reading': {'name_ja': '読解', 'name_en': 'Reading Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
    }

    for question in questions:
        sec = question.section
        if sec in section_breakdown:
            section_breakdown[sec]['total'] += 1
            if question.is_answered_correctly:
                section_breakdown[sec]['correct'] += 1

    for sec_data in section_breakdown.values():
        if sec_data['total'] > 0:
            sec_data['pct'] = int(round((sec_data['correct'] / sec_data['total']) * 100))
        else:
            sec_data['pct'] = 0

    return render(request, 'tests/results.html', {
        'attempt': attempt,
        'test': test,
        'questions': questions,
        'percentage': percentage,
        'passed': passed,
        'stroke_dashoffset': stroke_dashoffset,
        'scaled_score': scaled_score,
        'assessment_level': assessment_level,
        'scaled_score_percent': scaled_score_percent,
        'section_breakdown': section_breakdown,
    })





"""
Seed Script: SSW Prometric Skill Evaluation Exam (体験版)
Creates an official Prometric CBT test with:
- Phase 1: Audio Comprehension & Audio Typing
- Phase 2: Occupational & Practical Knowledge (Olympic color question + workplace skills)
"""

import os
import sys
import django

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
django.setup()

from tests.models import Test, Question, AnswerOption
from tests.audio_generator import generate_and_save_question_audio

def seed_ssw_demo_exam():
    print("Seeding SSW Prometric CBT Demo Exam...")

    test, created = Test.objects.get_or_create(
        title="SSW Prometric Skill Evaluation Exam (体験版)",
        defaults={
            "description": (
                "Official-style Specified Skilled Worker (特定技能) CBT practice test based on Prometric exam standards. "
                "Features Phase 1 Audio Comprehension & Typing, and Phase 2 Occupational Knowledge & Practical judgment."
            ),
            "category": Test.Category.SKILL,
            "requires_account": False,
            "is_published": True,
            "is_actual_exam_demo": True,
            "time_limit_seconds": 1200, # 20 minutes
        }
    )

    if not created:
        test.category = Test.Category.SKILL
        test.is_published = True
        test.is_actual_exam_demo = True
        test.time_limit_seconds = 1200
        test.save()

    # Clear existing questions for a clean seed
    test.questions.all().delete()

    # ─── PHASE 1: AUDIO & TYPING COMPREHENSION (第1部 音声・入力) ─────────────

    # Question 1: Audio Multiple Choice (Meeting time dialogue)
    q1 = Question.objects.create(
        test=test,
        section=Question.Section.AUDIO,
        type=Question.QuestionType.AUDIO,
        instruction="音声を聞いて、質問に対する最も適切な答えを1つ選んでください。",
        prompt="会話を聞いて、二人は何時に待ち合わせをしますか。",
        audio_script="[Nanami], [明日の打ち合わせは何時にしますか。], [Keita], [午後2時はどうですか。], [Nanami], [2時は別の会議があるので、3時はどうでしょうか。], [Keita], [わかりました。では3時にしましょう。]",
        order_index=1
    )
    AnswerOption.objects.create(question=q1, label="14:00 (午後2時)", is_correct=False, order_index=1)
    AnswerOption.objects.create(question=q1, label="15:00 (午後3時)", is_correct=True, order_index=2)
    AnswerOption.objects.create(question=q1, label="16:00 (午後4時)", is_correct=False, order_index=3)
    AnswerOption.objects.create(question=q1, label="17:00 (午後5時)", is_correct=False, order_index=4)

    # Question 2: Audio Typing Question (Customer greeting)
    # The candidate listens to the prompt/audio and must TYPE their answer
    q2 = Question.objects.create(
        test=test,
        section=Question.Section.AUDIO,
        type=Question.QuestionType.AUDIO_TYPING,
        instruction="音声を聞いて、質問に対する正しい挨拶をひらがなまたはローマ字で入力してください。",
        prompt="【入力設問】お客様がお店に来店したとき、店員が言う挨拶を入力してください。",
        audio_script="[Nanami], [お客様が来店されました。元気に挨拶してください。]",
        order_index=2
    )
    # Valid accepted answers for typing:
    AnswerOption.objects.create(question=q2, label="いらっしゃいませ", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q2, label="irasshaimase", is_correct=True, order_index=2)
    AnswerOption.objects.create(question=q2, label="いらっしゃい", is_correct=True, order_index=3)

    # ─── PHASE 2: OCCUPATIONAL & PRACTICAL KNOWLEDGE (第2部 専門・実技) ──────

    # Question 3: Prometric Olympic Color Question (from user screenshot)
    q3 = Question.objects.create(
        test=test,
        section=Question.Section.OCCUPATIONAL,
        type=Question.QuestionType.TEXT,
        instruction="一般常識・判断力に関する設問です。",
        prompt="問題1：オリンピックマーク（五輪マーク）に [red]使用されていない色[/red] を1つ選んでください。",
        order_index=3
    )
    AnswerOption.objects.create(question=q3, label="赤色", is_correct=False, order_index=1)
    AnswerOption.objects.create(question=q3, label="緑色", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q3, label="黒色", is_correct=False, order_index=3)
    AnswerOption.objects.create(question=q3, label="紫色", is_correct=True, order_index=4)
    AnswerOption.objects.create(question=q3, label="黄色", is_correct=False, order_index=5)
    AnswerOption.objects.create(question=q3, label="青色", is_correct=False, order_index=6)

    # Question 4: Workplace Hygiene & HACCP (Handwashing protocol)
    q4 = Question.objects.create(
        test=test,
        section=Question.Section.OCCUPATIONAL,
        type=Question.QuestionType.TEXT,
        instruction="衛生管理・安全作業基準に関する設問です。",
        prompt="食品の取り扱い前に行う正しい衛生手洗いの手順として、最も適切なものはどれですか。",
        order_index=4
    )
    AnswerOption.objects.create(question=q4, label="水だけで10秒間軽く流す", is_correct=False, order_index=1)
    AnswerOption.objects.create(question=q4, label="石鹸を泡立てて指の間・爪・手首までしっかり洗い、流水ですすぎ清潔なペーパータオルで拭く", is_correct=True, order_index=2)
    AnswerOption.objects.create(question=q4, label="アルコール消毒液を直接吹きかけて自然乾燥させるだけにする", is_correct=False, order_index=3)
    AnswerOption.objects.create(question=q4, label="作業着のエプロンで水気を拭き取る", is_correct=False, order_index=4)

    # Question 5: Workplace Safety & Emergency Action (Spill response)
    q5 = Question.objects.create(
        test=test,
        section=Question.Section.OCCUPATIONAL,
        type=Question.QuestionType.TEXT,
        instruction="職場の労働安全衛生に関する設問です。",
        prompt="作業通路の床に油がこぼれているのを発見しました。転倒事故を防ぐために最初に取るべき行動はどれですか。",
        order_index=5
    )
    AnswerOption.objects.create(question=q5, label="転倒の危険があるため、すぐに周囲に声をかけて注意を促し、直ちに油を拭き取る", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q5, label="終業時間の清掃担当者が掃除するまでそのままにしておく", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q5, label="自分がこぼしたわけではないので、気にせず通り過ぎる", is_correct=False, order_index=3)
    AnswerOption.objects.create(question=q5, label="上司が通るまで離れた場所で待機する", is_correct=False, order_index=4)

    print(f"Successfully created 5 questions for '{test.title}' (ID: {test.id})")

    # Generate TTS audio for q1 and q2 if possible
    try:
        generate_and_save_question_audio(q1, script_text=q1.audio_script, overwrite=True)
        generate_and_save_question_audio(q2, script_text=q2.audio_script, overwrite=True)
        print("Generated TTS audio for Phase 1 audio questions.")
    except Exception as e:
        print(f"TTS audio note: {e}")

    return test

if __name__ == "__main__":
    seed_ssw_demo_exam()

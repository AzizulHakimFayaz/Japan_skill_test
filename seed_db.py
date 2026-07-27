import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from tests.models import Test, Question, AnswerOption

def seed():
    print("Seeding database...")

    # 1. Free Practice Test (Basic category)
    test1, created = Test.objects.get_or_create(
        title="JFT-Basic Free Mock Exam (General)",
        defaults={
            "description": "This is a free practice exam open to all students. It contains questions on grammar, reading comprehension, and everyday vocabulary across all 4 official exam sections.",
            "category": Test.Category.BASIC,
            "requires_account": False,
            "is_published": True,
            "is_actual_exam_demo": True, # Actual Exam Demo with Intro
            "time_limit_seconds": 600 # 10 mins
        }
    )
    
    # Backfill fields if pre-existing
    if not created:
        test1.category = Test.Category.BASIC
        test1.is_actual_exam_demo = True
        test1.save(update_fields=["category", "is_actual_exam_demo"])


    # Clear existing questions for clean seed if re-running
    if not created and test1.questions.count() > 0:
        test1.questions.all().delete()

    # Section 1: Script and Vocabulary
    q1 = Question.objects.create(
        test=test1,
        section=Question.Section.SCRIPT_VOCAB,
        type=Question.QuestionType.TEXT,
        instruction="How do you write the underlined kanji word in hiragana?\nChoose the correct one.",
        prompt="水道が こわれた ときは、 ここに でんわして ください。",
        order_index=1
    )
    AnswerOption.objects.create(question=q1, label="すいどう", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q1, label="すいとう", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q1, label="ずいどう", is_correct=False, order_index=3)


    # Section 2: Conversation and Expression
    q2 = Question.objects.create(
        test=test1,
        section=Question.Section.CONVERSATION,
        type=Question.QuestionType.TEXT,
        prompt="Mei-san is asking Emi-san about baby gifts.\nComplete the sentence:\nわたしは はるが ______ です。 (I like spring.)",
        order_index=2
    )
    AnswerOption.objects.create(question=q2, label="すき (suki)", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q2, label="きらい (kirai)", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q2, label="へた (heta)", is_correct=False, order_index=3)

    # Section 3: Listening Comprehension
    q3 = Question.objects.create(
        test=test1,
        section=Question.Section.LISTENING,
        type=Question.QuestionType.IMAGE,
        prompt="Look at the clock in the illustration. What time is it?",
        order_index=3
    )
    AnswerOption.objects.create(question=q3, label="3:00 (San-ji)", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q3, label="6:00 (Roku-ji)", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q3, label="9:00 (Ku-ji)", is_correct=False, order_index=3)

    # Section 4: Reading Comprehension
    q4 = Question.objects.create(
        test=test1,
        section=Question.Section.READING,
        type=Question.QuestionType.TEXT,
        prompt="You are reading a public notice about a festival.\nフェスティバルに 行った 人は 何が できましたか。",
        order_index=4
    )
    AnswerOption.objects.create(question=q4, label="歌と おどりを 見ること", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q4, label="がっきを 買うこと", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q4, label="アクセサリーを 作ること", is_correct=False, order_index=3)

    print(f"Seeded 4 questions across 4 sections for {test1.title}")

    # 2. Account Required Practice Test (Skill category)
    test2, created = Test.objects.get_or_create(
        title="JFT-Basic Listening & Grammar Prep",
        defaults={
            "description": "Requires creating an account. Tests all 4 sections: Script & Vocab, Conversation, Listening, and Reading.",
            "category": Test.Category.SKILL,
            "requires_account": True,
            "is_published": True,
            "time_limit_seconds": 1200 # 20 mins
        }
    )
    
    if not created and test2.category != Test.Category.SKILL:
        test2.category = Test.Category.SKILL
        test2.save(update_fields=["category"])

    if not created and test2.questions.count() > 0:
        test2.questions.all().delete()

    q2_1 = Question.objects.create(
        test=test2,
        section=Question.Section.SCRIPT_VOCAB,
        type=Question.QuestionType.TEXT,
        prompt="What is the kanji for 'Nihon' (Japan)?",
        order_index=1
    )
    AnswerOption.objects.create(question=q2_1, label="日本", is_correct=True, order_index=1)
    AnswerOption.objects.create(question=q2_1, label="本国", is_correct=False, order_index=2)
    AnswerOption.objects.create(question=q2_1, label="日日", is_correct=False, order_index=3)

    q2_2 = Question.objects.create(
        test=test2,
        section=Question.Section.LISTENING,
        type=Question.QuestionType.AUDIO,
        prompt="Listen to the dialog. Where are the speakers going?",
        order_index=2
    )
    AnswerOption.objects.create(question=q2_2, label="えき (Station)", is_correct=False, order_index=1)
    AnswerOption.objects.create(question=q2_2, label="ぎんこう (Bank)", is_correct=True, order_index=2)
    AnswerOption.objects.create(question=q2_2, label="ゆうびんきょく (Post Office)", is_correct=False, order_index=3)

    print("Seeding complete.")

if __name__ == "__main__":
    seed()

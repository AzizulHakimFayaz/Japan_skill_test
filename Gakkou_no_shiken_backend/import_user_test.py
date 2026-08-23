import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from tests.models import Test, Question, QuestionGroup, AnswerOption
from tests.utils import import_questions_from_csv

test_obj, created = Test.objects.get_or_create(
    title="JFT-Basic Mock Test 1",
    defaults={
        "description": "Full-length standard JFT-Basic practice exam with all 4 sections (Script & Vocabulary, Conversation, Listening, Reading).",
        "category": "basic",
        "is_published": True,
        "is_actual_exam_demo": True,
        "time_limit_seconds": 3600
    }
)

if not created:
    test_obj.questions.all().delete()
    test_obj.question_groups.all().delete()
    test_obj.is_published = True
    test_obj.save()

with open('import_mocktest1.csv', 'rb') as f:
    count, errors = import_questions_from_csv(test_obj, f)

print(f"Successfully imported {count} questions into '{test_obj.title}' (ID: {test_obj.id})")
if errors:
    print("Errors:", errors)

print(f"Total questions in Test: {test_obj.questions.count()}")
print(f"Total groups in Test: {test_obj.question_groups.count()}")

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core import serializers
from tests.models import Test, QuestionGroup, Question, AnswerOption, Attempt

all_objects = []
all_objects.extend(Test.objects.all())
all_objects.extend(QuestionGroup.objects.all())
all_objects.extend(Question.objects.all())
all_objects.extend(AnswerOption.objects.all())

data = serializers.serialize('json', all_objects, indent=2, use_natural_foreign_keys=True)

with open('data_dump.json', 'w', encoding='utf-8') as f:
    f.write(data)

print(f"Successfully exported {len(all_objects)} objects to data_dump.json (UTF-8)")

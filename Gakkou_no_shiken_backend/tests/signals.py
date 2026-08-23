from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Test, Question, QuestionGroup, AnswerOption

def invalidate_test_cache(test_id):
    if test_id:
        cache.delete(f"cbt_quiz_data_v1_{test_id}")
        cache.delete("api_tests_list_cache")

@receiver([post_save, post_delete], sender=Test)
def clear_test_cache(sender, instance, **kwargs):
    invalidate_test_cache(instance.id)

@receiver([post_save, post_delete], sender=Question)
def clear_question_cache(sender, instance, **kwargs):
    invalidate_test_cache(instance.test_id)

@receiver([post_save, post_delete], sender=QuestionGroup)
def clear_group_cache(sender, instance, **kwargs):
    invalidate_test_cache(instance.test_id)

@receiver([post_save, post_delete], sender=AnswerOption)
def clear_option_cache(sender, instance, **kwargs):
    if instance.question_id:
        try:
            invalidate_test_cache(instance.question.test_id)
        except Exception:
            pass

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0012_underline_help_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='translations',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Optional JSON dictionary mapping languages to translations: {'English': '...', 'Chinese': '...', ...}",
                verbose_name='Multi-language Translations'
            ),
        ),
    ]
import sys
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile


class Command(BaseCommand):
    help = (
        "Checks whether 100% of user records have country populated before applying "
        "the final NOT NULL database migration."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Checking Country Migration Readiness for NOT NULL Constraint..."))

        total_users = User.objects.count()
        null_or_empty_profiles = []
        user_confirmed = 0
        ip_estimated = 0
        unknown_source = 0

        for user in User.objects.all().select_related('profile'):
            profile = getattr(user, 'profile', None)
            if not profile or not profile.country or not profile.country.strip():
                null_or_empty_profiles.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'country_source': getattr(profile, 'country_source', 'None')
                })
            else:
                if profile.country_source == UserProfile.CountrySource.USER:
                    user_confirmed += 1
                elif profile.country_source == UserProfile.CountrySource.IP:
                    ip_estimated += 1
                else:
                    unknown_source += 1

        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(f"  Total Registered Users:          {total_users}")
        self.stdout.write(f"  Users with Country Populated:    {total_users - len(null_or_empty_profiles)}")
        self.stdout.write(f"    - Explicit User Confirmed:     {user_confirmed}")
        self.stdout.write(f"    - IP Geolocation Estimated:    {ip_estimated}")
        self.stdout.write(f"    - Other Populated:             {unknown_source}")
        self.stdout.write(f"  Users where country IS NULL/'':  {len(null_or_empty_profiles)}")
        self.stdout.write("=" * 65 + "\n")

        if null_or_empty_profiles:
            self.stdout.write(self.style.ERROR(
                f"[BLOCKED] Database NOT NULL constraint CANNOT be applied yet. {len(null_or_empty_profiles)} users still have NULL/empty country."
            ))
            self.stdout.write("\nPending users:")
            for item in null_or_empty_profiles[:20]:
                self.stdout.write(f"  - User ID: {item['id']}, Username: '{item['username']}', Email: '{item['email']}' (source: {item['country_source']})")
            if len(null_or_empty_profiles) > 20:
                self.stdout.write(f"  ... and {len(null_or_empty_profiles) - 20} more users.")

            self.stdout.write("\nRecommended Next Steps:")
            self.stdout.write("1. Run 'python manage.py backfill_user_countries' to estimate remaining countries via IP.")
            self.stdout.write("2. Prompt existing users on login to complete their profile country.")
            self.stdout.write("3. Re-run this check once all users have selected or confirmed a country.")
            sys.exit(1)
        else:
            self.stdout.write(self.style.SUCCESS(
                "[READY] 100% of users have a populated country! It is now safe to apply the final NOT NULL database migration."
            ))
            sys.exit(0)

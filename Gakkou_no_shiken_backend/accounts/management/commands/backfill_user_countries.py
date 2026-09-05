from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile
from accounts.geolocation import lookup_ip_country


class Command(BaseCommand):
    help = (
        "Automated backfill process to populate countries for existing users "
        "using known IP addresses and geolocation, without overwriting user-confirmed data."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Simulate the backfill without committing changes to the database."
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help="Re-evaluate users who currently have country_source as 'ip' or 'unknown'."
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"Starting Existing User Country Migration (dry_run={dry_run}, force={force})..."
        ))

        total_users = User.objects.count()
        user_confirmed_count = 0
        ip_backfilled_count = 0
        unknown_count = 0
        already_populated_count = 0

        users = User.objects.all().order_by('id')

        for user in users:
            profile, _ = UserProfile.objects.get_or_create(user=user)

            # 1. Skip explicit user-confirmed countries
            if profile.country and profile.country_source == UserProfile.CountrySource.USER:
                user_confirmed_count += 1
                continue

            # 2. If already populated by IP and not forcing, skip
            if profile.country and profile.country_source == UserProfile.CountrySource.IP and not force:
                already_populated_count += 1
                continue

            # 3. Check for known IP address
            known_ip = profile.last_known_ip

            if known_ip:
                estimated_country = lookup_ip_country(known_ip)
                if estimated_country:
                    self.stdout.write(
                        f"  [IP DETECTED] User '{user.username}' (ID: {user.id}, IP: {known_ip}) -> {estimated_country}"
                    )
                    if not dry_run:
                        profile.country = estimated_country
                        profile.country_source = UserProfile.CountrySource.IP
                        profile.save(update_fields=['country', 'country_source'])
                    ip_backfilled_count += 1
                    continue
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  [IP UNRESOLVED] User '{user.username}' (ID: {user.id}, IP: {known_ip}) -> Geolocation lookup yielded no result."
                        )
                    )

            # 4. No IP or Geolocation failed -> DO NOT INVENT A COUNTRY
            self.stdout.write(
                f"  [UNKNOWN] User '{user.username}' (ID: {user.id}) -> Set to NULL (unknown source)."
            )
            if not dry_run:
                # Do not invent a country
                if not profile.country:
                    profile.country = None
                profile.country_source = UserProfile.CountrySource.UNKNOWN
                profile.save(update_fields=['country', 'country_source'])
            unknown_count += 1

        # Summary
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("Backfill Country Migration Summary:"))
        self.stdout.write(f"  Total Users Scanned:            {total_users}")
        self.stdout.write(f"  User-Explicit Country (Preserved): {user_confirmed_count}")
        self.stdout.write(f"  IP-Estimated Country (Backfilled): {ip_backfilled_count}")
        self.stdout.write(f"  Already Estimated (Skipped):       {already_populated_count}")
        self.stdout.write(f"  Unknown / Needs Selection:         {unknown_count}")
        self.stdout.write("=" * 60 + "\n")

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN COMPLETE: No database modifications were saved."))
        else:
            self.stdout.write(self.style.SUCCESS("MIGRATION COMPLETE: Database has been updated successfully."))

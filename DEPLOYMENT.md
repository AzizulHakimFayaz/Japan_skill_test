# Deployment Guide

This guide walks you through deploying the JFT-Basic Practice Portal to a production environment. It assumes a typical Linux VPS or PaaS workflow.

---

## 1. Pre-Deployment Checklist

- [ ] A POSIX-compatible host (Ubuntu 22.04 LTS or similar) with Python 3.11+.
- [ ] A managed PostgreSQL database (Neon, Supabase, RDS, or self-hosted).
- [ ] An S3-compatible object store (AWS S3, Cloudflare R2, Backblaze B2, MinIO) for media uploads.
- [ ] A domain name with DNS configured.
- [ ] A TLS certificate (Let's Encrypt is free).

---

## 2. Configure Environment

Copy the included `.env` template and **override every value** for production:

```ini
DEBUG=False
SECRET_KEY=<long-random-string-min-50-chars>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

DATABASE_URL=postgres://USER:PASS@HOST:5432/DBNAME

# S3 / R2 / etc.
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_STORAGE_BUCKET_NAME=jft-basic-media
AWS_S3_REGION_NAME=auto              # R2 needs "auto"; AWS uses e.g. us-east-1
AWS_S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com   # R2 only
# AWS_S3_CUSTOM_DOMAIN=cdn.yourdomain.com   # if you front the bucket with a CDN
```

> The application automatically switches the media backend to `S3Boto3Storage` once **both** `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are present. Leaving them unset keeps the default `FileSystemStorage`.

---

## 3. Provision the Database

1. Create a PostgreSQL database and user (e.g. Aiven, Supabase, Neon).
2. For serverless deployments (such as Vercel), **use a Connection Pooler (PgBouncer)** to avoid exhausting PostgreSQL `max_connections` slots.
   - On Aiven: Enable the **Connection Pooler** in the Aiven Console (Transaction Mode) and use the connection URI provided for the pool.
   - If using PgBouncer, set `DISABLE_SERVER_SIDE_CURSORS=True` in your environment (or include `pgbouncer` in your `DATABASE_URL`).
3. Set the connection string as `DATABASE_URL` in your Vercel / hosting environment variables.
4. The Django ORM will create all tables via `build.sh` (`python manage.py migrate`). Do not run migrations inside serverless HTTP request handlers.


---

## 4. Install Dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For higher throughput, also install the PostgreSQL driver:

```bash
pip install psycopg[binary]
```

(Django's `env.db()` understands `postgres://...` URLs out of the box.)

---

## 5. Run Migrations & Collect Static Files

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

---

## 6. Serve with Gunicorn (or Uvicorn)

Example `gunicorn` invocation:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --access-logfile -
```

If you prefer ASGI:

```bash
uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --workers 3
```

---

## 7. Front Nginx with TLS

A minimal Nginx server block:

```nginx
upstream jft_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 50M;   # enough for image/audio uploads

    location /static/ {
        alias /opt/jft-basic/staticfiles/;
        expires 30d;
        access_log off;
    }

    # If using S3/R2, you do NOT need /media/ served by Nginx.
    # Otherwise, expose it:
    # location /media/ {
    #     alias /opt/jft-basic/media/;
    # }

    location / {
        proxy_pass http://jft_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The proxy headers above ensure Django sees the correct scheme/host — required for CSRF and `ALLOWED_HOSTS` checks to behave correctly.

---

## 8. Process Management

Use `systemd` (or your platform's equivalent) to keep the app running:

`/etc/systemd/system/jft-basic.service`:

```ini
[Unit]
Description=JFT-Basic Practice Portal (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/jft-basic
EnvironmentFile=/opt/jft-basic/.env
ExecStart=/opt/jft-basic/.venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now jft-basic
sudo systemctl status jft-basic
```

---

## 9. Post-Deployment Smoke Tests

- Visit `https://yourdomain.com/` — landing page loads.
- Visit `https://yourdomain.com/admin/` — Jazzmin admin responds; sign in with the superuser.
- Start a free test end-to-end — verify the timer, audio playback (if any), and submission flow.
- Sign up a new user; verify they appear in `/accounts/my-results/` after submitting a test.
- Submit a paid test and confirm the result page enforces ownership (try accessing the URL of another user's attempt).

---

## 10. Operational Notes

- **Database backups** — schedule `pg_dump` regularly; store off-host.
- **Object-storage backups** — most providers offer versioning or cross-region replication; enable whichever fits your SLA.
- **Logging** — wire `LOGGING` in `settings.py` if you want structured logs; defaults rely on Gunicorn's stdout/stderr captures.
- **Updates** — `git pull`, re-run `pip install -r requirements.txt`, then `migrate` and `collectstatic`. Restart Gunicorn (`sudo systemctl restart jft-basic`).
- **Monitoring** — fronting with Nginx + a managed DB gets you most of the way; add platform-specific health checks as needed.

---

## 11. Troubleshooting

| Symptom                                       | Likely cause                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| 400 Bad Request on first request              | `ALLOWED_HOSTS` doesn't include your domain.                                |
| Static files 404                              | Forgot to run `collectstatic`; or Nginx alias doesn't match.               |
| Quiz images / audio broken                    | `AWS_*` env vars misconfigured, or bucket is private with no signed URLs.   |
| Login redirects to HTTP                       | Missing `X-Forwarded-Proto` header in Nginx; CSRF rejects insecure scheme.  |
| Admin styles 500                              | `collectstatic` not run after Jazzmin changes — re-run it.                 |

---

You should now have a production-ready deployment of the JFT-Basic Practice Portal.

# Deployment Guide: Railway (Backend) + Vercel (Frontend)

Your project is cleanly organized into two distinct directories:
- **`Gakkou_no_shiken_backend/`** (Django + Django REST Framework API) → Deploy to **Railway**
- **`Gakkou_no_shiken_frontend/`** (Next.js App) → Deploy to **Vercel**

---

## 1. Deploying the Backend to Railway

### Step 1: Push Code to GitHub
Ensure all your files in `Gakkou_no_shiken_backend/` and `Gakkou_no_shiken_frontend/` are committed and pushed to GitHub.

### Step 2: Create Railway Project
1. Log into [Railway.app](https://railway.app) with your GitHub account.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.

### Step 3: Set Root Directory in Railway
1. In your Railway service settings, go to the **Settings** tab.
2. Under **Root Directory**, set it to:
   ```
   Gakkou_no_shiken_backend
   ```

### Step 4: Add PostgreSQL Database (Recommended)
1. In your Railway canvas, click **+ New** → **Database** → **Add PostgreSQL**.
2. Railway will automatically link the database and set the `DATABASE_URL` variable for your Django app. *(No compute time quota limits!)*

### Step 5: Configure Environment Variables in Railway
In your Django service's **Variables** tab, set:
- `SECRET_KEY` = (A secure random string)
- `DEBUG` = `False`
- `ALLOWED_HOSTS` = `*`
- `CORS_ALLOW_ALL_ORIGINS` = `True`
- `CLOUDINARY_CLOUD_NAME` = (If using Cloudinary for images/audio)
- `CLOUDINARY_API_KEY` = (If using Cloudinary)
- `CLOUDINARY_API_SECRET` = (If using Cloudinary)

### Step 6: Generate Public Domain
Under the service's **Settings** → **Networking** → Click **Generate Domain**.
Copy your live backend URL (e.g. `https://gakkou-backend.up.railway.app`).

### Step 7: Create Superuser in Railway
1. Open the service **Terminal** in Railway.
2. Run: `python manage.py createsuperuser`
3. Access your Django Admin at `https://your-backend.up.railway.app/admin/`.

---

## 2. Deploying the Frontend to Vercel

### Step 1: Create Vercel Project
1. Log into [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.

### Step 2: Set Root Directory
Under **Build and Output Settings**:
- Set **Root Directory** to:
  ```
  Gakkou_no_shiken_frontend
  ```

### Step 3: Set Environment Variable
Under **Environment Variables**:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://your-backend.up.railway.app` *(Your live Railway backend URL from Step 1)*

### Step 4: Deploy
Click **Deploy**! Your Next.js frontend will be live on Vercel and connected to your Railway backend.

---

## 3. Local Development (Running Both Locally)

### Terminal 1: Backend (Port 8000)
```bash
cd Gakkou_no_shiken_backend
..\.venv\Scripts\python manage.py runserver 8000
```
API: `http://127.0.0.1:8000/api/` | Admin: `http://127.0.0.1:8000/admin/`

### Terminal 2: Frontend (Port 3000)
```bash
cd Gakkou_no_shiken_frontend
npm run dev
```
Frontend: `http://localhost:3000`

# OAuth Setup Guide — DevTask AI

Social login (Google + GitHub) works once you create OAuth apps and add credentials to `.env`.

---

## 🔵 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add these **Authorized redirect URIs**:
   - `http://localhost:5000/api/v1/auth/google/callback` (development)
   - `https://your-backend.onrender.com/api/v1/auth/google/callback` (production)
7. Copy **Client ID** and **Client Secret** into `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## ⚫ GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: DevTask AI
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/v1/auth/github/callback`
4. Click **Register application**
5. Copy **Client ID** and generate a **Client Secret**
6. Add to `.env`:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

---

## 🌐 Production (Render + Vercel)

Update `.env` on Render with production URLs:

```env
BACKEND_URL=https://devtaskai-backend.onrender.com
FRONTEND_URL=https://dev-task-ai-frontend.vercel.app

# Update callback URLs in Google Console and GitHub to production URLs too
```

---

## ✅ How it works

1. User clicks "Continue with Google/GitHub" on login/register page
2. Redirected to Google/GitHub to authenticate
3. Google/GitHub redirects back to backend callback URL
4. Backend creates/finds user, generates JWT token
5. Backend redirects to `{FRONTEND_URL}/auth/callback?token=...&name=...`
6. Frontend `AuthCallback` page stores token + user in localStorage
7. User lands on Dashboard ✨

---

## ⚠️ Notes

- If `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` are not set in `.env`, those buttons redirect but OAuth strategies won't be registered — keep placeholder values in `.env` until you're ready
- OAuth users don't have a password — they can't login with email/password (the backend shows a helpful message telling them to use the social sign-in method)
- If a user signs up with email first, then tries Google with the same email — the accounts are **automatically linked**

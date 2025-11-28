# Deployment Guide - Data Visualization Dashboard

This guide will help you deploy your full-stack application with the frontend on Netlify and backend on Render.

## Architecture Overview

- **Frontend**: React + Vite → Netlify
- **Backend**: Node.js + Express + MongoDB → Render (or Railway/Vercel)
- **Database**: MongoDB Atlas (already configured)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

The backend is already configured in the `src/` directory with proper environment variable support.

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/Hunterq417/Data-Visualisation-Dashboard`
4. Configure the service:
   - **Name**: `data-viz-dashboard-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `.` for root)
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: Free

### Step 3: Add Environment Variables on Render

In the Render dashboard, add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_here
GROQ_API_KEY=your_groq_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-render-app.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-netlify-site.netlify.app
PORT=3000
NODE_ENV=production
```

### Step 4: Note Your Backend URL

After deployment, Render will give you a URL like:
`https://data-viz-dashboard-api.onrender.com`

**Save this URL** - you'll need it for the frontend configuration.

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Update Frontend Configuration

Before deploying, you need to update the API URL in your frontend.

Create a file `Frontend/.env.production`:

```env
VITE_API_URL=https://your-render-app.onrender.com/api
```

Replace `your-render-app.onrender.com` with your actual Render backend URL.

### Step 2: Deploy to Netlify (Option A: Via GitHub)

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Configure build settings:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`
   - **Node version**: 18 or higher

5. Click **"Deploy site"**

### Step 3: Add Environment Variables on Netlify

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   VITE_API_URL=https://your-render-app.onrender.com/api
   ```

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## Part 3: Update Backend CORS Settings

Once you have your Netlify URL (e.g., `https://your-site.netlify.app`), you need to update the backend to allow requests from it.

### Update on Render:

Add/Update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://your-site.netlify.app
```

The backend is already configured to use this variable in `src/server.js`.

---

## Alternative: Deploy to Netlify via CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Navigate to Frontend Directory

```bash
cd Frontend
```

### Step 4: Build the Frontend

```bash
npm install
npm run build
```

### Step 5: Deploy

```bash
netlify deploy --prod
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Choose your team
- **Site name**: Choose a unique name
- **Publish directory**: `dist`

---

## Testing Your Deployment

### Test Backend:
```bash
curl https://your-render-app.onrender.com/api/health
```

Should return: `{"status":"ok"}`

### Test Frontend:
Visit your Netlify URL in a browser. The dashboard should load and connect to the backend.

---

## Troubleshooting

### Frontend can't connect to backend:
1. Check CORS settings in backend
2. Verify `VITE_API_URL` is set correctly
3. Check browser console for errors

### Backend not starting:
1. Check Render logs
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct

### Build failures:
1. Check Node version (should be 18+)
2. Verify all dependencies are in `package.json`
3. Check build logs for specific errors

---

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after inactivity (first request may be slow)
   - Netlify free tier has bandwidth limits

2. **Security**:
   - Never commit `.env` files
   - Rotate all API keys that were previously exposed
   - Use strong session secrets

3. **MongoDB Atlas**:
   - Whitelist Render's IP addresses in MongoDB Atlas
   - Or use `0.0.0.0/0` to allow all (less secure but easier)

---

## Quick Deploy Checklist

- [ ] Backend deployed to Render
- [ ] All environment variables set on Render
- [ ] Backend URL noted
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] Environment variables set on Netlify
- [ ] CORS configured on backend with Netlify URL
- [ ] Both services tested and working

---

## Support

If you encounter issues:
1. Check the deployment logs on Netlify/Render
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check browser console for frontend errors

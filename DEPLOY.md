# Render Deployment Guide

## Step 1: MongoDB Atlas
1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user and get your connection string:
   `mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopify-clone`
3. In Network Access, allow `0.0.0.0/0` (all IPs)

## Step 2: Deploy Backend (Web Service)
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add Environment Variables:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → any long random string
   - `NODE_ENV` → `production`
   - `CLIENT_URL` → your frontend URL (set after frontend is deployed)
5. Deploy and note your backend URL: `https://shopify-clone-backend.onrender.com`

## Step 3: Deploy Frontend (Static Site)
1. Create a new **Static Site** on Render
2. Connect your GitHub repo
3. Settings:
   - Root Directory: `client/vite-project`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variables:
   - `VITE_API_URL` → `https://shopify-clone-backend.onrender.com/api`
   - `VITE_SOCKET_URL` → `https://shopify-clone-backend.onrender.com`
5. Deploy

## Step 4: Update CORS
Go back to your backend service on Render and update:
- `CLIENT_URL` → your frontend URL e.g. `https://shopify-clone-frontend.onrender.com`

Then redeploy the backend.

## Step 5: Seed Products (Optional)
After deploying, register an admin user then call:
POST `https://your-backend.onrender.com/api/products/seed/run`
with your auth token to populate sample products.

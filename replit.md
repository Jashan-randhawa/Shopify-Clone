# Real-time Chat Application

## Overview
A full-stack real-time chat application with user authentication, group chats, file attachments, and an admin dashboard.

## Architecture

### Frontend (`/client/vite-project`)
- **Framework**: React 18 with Vite (port 5000)
- **UI**: Material UI (MUI) v6 + Emotion
- **State**: React Context API (AuthContext)
- **Real-time**: socket.io-client
- **Charts**: Chart.js / react-chartjs-2 (admin dashboard)
- **HTTP**: Axios
- **Routing**: React Router DOM v6

### Backend (`/server`)
- **Runtime**: Node.js with Express.js (port 3001)
- **Database**: MongoDB via Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT + Bcrypt
- **File uploads**: Multer

## Environment Variables / Secrets
- `MONGO_URI` - MongoDB connection string (required)
- `JWT_SECRET` - JWT signing secret (required)
- `CLIENT_URL` - Frontend URL for CORS (optional, defaults to http://localhost:5173)
- `PORT` - Backend port (optional, defaults to 3001)

## Workflows
- **Start application** - Runs the Vite frontend dev server on port 5000 (webview)
- **Backend** - Runs the Node.js/Express backend on port 3001 (console)

## Key Files
- `server/server.js` - Backend entry point
- `client/vite-project/src/main.jsx` - Frontend entry point
- `client/vite-project/src/App.jsx` - Main routing
- `client/vite-project/vite.config.js` - Vite config (proxies /api and /socket.io to backend)

## Development Setup
1. Secrets: `MONGO_URI` and `JWT_SECRET` must be set
2. Backend runs on `localhost:3001`
3. Frontend runs on `0.0.0.0:5000` and proxies API/socket requests to the backend

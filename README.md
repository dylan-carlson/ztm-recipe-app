# Recipes PWA

A full-stack Progressive Web App (PWA) for browsing, searching, and saving recipes. 
Built with React, Vite, Tailwind CSS, shadcn/ui on the frontend, and a Node.js/Express proxy on the backend.

## Features
- **Browse & Search**: Find recipes by category or search query via TheMealDB.
- **Offline Favorites**: Save recipes to your favorites, persisted locally via IndexedDB, and view them even without an internet connection!
- **Premium UI**: Designed with Tailwind CSS and shadcn/ui components, featuring a beautiful dark mode toggle.
- **PWA Capabilities**: Installable app with a custom Service Worker for caching static assets and API responses.
- **Secure Backend Proxy**: The client never exposes API keys. All requests are routed through a minimal Node/Express backend with helmet and CORS.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v3, shadcn/ui, TanStack Query (React Query), IndexedDB (idb), React Router.
- **Backend**: Node.js, Express, TypeScript.

## Setup Instructions

1. **Start the Backend**
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
   *The server runs on `http://localhost:5174` (or your chosen PORT).*

2. **Start the Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The frontend proxies `/api` requests to the backend automatically.*

## Environment Variables
- `MEALDB_API_BASE`: Base URL for the API (default: `https://www.themealdb.com/api/json/v1`).
- `MEALDB_API_KEY`: API key for development (default: `1`).
- `PORT`: Backend server port (default: `5174`).

## PWA & Caching Notes
- **Pre-caching**: The service worker (`client/public/sw.js`) precaches the app shell and core assets on install.
- **Runtime Strategies**:
  - Images and Categories use *Stale-While-Revalidate*.
  - Recipe details and search results use *Network-First* with cache fallback.
- **Offline Testing**: Toggle offline mode in Chrome DevTools (Network tab) to see the offline fallback toast and test viewing your saved favorites!

## Post-Generation Checklist
- [x] Backend proxy implemented
- [x] Client UI components and React Query integrated
- [x] Offline Favorites working with IndexedDB
- [ ] **Replace Icons**: Replace `client/public/icons/icon-192.png` and `icon-512.png` placeholders with real images.
- [ ] **Deploy**: Deploy the backend to a provider like Render or Heroku. Deploy the frontend to Netlify or Vercel (remembering to update `target` in `vite.config.ts` or set an environment variable for the production API URL).

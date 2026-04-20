<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/246db21e-477e-4a35-bada-2b7d2a180384

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set env vars in `.env` (or `.env.local`):
   - `OPENAI_API_KEY` for real chat responses (optional for mock mode)
   - Firebase / Firestore config (for persistent study sessions):
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
   - `ENABLE_MOCK_CHAT=false` to avoid accidental mock fallback
   - `VITE_ENABLE_DEV_TOOLS=false` for participant runs
   - `ENABLE_ADMIN_ROUTES=false` for participant runs
3. Run the app:
   `npm run dev`

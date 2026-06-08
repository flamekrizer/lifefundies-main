# Hostinger Deployment

## Express/Node.js Hosting

Use this path if you select **Express** or **Node.js** in Hostinger.

Recommended Hostinger settings:

- Framework: `Express`
- Root directory: project root, or `lf2` if Hostinger asks from the parent repo
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Output directory: `build`
- Node version: `20` or `18`
- Port: use Hostinger's provided `PORT` environment variable

Add these environment variables in Hostinger:

- `VITE_APP_URL=https://your-domain.com`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CASHFREE_ENV=production`
- `CASHFREE_ENV=production`
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `GROQ_API_KEY`

Do not add `VITE_CASHFREE_SECRET_KEY`. Anything prefixed with `VITE_` can be exposed in browser JavaScript.

The Express server runs from `server.js`, serves the built React app from `build/`, and handles:

- `/api/cashfree-create-order`
- `/api/cashfree-verify-order`
- `/api/cashfree-webhook`
- `/api/chat`
- `/api/chat/status`

## Static Website Hosting

Use this path if you are uploading the React frontend to Hostinger `public_html`.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add production environment values:
   ```bash
   cp .env.production.example .env.production
   ```
   Fill in the Firebase values and set `VITE_APP_URL` to your live domain.

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Upload the contents of `build/` to Hostinger `public_html`.
   Upload the contents inside `build`, not the `build` folder itself.

5. Confirm these files exist in `public_html`:
   - `index.html`
   - `.htaccess`
   - `assets/`
   - your images and videos

The included `.htaccess` makes React Router pages such as `/team`, `/mentors`, and `/policies` load correctly when opened directly.

## Backend/API Notes

Hostinger static hosting does not run the API files from `api/*.js`.

The frontend currently calls:
- `/api/cashfree-create-order`
- `/api/cashfree-verify-order`
- `/api/chat`
- `/api/chat/status`

For these features to work in production, use the Express/Node.js setup above, or deploy the backend separately using one of these options:
- Hostinger VPS or Node.js hosting.
- An external backend service and update the frontend/API URLs.
- Firebase/Cloud Functions or another serverless provider.

Never put `CASHFREE_SECRET_KEY` or `GROQ_API_KEY` in browser-exposed `VITE_*` variables. Keep those only on the backend.

## Quick Verification

After upload, test:
- Home page loads.
- Direct route loads: `https://your-domain.com/team`.
- Firebase login/register works.
- Booking payment creates an order only after the backend API is deployed.

# Hostinger Deployment

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

4. Upload the contents of `dist/` to Hostinger `public_html`.
   Upload the contents inside `dist`, not the `dist` folder itself.

5. Confirm these files exist in `public_html`:
   - `index.html`
   - `.htaccess`
   - `assets/`
   - your images and videos

The included `.htaccess` makes React Router pages such as `/team`, `/mentors`, and `/policies` load correctly when opened directly.

## Backend/API Notes

Hostinger static hosting does not run Vercel-style API files from `api/*.js`.

The frontend currently calls:
- `/api/cashfree-create-order`
- `/api/cashfree-verify-order`
- `/api/chat`
- `/api/chat/status`

For these features to work in production, deploy the backend separately using one of these options:
- Hostinger VPS or Node.js hosting for the `api/` endpoints.
- An external backend service and update the frontend/API URLs.
- Firebase/Cloud Functions or another serverless provider.

Never put `CASHFREE_SECRET_KEY` or `GROQ_API_KEY` in browser-exposed `VITE_*` variables. Keep those only on the backend.

## Quick Verification

After upload, test:
- Home page loads.
- Direct route loads: `https://your-domain.com/team`.
- Firebase login/register works.
- Booking payment creates an order only after the backend API is deployed.

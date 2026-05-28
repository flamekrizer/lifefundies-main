# Lifefundies-code-TEAM-PUSHKAR-

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Security: leaked API key remediation

- **Do not commit secrets**: remove any `.env*` files from the repository (done).
- **Revoke and rotate the leaked key immediately**: go to Google Cloud Console → APIs & Services → Credentials and revoke the exposed API key, then create a new one.
- **Invalidate cached builds**: remove built artifacts from the repository (the `dist` built asset was removed) and add `/dist` to `.gitignore` to prevent future commits of build bundles.
- **Use environment variables**: put secrets into a local `.env` (not committed) and reference them via `import.meta.env.VITE_FIREBASE_API_KEY` or `process.env.*` depending on your runtime.
- **Close the GitHub secret scanning alert** after you revoke the key and remove the secret from the repo.

If you want, I can also help to rewrite any source firebase config to read the API key from environment variables instead of embedding it.

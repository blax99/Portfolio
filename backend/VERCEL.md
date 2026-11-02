# Deploy separate Vercel projects

## Backend project

Create a Vercel project with `backend` as its Root Directory. Configure these
Production environment variables:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=a-long-unique-password-of-at-least-12-characters
CORS_ORIGINS=https://your-frontend.vercel.app
```

Set `CORS_ORIGINS` to the exact frontend origin, including the scheme and
hostname but no trailing slash. Add more production origins as a comma-separated
list. Do not use `*`: admin API requests use credentialed cookies. The backend
function serves the API at `/api/*`.

## Frontend project

Create a separate Vercel project with `frontend` as its Root Directory. Set
`VITE_API_BASE_URL` to the backend project's origin, for example
`https://your-backend.vercel.app`, then redeploy. The frontend will send API
requests to that origin.

The backend sets its production admin session cookie to `SameSite=None; Secure`
for cross-origin requests. Browsers that block third-party cookies may require
custom domains configured to share a site.

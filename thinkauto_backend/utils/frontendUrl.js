// Website URL(s) from FRONTEND_URL — comma-separated, trailing slashes removed.
// Used for CORS (all of them) and for links inside emails (the first one).
export const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:8081,http://localhost:8080')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const primaryFrontendUrl = frontendUrls[0];

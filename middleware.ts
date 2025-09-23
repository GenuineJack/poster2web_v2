// The app handles auth properly at the page level, so middleware is not needed

// This file is intentionally minimal to avoid Edge Runtime compatibility issues
// Auth is handled by:
// - Server components (dashboard) check auth and redirect
// - Client components (home page) handle auth state properly
// - All auth flows work without middleware intervention

export {}

// Remove the config export to disable middleware entirely

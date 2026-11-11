import env from "../env.js";

/**
 * Cookie flags for the auth tokens.
 *
 * - httpOnly: JS cannot read it, which blunts XSS token theft.
 * - secure:   HTTPS only. MUST be false on http://localhost or the browser
 *             silently drops the cookie.
 * - sameSite: "none" is required when the API and the SPA are on different
 *             sites (Render + Netlify) -- and "none" REQUIRES secure:true.
 *             On localhost both run on the same site, so "lax" works and
 *             avoids the secure requirement.
 * - maxAge:   matched to the token lifetime so the browser and the JWT expire
 *             together instead of the cookie outliving a dead token.
 */
const DAY = 24 * 60 * 60 * 1000;

const base = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
};

export const accessCookieOptions = { ...base, maxAge: 1 * DAY };
export const refreshCookieOptions = { ...base, maxAge: 10 * DAY };

/** Must match `base` exactly (minus maxAge) or clearCookie won't match. */
export const clearCookieOptions = { ...base };

import axios from "axios";

// The in-flight refresh, shared by every request that 401s at the same time.
let refreshPromise = null;

/*
  CIRCUIT BREAKER.

  Without this, an anonymous visitor produced a storm of requests: each page
  calls /users/currentuser, each 401 triggers a refresh, the refresh 401s
  because there is no session, and the next navigation does it all again --
  dozens of pointless round trips per minute.

  Once a refresh has failed we KNOW there is no session, so we stop trying
  for a while. Any successful login clears the breaker via `resetAuthState`.
*/
let refreshBlockedUntil = 0;
const REFRESH_COOLDOWN_MS = 30_000;

export function resetAuthState() {
  refreshBlockedUntil = 0;
  refreshPromise = null;
}
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND}/api/v1`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 429) {
      window.dispatchEvent(
        new CustomEvent("rate-limit", {
          detail: {
            message: "You're requesting too quickly.",
          },
        })
      );

      return Promise.reject(error);
    }
    // Never try to refresh in response to the refresh call itself (infinite
    // loop) or to a failed login/register (there is no session to refresh).
    const url = originalRequest?.url ?? "";
    const isAuthRoute = ["/users/refreshtoken", "/users/login", "/users/register"].some(
      (route) => url.includes(route)
    );

    const refreshAllowed = Date.now() >= refreshBlockedUntil;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute &&
      refreshAllowed
    ) {
      originalRequest._retry = true;
      try {
        // Single-flight: if ten requests 401 at once they must share ONE
        // refresh call, or each rotates the token and invalidates the others.
        if (!refreshPromise) {
          refreshPromise = api.post("/users/refreshtoken").finally(() => {
            // Clear in `finally` so a failed refresh doesn't leave a rejected
            // promise cached for every later request to await.
            refreshPromise = null;
          });
        }

        await refreshPromise;

        return api(originalRequest);
      } catch (refreshError) {
        // Trip the breaker: there is no usable session right now.
        refreshBlockedUntil = Date.now() + REFRESH_COOLDOWN_MS;
        window.dispatchEvent(new Event("logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

import api from "./api";

/**
 * The API wraps every payload in { statusCode, data, message, success }.
 * Unwrap it here so callers keep using `data.user`.
 */
export default async function getCurrentUser() {
    const response = await api.get("/users/currentuser");
    return response.data?.data ?? { user: null };
}

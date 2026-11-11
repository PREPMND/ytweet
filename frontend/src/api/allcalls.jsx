import api from "./api";

export const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await api.get("/videos/getvideos", {
    params: { page: pageParam, limit: 6, sort: "latest" },
  });
  return res.data.data;
};

export const DBVideoSearch = async (search) => {
  // Build the query with `params` so a search term containing &, ? or # is
  // encoded instead of corrupting the URL.
  const res = await api.get("/videos/practicetrending", {
    params: { search, limit: 8 },
  });
  return res.data.data;
};

// Returning `error.status` on failure made the caller receive a NUMBER where
// it expected `{ videos: [...] }`, so the UI silently rendered nothing and
// react-query never saw an error. Let it throw instead.

export const searchUsers = async (q) => {
  const res = await api.get("/users/search", { params: { q } });
  return res.data.data ?? [];
};


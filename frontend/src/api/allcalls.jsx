import api from "./api";
export const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await api.get(
    `/videos/getvideos?page=${pageParam}&limit=6&sort=${"latest"}`
  );

  return res.data.data;
};
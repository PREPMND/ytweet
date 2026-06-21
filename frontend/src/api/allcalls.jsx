import axios from "axios";
export const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `/videos/getvideos?page=${pageParam}&limit=6`
  );

  return res.data.data;
};
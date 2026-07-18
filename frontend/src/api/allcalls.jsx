import api from "./api";
export const fetchVideos = async ({ pageParam = 1 }) => {
  const res = await api.get(
    `/videos/getvideos?page=${pageParam}&limit=6&sort=${"latest"}`
  );

  return res.data.data;
};
export const DBVideoSearch=async(search)=>{
  try {
    const res= await api.get(`/videos/practicetrending?search=${search}`);
  
    return res.data.data;
  } catch (error) {
    return error.status;
  }
}
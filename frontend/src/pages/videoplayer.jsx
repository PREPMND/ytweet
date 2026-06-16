import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/api";

export const VideoIndv = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [desOpen, setDesOpen] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`/api/v1/videos/watchvideo/${id}`);
        setVideo(res.data.data);
        console.log("Fetched video data:", res.data.data);

        // fetch owner's other videos
        setLoadingVideos(true);
        const res2 = await api.post("/videos/any", { owner: res.data.data });
        setVideos(res2.data.data);
        console.log("Owner's other videos:", res2.data.data);
        setLoadingVideos(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [id]);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="my-2">
      {/* Video player */}
      <div className="h-[70%]">
        <video
          className="w-[95%] m-auto md:mx-2 md:w-[70%] h-[40%] md:h-[60%] bg-black aspect-[16/9] object-contain rounded-lg"
          controls
          src={video.videoFile}
        />
      </div>

      {/* Title + description toggle */}
      <div className="flex w-full justify-between md:w-[70%] mt-4 h-[40px] items-center gap-5">
        <h2 className="text-xl ml-3 w-[88%] truncate font-bold">{video.title}</h2>
        <ChevronDown
          className={`mr-2 cursor-pointer ${desOpen ? "rotate-180" : ""}`}
          onClick={() => setDesOpen(!desOpen)}
        />
      </div>
      {desOpen && (
        <div className="p-4 bg-white rounded-lg shadow-md mt-2">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-sm text-gray-600">{video.description}</p>
        </div>
      )}

      {/* Owner info */}
      <div className="flex items-center gap-3 ml-3 mt-4">
        <img className="w-10 h-10 rounded-full object-cover" src={video.owner.avatar} alt="Profile" />
        <h3 className="font-semibold text-lg">{video.owner.username}</h3>
      </div>

      {/* More from this channel */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold ml-3 mt-6 mb-1">More from this channel</h2>
        {loadingVideos ? (
          <p className="m-auto">Loading videos...</p>
        ) : (
          <div className="flex overflow-x-auto flex-col gap-4 p-3">
            {videos.map((v) => (
              <div
                key={v._id}
                className="flex-shrink-0 w-full relative cursor-pointer"
                onClick={() => navigate(`/video/${v._id}`)}
              >
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full rounded-lg aspect-video h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {v.durationFormatted}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

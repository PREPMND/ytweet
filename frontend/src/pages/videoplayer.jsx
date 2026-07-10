import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/api";
import LoaderTwo from "../assets/loading2";

export const VideoIndv = ({ darkMode }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [desOpen, setDesOpen] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await api.get(`/videos/getvideo/${id}`);
                setTimeout(() => {
                    setVideo(res.data.data);
                }, 1000);
                console.log("Fetched video data:", res.data);

                // fetch owner's other videos
                setLoadingVideos(true);
                const res2 = await api.post("/videos/any", { owner: res.data.data.owner._id, excludeId: id, limit: 10 });
                setVideos(res2.data.data);
                console.log("Owner's other videos:", res2.data.data);

                setLoadingVideos(false);
            } catch (err) {
                console.error(err);
            }
        };
        fetchVideo();
    }, [id]);

    if (!video) return <LoaderTwo darkMode={darkMode} text="Loading.." />;

    return (
        <div className={`py-2 ${darkMode ? "bg-neutral-900 text-white" : "bg-white"}`}>
            {/* Video player */}
            <div className="h-[70%]">
                <video
                    className="w-[95%] m-auto md:mx-2 md:w-[70%] h-[40%] md:h-[60%] bg-black aspect-[16/9] object-contain rounded-lg"
                    controls
                    src={video.videoFile}
                />
            </div>

            {/* Title + description toggle */}
            <div className={` ${desOpen ? "opacity-0" : ""} flex w-full justify-between md:w-[70%] mt-4 h-[40px] items-center gap-5`}>
                <h2 className={`text-xl ml-3 w-[88%] truncate font-bold ${darkMode ? "text-white bg-neutral-900" : "text-black"}`}>{video.title}</h2>
                <ChevronDown
                    className={`mr-2 cursor-pointer ${desOpen ? "rotate-180" : ""}`}
                    onClick={() => setDesOpen(!desOpen)}
                />
            </div>
            {desOpen && (
                <div
                    className={`fixed inset-0  bg-opacity-50 z-40
                        `}
                    onClick={() => setDesOpen(false)}
                >
                    <div
                        className={`absolute bottom-0 left-0 right-0 w-full
                        md:top-[30%] md:h-auto h-[60%] md:mx-auto md:w-[80%]
                        pt-4 pl-5 p-4 rounded-t-lg z-50
                        ${darkMode? "bg-neutral-950 text-white": "bg-white text-black"
                        }
                        ${desOpen ? "translate-y-0" : "translate-y-full"
                        } transition-transform duration-1000 ease-in-out`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <h2 className="text-2xl font-[500] text-[20px] md:text-[30px] font-[Saira]">
                                {video.title}
                            </h2>
                            <div className="border-b border-gray-500 mt-3"></div>
                        </div>

                        <h2 className="text-md my-4 text-[16px] md:text-[23px] font-[Saira] font-[500] mb-2">Description</h2>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} text-[13px] md:text-[16px] overflow-y-auto no-scrollbar max-h-[50vh]`}>
                            {video.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Owner info */}
            <div 
            onClick={() => navigate(`/${video.owner.username}`)}
            className="flex items-center gap-3 ml-3 mt-4">
                <img className="w-10 h-10 rounded-full object-cover" src={video.owner.avatar} alt="Profile" />
                <h3 className="font-semibold text-lg">{video.owner.username}</h3>
            </div>

            {/* More from this channel */}
            <div className="mt-4 min-h-[50vw] ">
                <h2 className="text-xl font-semibold ml-3 mt-6 mb-1">More from this channel</h2>
                {true? (
                    <p className={`m-auto ${darkMode ? "text-gray-400 bg-neutral-800" : "text-gray-600"} text-center h-[70vw] md:h-[10vw]  mt-2`}>Loading videos..</p>
                ) : (
                    <div className="flex overflow-x-auto min-h-screen flex-col gap-4 p-3">
                        {videos.map((v) => (
                            <div
                                key={v._id}
                                className="flex-shrink-0 w-full h-full md:flex mt-4 relative cursor-pointer"
                                onClick={() => navigate(`/watchvideo/${v._id}`)}
                            >
                                <img
                                    src={v.thumbnail}
                                    alt={v.title}
                                    className="w-full md:w-[50%] rounded-lg aspect-video h-full object-cover"
                                />
                                <h3 className=" font-[500] px-2 line-clamp-2 mt-2 md:line-clamp-6 md:px-5 font-[Saira] text-[16px] md:text-[20px] rounded">
                                    {v.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

import { Droplet, ThumbsUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";

export const VideoIndv = (props) => {
    const { videoIdSelected } = props;
    const [desOpen, setDesOpen] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [videos, setVideos] = useState([]);

    console.log(videoIdSelected)

    {/* owner's other videos are present here */ }
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });

    const channelVideo = async (ownerId) => {
        setLoadingVideos(true);
        try {
            const res = await api.post("/videos/any", { owner: ownerId });
            setVideos(res.data.data);
            console.log("Owner's other videos:", res.data.data);
            // match backend response structure
            setLoadingVideos(false);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        channelVideo(videoIdSelected.owner._id);
    }, [data]);

    {/* Function to format duration in seconds to HH:MM:SS or MM:SS */ }
    function formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    return (
        <>
            <div className="my-2 ">
                <div>
                    {/* Actual video player*/}

                    <div className=' h-[70%]'>

                        <video
                            className="w-[95%] m-auto md:mx-2 md:w-[70%] h-[40%] md:h-[60%] bg-black aspect-[16/9] object-contain rounded-lg"
                            controls
                        >
                            <source src={videoIdSelected.videoFile} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
                <div>
                    {/* Comment and likes */}
                    <div>
                        <div className="flex w-full justify-between md:w-[70%] mt-4 h-[40px] items-center gap-5">
                            <h2 className="text-xl ml-3 w-[88%] truncate font-bold">
                                {videoIdSelected.title}
                            </h2>
                            <ChevronDown
                                className={`mr-2 md:mr-0 absolute text-right md:static  md:right-0 right-[6px] mt-2 cursor-pointer ${desOpen ? 'rotate-180' : ''}`}
                                onClick={() => setDesOpen(true)}
                            />
                        </div>
                        {desOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setDesOpen(false)}
                            >
                                <div
                                    className={`absolute bottom-0 w-[100%] left-0 right-0 md:top-[30%] md:h-auto h-[60%] md:mx-auto md:w-[80%] pt-4 pl-5  bg-white rounded-t-lg p-4 z-50
                                    ${desOpen ? 'translate-y-0' : 'translate-y-full'} transition-transform  duration-1000 ease-in-out`}
                                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                                >
                                    <div>
                                        <h2 className="text-2xl font-[500] text-[20px] md:text-[30px] font-[Saira]">
                                            {videoIdSelected.title}
                                        </h2>
                                        <div className="border-b border-gray-500 mt-3"></div>
                                    </div>

                                    <h2 className="text-md my-4 text-[16px] md:text-[23px] font-[Saira] font-[500] mb-2">Description</h2>
                                    <p className="text-sm text-gray-600 text-[13px] md:text-[16px] overflow-y-auto no-scrollbar max-h-[50vh]">
                                        {videoIdSelected.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 ml-3 mt-4">
                            <img className="w-10 h-10 rounded-full object-cover" src={videoIdSelected.owner.avatar} alt="Profile" />
                            <div className="flex flex-col ml-5">
                                <h3 className="font-semibold text-lg">{videoIdSelected.owner.username}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {/* video suggestions */}
                    <div className="mt-4">
                        <h2 className="text-xl font-bold ml-3 mb-2 font-[Saira">More from this channel</h2>
                        {loadingVideos ? (
                            <p className="m-auto">Loading videos...</p>
                        ) : (
                            <div className="flex overflow-x-auto flex-col gap-4 p-3">
                                {videos.map((video) => (
                                    <div
                                        key={video._id}
                                        className="flex-shrink-0 w-full relative cursor-pointer"
                                        onClick={() => navigate(`/video/${video._id}`)} // or your routing logic
                                    >
                                        {/* Thumbnail only */}
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full rounded-lg aspect-video h-full object-cover"
                                        />

                                        {/* Duration overlay */}
                                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            {video.durationFormatted}
                                        </span>
                                    </div>

                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
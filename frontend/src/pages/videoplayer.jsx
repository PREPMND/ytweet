import { Droplet, ThumbsUp, ChevronDown } from "lucide-react";
import { useState } from "react";
export const VideoIndv = (props) => {
    const { videoIdSelected } = props;
    const [desOpen, setDesOpen] = useState(false);
    console.log(videoIdSelected)
    return (
        <>
            <div className="my-2 mx-2 ">
                <div>
                    {/* Actual video player*/}

                    <div className=' h-[70%]'>

                        <video
                            className="w-full md:w-[70%] h-[40%] md:h-[60%] bg-black aspect-[16/9] object-contain rounded-lg"
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
                            <h2 className="text-xl ml-3 truncate font-bold">
                                {videoIdSelected.title}
                            </h2>
                            <ChevronDown
                                className={`ml-3 text-right mt-2 cursor-pointer ${desOpen ? 'rotate-180' : ''}`}
                                onClick={() => setDesOpen(true)}
                            />
                        </div>
                        {desOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setDesOpen(false)}
                            >
                                <div
                                    className={`absolute bottom-0 w-[90%] left-0 right-0 md:top-[30%] md:mx-auto md:w-[80%] pt-4 pl-5  bg-white rounded-t-lg p-4 z-50
                                    ${desOpen ? 'translate-y-0':'translate-y-full'} transition-transform  duration-1000 ease-in-out`}
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
                </div>
            </div>
        </>
    )
}
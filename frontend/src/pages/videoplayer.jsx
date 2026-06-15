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
                        <div className="flex w-full justify-between md:w-[70%] mt-4 h-[40px]  items-center gap-5">
                            <h2 className="text-xl ml-3 truncate font-bold ">{videoIdSelected.title}</h2>
                            <ChevronDown className={`ml-3 text-right mt-2 cursor-pointer ${desOpen ? 'rotate-180' : ''}`} onClick={() => setDesOpen(!desOpen)} />
                        </div>
                        <div>


                            <div
                                className={`ml-3 mt-2 text-sm text-gray-600 overflow-hidden transition-[max-height] duration-1000 ease-in-out`}
                                style={{ maxHeight: desOpen ? '500px' : '0px' }}
                            >
                                {videoIdSelected.description}
                            </div>



                        </div>
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
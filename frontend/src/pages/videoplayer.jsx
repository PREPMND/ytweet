import { Droplet, ThumbsUp,ChevronDown } from "lucide-react";
import {useState} from "react";
export const VideoIndv = (props) => {
    const { videoIdSelected } = props;
    const[desOpen, setDesOpen] = useState(false);
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
                        <div className="flex  mt-4 h-[40px]  items-center gap-5">
                            <h2 className="text-xl ml-3 truncate font-bold ">{videoIdSelected.title}</h2>
                        </div>
                        <div>
                            <ChevronDown className="ml-3 mt-2 cursor-pointer" onClick={() => setDesOpen(!desOpen)} />
                            <p className="ml-3 mt-2 text-sm text-gray-600">{videoIdSelected.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3 mt-4">
                            <img className="w-10 h-10 rounded-full object-cover" src={videoIdSelected.owner.avatar} alt="Profile" />
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
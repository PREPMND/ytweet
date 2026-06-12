export const VideoIndv = (props) => {
    const { videoIdSelected } = props;
    console.log(videoIdSelected)
    return (
        <>
            <div className="mt-2 ml-2">
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
                        <div className="flex  mt-4 h-[40px] items-center">
                            <img className="w-10 h-10 rounded-full object-cover" src={videoIdSelected.owner.avatar} alt="Profile" />
                            <h2 className="text-xl font-bold ">{videoIdSelected.title}</h2>
                        </div>
                        
                        <p className="text-gray-600 mt-2">{videoIdSelected.description}</p>
                    </div>
                </div>
                <div>
                    {/* video suggestions */}
                </div>
            </div>
        </>
    )
}
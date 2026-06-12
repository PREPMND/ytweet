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
                        <h2 className="text-xl font-bold mt-4">{videoIdSelected.title}</h2>
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
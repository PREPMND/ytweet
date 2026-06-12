export const VideoIndv =(props)=>{
    const {videoIdSelected}=props;
    console.log(videoIdSelected)
    return(
        <>
        <div>
            <div>
                {/* Actual video player*/}
                DIJGBOS
                <div>
                    <video
                    className="w-full h-[40%] md:h-[70%] bg-black aspect-video object-contain rounded-lg"
                    controls>
                        <source src={videoIdSelected.videoFile} type="video/mp4"/>
                    </video>
                </div>
            </div>
            <div>
                {/* Comment and likes */}
            </div>
            <div>
                {/* video suggestions */ }
            </div>
        </div>
        </>
    )
}
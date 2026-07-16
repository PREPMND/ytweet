import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api";
import axios from "axios";
const PracticeVideoPagination=()=>{
    const [videoData,setVideoData]=useState([])
        const getVideos=async ()=>{
        console.log("ewgwg");
        
        const page=3;
        const limit=3;
        console.log(limit);
        
        const res= await api.get(`videos/practicevideo?page=${page}&limit=${limit}`);
        setVideoData(res.data.data.videos);
        console.log(res.data.data);
        
    }
    useEffect(()=>{
        getVideos();
    },[])
    return (
        <>
        <div>
            {videoData.map((video)=>{
                return (
                <div 
                className="flex items-center flex-row-reverse justify-center "
                key={video._id}>
                    <div>{video._id}</div>
                    <div className="w-[60%]"> 
                        <img
                        className="w-[40%] aspect-[16/9] object-cover"
                        src={video.thumbnail}/>
                    </div>
                </div>);
            })}
        </div>
        </>
    )
}
export default PracticeVideoPagination
{/*
    1. Backend with query params
js
const getVideos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  const skip = (page - 1) * limit;

  const videos = await Video.find()
    .skip(skip)
    .limit(limit);

  res.json({ data: videos });
};
👉 Frontend call:

js
axios.get(`/videos/getvideos?page=${page}&limit=${limit}`);
This is the most common way. Query params are flexible and easy to extend (?page=2&limit=10&sort=asc).

2. Backend with route params
js
router.get("/getvideos/:page/:limit", getVideos);

const getVideos = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 6;

  const skip = (page - 1) * limit;

  const videos = await Video.find()
    .skip(skip)
    .limit(limit);

  res.json({ data: videos });
};
👉 Frontend call:

js
axios.get(`/videos/getvideos/${page}/${limit}`);
This is less flexible (harder to add optional filters), but sometimes used for cleaner URLs.

3. Backend with request body (POST)
js
router.post("/getvideos", getVideos);

const getVideos = async (req, res) => {
  const { page = 1, limit = 6 } = req.body;

  const skip = (page - 1) * limit;

  const videos = await Video.find()
    .skip(skip)
    .limit(limit);

  res.json({ data: videos });
};
👉 Frontend call:

js
axios.post(`/videos/getvideos`, { page, limit });
This is useful if you’re sending complex filters (e.g., category, tags, search terms) along with pagination.

// Route setup
router.get("/getvideos", getVideos);              // query params
router.get("/getvideos/:page/:limit", getVideos); // route params

// Controller
const getVideos = async (req, res) => {
  // Handle both query and route params
  const page = parseInt(req.query.page || req.params.page) || 1;
  const limit = parseInt(req.query.limit || req.params.limit) || 6;

  const skip = (page - 1) * limit;

  const videos = await Video.find()
    .skip(skip)
    .limit(limit);

  res.json({ data: videos });
};

    */ }
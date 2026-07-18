import { useEffect } from "react"
import api from "../api/api"
import { useState } from "react"
import { useEffectEvent } from "react";
export const TrendingPractice=()=>{
    const [videos,setVideos]=useState([]);
    async function getSearch(){
        try {
            const page=1;
            const limit=3;
            const res=await api.get(`/videos/practicetrending?search=${"onlyfans"}`);
            console.log(res.data.data);
        } catch (error) {
            return error.status;
        }
    }
    useEffect(()=>{
        getSearch();
    },[])
    return (
        <>
        <div>
            Hey
        </div>
        </>
    )
}
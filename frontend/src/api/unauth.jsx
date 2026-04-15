import axios from 'axios'

const Api=axios.create({
    baseURL:`${import.meta.env.VITE_BACKEND}/api/v1/users`,
    withCredentials:true
})
Api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error.response.status==401){
            window.location.href="/login"
        }
        return Promise.reject(error)
    }
)
export default Api
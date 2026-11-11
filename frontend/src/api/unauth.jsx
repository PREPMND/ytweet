import axios from 'axios'

const Api=axios.create({
    baseURL:`${import.meta.env.VITE_BACKEND}/api/v1/users`,
    withCredentials:true
})
Api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        // `error.response` is undefined for network errors / timeouts, so the
        // old `error.response.status` threw inside the interceptor and masked
        // the real failure. Optional-chain it.
        if(error.response?.status===401){
            window.location.href="/login"
        }
        return Promise.reject(error)
    }
)
export default Api
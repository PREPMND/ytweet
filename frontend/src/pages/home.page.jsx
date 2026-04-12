import React from 'react'
import axios from 'axios';

const Home = () => {
    let res;
    async function fetchData() {
        try {
            const response = await axios.post("http://localhost:8000/api/v1/users/currentuser")
            console.log(response.data)
            return response.data
        }
        catch(err){
            console.log(err)
        }
    }
    res=fetchData()
  return (
    <div
    >
      {res}
    </div>
  )
}

export default Home

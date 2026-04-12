import React from 'react'

const Home = () => {
    let res;
    async function fetchData() {
        try {
            const response = await fetch("http://localhost:8000/api/v1/users/me")
            return response
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

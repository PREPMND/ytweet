import React, { useState } from 'react'
import axios from 'axios';
const Login = () => {
    const [email,setEmail]=useState('');
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [way,setWay]=useState('email');
    async function HandleSubmit(e){
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/api/v1/users/login",
                        {email,username,password},
                        {
                            withCredentials: true,                        
                        });
            console.log(res.data.data.user.username)
            return res.data.data.user.username
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);}
    }
    return (
    <>
    <div>
        <div>
            <div className='flex justify-'>
                <h1 >Login</h1>
                <h3
                onClick={()=>{
                    if(way=="email"){setWay('username')}
                    else{setWay('email')}
                }}
                >`Use {way=="email"?"username":"email"} To Login`</h3>
                <div>
                    <form onSubmit={HandleSubmit}>
                        <input 
                        className={`${way=="email"?"flex":"hidden"}`}
                        type='text' 
                        placeholder='email' value={email} 
                        name='email' onChange={(e)=>{setEmail(e.target.value)}}/>
                        <input 
                        className={`${way=="email"?"hidden":"flex"}`}
                        type='text' 
                        placeholder='username' value={username} 
                        name='username' onChange={(e)=>{setUsername(e.target.value)}}/>
                        <input 
                        type='text'
                        value={password}
                        onChange={(e)=>{setPassword(e.target.value)}} 
                        
                        />
                        <input type="submit" placeholder='submit'/>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

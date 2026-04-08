import React, { useState } from 'react'
import axios from 'axios';
const Login = () => {
    const [email,setEmail]=useState('');
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [way,setWay]=useState('email');
    const [currentUser,setCurrentUser] = useState(null);
    async function HandleSubmit(e){
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/api/v1/users/login",
                        {email,username,password},
                        {
                            withCredentials: true,                        
                        });
            setCurrentUser(res.data.data.user.username);
            setEmail('');
            setUsername('');
            setPassword('');
            return res.data.data.user.username
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);}
    }
    return (
    <>
    <div className='flex jus'>
        <div className='border border-amber-300 rounded-lg w-[400px] h-[400px] flex items-center justify-center'>
            <div className='flex h-screen items-center justify-center flex-col'>
                <h1 className='text-xl font-700 mb-4'>Login</h1>
                <h3
                className='cursor-pointer'
                onClick={()=>{
                    if(way=="email"){setWay('username')}
                    else{setWay('email')}
                }}
                >Use {way=="email"?"username":"email"} To Login</h3>
                <div className='mt-12'>
                    <form 
                    className='h-full w-full flex flex-col items-center justify-center gap-4'
                    onSubmit={HandleSubmit}>
                        <input 
                        className={`${way=="email"?"flex":"hidden"} border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        w-[250px]`}
                        type='text' 
                        placeholder='email' value={email} 
                        name='email' onChange={(e)=>{setEmail(e.target.value)}}/>
                        <input 
                        className={`${way=="email"?"hidden":"flex"} border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        w-[250px]`}
                        type='text' 
                        placeholder='username' value={username} 
                        name='username' onChange={(e)=>{setUsername(e.target.value)}}/>
                        <input 
                        className='border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[250px]'
                        type='text'
                        value={password} placeholder='password'
                        
                        onChange={(e)=>{setPassword(e.target.value)}} 
                        
                        />
                        <input type="submit" placeholder='submit'/>
                    </form>
                
                </div>
                <div className={`${currentUser ? 'block' : 'hidden'}`}> Welcome {currentUser}</div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

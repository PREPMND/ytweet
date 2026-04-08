import React, { useState } from 'react'

const Login = () => {
    const [email,setEmail]=useState('');
    const [username,setUsername]=useState('');
    const [way,setWay]=useState('email');
    return (
    <>
    <div>
        <div>
            <div>
                <h1 >Login</h1>
                <h3
                onClick={()=>{
                    if(way=="email"){setWay('username')}
                    else{setWay('email')}
                }}
                >`Use {way=="email"?"username":"email"} To Login`</h3>
                <div>
                    <form>
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
                        <input type='text'
                        />
                    </form>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

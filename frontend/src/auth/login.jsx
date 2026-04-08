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
                onClick={()=>{setWay('username')}}
                >Use Username To Login</h3>
                <div>
                    <form>
                        <input 
                        className={`${way=="email"?"flex":"hidden"}`}
                        type='text' 
                        placeholder='email' value={email} 
                        name='email' onChange={(e)=>{setEmail(e.target.value)}}/>
                        <input 
                        type='text' 
                        placeholder='username' value={username} 
                        name='username' onChange={(e)=>{setUsername(e.target.value)}}/>
                    
                    </form>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

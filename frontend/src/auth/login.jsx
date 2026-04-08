import React, { useState } from 'react'

const Login = () => {
    const [email,setEmail]=useState('');
    return (
    <>
    <div>
        <div>
            <div>
                <h1>Login</h1>
                <h3>Use Username To Login</h3>
                <div>
                    <form>
                        <input type='text' 
                        placeholder='email' value={email} 
                        name='email' onChange={(e)=>{see.target.value}}/>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

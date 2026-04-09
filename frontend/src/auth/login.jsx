import { useState } from 'react'
import axios from 'axios';
import Aurora from "../assets/aurora.jsx"
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

    <div className='flex justify-center items-center h-screen'>
  
        <Aurora 
        className='absolute z-0'
        colorStops={["#7cff67","#B19EEF","#5227FF"]} blend={0.5} 
        amplitude={10} speed={1}/>
        <div className='border border-amber-300 z-40 rounded-lg w-[400px] h-[400px] flex items-center justify-center'>
            <div className='flex items-center justify-center flex-col'>
                <h1 className='text-xl font-700 mb-4'>Login</h1>
                <h3
                className='cursor-pointer mt-6 text-green-400 hover:underline'
                onClick={()=>{
                    if(way=="email"){setWay('username')}
                    else{setWay('email')}
                }}
                >Use {way=="email"?"username":"email"} To Login</h3>
                <div className='mt-12'>
                    <form 
                    className='h-full *:text-lg w-full flex flex-col items-center justify-center gap-4'
                    onSubmit={HandleSubmit}>
                        <input 
                        className={`${way=="email"?"flex":"hidden"} border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        w-[250px]`}
                        type='text' 
                        placeholder='Email' value={email} 
                        name='email' onChange={(e)=>{setEmail(e.target.value)}}/>
                        <input 
                        className={`${way=="email"?"hidden":"flex"} border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        w-[250px]`}
                        type='text' 
                        placeholder='Username' value={username} 
                        name='username' onChange={(e)=>{setUsername(e.target.value)}}/>
                        <input 
                        className='border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[250px]'
                        type='text'
                        value={password} placeholder='Password'
                        
                        onChange={(e)=>{setPassword(e.target.value)}} 
                        
                        />
                        <input 
                        className='bg-blue-300 rounded px-4 py-1 font-[600] text-white '
                        type="submit" name='Login' value={"Login"} placeholder='Login'/>
                    </form>
                
                </div>
                <div
                className={`
                    ${currentUser?'hidden':'block'}
                    cursor-pointer mt-6 text-green-400 text-[15px] text-yellow hover:underline`}
                >Want to create a new account!</div>
                <div className={`
                    mt-4
                    ${currentUser ? 'block' : 'hidden'}`}> Welcome {currentUser}</div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login

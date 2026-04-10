import React, { useEffect, useState } from 'react';
import axios from 'axios';
const Register = () => {
    const [next, setNext] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [fullName, setFullName] = useState('');
    const [coverImage, setCoverImage] = useState('');
    async function HandleSubmit(e) {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/api/v1/users/register",
                { email, username, password,fullName,avatar,coverImage },
                {
                    withCredentials: true,
                });
            return res
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
        }
    }
    function HandlingNext(e) {
        e.preventDefault();
        const confirmed = window.confirm("You confirm these details?");
        if (confirmed) {
            setNext(true);
        }
    }

    useEffect(() => {
        if (next) {
            console.log("Proceeding to avatar step...");
        }
    }, [next]);

    return (
        <div className='w-full h-[100vh] flex items-center justify-center'>
            <form className='flex flex-col gap-8 mb-6 *:w-[280px]'>
                <div className={`${next ? "hidden" : "flex flex-col gap-8 mb-6 *:w-[280px]"}`}>
                    <input className='input' type='text' value={fullName} placeholder='Full Name' 
                    onChange={(e)=>{setFullName(e.target.value)}}/>
                    <input className='input' type='text' value={email} placeholder='Email' 
                    onChange={(e)=>{setEmail(e.target.value)}} />
                    <input className='input' type='text' value={username} placeholder='UserName' 
                    onChange={(e)=>{setUsername(e.target.value)}}/>
                    <input className='input' type='text' value={password} placeholder='Password' 
                    onChange={(e)=>{setPassword(e.target.value)}}/>
                </div>
                <button
                    className={`${next ? "hidden" : "block"}`}
                    onClick={HandlingNext}>Next</button>

                <div className={`${next ? "block" : "hidden"} *:mb-5 `}>
                    <div>Choose Avatar</div>
                    <input className='files' type='file' accept='image/*' value={avatar} placeholder='Avatar' 
                    onChange={(e)=>{setAvatar(e.target.value)}}/>
                    <div>Choose Cover Image</div>
                    <input className='files' type='file' accept='image/*' value={coverImage} placeholder='Cover Image' 
                    onChange={(e)=>{setCoverImage(e.target.value)}}/>
                    <div className='flex justify-center'>
                        <input
                            className='bg-blue-500 rounded px-4 py-1 hover:bg-blue-700 transition-colors duration-300 ease-in-out font-[600] text-white text-lg w-[100px] cursor-pointer'
                            type="submit" name='Login' placeholder='Register' />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Register;
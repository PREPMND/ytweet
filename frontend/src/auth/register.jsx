import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Register = () => {
    const blockedUsername = ["", "ytweet", "modih"];
    const [next, setNext] = useState(false);
    const [subnext, setSubnext] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [fullName, setFullName] = useState('');
    const [coverImage, setCoverImage] = useState('');

    useEffect(() => {
        if (
            !blockedUsername.includes(username) &&
            !blockedUsername.includes(email) &&
            !blockedUsername.includes(fullName) &&
            !blockedUsername.includes(password)
        ) {
            setSubnext(true);
        } else {
            setSubnext(false);
        }
    }, [username, email, fullName, password]);

    async function HandleSubmit(e) {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:8000/api/v1/users/register",
                { email, username, password, fullName, avatar, coverImage },
                { withCredentials: true }
            );
            return res;
        } catch (err) {
            console.error("Login failed:", err.status ,err.message);
        }
    }

    function HandlingNext(e) {
        e.preventDefault();
        const confirmed = window.confirm("You confirm these details?");
        if (confirmed) {
            setNext(true);
        }
    }

    function HandlingBack(e) {
        e.preventDefault();
        setNext(false);
    }

    return (
        <div className='w-full h-[100vh] flex items-center justify-center'>
            <form className='flex flex-col gap-8 mb-6 *:w-[280px]' onSubmit={HandleSubmit}>
                <div className={`${next ? "hidden" : "flex flex-col gap-8 mb-6 *:w-[280px]"}`}>
                    <input className='input' type='text' value={fullName} placeholder='Full Name'
                        onChange={(e) => setFullName(e.target.value)} />
                    <input className='input' type='text' value={email} placeholder='Email'
                        onChange={(e) => setEmail(e.target.value)} />
                    <input className='input' type='text' value={username} placeholder='UserName'
                        onChange={(e) => setUsername(e.target.value)} />
                    <input className='input' type='text' value={password} placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button
                    className={`${next ? "hidden" : "block"} ${subnext ? "bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2" : "bg-gray-400 text-gray-700 cursor-not-allowed rounded px-4 py-2"}`}
                    onClick={HandlingNext}
                    disabled={!subnext}
                >
                    Next
                </button>

                <div className={`${next ? "block" : "hidden"} *:mb-5`}>
                    <div>Choose Avatar</div>
                    <input className='files' type='file' accept='image/*' value={avatar} placeholder='Avatar'
                        onChange={(e) => setAvatar(e.target.value)} />
                    <div>Choose Cover Image</div>
                    <input className='files' type='file' accept='image/*' value={coverImage} placeholder='Cover Image'
                        onChange={(e) => setCoverImage(e.target.value)} />

                    <div className='flex justify-between mt-4'>
                        <button
                            className='bg-gray-500 rounded px-4 py-1 hover:bg-gray-700 transition-colors duration-300 ease-in-out font-[600] text-white text-lg w-[100px]'
                            onClick={HandlingBack}
                        >
                            Back
                        </button>
                        <input
                            className='bg-blue-500 rounded px-4 py-1 hover:bg-blue-700 transition-colors duration-300 ease-in-out font-[600] text-white text-lg w-[100px] cursor-pointer'
                            type="submit"
                            value='Register'
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Register;
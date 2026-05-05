import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"
import { Home, Loader, LoaderPinwheel } from "lucide-react"
import orange from '../assets/orange.jpg'
const Register = () => {
    const blockedUsername = ["ytweet", "modih", "", " ", "admin", "administrator", "root", "sysadmin", "support", "helpdesk", "contact", "info", "sales", "marketing", "webmaster", "postmaster", "hostmaster", "abuse", "security", "noreply", "no-reply"];
    const [next, setNext] = useState(false);
    const [subnext, setSubnext] = useState(false);
    const [button2, setButton2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [fullName, setFullName] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const navigate = useNavigate()

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
            const formData = new FormData();
            formData.append("email", email);
            formData.append("username", username);
            formData.append("password", password);
            formData.append("fullName", fullName);
            formData.append("avatar", avatar);
            formData.append("coverImage", coverImage);
            console.log(avatar)
            setLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND}/api/v1/users/register`,
                formData,
                { withCredentials: true }
            );
            setLoading(false);
            if (res.status == 200 || res.status == 201) { navigate("/") }
            return res;
        } catch (err) {
            setLoading(false);
            console.error("Register failed:", err.response?.data || err.message);
        }
    }
    function HandlingNext(e) {
        e.preventDefault();
        setButton2(true)
        //const confirmed = window.confirm("You confirm these details?");
        if (
            email.trim() !== "" &&
            username.trim() !== "" &&
            password.trim() !== "" &&
            fullName.trim() !== "" &&
            subnext
        ) {
            setNext(true);
        } else {
            alert("Please fill all fields correctly before continuing.");
        }

    }
    function HandlingBack(e) {
        e.preventDefault();
        setNext(false);
    }
    return (
        <>

            <div className='w-full h-[100vh] flex relative items-center justify-center'>
                <img className='z-0 inset-0 absolute w-full h-screen object-cover' src={orange} />
                <form className='flex flex-col gap-8 mb-6 w-[300px] md:w-[390px]' onSubmit={HandleSubmit}>
                    <div className={`${next ? "hidden" : "flex flex-col gap-8 mb-6 "} border-[1.5px] backdrop-blur-md bg-white/90 border-blue-500 hover:border-green-500 z-30 shadow-lg rounded-lg py-9 *:w-[240px]  md:*:w-[280px] h-full items-center justify-center transition-transform duration-500 ease-in-out 
              ${next ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}w-full `}>
                        <h1 className='text-2xl font-[700] text-center text-neutral-800 mb-2'>Register</h1>
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
                        className={`${next ? "hidden" : "block"} ${setNext ? "bg-blue-500/90 hover:bg-blue-700 z-40 text-white font-semibold rounded px-4 py-2" : "bg-gray-400 text-gray-700 rounded px-4 py-2"} transition-colors duration-300 ease-in-out z-40`}
                        onClick={HandlingNext}
                    >
                        Next
                    </button>
                    <div className={`${next ? "flex flex-col justify-center items-center" : "hidden"} *:mb-5 z-30 text-center font-[700] h-full`}>

                        <div className='flex gap-9 border-[1px] shadow-md rounded-lg p-4 items-center justify-center w-[500px] select-none bg-white/90 backdrop-blur-md'>
                            <div >
                                <div>Choose Avatar</div>
                                <input className='files' type='file' accept='image/*' placeholder='Avatar'
                                    onChange={(e) => setAvatar(e.target.files[0])} />
                            </div>
                            <div className='border-[1px] shadow-lg rounded-[50%] w-[80px] h-[80px] overflow-hidden'>
                                <img className='w-full h-full object-cover' src={avatar ? URL.createObjectURL(avatar) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                            </div>
                        </div>
                        <div className='flex gap-9 border-[1px] shadow-md rounded-lg p-4 items-center justify-center w-[500px] select-none bg-white/90 backdrop-blur-md'>
                            <div >
                                <div>Choose Cover Image</div>
                                <input className='files' type='file' accept='image/*' placeholder='Cover Image'
                                    onChange={(e) => setCoverImage(e.target.files[0])} />
                            </div>
                            <div className='border-[1px] shadow-lg rounded-[50%] w-[80px] h-[80px] overflow-hidden'>
                                <img className='w-full h-full object-cover' src={coverImage ? URL.createObjectURL(coverImage) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                            </div>
                        </div>
                        <div className='flex justify-between gap-10 mt-4'>
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
                    <LoaderPinwheel className={`${loading ? "block" : "hidden"} absolute top-5  animate-spin text-yellow-50`} />
                </form>

            </div>

        </>

    );
};

export default Register;
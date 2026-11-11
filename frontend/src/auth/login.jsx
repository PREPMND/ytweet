import { useState } from 'react'
import axios from 'axios';
// `Aurora` was imported and never rendered, and `Particles` is only used
// inside a commented-out block below. Both pull in `ogl` (a WebGL library),
// so the dead imports alone were shipping it to every visitor. Re-add the
// import next to the JSX if you switch the particle background back on.
import '../assets/particles.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { resetAuthState } from "../api/api"
import { LoaderPinwheel } from "lucide-react"
import orange from '../assets/orange.jpg'
const Login = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [way, setWay] = useState('email');
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(false);
    const [bgLoaded, setbgLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rateLimitMessage, setRateLimitMessage] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    async function HandleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            if ((email.trim() || username.trim()) && password.trim()) {
                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND}/api/v1/users/login`,
                    { email, username, password },
                    { withCredentials: true }
                );

                // Clear the refresh circuit breaker -- there IS a session now.
                resetAuthState();

                setCurrentUser(res.data.data.user.username);
                setEmail("");
                setUsername("");
                setPassword("");
                setError(false);

                // The cached "currentUser" is still the signed-OUT result, and
                // its staleTime means react-query would happily serve it for
                // another minute -- so the navbar and <Protected> would still
                // think nobody is logged in. Invalidate before navigating.
                await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

                // <Protected> stores where the user was headed before the
                // redirect, so send them back there instead of always home.
                navigate(location.state?.from || "/", { replace: true });
            } else {
                setError(true);
            }

        } catch (err) {

            if (err.response?.status === 429) {
                setRateLimitMessage(true);

                clearTimeout(window.rateLimitTimer);

                window.rateLimitTimer = setTimeout(() => {
                    setRateLimitMessage(false);
                }, 2000);

                return;
            }

            setError(true);
            console.error(err);

        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            {
                !bgLoaded && (
                    <div className='flex items-center h-screen justify-center'>
                        <div className='border-[1.5px] backdrop-blur-md bg-white/90 border-blue-500 transition-colors duration-500 hover:border-green-500 z-30 shadow-lg rounded-lg gap-9 flex flex-col justify-center place-content-center *:h-[40px] *:w-[80%] *:bg-neutral-500 *:mx-auto *:animate-pulse *mb-5 w-[300px] h-[380px] md:w-[400px] md:h-[400px]'>
                            <div className=''></div>
                            <div className=''></div>
                            <div className=''></div>
                            <div className=''></div>
                        </div>
                    </div>
                )
            }
            <img
                onLoad={() => { setbgLoaded(true) }}
                onError={() => setbgLoaded(true)}
                className='-z-20 hidden inset-0 absolute w-full h-screen object-cover' src={orange} />
            {bgLoaded && (<div>
                {/*
        <div 
        className="h-screen w-screen" style={{ position: 'relative' }}>
        <Particles
        className='bg-black'
        particleColors={["#ffffff"]}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover
        alphaParticles={false}
        disableRotation={false}
        pixelRatio={1}/>
        </div>*/}
                <div
                    className='bg-white select-none absolute inset-0 flex z-30 items-center justify-center'>
                    <img
                        className='-z-20 inset-0 absolute w-full h-screen object-cover' src={orange} />

                    <div className='border-[1.5px] backdrop-blur-md bg-white/90 border-blue-500 transition-colors duration-500 hover:border-green-500 z-30 shadow-lg rounded-lg w-[300px] h-[380px] md:w-[400px] md:h-[400px]'>

                        <div className='flex items-center justify-center h-full flex-col'>
                            <h1 className='text-2xl font-[700] mt-3 md:mt-5 text-neutral-800 mb-4'>Login</h1>
                            <h3
                                className='cursor-pointer mt-4 md:mt-6 text-green-500 hover:underline'
                                onClick={() => {
                                    if (way == "email") { setWay('username') }
                                    else { setWay('email') }
                                }}
                            >Use {way == "email" ? "username" : "email"} To Login</h3>
                            <div className='mt-8 md:mt-12'>
                                <form
                                    className='h-full *:text-lg w-full flex flex-col items-center justify-center gap-4'
                                    onSubmit={HandleSubmit}>
                                    <input
                                        className={`${way == "email" ? "flex" : "hidden"} border border-gray-300 bg-white text-neutral-900 rounded px-3 py-1 focus:outline-none focus:ring-2 placeholder:text-neutral-700 focus:ring-blue-500 focus:border-transparent
                        w-[200px] md:w-[250px]`}
                                        type='text'
                                        placeholder='Email' value={email}
                                        name='email' onChange={(e) => { setEmail(e.target.value) }} />
                                    <input
                                        className={`${way == "email" ? "hidden" : "flex"} border border-gray-300 bg-white text-neutral-900 rounded px-3 py-1 focus:outline-none focus:ring-2 placeholder:text-neutral-700 focus:ring-blue-500 focus:border-transparent
                        w-[200px] md:w-[250px]`}
                                        type='text'
                                        placeholder='Username' value={username}
                                        name='username' onChange={(e) => { setUsername(e.target.value) }} />
                                    {/* type="password" -- it was "text", so the
                                        password was shown in the clear and
                                        browsers wouldn't offer to save it. */}
                                    <input
                                        className='border border-gray-300 bg-white text-neutral-900 placeholder:text-neutral-700 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[200px] md:w-[250px]'
                                        type='password'
                                        autoComplete='current-password'
                                        value={password} placeholder='Password'

                                        onChange={(e) => { setPassword(e.target.value) }}

                                    />
                                    <input
                                        className='bg-blue-400 rounded px-4 py-1 hover:bg-blue-700 transition-colors duration-300 ease-in-out font-[600] text-white text-lg w-[100px] cursor-pointer'
                                        type="submit" name='Login' value={"Login"} placeholder='Login' />
                                </form>

                            </div>
                            <div className={`${error ? "block" : "opacity-0"} mt-2 text-center text-red-500`}>Login Failed. Please check your credentials.</div>
                            <div
                                onClick={() => navigate("/register")}
                                className={`
                    ${currentUser ? 'hidden' : 'block'}
                    cursor-pointer md:mt-7 text-green-400 text-[15px] text-yellow hover:underline`}
                            >Want to create a new account!</div>
                        </div>
                    </div>
                </div>
                <LoaderPinwheel className={`${loading ? "block" : "hidden"} z-40 absolute left-1/2 top-10 animate-spin text-yellow-50`} size={28} />
            </div>)}
            <div>
                {rateLimitMessage && (
                    <div
                        className="text-[14px] font-[Saira] md:text-[17px] fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900
    text-white  px-5 max-w-[50%] py-3 rounded-xl shadow-2xl border border-neutral-700 z-[9999] animate-toast">
                        You're requesting too quickly.
                    </div>
                )}
            </div >
        </>
    )
}

export default Login

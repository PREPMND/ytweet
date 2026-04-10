import React, { useEffect, useState } from 'react'

const Register = () => {

    function handlingNext(){
        u
    }se
    const [next, setNext] = useState(false)
    return (
        <>
            <div className=''>
                <div>
                    <div className=''>
                        <div className='w-full h-[100vh] flex items-center justify-center'>
                            <form
                                className='flex flex-col gap-8 mb-6 *:w-[280px] '
                            >
                                <input
                                    className='input'
                                    type='text' placeholder='Full Name' />
                                <input
                                    className='input'
                                    type='text' placeholder='Email' />
                                <input
                                    className='input'
                                    type='text' placeholder='UserName' />
                                <input
                                    className='input'
                                    type='text' placeholder='Password' />
                                <button
                                    onClick={
                                        handlingNext()
                                    }
                                >Next</button>
                                <div className={`${next ? "block" : "hidden"}`}>
                                    <div>Choose Avatar</div>
                                    <input
                                        className='files'
                                        type='file' accept='image/*' placeholder='Avatar' />
                                    <div>Choose Cover Image</div>
                                    <input
                                        className='files'
                                        type='file' accept='image/*' placeholder='Cover Image' />
                                    <input type='submit' />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register

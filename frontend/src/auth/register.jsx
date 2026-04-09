import React from 'react'

const Register = () => {
    return(
        <>
        <div className=''>
            <div>
                <div className=''>
                    <div className='w-full h-[100vh] flex items-center justify-center'>
                        <form
                        className='bg-white/90 backdrop-blur-md border-[1.5px] border-blue-500 shadow-lg rounded-lg w-[400px] h-[500px] flex items-center justify-center gap-12 p-8'
                        >
                            <div className='flex flex-col gap-8'>
                            <input 
                            className='input'
                            type='text' placeholder='Full Name'/>
                            <input 
                            className='input'
                            type='text' placeholder='Email'/>
                            <input 
                            className='input'
                            type='text' placeholder='UserName'/>
                            <input 
                            className='input'
                            type='text' placeholder='Password'/>
                            </div>
                            <div>
                            <div>Choose Avatar</div>
                            <input 
                            className='files'
                            type='file' accept='image/*' placeholder='Avatar'/>
                            <div>Choose Cover Image</div>
                            <input
                            className='files'
                            type='file' accept='image/*' placeholder='Cover Image'/>
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

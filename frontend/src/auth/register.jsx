import React from 'react'

const Register = () => {
    return(
        <>
        <div className=''>
            <div>
                <div className=''>
                    <div className='w-full h-[100vh] flex items-center justify-center'>
                        <form
                        className='flex flex-col gap-8 '
                        >
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
                            <input 
                            className='files'
                            type='file' accept='image/*' placeholder='Avatar'/>
                            <input
                            className='files s'
                            type='file' accept='image/*' placeholder='Cover Image'/>

                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Register

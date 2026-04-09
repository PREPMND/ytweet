import React from 'react'

const Register = () => {
    return(
        <>
        <div className=''>
            <div>
                <div className=''>
                    <div className='w-full h-[100vh] flex items-center justify-center'>
                        <form
                        className='flex flex-col '
                        >
                            <input type='text' placeholder='Full Name'/>
                            <input type='text' placeholder='Email'/>
                            <input type='text' placeholder='UserName'/>
                            <input type='text' placeholder='Password'/>
                            <input type='file' accept='image/*' placeholder='Avatar'/>
                            <input type='file' accept='image/*' placeholder='Cover Image'/>

                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Register

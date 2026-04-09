import React from 'react'

const Register = () => {
    return(
        <>
        <div className=''>
            <div>
                <div className=''>
                    <h1>Welcome , Register</h1>
                    <div className='w-[400px] h-[600px] flex items-center justify-center'>
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

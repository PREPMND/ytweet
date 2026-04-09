import React from 'react'

const Register = () => {
    return(
        <>
        <div>
            <div>
                <div>
                    <h1>Welcome , Register</h1>
                    <div>
                        <form>
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

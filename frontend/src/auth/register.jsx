import React from 'react'

const register = () => {
    return(
        <>
        <div>
            <div>
                <div>
                    <h1>Welcome , Register</h1>
                    <div>
                        <form>
                            <input type='text' placeholder='Full Name'/>
                            <input type='text' placeholder=''/>
                            <input type='text' placeholder='Full Name'/>
                            <input type='text' placeholder=''/>
                            <input type='file' accept='image/*' placeholder='Avatar'/>
                            <input type='text' accept='image/*' placeholder='Cover Image'/>

                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default register

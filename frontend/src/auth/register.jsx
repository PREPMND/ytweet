import React, { useEffect, useState } from 'react';

const Register = () => {
  const [next, setNext] = useState(false);

  function HandlingNext(e) {
    e.preventDefault();
    const confirmed = window.confirm("You confirm these details?");
    if (confirmed) {
      setNext(true);
    }
  }

  useEffect(() => {
    if (next) {
      console.log("Proceeding to avatar step...");
    }
  }, [next]);

  return (
    <div className='w-full h-[100vh] flex items-center justify-center'>
      <form className='flex flex-col gap-8 mb-6 *:w-[280px]'>
        <div className={`${next?"hidden":"flex flex-col gap-8 mb-6 *:w-[280px]"}`}>
        <input className='input' type='text' placeholder='Full Name' />
        <input className='input' type='text' placeholder='Email' />
        <input className='input' type='text' placeholder='UserName' />
        <input className='input' type='text' placeholder='Password' />
        </div>
        <button
        className={`${next ? "hidden" : "block"}`}
        onClick={HandlingNext}>Next</button>

        <div className={`${next ? "block" : "hidden"} `}>
          <div>Choose Avatar</div>
          <input className='files' type='file' accept='image/*' placeholder='Avatar' />
          <div>Choose Cover Image</div>
          <input className='files' type='file' accept='image/*' placeholder='Cover Image' />
          <input 
          className=''
          type='submit' />
        </div>
      </form>
    </div>
  );
};

export default Register;
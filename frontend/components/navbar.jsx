import React from 'react'
import { Home, Loader, LoaderPinwheel } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

import getCurrentUser from '../api/currentuser';
const Navbar = () => {
    const currentUser = getCurrentUser();
    console.log(currentUser);

    return (
        <>
        <div>
            <div>
                <div>
                    
                </div>
            </div>
        </div>

        </>
    )
}

export default Navbar

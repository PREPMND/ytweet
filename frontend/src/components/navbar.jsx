import React from 'react'
import { Home, Loader, LoaderPinwheel } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

import getCurrentUser from '../api/currentuser.jsx';
const Navbar = () => {
    const currentUser = getCurrentUser();
    console.log(getCurrentUser())
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                console.log(data);
            } catch (err) {
                console.log("Error in component");
            }
        };

        fetchUser();
    }, []);
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

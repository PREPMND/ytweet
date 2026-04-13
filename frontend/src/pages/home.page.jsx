import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import getCurrentUser from '../api/currentuser.jsx';
const Home = (props) => {
    const { User } = props;
    
    return (
        <div>
            {User ? (
                <div>
                    <h2>Welcome, {User.user.fullName}!</h2>
                    <p><strong>ID:</strong> {User.user._id}</p>
                    <p><strong>Email:</strong> {User.user.email}</p>
                    <p><strong>Full Name:</strong> {User.user.fullName}</p>
                    {/* Add more fields as needed */}
                </div>
            ) : (
                "Loading..."
            )}
        </div>
    );
};

export default Home;
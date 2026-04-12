import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const [res, setRes] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.post("http://localhost:8000/api/v1/users/currentuser");
                setRes(response.data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            {res ? <pre>{JSON.stringify(res, null, 2)}</pre> : "Loading..."}
        </div>
    );
};

export default Home;
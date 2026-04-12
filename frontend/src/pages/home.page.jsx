import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post("http://localhost:8000/api/v1/users/currentuser");
        setUser(response.data.data);       // the actual user object
        setMessage(response.data.message); // success message
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h2>{message}</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {/* Add more fields as needed */}
        </div>
      ) : (
        "Loading..."
      )}
    </div>
  );
};

export default Home;
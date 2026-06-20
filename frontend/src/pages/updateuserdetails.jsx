import React, { useEffect, useState } from "react";
import api from "../api/api";
import getCurrentUser from "../api/currentuser";
import { useNavigate } from "react-router-dom";
import LoaderTwo from "../assets/loading2";
const UpdateProfile = ({ darkMode }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();

        setFullName(data.user.fullName);
        setEmail(data.user.email);
        setAvatar(data.user.avatar);
        setUsername(data.user.username);
      } catch (err) {
        console.log(err);
      } finally {
        setTimeout(()=>{
          setLoading(false);
        },2000)
        
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      await api.patch("/users/updateaccount", {
        fullName,
        email,
      });

      alert("Profile Updated Successfully");
      navigate("/currentuserdetails");
    } catch (err) {
      console.log(err);
      alert("Failed To Update Profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <LoaderTwo darkMode={darkMode} text="Loading.." />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
        
      <div
        className={`max-w-2xl mx-auto rounded-2xl p-6 border ${
          darkMode
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-gray-300"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">
          Update Profile
        </h1>

        <div className="flex flex-col items-center mb-8">
          <img
            src={avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />

          <h2 className="mt-3 text-xl font-semibold">
            @{username}
          </h2>
        </div>

        <form
          onSubmit={handleUpdate}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block mb-2 font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-3 rounded-lg bg-blue-600 text-white"
            >
              {updating
                ? "Updating..."
                : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/currentuserdetails")
              }
              className="px-5 py-3 rounded-lg bg-gray-600 text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
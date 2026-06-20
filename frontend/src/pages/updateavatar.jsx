import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ChangeAvatar = ({ darkMode }) => {
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      alert("Select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("avatar", avatar);

      await api.patch(
        "/users/changeavatar",
        formData
      );

      alert("Avatar Updated Successfully");
      navigate(-1);
    } catch (err) {
      console.log(err);
      alert("Failed To Update Avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-black text-white" : "bg-gray-100 text-black"}`}>
      <div className={`max-w-2xl mx-auto p-6 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-700" : "bg-white border-gray-300"}`}>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Change Avatar
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            className={`w-[80%] md:w-full m-auto p-2 md:p-4 rounded-lg border ${darkMode ? "bg-zinc-800 border-zinc-700 text-black" : "bg-white border-gray-300"}`}
            type="file"
            accept="image/*"
            onChange={handleFile}
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-32 m-auto h-32 rounded-full object-cover mt-5"
            />
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 hover:bg-blue-700 transition-colors duration-300 ease-in-out bg-blue-600 text-white rounded-lg"
            >
              {loading ? "Uploading..." : "Update Avatar"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeAvatar;
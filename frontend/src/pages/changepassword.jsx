import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ChangePassword = ({ darkMode }) => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password should be at least 6 characters");
      return;
    }

    try {
      setUpdating(true);

      await api.post("/users/changedpsw", {
        oldPassword,
        newPassword,
      });

      alert("Password Updated Successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      navigate("/-1");
    } catch (err) {
      console.log(err);
      alert(
        err?.response?.data?.message ||
        "Failed To Update Password"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`max-w-2xl  mx-auto rounded-2xl p-6 border ${
          darkMode
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-gray-300"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">
          Change Password
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex *:font-[Saira] flex-col gap-5"
        >
          <div>
            <label className="block font-[Saira] mb-2 font-semibold">
              Current Password
            </label>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) =>
                setOldPassword(e.target.value)
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-300"
              }`}
              required
            />
          </div>

          <div>
            <label className="block font-[Saira] mb-2 font-semibold">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-300"
              }`}
              required
            />
          </div>

          <div>
            <label className="block font-[Saira] mb-2 font-semibold">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-300"
              }`}
              required
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
                : "Change Password"}
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

export default ChangePassword;
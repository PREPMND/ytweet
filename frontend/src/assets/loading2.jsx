import React from "react";

const LoaderTwo = ({ dark = true, text = "Loading..." }) => {
  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-[9999] transition-all duration-300 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="relative w-24 h-24">
        {/* Center Dot */}
        <div
          className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Orbit Ring */}
        <div
          className={`absolute inset-0 border-2 rounded-full ${
            dark ? "border-gray-700" : "border-gray-300"
          }`}
        />

        {/* Orbiting Ball */}
        <div className="absolute inset-0 animate-spin">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
              dark ? "bg-cyan-400" : "bg-blue-600"
            }`}
          />
        </div>
      </div>

      <h2 className="mt-6 text-lg font-medium tracking-widest animate-pulse">
        {text}
      </h2>
    </div>
  );
};

export default Loader;
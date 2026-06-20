import React from "react";

const LoaderTwo = ({ dark }) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${
        dark ? "bg-black" : "bg-white"
      }`}
    >
      {/* Moving Gradient */}
      <div className="absolute inset-0">
        <div className="absolute h-[400px] w-[400px] rounded-full bg-purple-500/30 blur-3xl animate-pulse top-20 left-20" />
        <div className="absolute h-[400px] w-[400px] rounded-full bg-cyan-500/30 blur-3xl animate-pulse bottom-20 right-20" />
      </div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-xl border border-white/10 rounded-3xl px-12 py-8">
        <h1
          className={`text-4xl font-bold tracking-widest ${
            dark ? "text-white" : "text-black"
          }`}
        >
          PREPWATCH
        </h1>

        <div className="flex justify-center gap-2 mt-6">
          <span className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" />
          <span
            className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        <p className="text-center text-gray-400 mt-4 tracking-[0.3em]">
          LOADING
        </p>
      </div>
    </div>
  );
};

export default LoaderTwo;
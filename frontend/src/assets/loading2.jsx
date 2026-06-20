import { useMemo } from "react";
import { motion } from "framer-motion";
import {Math} from "mathjs";
const themes = ["snow", "stars", "rain"];

const messages = [
  "Loading Feed...",
  "Fetching Posts...",
  "Connecting Friends...",
  "Preparing Content...",
];

export default function Loader() {
  const theme = useMemo(
    () => themes[Math.floor(Math.random() * themes.length)],
    []
  );

  const message = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    []
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center z-[9999]">

      {theme === "snow" && <SnowTheme />}
      {theme === "stars" && <StarsTheme />}
      {theme === "rain" && <RainTheme />}

      <div className="relative z-20 flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 rounded-full border border-white/20 border-t-white"
        />

        <h1 className="text-white text-3xl font-bold mt-6 tracking-[0.25em]">
          SOCIAL
        </h1>

        <p className="text-white/70 mt-3 tracking-widest">
          {message}
        </p>
      </div>
    </div>
  );
}

function SnowTheme() {
  return (
    <>
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
          }}
          animate={{
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 5 + Math.random() * 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

function StarsTheme() {
  return (
    <>
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
          }}
        />
      ))}
    </>
  );
}

function RainTheme() {
  return (
    <>
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] h-10 bg-white/60"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -100,
          }}
          animate={{
            y: window.innerHeight + 100,
          }}
          transition={{
            duration: 0.6 + Math.random(),
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}
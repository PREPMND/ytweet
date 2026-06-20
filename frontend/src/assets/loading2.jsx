import { useMemo } from "react";
import { motion } from "framer-motion";

export default function Loader() {
  const themes = ["stars", "snow", "meteor"];

  const theme = useMemo(
    () => themes[Math.floor(Math.random() * themes.length)],
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 2 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center z-[9999]">

      {theme === "stars" && <Stars particles={particles} />}
      {theme === "snow" && <Snow particles={particles} />}
      {theme === "meteor" && <Meteor />}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white"
        />

        <h1 className="mt-6 text-white text-3xl font-bold tracking-[0.3em]">
          SOCIAL
        </h1>

        <p className="mt-3 text-white/60 tracking-widest">
          Loading Feed...
        </p>
      </div>
    </div>
  );
}

function Stars({ particles }) {
  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
          }}
        />
      ))}
    </>
  );
}

function Snow({ particles }) {
  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white rounded-full"
          style={{
            left: `${p.x}%`,
          }}
          initial={{
            top: "-10%",
          }}
          animate={{
            top: "110%",
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </>
  );
}

function Meteor() {
  const meteors = Array.from({ length: 15 });

  return (
    <>
      {meteors.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] w-24 bg-white"
          style={{
            top: `${Math.random() * 80}%`,
            left: "-10%",
            rotate: "-25deg",
          }}
          animate={{
            x: ["0vw", "120vw"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}
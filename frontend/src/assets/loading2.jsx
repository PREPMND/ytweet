import { useMemo } from "react";
import { motion } from "framer-motion";

export default function LoaderTwo({
  text = "Loading...",
  username,
}) {
  const theme = useMemo(() => {
    const themes = ["stars", "snow", "fireflies", "meteors"];
    return themes[Math.floor(Math.random() * themes.length)];
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        size: 1 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center z-[9999]">

      {theme === "stars" && (
        <>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </>
      )}

      {theme === "snow" && (
        <>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${p.left}%`,
                width: `${p.size + 2}px`,
                height: `${p.size + 2}px`,
              }}
              initial={{
                top: "-10%",
              }}
              animate={{
                top: "110%",
              }}
              transition={{
                duration: 5 + p.duration,
                repeat: Infinity,
                ease: "linear",
                delay: p.delay,
              }}
            />
          ))}
        </>
      )}

      {theme === "fireflies" && (
        <>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size + 2}px`,
                height: `${p.size + 2}px`,
                boxShadow: "0 0 12px white",
              }}
              animate={{
                opacity: [0.1, 1, 0.2],
                x: [-20, 20, -20],
                y: [-10, 10, -10],
              }}
              transition={{
                duration: p.duration + 2,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </>
      )}

      {theme === "meteors" && (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] w-24 bg-white"
              style={{
                top: `${10 + i * 6}%`,
                left: "-20%",
                rotate: "-25deg",
              }}
              animate={{
                x: ["0vw", "130vw"],
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
      )}

      {/* Center Content */}
      <div className="relative z-20 flex flex-col items-center">

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative w-20 h-20"
        >
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-white" />
        </motion.div>

        <h1 className="mt-6 text-white text-3xl font-bold tracking-[0.3em]">
          {text}
        </h1>

        {username && (
          <p className="mt-3 text-white/50 tracking-widest text-sm">
            Welcome back {username}
          </p>
        )}

      </div>
    </div>
  );
}
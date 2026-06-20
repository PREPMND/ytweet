import { useMemo } from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";

export default function LoaderTwo({ dark, text }) {
  const particleOptions = useMemo(
    () => ({
      fullScreen: false,
      background: {
        color: "#000000",
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 80,
        },
        color: {
          value: "#ffffff",
        },
        opacity: {
          value: { min: 0.2, max: 1 },
          animation: {
            enable: true,
            speed: 0.5,
          },
        },
        size: {
          value: { min: 1, max: 3 },
        },
        move: {
          enable: true,
          speed: 0.3,
        },
      },
    }),
    []
  );

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">

      <Particles
        id="tsparticles"
        options={particleOptions}
        className="absolute inset-0"
      />

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
          {text}
        </p>
      </div>
    </div>
  );
}
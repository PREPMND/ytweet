import { useMemo } from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "tsparticles-slim";
export default function LoaderTwo({ dark, text, username }) {
    const particleOptions = useMemo(() => {
        const themes = [
            // Stars
            {
                particles: {
                    number: { value: 100 },
                    color: { value: "#ffffff" },
                    size: { value: { min: 1, max: 3 } },
                    move: { enable: true, speed: 0.2 },
                    opacity: {
                        value: { min: 0.2, max: 1 },
                        animation: {
                            enable: true,
                            speed: 0.3,
                        },
                    },
                },
            },

            // Snow
            {
                particles: {
                    number: { value: 120 },
                    color: { value: "#ffffff" },
                    size: { value: { min: 1, max: 5 } },
                    move: {
                        enable: true,
                        direction: "bottom",
                        speed: 2,
                    },
                },
            },

            // Meteors
            {
                particles: {
                    number: { value: 25 },
                    color: { value: "#ffffff" },
                    shape: {
                        type: "line",
                    },
                    move: {
                        enable: true,
                        direction: "bottom-right",
                        speed: 8,
                    },
                },
            },

            // Fireflies
            {
                particles: {
                    number: { value: 40 },
                    color: { value: "#ffffff" },
                    size: {
                        value: { min: 2, max: 6 },
                    },
                    move: {
                        enable: true,
                        speed: 1,
                    },
                    opacity: {
                        value: { min: 0.1, max: 1 },
                        animation: {
                            enable: true,
                            speed: 2,
                        },
                    },
                },
            },
        ];

        const selected =
            themes[Math.floor(Math.random() * themes.length)];

        return {
            fullScreen: false,
            fpsLimit: 60,
            background: {
                color: "#000000",
            },
            ...selected,
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">

            <Particles
                id="tsparticles"
                options={particleOptions}
                className="absolute inset-0"
            />

            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="relative w-20 h-20"
                >
                    <div className="absolute inset-0 rounded-full border border-white/10" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-white" />
                </motion.div>

                <h1 className="mt-6 text-white text-3xl font-bold tracking-[0.3em]">
                    {text}
                </h1>


            </div>
        </div>
    );
}
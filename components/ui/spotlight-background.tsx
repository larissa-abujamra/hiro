"use client";

import React from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";

interface SpotlightProps {
  className?: string;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
}

function Spotlight({ className, ...props }: SpotlightProps) {
  return <motion.div className={`absolute ${className ?? ""}`} {...props} />;
}

interface SpotlightBackgroundProps {
  children: React.ReactNode;
}

export default function SpotlightBackground({
  children,
}: SpotlightBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a3a2f]">
      <div className="absolute inset-0 overflow-hidden">
        {/* Left — light green */}
        <Spotlight
          initial={{ x: "-50%", y: "-50%", rotate: "0deg" }}
          animate={{
            x: ["-50%", "-30%", "-70%", "-50%"],
            y: ["-50%", "-70%", "-30%", "-50%"],
            rotate: ["0deg", "15deg", "-15deg", "0deg"],
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="left-0 top-0 h-[40rem] w-[40rem] rounded-full bg-[#7fb69a]/20 blur-[120px]"
        />

        {/* Center — medium green */}
        <Spotlight
          initial={{ x: "0%", y: "0%", rotate: "0deg" }}
          animate={{
            x: ["0%", "20%", "-20%", "0%"],
            y: ["0%", "30%", "10%", "0%"],
            rotate: ["-20deg", "0deg", "20deg", "-20deg"],
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 3,
          }}
          className="left-1/2 top-1/2 h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2d5a47]/30 blur-[100px]"
        />

        {/* Right — subtle gold */}
        <Spotlight
          initial={{ x: "0%", y: "0%", rotate: "10deg" }}
          animate={{
            x: ["0%", "-30%", "10%", "0%"],
            y: ["0%", "-20%", "20%", "0%"],
            rotate: ["10deg", "-10deg", "25deg", "10deg"],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 5,
          }}
          className="right-0 top-1/3 h-[35rem] w-[35rem] rounded-full bg-[#c9a962]/10 blur-[100px]"
        />
      </div>

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #7fb69a 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {children}
      </div>
    </div>
  );
}

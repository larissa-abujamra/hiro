"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface ContainerScrollProps {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scaleDimensions = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div
      className="relative flex flex-col items-center justify-start py-10 md:py-20"
      ref={containerRef}
      style={{ perspective: "1200px" }}
    >
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
        {titleComponent}
      </div>

      <motion.div
        style={{
          rotateX: rotate,
          scale: scaleDimensions,
          y: translateY,
          opacity,
        }}
        className="mx-auto -mt-4 w-full max-w-5xl md:-mt-8"
      >
        <div className="relative mx-4 md:mx-6 rounded-2xl md:rounded-[2rem] border border-white/20 bg-[#1a2e20]/90 p-2 md:p-4 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          {/* Screen bezel */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden bg-[#0a0f0b]">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

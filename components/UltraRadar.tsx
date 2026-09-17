"use client";

import { motion } from "framer-motion";

export default function UltraRadar({ className = "", color = "#38bdf8" }: { className?: string, color?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden flex items-center justify-center ${className}`}>
      {/* Dark background base */}
      <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-md border border-white/5" />
      
      {/* Concentric rings */}
      <div className="absolute inset-[10%] rounded-full border border-white/10" />
      <div className="absolute inset-[30%] rounded-full border border-white/10" />
      <div className="absolute inset-[50%] rounded-full border border-white/10" />
      <div className="absolute inset-[70%] rounded-full border border-white/10 text-xs text-white/20 flex items-center justify-center font-mono">
        <div className="absolute inset-[30%] rounded-full border border-white/20 bg-black/50" />
      </div>

      {/* Axis Lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10 -translate-x-1/2" />
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10 -translate-y-1/2" />
      
      {/* 45 degree lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 -translate-x-1/2 rotate-45" />
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 -translate-x-1/2 -rotate-45" />

      {/* Sweeping Cone */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute inset-0 rounded-full origin-center"
        style={{
          background: `conic-gradient(from 0deg, transparent 70%, ${color}20 95%, ${color} 100%)`,
        }}
      >
        <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-white/80 origin-bottom" style={{ boxShadow: `0 0 10px ${color}` }} />
      </motion.div>

      {/* Center Pulse Node */}
      <div className="absolute w-2 h-2 rounded-full z-10" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }} />
      <motion.div 
        animate={{ scale: [1, 3], opacity: [0.8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Realistic Blips */}
      <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] animate-[ping_4s_ease-out_infinite_0.5s]" />
      <div className="absolute bottom-[35%] right-[25%] w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white] animate-[ping_4s_ease-out_infinite_1.2s]" />
      <div className="absolute top-[60%] left-[65%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_red] animate-[ping_4s_ease-out_infinite_2.8s]" />
      
      {/* Micro tech rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transform rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" className="text-white/30" />
      </svg>
    </div>
  );
}


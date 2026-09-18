"use client";

export default function SpinningSatellite({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer spinning ring */}
      <div className="absolute inset-[-20%] border border-[#8b5cf6]/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" style={{ borderLeftColor: "#8b5cf6", borderRightColor: "transparent" }} />
      
      {/* Inner spinning ring */}
      <div className="absolute inset-0 border border-[#38bdf8]/50 rounded-full animate-[spin_4s_linear_infinite]" style={{ borderTopColor: "#38bdf8", borderBottomColor: "transparent" }} />
      
      {/* Core glowing node */}
      <div className="absolute w-2.5 h-2.5 bg-[#38bdf8] rounded-full shadow-[0_0_15px_#38bdf8] animate-pulse" />
      
      {/* Subtle background container */}
      <div className="absolute inset-0 bg-[#38bdf8]/10 rounded-full blur-sm" />
    </div>
  );
}


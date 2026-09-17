"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Disable SSR for react-globe.gl
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function RealisticGlobe() {
  const globeRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Slight delay to ensure parent div is rendered and sized
    setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (globeRef.current && mounted) {
      // Auto-rotate the globe
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
      
      // Remove zoom limits to allow deep zooming
      globeRef.current.controls().enableZoom = true;
      globeRef.current.controls().minDistance = 150; // allow very close zoom
      globeRef.current.controls().maxDistance = 500;
      
      // Set initial point of view (looking at South America/Brazil)
      globeRef.current.pointOfView({ lat: -15, lng: -50, altitude: 2 });
    }
  }, [mounted]);

  if (!mounted) return <div className="w-full h-full" />;

  // Some sample data for the glowing arcs/points
  const arcsData = [
    { startLat: -23.5505, startLng: -46.6333, endLat: 40.7128, endLng: -74.0060, color: "var(--signal)" }, // SP -> NY
    { startLat: -23.5505, startLng: -46.6333, endLat: 51.5074, endLng: -0.1278, color: "#38bdf8" },   // SP -> London
    { startLat: 40.7128, startLng: -74.0060, endLat: 35.6895, endLng: 139.6917, color: "#8b5cf6" },   // NY -> Tokyo
    { startLat: 51.5074, startLng: -0.1278, endLat: 35.6895, endLng: 139.6917, color: "var(--signal)"}, // London -> Tokyo
  ];

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          // High-res realistic nighttime earth texture
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          // We can leave background transparent or use night sky
          backgroundColor="rgba(0,0,0,0)"
          
          // Arcs configurations
          arcsData={arcsData}
          arcColor={() => "#2dffb4"}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2500}
          arcStroke={0.5}

          // Rings/points to cities
          ringsData={[
            { lat: -23.5505, lng: -46.6333 },
            { lat: 40.7128, lng: -74.0060 },
            { lat: 51.5074, lng: -0.1278 },
            { lat: 35.6895, lng: 139.6917 },
          ]}
          ringColor={() => "#8b5cf6"}
          ringMaxRadius={8}
          ringPropagationSpeed={3}
          ringRepeatPeriod={1000}
        />
      )}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mono text-[10px] text-white/40 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md pointer-events-none whitespace-nowrap z-50">
        SCROLL PARA ZOOM • ARRASTE PARA GIRAR
      </div>
    </div>
  );
}

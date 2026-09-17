"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { useSpring, motion } from "framer-motion";

export default function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  
  // Spring for rotation
  const r = useSpring(0, {
    stiffness: 280,
    damping: 40,
    mass: 1,
  });

  // State for zoom
  const [zoom, setZoom] = useState(1);
  const zoomSpring = useSpring(1, { stiffness: 100, damping: 20 });

  useEffect(() => {
    let phi = 4.7; // Start looking at Brazil
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 4.7,
      theta: -0.3,
      dark: 1.05, // very dark
      diffuse: 1.2,
      mapSamples: 24000,
      mapBrightness: 8,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: [0.18, 1.0, 0.7], // Neon green/cyan signal
      glowColor: [0.05, 0.1, 0.08], // subtle cyber glow
      markers: [
        { location: [-23.5505, -46.6333], size: 0.1 }, // SP
        { location: [40.7128, -74.0060], size: 0.05 }, // NY
        { location: [51.5074, -0.1278], size: 0.04 }, // London
        { location: [35.6895, 139.6917], size: 0.07 }, // Tokyo
        { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
        { location: [55.7558, 37.6173], size: 0.05 }, // Moscow
      ],
    });

    let rafId: number;
    const render = () => {
      if (!pointerInteracting.current) {
        phi += 0.003;
      }
      globe.update({ 
        phi: phi + r.get(), 
        width: width * 2, 
        height: width * 2 
      });
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      globe.destroy();
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    zoomSpring.set(zoom);
  }, [zoom, zoomSpring]);

  return (
    <div 
      className="relative w-full aspect-square max-w-[800px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing z-30"
      onWheel={(e) => {
        // Zoom on wheel
        e.preventDefault();
        const newZoom = Math.min(Math.max(zoom + (e.deltaY * -0.002), 1), 3);
        setZoom(newZoom);
      }}
    >
      <motion.div style={{ scale: zoomSpring }} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-0 transition-opacity duration-1000"
          style={{ width: "100%", height: "100%", contain: "layout paint size", opacity: 1 }}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX;
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              r.set(r.get() + delta * 0.01);
              pointerInteracting.current = e.clientX;
            }
          }}
          onTouchMove={(e) => {
            if (pointerInteracting.current !== null && e.touches[0]) {
              const delta = e.touches[0].clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              r.set(r.get() + delta * 0.01);
              pointerInteracting.current = e.touches[0].clientX;
            }
          }}
        />
      </motion.div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 mono text-[10px] text-white/40 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md pointer-events-none whitespace-nowrap">
        SCROLL PARA APROXIMAR • ARRASTE PARA ROTACIONAR
      </div>
    </div>
  );
}

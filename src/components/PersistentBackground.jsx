import React, { useEffect, useRef } from "react";
import BackgroundParticles from "@/components/BackgroundParticles";
import BackgroundBubbles from "@/components/BackgroundBubbles";

export default function PersistentBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      container.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 transition-transform duration-500 ease-out"
      style={{
        willChange: "transform",
      }}
    >
      <div className="absolute inset-0" />

      <BackgroundParticles />
      <BackgroundBubbles />
    </div>
  );
}

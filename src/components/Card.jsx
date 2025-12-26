import React from "react";
import { motion } from "framer-motion";

export default function Card({ 
  children, 
  className = "", 
  hover = false,
  elevated = false,
  gradient = false,
  onClick,
  ...props 
}) {
  const baseClasses = elevated 
    ? "glass-card-elevated" 
    : "glass-card";
  
  const hoverClasses = hover 
    ? "hover:shadow-card-hover hover:border-white/20 cursor-pointer" 
    : "";

  const gradientBg = gradient && (
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
  );

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${hoverClasses} ${className} relative overflow-hidden group transition-all duration-300`}
      onClick={onClick}
      {...props}
    >
      {gradientBg}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

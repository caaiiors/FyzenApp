import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Button({ 
  children, 
  variant = "primary", 
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...props 
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ultra: "btn-ultra",
    ghost: "bg-transparent text-slate-300 hover:bg-white/5 px-4 py-2 rounded-xl transition-all",
  };

  const baseClass = variants[variant] || variants.primary;
  const disabledClass = (disabled || loading) ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseClass} ${disabledClass} ${className} flex items-center justify-center gap-2 disabled:cursor-not-allowed`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </motion.button>
  );
}

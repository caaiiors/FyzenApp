import React from "react";
import { Lock } from "lucide-react";

export default function PremiumLock({ label = "Recurso Premium", plan = "pro", className = "" }) {
  const planName = plan.toUpperCase();

  return (
    <div
      className={`absolute inset-0 backdrop-blur-md bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-white/10 z-20 ${className}`}
    >
      <Lock className="w-10 h-10 text-yellow-300 mb-3" />
      <p className="text-slate-200 text-sm font-medium text-center">
        {label}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Disponível no plano <span className="font-semibold text-yellow-300">{planName}</span>
      </p>
      <a
        href="#premium"
        className="mt-3 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-yellow-300 to-amber-300 text-black font-semibold shadow-md hover:brightness-110 transition"
      >
        Desbloquear agora
      </a>
    </div>
  );
}

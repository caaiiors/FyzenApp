import React from "react";

export default function Navbar({ items = [], active, onSelect, className = "" }) {
  if (!items.length) return null;

  return (
    <nav className={`flex flex-col gap-3 text-sm font-medium w-full ${className}`}>
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect?.(item.value)}
            className={`flex items-center justify-start gap-2 px-4 py-3 rounded-xl transition border text-left w-full ${
              isActive
                ? "border-teal-300 bg-teal-300/10 text-slate-50 shadow-md"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

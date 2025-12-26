import { Sparkles } from "lucide-react";

export default function UpgradeScreen({ feature }) {
  return (
    <div className="text-center flex flex-col items-center justify-center py-20">
      <Sparkles className="w-10 h-10 text-teal-300 mb-3" />

      <h1 className="text-xl font-semibold text-white">
        Recurso Premium 🔒
      </h1>

      <p className="text-slate-400 mt-2 max-w-xs">
        Para acessar <span className="text-teal-300">{feature}</span>,
        você precisa do plano <strong>PRO</strong> ou <strong>ULTRA</strong>.
      </p>

      <button
        onClick={() => window.location.href = "/premium"}
        className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-300 to-purple-300 text-black font-medium hover:scale-105 transition"
      >
        Ver Planos
      </button>
    </div>
  );
}

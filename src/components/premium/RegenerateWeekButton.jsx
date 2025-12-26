import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { regenerarSemanaIA } from "@/lib/aiWorkoutService";

export default function RegenerateWeekButton({
  nivel,
  isUltra,
  form,
  onRegenerated, // callback que recebe NOVO array completo de treinos (formato plan.treinos)
}) {
  const [loading, setLoading] = useState(false);

  // Só ULTRA vê
  if (!isUltra || nivel !== "ultra") return null;

  const handleClick = async () => {
    try {
      if (!form) return;

      setLoading(true);

      // IA retorna: [{ dia, grupos: [{ grupo, exercicios: [] }] }]
      const semana = await regenerarSemanaIA(form);

      const flatTreinos = Array.isArray(semana)
        ? semana
            .flatMap((d) => (Array.isArray(d?.grupos) ? d.grupos : []))
            .map((g) => ({
              grupo: g?.grupo || "Grupo",
              exercicios: Array.isArray(g?.exercicios) ? g.exercicios : [],
            }))
            .filter((g) => g.exercicios.length > 0)
        : [];

      if (!flatTreinos.length) {
        alert("Não foi possível gerar uma nova semana de treinos.");
        return;
      }

      onRegenerated?.(flatTreinos);
    } catch (err) {
      console.error("Erro ao regenerar semana:", err);
      alert(err?.message || "Erro ao regenerar a semana. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <button
  onClick={handleClick}
  disabled={loading}
  className="h-11 flex-1 rounded-xl bg-slate-800/70 border border-white/10 text-slate-100 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700/80 transition disabled:opacity-60 disabled:cursor-not-allowed"
>
  <RefreshCw className="w-4 h-4" />
  {loading ? "Gerando nova semana..." : "Gerar nova semana inteira"}
</button>
  );
}

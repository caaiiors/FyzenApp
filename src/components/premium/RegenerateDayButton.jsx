import React, { useState } from "react";
import { regenerarDiaIA } from "@/lib/aiWorkoutService";
import { usePremium } from "@/context/PremiumContext";
import { Sparkles } from "lucide-react";

export default function RegenerateDayButton({
  form,
  diaSelecionado,
  dayData,
  onRegenerated
}) {
  const { nivel, isUltra } = usePremium();
  const [loading, setLoading] = useState(false);

  if (!isUltra || nivel !== "ultra") return null;

  async function handleClick() {
    setLoading(true);

    const novoDia = await regenerarDiaIA(form, diaSelecionado, dayData);

    onRegenerated(novoDia);
    setLoading(false);
  }

  return (
<button
  onClick={handleClick}
  disabled={loading}
  className="h-11 flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
>
  <Sparkles className="w-4 h-4" />
  {loading ? "Gerando treino do dia..." : "Regenerar Dia com IA"}
</button>

  );
}

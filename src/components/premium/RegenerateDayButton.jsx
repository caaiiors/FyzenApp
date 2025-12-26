import React, { useState } from "react";
import { regenerarDiaIA } from "@/lib/aiWorkoutService";
import { usePremium } from "@/context/PremiumContext";

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
      className="w-full py-3 bg-indigo-600 text-white rounded-xl mt-3"
    >
      {loading ? "Gerando..." : "Regenerar Dia com IA"}
    </button>
  );
}

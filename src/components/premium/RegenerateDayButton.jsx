import React, { useState } from "react";
import { regenerarDiaIA } from "@/lib/aiWorkoutService";
import { usePremium } from "@/context/PremiumContext";
import { Sparkles, Loader2 } from "lucide-react"; // Adicionei Loader2

export default function RegenerateDayButton({
  form,
  diaSelecionado,
  dayData,
  onRegenerated,
  className, // ✅ Aceita className externo
  children   // ✅ Aceita conteúdo personalizado (ícone + texto)
}) {
  const { nivel, isUltra } = usePremium();
  const [loading, setLoading] = useState(false);

  // Se não for Ultra, não renderiza nada
  if (!isUltra && nivel !== "ultra") return null;

  async function handleClick() {
    setLoading(true);
    try {
      // Chama a função de regenerar
      const novoDia = await regenerarDiaIA(form, diaSelecionado, dayData);
      if (onRegenerated) onRegenerated(novoDia);
    } catch (error) {
      console.error("Erro ao regenerar dia:", error);
      alert("Erro ao regenerar dia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Se tiver children (novo design), renderiza o children
  // Caso contrário, usa o design padrão (fallback)
  if (children) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={className} // ✅ Aplica a classe passada pelo pai
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">Gerando...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }

  // Design Padrão (Fallback - caso não passe children)
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`h-11 flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Gerando...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>Regenerar Dia com IA</span>
        </>
      )}
    </button>
  );
}

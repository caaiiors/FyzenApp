import React, { useEffect, useState, useRef } from "react";
import { atualizarStreak } from "../lib/useStreak.js";
import confetti from "canvas-confetti";
import { registrarTreinoConcluido } from "../lib/treinoService";
import { motion } from "framer-motion";

const STORAGE_KEY = "fyzen-checklist-v1";

export default function WorkoutChecklist({ treino = [], dia, grupo, bloqueado }) {
  const [checked, setChecked] = useState([]);
  const [streakMessage, setStreakMessage] = useState("");
  const prevCompleteRef = useRef(false);
  const firstRenderRef = useRef(true);
  const userActionRef = useRef(false);

  // Carrega o estado salvo para esse dia + grupo
  useEffect(() => {
    if (!Array.isArray(treino) || treino.length === 0) {
      if (checked.length !== 0) setChecked([]);
      prevCompleteRef.current = false;
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = `${dia}::${grupo}`;
    const salvo = data[key];

    const arraysIguais =
      salvo && JSON.stringify(salvo.treino) === JSON.stringify(treino);

    if (
      salvo &&
      arraysIguais &&
      Array.isArray(salvo.checked) &&
      JSON.stringify(salvo.checked) === JSON.stringify(checked)
    ) {
      return;
    }

    if (salvo && arraysIguais) {
      if (JSON.stringify(salvo.checked) !== JSON.stringify(checked)) {
        setChecked(salvo.checked);
        prevCompleteRef.current = salvo.checked.every(Boolean);
      }
      return;
    }

    const initial = Array(treino.length).fill(false);
    if (JSON.stringify(initial) !== JSON.stringify(checked)) {
      setChecked(initial);
    }
    prevCompleteRef.current = false;
  }, [treino, dia, grupo]);

  // Salva o estado no localStorage quando o usuário marca/desmarca
  useEffect(() => {
    if (!Array.isArray(checked) || checked.length === 0) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      const key = `${dia}::${grupo}`;
      data[key] = {
        treino,
        checked,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignora erro de localStorage
    }
  }, [checked, dia, grupo, treino]);

  // Detecta quando TODOS os exercícios foram concluídos
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (!userActionRef.current) {
      const completoAgora = checked.every(Boolean);
      prevCompleteRef.current = completoAgora;
      return;
    }

    if (!Array.isArray(checked) || !Array.isArray(treino)) return;
    if (checked.length === 0 || treino.length === 0) return;
    if (checked.length !== treino.length) return;

    const completoAgora = checked.every(Boolean);
    const completoAntes = prevCompleteRef.current;

    if (!completoAntes && completoAgora) {
      const novaStreak = atualizarStreak();
      window.dispatchEvent(new Event("streakUpdate"));

      registrarTreinoConcluido(dia, grupo, treino.length, treino, novaStreak);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });

      setStreakMessage(
        novaStreak === 1
          ? "🎉 Parabéns! Você começou sua streak hoje!"
          : `🔥 Você está no dia ${novaStreak} da sua streak!`
      );
    }

    prevCompleteRef.current = completoAgora;
    userActionRef.current = false;
  }, [checked]);

  const toggle = (index) => {
    if (bloqueado) return; // ✅ Bloqueia interação
    userActionRef.current = true;
    setChecked((prev) => {
      const arr = [...prev];
      arr[index] = !arr[index];
      return arr;
    });
  };

  if (!Array.isArray(treino) || treino.length === 0) {
    return (
      <p className="text-xs text-slate-500 mt-2">
        Nenhum exercício cadastrado para este grupo.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {streakMessage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-emerald-300 mb-1 font-medium"
        >
          {streakMessage}
        </motion.p>
      )}

      <ul className="space-y-2">
        {treino.map((item, i) => {
          const completo = checked[i];

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                bloqueado
                  ? "bg-slate-800/20 opacity-50 cursor-not-allowed" // ✅ Visual bloqueado
                  : completo
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-slate-800/50 hover:bg-slate-800/70 border border-transparent"
              }`}
            >
              <button
                type="button"
                disabled={bloqueado} // ✅ Desabilita quando bloqueado
                onClick={() => toggle(i)}
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border text-xs transition-all ${
                  bloqueado
                    ? "bg-slate-700/50 border-slate-600 cursor-not-allowed opacity-50" // ✅ Estilo bloqueado
                    : completo
                    ? "bg-emerald-400 border-emerald-300 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                    : "bg-slate-900/60 border-slate-600 text-slate-400 hover:border-emerald-400 hover:bg-slate-800"
                }`}
              >
                {completo && "✓"}
              </button>

              <div className="flex-1">
                <span
                  className={`text-sm leading-snug block ${
                    bloqueado
                      ? "text-slate-500" // ✅ Texto cinza quando bloqueado
                      : completo
                      ? "line-through text-slate-500"
                      : "text-slate-200"
                  }`}
                >
                  {typeof item === "string" ? item : item.nome || "Exercício sem nome"}
                </span>
                
                {/* ✅ Mostrar séries/reps se existir */}
                {item?.series && item?.reps && (
                  <span className="text-xs text-slate-500 mt-1 block">
                    {item.series} séries × {item.reps} reps
                  </span>
                )}
              </div>

              {/* ✅ Ícone de cadeado quando bloqueado */}
              {bloqueado && (
                <svg 
                  className="w-4 h-4 text-slate-600 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              )}
            </motion.li>
          );
        })}
      </ul>

      {/* ✅ Contador de progresso */}
      {!bloqueado && checked.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progresso</span>
            <span className={`font-bold ${
              checked.filter(Boolean).length === checked.length
                ? "text-emerald-400"
                : "text-slate-300"
            }`}>
              {checked.filter(Boolean).length} / {checked.length}
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${(checked.filter(Boolean).length / checked.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
  const userActionRef = useRef(false); // 👈 marca se veio de clique do usuário

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

  // 🔒 SE O CHECKED ATUAL JÁ ESTÁ IGUAL AO SALVO → NÃO ATUALIZA NADA
  if (
    salvo &&
    arraysIguais &&
    Array.isArray(salvo.checked) &&
    JSON.stringify(salvo.checked) === JSON.stringify(checked)
  ) {
    return;
  }

  // 🔒 SE EXISTE SALVO E A ESTRUTURA DO TREINO É IGUAL → ATUALIZA UMA VEZ
  if (salvo && arraysIguais) {
    if (JSON.stringify(salvo.checked) !== JSON.stringify(checked)) {
      setChecked(salvo.checked);
      prevCompleteRef.current = salvo.checked.every(Boolean);
    }
    return;
  }

  // 🔒 SE O TREINO MUDOU COMPLETAMENTE (NOVA SEMANA, NOVA IA, ETC)
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
    // ignora primeira render
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    // se a mudança de checked NÃO veio de clique do usuário, não dispara nada
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
    userActionRef.current = false; // reseta flag
  }, [checked]);

  const toggle = (index) => {
    if (bloqueado) return;
    userActionRef.current = true; // 👈 marca que é ação do usuário
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
        <p className="text-xs text-emerald-300 mb-1">{streakMessage}</p>
      )}

      <ul className="space-y-2">
        {treino.map((item, i) => {
          const completo = checked[i];

          return (
            <li
              key={i}
              className={`flex items-start gap-2 ${
                bloqueado ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <button
                type="button"
                disabled={bloqueado}
                onClick={() => toggle(i)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs mt-[2px]
                  ${
                    completo
                      ? "bg-emerald-400 border-emerald-300 text-black"
                      : "bg-slate-900/60 border-slate-600 text-slate-400"
                  }`}
              >
                {completo && "✓"}
              </button>

              <span
                className={`leading-snug ${
                  completo
                    ? "line-through text-slate-500"
                    : "text-slate-200"
                }`}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

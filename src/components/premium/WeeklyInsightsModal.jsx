import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Flame, Activity, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

export default function WeeklyInsightsModal({ open, onClose, insights }) {
  if (!open || !insights) return null;

  const {
    totalTreinosPlaneados,
    totalExerciciosPlaneados,
    totalExerciciosCompletados,
    diasAtivos,
    diasComTreinoCompleto,
    diaMaisForte,
    porDia = [],
    volume = {},
    nivel,
  } = insights;

  const volumeEntries = Object.entries(volume || {});
  const hasVolume = volumeEntries.length > 0;

  // Calcula percentual geral de conclusão
  const percentualGeral = totalExerciciosPlaneados > 0 
    ? Math.round((totalExerciciosCompletados / totalExerciciosPlaneados) * 100)
    : 0;

  const badgeColor =
    nivel === "ULTRA"
      ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900"
      : nivel === "PRO"
      ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900"
      : "bg-slate-700 text-slate-200";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/90 border border-white/10 shadow-xl shadow-black/50 p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-300" />
                <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                  Relatório da semana
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Visão geral dos seus treinos distribuídos ao longo da semana.
              </p>
              {nivel && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold mt-1 ${badgeColor}`}
                >
                  {nivel === "ULTRA" && "Painel ULTRA ativo"}
                  {nivel === "PRO" && "Plano PRO ativo"}
                  {nivel === "FREE" && "Plano gratuito"}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <ResumoCard
              icon={Activity}
              label="Grupos de treino"
              value={totalTreinosPlaneados || 0}
              helper="Blocos de treino planejados"
            />

            <ResumoCard
              icon={Flame}
              label="Exercícios totais"
              value={`${totalExerciciosCompletados}/${totalExerciciosPlaneados}`}
              helper={`${percentualGeral}% concluído`}
              highlight={percentualGeral >= 80}
            />

            <ResumoCard
              icon={Calendar}
              label="Dias ativos"
              value={diasAtivos || 0}
              helper={
                diaMaisForte?.dia
                  ? `Dia mais forte: ${formatDia(diaMaisForte.dia)}`
                  : "Nenhum treino concluído"
              }
            />
          </div>

          {percentualGeral > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progresso da Semana
                </span>
                <span className="text-2xl font-bold text-white">{percentualGeral}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentualGeral}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {diasComTreinoCompleto > 0
                  ? `🎉 Você completou ${diasComTreinoCompleto} dia${diasComTreinoCompleto > 1 ? "s" : ""} inteiro${diasComTreinoCompleto > 1 ? "s" : ""}!`
                  : "Continue assim! Cada exercício conta."}
              </p>
            </div>
          )}

          {porDia.length > 0 && (
            <div className="rounded-2xl bg-slate-900/70 border border-white/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-300" />
                Distribuição de exercícios por dia
              </p>

              <div className="space-y-2">
                {porDia.map((d) => {
                  const percentual = d.percentualConclusao || 0;
                  const isCompleto = percentual === 100;

                  return (
                    <div key={d.dia} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[11px] text-slate-400 uppercase tracking-wide">
                            {formatDia(d.dia)}
                          </span>
                          {isCompleto && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          )}
                        </div>
                        <span className="text-xs text-slate-300">
                          {d.exerciciosCompletados}/{d.exerciciosTotais}
                          <span className="text-slate-500 ml-1">({percentual}%)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isCompleto
                                ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                : percentual > 0
                                ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                                : "bg-slate-700"
                            }`}
                            style={{ width: `${percentual || 3}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-900/70 border border-white/5 p-4">
            <p className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-300" />
              Volume por grupo muscular
            </p>

            {hasVolume ? (
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {volumeEntries.map(([grupo, valor]) => (
                  <div
                    key={grupo}
                    className="flex items-center justify-between bg-slate-900/80 rounded-xl px-3 py-2"
                  >
                    <span className="text-slate-200 truncate">{grupo}</span>
                    <span className="text-slate-400">
                      {valor} exercício{valor !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Ainda não há volume registrado por grupo. Conclua treinos para
                destravar esse resumo.
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-1 py-2 bg-slate-800/70 hover:bg-slate-700 text-slate-100 rounded-2xl text-sm transition"
          >
            Fechar relatório
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ResumoCard({ icon: Icon, label, value, helper, highlight }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${
      highlight 
        ? "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20"
        : "bg-slate-900/70 border-white/5"
    }`}>
      <span className="text-[11px] uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${highlight ? "text-teal-400" : "text-teal-300"}`} />
        {label}
      </span>
      <span className={`text-xl font-semibold ${highlight ? "text-teal-300" : "text-slate-50"}`}>
        {value}
      </span>
      <span className="text-[11px] text-slate-500">{helper}</span>
    </div>
  );
}

function formatDia(dia) {
  if (!dia) return "";
  const map = {
    segunda: "Seg",
    terça: "Ter",
    terca: "Ter",
    quarta: "Qua",
    quinta: "Qui",
    sexta: "Sex",
    sabado: "Sáb",
    sábado: "Sáb",
    domingo: "Dom",
  };
  return map[dia.toLowerCase()] || dia;
}

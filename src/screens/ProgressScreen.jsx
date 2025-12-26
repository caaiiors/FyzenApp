import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  Calendar,
  CheckCircle,
  TrendingUp,
  Activity,
  Flame,
} from "lucide-react";

import { auth, db } from "../lib/firebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import Container from "@/components/Container";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export default function ProgressScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treinos, setTreinos] = useState([]);
  const [porDia, setPorDia] = useState({});
  const [porSemana, setPorSemana] = useState([]);
  const [diasAtivos, setDiasAtivos] = useState(0);
  const [totalMes, setTotalMes] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null);
        setTreinos([]);
        setLoading(false);
        return;
      }
      setUser(u);
      setLoading(true);
      await carregarTreinos(u.uid);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const carregarTreinos = async (uid) => {
    try {
      const ref = collection(db, "historicoTreino", uid, "registros");
      const q = query(ref, orderBy("timestamp", "asc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map((d) => d.data());
      setTreinos(lista);
      processar(lista);
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
    }
  };

  const processar = (lista) => {
    if (!lista || lista.length === 0) {
      setPorDia({});
      setPorSemana([]);
      setDiasAtivos(0);
      setTotalMes(0);
      return;
    }

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);

    const mapaPorDia = {
      domingo: 0,
      segunda: 0,
      terça: 0,
      quarta: 0,
      quinta: 0,
      sexta: 0,
      sábado: 0,
    };

    const diasAtivosSet = new Set();
    let totalMesCalc = 0;

    lista.forEach((t) => {
      const ts = t.timestamp;
      if (!ts) return;
      const data = ts?.toDate?.() ? ts.toDate() : new Date(ts);

      const diaNome = DIAS[data.getDay()];
      mapaPorDia[diaNome] = (mapaPorDia[diaNome] || 0) + 1;

      diasAtivosSet.add(data.toDateString());

      if (data >= inicioMes && data <= hoje) {
        totalMesCalc++;
      }
    });

    setPorDia(mapaPorDia);
    setDiasAtivos(diasAtivosSet.size);
    setTotalMes(totalMesCalc);

    const semanal = DIAS.map((d) => ({
      dia: d,
      total: mapaPorDia[d] || 0,
    }));
    setPorSemana(semanal);
  };

  const mediaSemanal = porSemana.length
    ? (porSemana.reduce((acc, d) => acc + d.total, 0) / porSemana.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <Container className="py-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-sm">Carregando progresso...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-sm">
          Faça login para acompanhar seu progresso.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <motion.div {...fadeIn}>
          <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-300" />
            Seu progresso
          </h2>
          <p className="text-sm text-slate-400">
            Acompanhe sua evolução ao longo dos dias e semanas.
          </p>
        </motion.div>

        {/* Cards de Resumo */}
        <motion.div {...fadeIn} className="grid md:grid-cols-3 gap-4">
          <Card
            icon={CheckCircle}
            label="Dias ativos"
            value={diasAtivos}
            helper="Dias com pelo menos um treino"
            color="text-emerald-300"
          />

          <Card
            icon={Flame}
            label="Treinos este mês"
            value={totalMes}
            helper="Total confirmado no mês atual"
            color="text-amber-300"
          />

          <Card
            icon={TrendingUp}
            label="Média semanal"
            value={mediaSemanal}
            helper="Treinos por semana"
            color="text-purple-300"
          />
        </motion.div>

        {/* Gráfico Semanal */}
        <motion.div
          {...fadeIn}
          className="glass-card rounded-3xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary-400" />
            Treinos por dia da semana
          </h3>
          
          <div className="space-y-4">
            {porSemana.map((d, idx) => {
              const max = Math.max(...porSemana.map(x => x.total), 1);
              const percent = (d.total / max) * 100;
              
              return (
                <motion.div
                  key={d.dia}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-20 capitalize">
                      {d.dia}
                    </span>
                    
                    <div className="flex-1 h-10 bg-slate-800/50 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-lg relative"
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse-slow" />
                      </motion.div>
                      
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-semibold text-white">
                        {d.total}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Heatmap de Consistência */}
        <motion.div
          {...fadeIn}
          className="glass-card rounded-3xl p-5 border border-white/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-300" />
              Mapa de consistência
            </p>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Últimos 4 meses
            </span>
          </div>
          
          <ConsistencyHeatmap treinos={treinos} />
        </motion.div>
      </div>
    </Container>
  );
}

function Card({ icon: Icon, label, value, helper, color }) {
  return (
    <div className="glass-card rounded-3xl p-4 border border-white/5">
      <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wide">
        <Icon className={`w-4 h-4 ${color}`} />
        {label}
      </div>
      <p className="text-2xl font-semibold text-slate-50 mt-1">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{helper}</p>
    </div>
  );
}

function ConsistencyHeatmap({ treinos }) {
  const activeDays = useMemo(() => {
    const set = new Set();
    if (!treinos) return set;
    treinos.forEach((t) => {
      const ts = t.timestamp;
      if (!ts) return;
      const d = ts?.toDate?.() ? ts.toDate() : new Date(ts);
      const key = d.toISOString().split("T")[0];
      set.add(key);
    });
    return set;
  }, [treinos]);

  const weeks = 18;
  const grid = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

  for (let w = 0; w < weeks; w++) {
    const weekDates = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - (w * 7) - (6 - d));
      weekDates.push(date);
    }
    grid.unshift(weekDates);
  }

  const getStyle = (isActive) => {
    if (isActive) {
      return 'bg-teal-400 border border-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.4)]';
    }
    return 'bg-slate-800/50 border border-white/5';
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-[2px] text-[9px] text-slate-500 font-medium h-[98px]">
          <span>Dom</span>
          <span>Ter</span>
          <span>Qui</span>
          <span>Sáb</span>
        </div>

        <div className="flex-1 flex gap-[3px] overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
          {grid.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((date, j) => {
                const dateStr = date.toISOString().split('T')[0];
                const isActive = activeDays.has(dateStr);
                const title = isActive
                  ? `${date.toLocaleDateString('pt-BR')}: Treino concluído ✅`
                  : `${date.toLocaleDateString('pt-BR')}: Sem registro`;

                return (
                  <div
                    key={dateStr}
                    title={title}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] transition-all hover:opacity-80 ${getStyle(isActive)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-end gap-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-800/50 border border-white/5" />
          <span>Sem treino</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-teal-400 border border-teal-300 shadow-[0_0_4px_rgba(45,212,191,0.4)]" />
          <span className="text-teal-300">Concluído</span>
        </div>
      </div>
    </div>
  );
}

function formatDia(dia) {
  const map = {
    domingo: "Dom",
    segunda: "Seg",
    terça: "Ter",
    terca: "Ter",
    quarta: "Qua",
    quinta: "Qui",
    sexta: "Sex",
    sábado: "Sáb",
    sabado: "Sáb",
  };
  return map[dia?.toLowerCase()] || dia;
}

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  TrendingUp,
  CheckCircle,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { auth, db } from "../lib/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import Container from "../components/Container.jsx";

import { RequireUltra } from "../components/premium/RequireLevel.jsx";

function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const DIAS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export default function UltraDashboardProtected(props) {
  return (
    <RequireUltra onUpgrade={() => props.onSelectScreen("premium")}>
      <UltraDashboard {...props} />
    </RequireUltra>
  );
}

function UltraDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState(null);
  const [userForm, setUserForm] = useState(null);
  const [plan, setPlan] = useState(null);

  const [metasDoc, setMetasDoc] = useState(null);

  const [treinosSemana, setTreinosSemana] = useState(0);
  const [treinosMes, setTreinosMes] = useState(0);
  const [porDiaSemana, setPorDiaSemana] = useState({});
  const [melhorDia, setMelhorDia] = useState(null);

  const [exerciciosSemana, setExerciciosSemana] = useState(0);
  const [volumeGrupoSemana, setVolumeGrupoSemana] = useState({});
  const [intensidadeSemana, setIntensidadeSemana] = useState(null);
  const [comparacaoSemana, setComparacaoSemana] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(u);
      setLoading(true);

      await Promise.all([
        carregarPlano(u.uid),
        carregarMetas(u.uid),
        carregarHistoricoSemana(u.uid),
      ]);

      setLoading(false);
    });

    return () => unsub();
  }, []);


  const carregarPlano = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "planos", uid));
      if (snap.exists()) {
        const data = snap.data();
        setAnalysis(data.analysis || null);
        setUserForm(data.form || null);
        setPlan(data.plan || null);
      }
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
    }
  };

  const carregarMetas = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "metas", uid));
      setMetasDoc(snap.exists() ? snap.data() : null);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      setMetasDoc(null);
    }
  };

  const carregarHistoricoSemana = async (uid) => {
    try {
      const ref = collection(db, "historicoTreino", uid, "registros");
      const q = query(ref, orderBy("timestamp", "asc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map((d) => d.data());

      if (!lista.length) {
        resetarHistorico();
        return;
      }

      processarHistorico(lista);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      resetarHistorico();
    }
  };

  const resetarHistorico = () => {
    setTreinosSemana(0);
    setTreinosMes(0);
    setPorDiaSemana({});
    setMelhorDia(null);
    setExerciciosSemana(0);
    setVolumeGrupoSemana({});
    setComparacaoSemana(null);
    setIntensidadeSemana(null);
  };

  const processarHistorico = (lista) => {
    const hoje = new Date();
    const { start, end } = getWeekRange(hoje);

    const semanaPassada = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { start: startAnt, end: endAnt } = getWeekRange(semanaPassada);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const dias = {
      domingo: 0,
      segunda: 0,
      terça: 0,
      quarta: 0,
      quinta: 0,
      sexta: 0,
      sábado: 0,
    };

    let semanaAtual = 0,
      mesAtual = 0,
      exAtual = 0,
      exAnterior = 0,
      tempoTotal = 0;

    const volGrupo = {};

    lista.forEach((t) => {
      const data = extrairDataRegistro(t);
      if (!data) return;

      if (data >= inicioMes) mesAtual++;

      const volume =
        t.totalExercicios ||
        (t.volumeGrupo ? somaValores(t.volumeGrupo) : t.exercicios?.length || 1);

      if (data >= start && data < end) {
        semanaAtual++;
        exAtual += volume;

        dias[DIAS[data.getDay()]]++;

        tempoTotal += t.tempoEstimado || Math.max(20, volume * 4);

        const grupo = t.grupo || "Treino";
        const key = normalizar(grupo);
        volGrupo[key] = volGrupo[key]
          ? { nome: grupo, volume: volGrupo[key].volume + volume }
          : { nome: grupo, volume };
      }

      if (data >= startAnt && data < endAnt) {
        exAnterior += volume;
      }
    });

    setTreinosSemana(semanaAtual);
    setTreinosMes(mesAtual);
    setPorDiaSemana(dias);
    setMelhorDia(obterMelhorDia(dias));
    setExerciciosSemana(exAtual);
    setVolumeGrupoSemana(volGrupo);
    setComparacaoSemana({
      atual: exAtual,
      anterior: exAnterior,
      diffAbs: exAtual - exAnterior,
      diffPerc:
        exAnterior > 0 ? ((exAtual - exAnterior) / exAnterior) * 100 : null,
    });
    setIntensidadeSemana(
      semanaAtual ? Math.min(10, (tempoTotal / semanaAtual) / 6) : null
    );
  };


  const extrairDataRegistro = (t) => {
    if (t.timestamp?.toDate) return t.timestamp.toDate();
    if (typeof t.timestamp === "number") return new Date(t.timestamp);
    if (t.criadoEm) return new Date(t.criadoEm);
    if (t.data) return new Date(t.data);
    return null;
  };

  const somaValores = (obj) =>
    Object.values(obj).reduce(
      (acc, v) => acc + (typeof v === "number" ? v : 0),
      0
    );

  const normalizar = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  const obterMelhorDia = (dias) => {
    let best = null;
    Object.entries(dias).forEach(([dia, qtd]) => {
      if (!best || qtd > best.qtd) best = { dia, qtd };
    });
    return best?.qtd > 0 ? best : null;
  };

  function getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  }

  const treinosSemanaisAtual = metasDoc?.treinosSemanaisAtual ?? treinosSemana;

  const metaSemanalTreinos =
    metasDoc?.personalGoals?.treinosSemanaisAlvo ??
    metasDoc?.treinosSemanaisAlvo ??
    plan?.treinos?.reduce(
      (tot, t) => tot + (t.exercicios?.length || 0),
      0
    ) ??
    10;

  const minutosSemana = treinosSemanaisAtual * 27;
  const caloriasSemana = treinosSemanaisAtual * 178;

  const metaDiariaMinutos = metasDoc?.minutosDiariosAlvo ?? 30;
  const minutosDiariosAtual = metasDoc?.minutosDiariosAtual ?? 0;

  const percMetaSemanal =
    metaSemanalTreinos > 0
      ? Math.min((exerciciosSemana / metaSemanalTreinos) * 100, 130)
      : 0;

  const percMetaDiaria =
    metaDiariaMinutos > 0
      ? Math.min((minutosDiariosAtual / metaDiariaMinutos) * 100, 130)
      : 0;

  const topGruposSemana = Object.values(volumeGrupoSemana)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3);

  const resumoInteligente = gerarResumo(
    volumeGrupoSemana,
    comparacaoSemana,
    metaSemanalTreinos,
    exerciciosSemana
  );

  if (loading)
    return (
      <p className="text-slate-400 text-sm">
        Carregando painel Ultra…
      </p>
    );

  if (!user)
    return (
      <p className="text-slate-400 text-sm">
        Faça login para ver o painel Ultra.
      </p>
    );

  return (
        <Container className="py-8">
    <div className="space-y-8">
      <motion.div {...fade} className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-50">Painel Ultra</h2>
        <p className="text-sm text-slate-400">
          Sua visão completa com dados reais.
        </p>
        <p className="text-xs text-amber-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Exclusivo para ULTRA.
        </p>
      </motion.div>

      <motion.div {...fade} className="grid md:grid-cols-3 gap-4">
        <CircleCard label="Treinos" value={treinosSemanaisAtual} helper="semanais" />
        <CircleCard label="Minutos" value={minutosSemana} helper="na semana" />
        <CircleCard label="Calorias" value={caloriasSemana} helper="na semana" />
      </motion.div>

      <motion.div {...fade} className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon={Activity}
          label="IMC"
          value={analysis?.imc ?? "--"}
          helper={analysis?.classificacao ?? "Gere um plano"}
        />
        <InfoCard
          icon={Flame}
          label="Peso atual"
          value={userForm?.peso ? `${userForm.peso} kg` : "--"}
          helper="Do formulário"
        />
        <InfoCard
          icon={TrendingUp}
          label="Melhor dia"
          value={melhorDia?.dia ? capitalizar(melhorDia.dia) : "--"}
          helper={
          melhorDia ? `${melhorDia.qtd} treinos` : "Nenhum registro ainda"
          }
        />
      </motion.div>

      <motion.div {...fade} className="grid md:grid-cols-2 gap-4">
        <MetaProgressCard
          label="Meta semanal"
          valorAtual={exerciciosSemana}
          meta={metaSemanalTreinos}
          perc={percMetaSemanal}
          helper="Exercícios concluídos"
          unidade="exercícios"
        />
        <MetaProgressCard
          label="Meta diária"
          valorAtual={minutosDiariosAtual}
          meta={metaDiariaMinutos}
          perc={percMetaDiaria}
          helper="Minutos acumulados hoje"
          unidade="min"
        />
      </motion.div>

      <motion.div {...fade} className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-3">
          <p className="text-sm text-slate-300 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-300" />
            Top grupos da semana
          </p>

          {!topGruposSemana || topGruposSemana.length === 0 ? (
            <p className="text-xs text-slate-500">
              Você ainda não treinou nesta semana.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-200">
              {topGruposSemana.map((g, idx) => (
                <li key={g.nome} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    {g.nome}
                  </span>
                  <span className="text-xs text-slate-400">{g.volume} exer.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-3">
          <p className="text-sm text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-300" />
            Intensidade da semana
          </p>

            <p className="text-2xl font-semibold text-slate-50">
              {Number.isFinite(intensidadeSemana)
                ? intensidadeSemana.toFixed(1)
                : "--"}{" "}
              <span className="text-sm text-slate-500">/ 10</span>
            </p>

            {Number.isFinite(comparacaoSemana?.diffPerc) && (
              <p className="text-xs text-slate-400">
                {comparacaoSemana.diffPerc > 0
                  ? `+${Math.round(comparacaoSemana.diffPerc)}% vs semana passada`
                  : `${Math.round(comparacaoSemana.diffPerc)}% vs semana passada`}
              </p>
            )}
        </div>
      </motion.div>

      <motion.div {...fade} className="glass-card rounded-3xl p-5 border border-white/5">
        <p className="text-sm text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Resumo inteligente da semana
        </p>
        <p className="text-sm text-slate-200">{resumoInteligente.linha1}</p>
        {resumoInteligente.linha2 && (
          <p className="text-xs text-slate-400">{resumoInteligente.linha2}</p>
        )}
      </motion.div>
    </div>
    </Container>
  );
}


function CircleCard({ label, value, helper }) {
  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col items-center border border-white/5">
      <div className="relative w-28 h-28 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-1 rounded-full border-4 border-teal-400/80 border-t-transparent rotate-45" />
        <div className="absolute inset-4 rounded-full bg-slate-950/80 flex items-center justify-center">
          <span className="text-2xl font-semibold text-slate-50">{value}</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className="text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="glass-card rounded-3xl p-4 border border-white/5 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-300" />
        {label}
      </span>
      <span className="text-xl font-semibold text-slate-50">{value}</span>
      <span className="text-[11px] text-slate-500">{helper}</span>
    </div>
  );
}

function MetaProgressCard({ label, valorAtual, meta, perc, helper, unidade }) {
  return (
    <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-2">
      <p className="text-xs text-slate-400 uppercase flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-300" /> {label}
      </p>

      <p className="text-sm text-slate-300">
        {valorAtual} / {meta}{" "}
        <span className="text-slate-500 text-xs">{unidade}</span>
      </p>

      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
          style={{ width: `${perc}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function gerarResumo(volumePorGrupo, comparacao, metaSemanal, exAtual) {
  const grupos = Object.values(volumePorGrupo);
  if (!grupos.length)
    return {
      linha1:
        "Assim que você concluir um treino esta semana, seu resumo inteligente aparecerá aqui.",
      linha2: "",
    };

  const ordenados = [...grupos].sort((a, b) => b.volume - a.volume);

  const top = ordenados[0];
  const bottom = ordenados[ordenados.length - 1];

  let linha1 = `Seu grupo mais treinado foi ${top.nome} (${top.volume} exercícios).`;
  let linha2 = `O grupo menos treinado foi ${bottom.nome} (${bottom.volume}).`;

    if (Number.isFinite(comparacao?.diffPerc)) {
    const diff = Math.round(comparacao.diffPerc);
    linha2 =
      diff > 0
        ? `Você fez cerca de ${diff}% mais exercícios que a semana passada.`
        : diff < 0
        ? `Você fez ${Math.abs(diff)}% menos exercícios que a semana passada.`
        : "Seu volume foi igual ao da semana passada.";
  }

  return { linha1, linha2 };
}

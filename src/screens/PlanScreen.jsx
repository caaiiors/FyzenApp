import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Activity, Apple, Flame } from "lucide-react";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import WorkoutChecklist from "@/components/WorkoutChecklist";
import WeeklyInsightsModal from "@/components/premium/WeeklyInsightsModal";
import { gerarWeeklyInsights } from "@/lib/premium/weeklyInsights";
import RegenerateDayButton from "@/components/premium/RegenerateDayButton";
import RegenerateWeekButton from "@/components/premium/RegenerateWeekButton";
import EditGroupModal from "@/components/premium/EditGroupModal";
import { usePremium } from "@/context/PremiumContext";
import { gerarPlanoSemanaIA, regenerarSemanaIA } from "@/lib/aiWorkoutService";
import { SkeletonCard, SkeletonStats } from "@/components/SkeletonLoader";
import Container from "@/components/Container";
import FormWizard from "@/components/FormWizard";

const diasSemana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const DIAS = ["segunda", "terça", "quarta", "quinta", "sexta"];

const API_URL = import.meta.env.VITE_AI_WORKOUT_API_URL || "https://fyzenbackend.onrender.com/api";

function getDiaSemanaAtual() {
  return diasSemana[new Date().getDay()];
}

const initialForm = {
  sexo: "",
  idade: "",
  peso: "",
  altura: "",
  nivel: "",
  objetivo: "",
  local: "",
  exerciciosPorGrupo: "3",
};

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
  viewport: { once: true, amount: 0.3 },
};

export default function PlanScreen() {
  // ========== ESTADOS ==========
  const [form, setForm] = useState(initialForm);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [plan, setPlan] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [weeklyInsights, setWeeklyInsights] = useState(null);
  const [openInsights, setOpenInsights] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState("segunda");
  const [editingGroup, setEditingGroup] = useState(null);
  const [skipInsights, setSkipInsights] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [iaOverlayOpen, setIaOverlayOpen] = useState(false);
  const [iaOverlayText, setIaOverlayText] = useState("Gerando com IA (Ultra), aguarde...");

  const { nivel, isPro, isUltra } = usePremium();
  const diaAtual = getDiaSemanaAtual();

  // ========== MEMOS ==========
  const treinosPorDiaMemo = useMemo(() => {
    if (!plan?.treinos) return {};
    const obj = DIAS.reduce((acc, dia) => {
      acc[dia] = [];
      return acc;
    }, {});
    (plan.treinos || []).forEach((grupo, index) => {
      const dia = DIAS[index % DIAS.length];
      obj[dia].push({ ...grupo, _globalIndex: index });
    });
    return obj;
  }, [plan]);

  const treinosDoDia = useMemo(() => {
    return treinosPorDiaMemo[diaSelecionado] || [];
  }, [treinosPorDiaMemo, diaSelecionado]);

  const exerciciosBase = useMemo(
    () => ({
      emagrecimento: {
        casa: [
          {
            grupo: "Cardio leve",
            exercicios: [
              "Polichinelos – 3x40s",
              "Corrida estacionária – 3x1min",
              "Pular corda – 3x30s",
              "Escalador (mountain climber) – 3x20 reps",
              "Agachamento com salto – 3x15 reps",
              "Corrida lateral – 3x30s",
            ],
          },
          {
            grupo: "Corpo completo",
            exercicios: [
              "Agachamento livre – 4x15",
              "Flexão de braço – 3x10",
              "Prancha – 3x30s",
              "Afundo alternado – 3x12 cada perna",
              "Abdominal infra – 3x20",
              "Polichinelo com toque no chão – 3x20",
            ],
          },
          {
            grupo: "Pernas e glúteos",
            exercicios: [
              "Agachamento sumô – 4x15",
              "Avanço (lunge) – 3x12 cada perna",
              "Elevação pélvica – 4x12",
              "Afundo búlgaro – 3x10 cada perna",
              "Passada lateral – 3x12",
              "Ponte com uma perna – 3x10 cada perna",
            ],
          },
          {
            grupo: "Core e estabilidade",
            exercicios: [
              "Prancha – 3x30s",
              "Prancha lateral – 3x20s cada lado",
              "Abdominal bicicleta – 3x20",
              "Abdominal canivete – 3x12",
              "Prancha com elevação de perna – 3x10 cada perna",
              "Prancha com ombro – 3x20",
            ],
          },
          {
            grupo: "HIIT em casa",
            exercicios: [
              "Corrida estacionária – 30s",
              "Burpees – 10 reps",
              "Polichinelos – 30s",
              "Escalador – 20 reps",
              "Agachamento com salto – 15 reps",
              "Descanso ativo (marchar parado) – 30s",
            ],
          },
        ],
        academia: [
          {
            grupo: "Cardio e resistência",
            exercicios: [
              "Esteira – 20 min",
              "Escada – 10 min",
              "Elíptico – 15 min",
              "Bicicleta ergométrica – 10 min",
              "Corrida leve na pista – 15 min",
              "Remo ergométrico – 8 min",
            ],
          },
          {
            grupo: "Pernas focadas",
            exercicios: [
              "Leg press – 4x15",
              "Cadeira extensora – 3x12",
              "Cadeira flexora – 3x12",
              "Agachamento livre – 4x12",
              "Elevação de panturrilha em pé – 4x15",
              "Avanço com halteres – 3x10 cada perna",
            ],
          },
          {
            grupo: "Treino circuito",
            exercicios: [
              "Remada baixa – 3x12",
              "Supino reto – 3x12",
              "Puxada na frente – 3x12",
              "Desenvolvimento com halteres – 3x10",
              "Abdominal na máquina – 3x15",
              "Prancha – 3x30s",
            ],
          },
          {
            grupo: "Cardio intervalado",
            exercicios: [
              "Esteira (sprints) – 10x30s rápido / 30s leve",
              "Bike em intensidade moderada – 15 min",
              "Escada rápida – 5 min",
              "Remo moderado – 8 min",
              "Caminhada leve – 10 min (resfriamento)",
            ],
          },
          {
            grupo: "Full body emagrecimento",
            exercicios: [
              "Agachamento no Smith – 4x12",
              "Supino inclinado – 3x10",
              "Puxada aberta – 3x10",
              "Elevação lateral – 3x12",
              "Tríceps testa – 3x12",
              "Rosca direta – 3x12",
            ],
          },
        ],
      },
      hipertrofia: {
        casa: [
          {
            grupo: "Peito e tríceps",
            exercicios: [
              "Flexão de braço – 4x12",
              "Flexão diamante – 3x10",
              "Flexão declinada – 3x10",
              "Mergulho entre cadeiras – 4x10",
              "Flexão isométrica – 3x30s",
              "Flexão com apoio elevado – 3x12",
            ],
          },
          {
            grupo: "Costas e bíceps",
            exercicios: [
              "Remada curvada com mochila – 4x12",
              "Rosca direta com mochila – 3x12",
              "Rosca alternada – 3x10",
              "Remada unilateral – 3x12 cada lado",
              "Bíceps martelo – 3x12",
              "Remada invertida na mesa – 3x10",
            ],
          },
          {
            grupo: "Pernas e glúteos",
            exercicios: [
              "Agachamento búlgaro – 4x10 cada perna",
              "Afundo – 3x12 cada perna",
              "Elevação pélvica – 4x12",
              "Agachamento sumô – 3x12",
              "Ponte com uma perna – 3x10 cada perna",
              "Elevação de panturrilha – 4x15",
            ],
          },
          {
            grupo: "Ombros e core",
            exercicios: [
              "Elevação lateral com garrafa – 3x15",
              "Desenvolvimento com mochila – 3x12",
              "Elevação frontal – 3x12",
              "Prancha – 3x30s",
              "Abdominal canivete – 3x12",
              "Prancha lateral – 3x20s cada lado",
            ],
          },
          {
            grupo: "Peito e costas",
            exercicios: [
              "Flexão de braço – 4x12",
              "Remada curvada – 4x12",
              "Flexão com pegada aberta – 3x10",
              "Remada unilateral – 3x12 cada lado",
              "Flexão isométrica – 3x30s",
              "Prancha – 3x30s",
            ],
          },
        ],
        academia: [
          {
            grupo: "Peito e tríceps",
            exercicios: [
              "Supino reto – 4x10",
              "Supino inclinado – 3x10",
              "Crossover – 3x12",
              "Tríceps corda – 3x12",
              "Tríceps testa – 3x10",
              "Crucifixo inclinado – 3x12",
            ],
          },
          {
            grupo: "Costas e bíceps",
            exercicios: [
              "Puxada na frente – 4x10",
              "Remada curvada – 3x10",
              "Remada baixa – 3x12",
              "Rosca direta – 3x12",
              "Rosca alternada – 3x10",
              "Pulldown – 3x12",
            ],
          },
          {
            grupo: "Pernas",
            exercicios: [
              "Agachamento livre – 4x8",
              "Leg press – 4x10",
              "Cadeira extensora – 3x12",
              "Cadeira flexora – 3x12",
              "Stiff – 3x10",
              "Elevação de panturrilha sentado – 4x15",
            ],
          },
          {
            grupo: "Ombros e trapézio",
            exercicios: [
              "Desenvolvimento com halteres – 4x10",
              "Elevação lateral – 3x12",
              "Elevação frontal – 3x12",
              "Encolhimento com barra – 4x12",
              "Remada alta – 3x10",
              "Crucifixo inverso – 3x12",
            ],
          },
          {
            grupo: "Full body",
            exercicios: [
              "Supino reto – 4x8",
              "Puxada aberta – 4x8",
              "Crucifixo – 3x10",
              "Remada baixa – 3x10",
              "Rosca direta – 3x10",
              "Tríceps corda – 3x10",
            ],
          },
        ],
      },
      resistencia: {
        casa: [
          {
            grupo: "Circuito funcional",
            exercicios: [
              "Corrida no lugar – 1min",
              "Polichinelos – 40s",
              "Agachamento + salto – 3x15",
              "Flexão de braço – 3x10",
              "Prancha – 3x30s",
              "Polichinelos cruzados – 3x40s",
              "Escalador cruzado – 3x20",
            ],
          },
          {
            grupo: "Resistência de pernas",
            exercicios: [
              "Agachamento livre – 4x20",
              "Afundo – 3x15 cada perna",
              "Ponte de glúteo – 4x15",
              "Agachamento sumô – 3x15",
              "Passada andando – 3x20 passos",
              "Elevação de panturrilha – 4x20",
            ],
          },
          {
            grupo: "Resistência de superiores",
            exercicios: [
              "Flexão de braço – 4x15",
              "Flexão inclinada na parede – 3x20",
              "Mergulho em cadeira – 3x15",
              "Remada invertida na mesa – 3x12",
              "Prancha alta – 3x40s",
              "Prancha com ombro – 3x20",
            ],
          },
          {
            grupo: "Core avançado",
            exercicios: [
              "Prancha – 4x40s",
              "Abdominal bicicleta – 3x20",
              "Abdominal canivete – 3x15",
              "Prancha lateral – 3x25s cada lado",
              "Prancha com elevação de perna – 3x10 cada perna",
              "Escalador – 3x25",
            ],
          },
          {
            grupo: "HIIT resistência",
            exercicios: [
              "Burpees – 10 reps",
              "Corrida estacionária – 40s",
              "Polichinelos – 40s",
              "Agachamento com salto – 15 reps",
              "Escalador – 20 reps",
              "Prancha – 30s",
            ],
          },
        ],
        academia: [
          {
            grupo: "Cardio + força",
            exercicios: [
              "Esteira – 15min ritmo moderado",
              "Corda naval – 3x30s",
              "Agachamento com barra – 4x12",
              "Flexão de braço – 3x10",
              "Remada baixa – 3x12",
              "Prancha – 3x40s",
            ],
          },
          {
            grupo: "Resistência de pernas",
            exercicios: [
              "Leg press – 4x15",
              "Agachamento guiado – 4x12",
              "Cadeira extensora – 3x15",
              "Cadeira flexora – 3x15",
              "Panturrilha em pé – 4x20",
              "Afundo com halteres – 3x12 cada perna",
            ],
          },
          {
            grupo: "Resistência de superiores",
            exercicios: [
              "Supino reto – 3x15",
              "Puxada na frente – 3x15",
              "Desenvolvimento – 3x15",
              "Remada baixa – 3x15",
              "Tríceps polia – 3x15",
              "Rosca direta – 3x15",
            ],
          },
          {
            grupo: "Circuito metabólico",
            exercicios: [
              "Corda naval – 3x30s",
              "Kettlebell swing – 3x15",
              "Burpee – 3x12",
              "Agachamento frontal – 3x12",
              "Remada curvada – 3x12",
              "Abdominal na bola – 3x20",
            ],
          },
          {
            grupo: "Cardio prolongado",
            exercicios: [
              "Esteira – 25min",
              "Bike – 20min",
              "Elíptico – 15min",
              "Remo – 10min",
              "Caminhada leve – 10min (resfriamento)",
              "Abdominal prancha – 3x40s",
            ],
          },
        ],
      },
    }),
    []
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await carregarPlano(u.uid);
      } else {
        setUser(null);
        setPlan(null);
        setAnalysis(null);
        setNutrition(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!diaSelecionado) return;
    const indexAtual = diasSemana.indexOf(diaAtual);
    const indexTreino = diasSemana.indexOf(diaSelecionado);
    if (indexTreino > indexAtual) {
      setBloqueado(true);
      setMensagem(`Hoje é ${diaAtual}. Volte na ${diaSelecionado} para completar este treino.`);
      return;
    }
    if (indexTreino < indexAtual) {
      setBloqueado(true);
      setMensagem(`Você já passou o dia de ${diaSelecionado}.`);
      return;
    }
    setBloqueado(false);
    setMensagem("");
  }, [diaSelecionado, diaAtual]);

  useEffect(() => {
    if (isEditingForm || !plan?.treinos || skipInsights) return;
    const gerar = async () => {
      try {
        const novos = await gerarWeeklyInsights(plan.treinos, DIAS, nivel);
        setWeeklyInsights(novos);
      } catch (err) {
        console.error("Erro ao gerar insights semanais:", err);
      }
    };
    gerar();
  }, [plan, nivel, isEditingForm, skipInsights]);

  useEffect(() => {
    if (!iaOverlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") e.preventDefault();
    };
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [iaOverlayOpen]);

  // ========== FUNÇÕES ==========
  const carregarPlano = async (uid) => {
    try {
      const ref = doc(db, "planos", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm({ ...initialForm, ...(data.form ?? {}) });
        setAnalysis(data.analysis ?? null);
        setPlan(data.plan ?? null);
        setNutrition(data.nutrition ?? null);
        setStatusMsg("Plano carregado da nuvem ☁️");
      }
    } catch (err) {
      console.error("Erro ao carregar plano:", err);
      setStatusMsg("Não foi possível carregar seu plano anterior.");
    }
  };

  const salvarPlano = async (uid, dados) => {
    try {
      await setDoc(doc(db, "planos", uid), dados, { merge: true });
      setStatusMsg("Plano salvo automaticamente na sua conta.");
    } catch (err) {
      console.error("Erro ao salvar plano:", err);
      setStatusMsg("Erro ao salvar plano.");
    }
  };

  const gerarPlanoTreino = (objetivo, local, formAtual) => {
    const base = exerciciosBase[objetivo];
    if (!base) return [];
    const tipo = local === "academia" ? base.academia : base.casa;
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    return tipo.map((grupo) => {
      const qtd = parseInt(formAtual.exerciciosPorGrupo) || 3;
      const embaralhados = shuffle(grupo.exercicios);
      return {
        grupo: grupo.grupo,
        exercicios: embaralhados.slice(0, Math.min(qtd, grupo.exercicios.length)),
      };
    });
  };

async function handleGenerate(formData) {
  if (!user) return alert("Faça login para gerar seu plano.");

  setForm(formData);

  const peso = parseFloat(formData.peso);
  const alturaCm = parseFloat(formData.altura);
  const idade = parseFloat(formData.idade);

  if (!peso || !alturaCm || !idade) {
    return alert("Altura, peso e idade inválidos.");
  }

  const altura = alturaCm / 100;
  const imc = peso / (altura * altura);

  let classificacao;
  if (imc < 18.5) classificacao = "Abaixo do peso";
  else if (imc < 25) classificacao = "Peso normal";
  else if (imc < 30) classificacao = "Sobrepeso";
  else classificacao = "Obesidade";

  const tmb =
    formData.sexo === "feminino"
      ? 655 + 9.6 * peso + 1.8 * alturaCm - 4.7 * idade
      : 66 + 13.7 * peso + 5 * alturaCm - 6.8 * idade;

  let fator = 1.2;
  if (formData.nivel === "intermediario") fator = 1.5;
  if (formData.nivel === "avancado") fator = 1.8;

  const gasto = Math.round(tmb * fator);
  const analise = { imc: imc.toFixed(1), classificacao, gasto };

  let planoTreino = [];

  if (isUltra) {
    setIaOverlayText("Gerando com IA Ultra, aguarde...");
    setIaOverlayOpen(true);

    try {
      const respostaIA = await fetch(`${API_URL}/workout/week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: formData })
      });

      const dataIA = await respostaIA.json().catch(() => ({}));

      if (respostaIA.ok && dataIA.treinos && Array.isArray(dataIA.treinos)) {
        planoTreino = dataIA.treinos;
        console.log("[Plan] IA retornou treinos:", planoTreino);
      } else {
        console.warn("[Plan] IA falhou, usando método tradicional");
        planoTreino = gerarPlanoTreino(
          formData.objetivo,
          formData.local,
          formData
        );
      }
    } catch (err) {
      console.error("[Plan] Erro ao chamar IA:", err);
      planoTreino = gerarPlanoTreino(
        formData.objetivo,
        formData.local,
        formData
      );
    } finally {
      setIaOverlayOpen(false);
    }
  } else {
    planoTreino = gerarPlanoTreino(formData.objetivo, formData.local, formData);
  }

  const calorias =
    formData.objetivo === "emagrecimento"
      ? analise.gasto - 400
      : formData.objetivo === "hipertrofia"
      ? analise.gasto + 400
      : analise.gasto;

  const dados = {
    form: formData,
    analysis: analise,
    plan: { info: formData, treinos: planoTreino },
    nutrition: { total: calorias, plano: "" },
    ownerUid: user.uid,
    updatedAt: serverTimestamp()
  };

  setSaving(true);

  try {
    setAnalysis(analise);
    setPlan(dados.plan);
    setNutrition(dados.nutrition);

    await salvarPlano(user.uid, dados);
    setStatusMsg("Plano gerado e salvo!");
    setDiaSelecionado("segunda");
    setIsEditingForm(false);

    // ===== ADICIONAR ISTO - SCROLL AUTOMÁTICO =====
    setTimeout(() => {
      // Faz scroll suave até a seção de treinos
      const treinoSection = document.querySelector('[data-treino-section]');
      if (treinoSection) {
        treinoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll manual se o elemento não estiver presente
        window.scrollTo({ top: 800, behavior: 'smooth' });
      }
    }, 500);
    // ===== FIM DO SCROLL =====

  } catch (err) {
    console.error("Erro ao gerar/salvar plano:", err);
    setStatusMsg("Erro ao gerar seu plano.");
  } finally {
    setSaving(false);
  }
}


  async function handleRegenerateWeek() {
    try {
      if (!user) return alert("Faça login.");
      if (!isUltra) return alert("Disponível apenas no Ultra.");
      setSaving(true);
      setStatusMsg("Gerando nova semana com IA...");
      const semana = await regenerarSemanaIA(form);
      let novoTreino = null;
      if (Array.isArray(semana) && semana.length > 0) {
        novoTreino = semana
          .flatMap((d) => (Array.isArray(d?.grupos) ? d.grupos : []))
          .map((g) => ({
            grupo: g?.grupo || "Grupo",
            exercicios: Array.isArray(g?.exercicios) ? g.exercicios : [],
          }))
          .filter((g) => g.exercicios.length > 0);
      }
      if (!novoTreino || novoTreino.length === 0) {
        alert("Falha ao gerar semana com IA.");
        return;
      }
      const dados = {
        form,
        analysis,
        nutrition,
        plan: { info: form, treinos: novoTreino },
        ownerUid: user.uid,
        updatedAt: serverTimestamp(),
      };
      setPlan(dados.plan);
      await salvarPlano(user.uid, dados);
      setDiaSelecionado("segunda");
      setStatusMsg("Nova semana gerada e salva!");
    } catch (err) {
      console.error(err);
      setStatusMsg("Erro ao gerar nova semana.");
    } finally {
      setSaving(false);
    }
  }

  // ========== COMPONENTES DAS ETAPAS ==========
  const Step1Personal = ({ data, updateField }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Sexo *</label>
          <div className="grid grid-cols-2 gap-3">
            {["masculino", "feminino"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateField("sexo", s)}
                className={`p-3 rounded-xl border transition-all ${
                  data.sexo === s
                    ? "border-primary-500 bg-primary-500/10 text-white"
                    : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20"
                }`}
              >
                {s === "masculino" ? "♂ Masculino" : "♀ Feminino"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Idade *</label>
          <input
            type="number"
            value={data.idade}
            onChange={(e) => updateField("idade", e.target.value)}
            placeholder="Ex: 25"
            min="10"
            max="100"
            className="input-style"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Peso (kg) *</label>
          <input
            type="number"
            value={data.peso}
            onChange={(e) => updateField("peso", e.target.value)}
            placeholder="Ex: 75"
            min="20"
            max="300"
            step="0.1"
            className="input-style"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Altura (cm) *</label>
          <input
            type="number"
            value={data.altura}
            onChange={(e) => updateField("altura", e.target.value)}
            placeholder="Ex: 175"
            min="100"
            max="230"
            className="input-style"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-300">
          💡 Esses dados são usados para calcular seu IMC e gasto calórico diário
        </p>
      </div>
    </div>
  );

  const Step2Goals = ({ data, updateField }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Nível de experiência *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "iniciante", label: "Iniciante", desc: "Começando agora" },
            { value: "intermediario", label: "Intermediário", desc: "Treino regular" },
            { value: "avancado", label: "Avançado", desc: "Treino intenso" },
          ].map((n) => (
            <button
              key={n.value}
              type="button"
              onClick={() => updateField("nivel", n.value)}
              className={`p-4 rounded-xl border transition-all text-left ${
                data.nivel === n.value
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/10 bg-slate-800/50 hover:border-white/20"
              }`}
            >
              <div
                className={`font-semibold ${
                  data.nivel === n.value ? "text-primary-300" : "text-slate-300"
                }`}
              >
                {n.label}
              </div>
              <div className="text-xs text-slate-500 mt-1">{n.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Objetivo principal *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "emagrecimento", label: "Emagrecer", emoji: "🔥" },
            { value: "hipertrofia", label: "Ganhar Massa", emoji: "💪" },
            { value: "resistencia", label: "Resistência", emoji: "⚡" },
          ].map((obj) => (
            <button
              key={obj.value}
              type="button"
              onClick={() => updateField("objetivo", obj.value)}
              className={`p-4 rounded-xl border transition-all ${
                data.objetivo === obj.value
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/10 bg-slate-800/50 hover:border-white/20"
              }`}
            >
              <div className="text-2xl mb-2">{obj.emoji}</div>
              <div
                className={`font-semibold ${
                  data.objetivo === obj.value ? "text-primary-300" : "text-slate-300"
                }`}
              >
                {obj.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Step3Location = ({ data, updateField }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Local de treino *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: "casa", label: "🏠 Em Casa", desc: "Treinos com peso corporal" },
            { value: "academia", label: "🏋️ Academia", desc: "Equipamentos completos" },
          ].map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => updateField("local", loc.value)}
              className={`p-6 rounded-xl border transition-all text-left ${
                data.local === loc.value
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/10 bg-slate-800/50 hover:border-white/20"
              }`}
            >
              <div
                className={`text-lg font-semibold mb-1 ${
                  data.local === loc.value ? "text-primary-300" : "text-slate-300"
                }`}
              >
                {loc.label}
              </div>
              <div className="text-sm text-slate-500">{loc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Exercícios por grupo muscular
        </label>
        <select
          value={data.exerciciosPorGrupo}
          onChange={(e) => updateField("exerciciosPorGrupo", e.target.value)}
          className="input-style"
        >
          <option value="2">2 exercícios (rápido)</option>
          <option value="3">3 exercícios (balanceado)</option>
          <option value="4">4 exercícios (intenso)</option>
          <option value="5">5 exercícios (máximo)</option>
        </select>
        <p className="text-xs text-slate-500 mt-2">
          Define quantos exercícios diferentes por grupo muscular
        </p>
      </div>
    </div>
  );

  const Step4Summary = ({ data }) => {
    const peso = parseFloat(data.peso);
    const alturaCm = parseFloat(data.altura);
    const idade = parseFloat(data.idade);

    let imc = null;
    let classificacao = "";

    if (peso && alturaCm && idade) {
      const altura = alturaCm / 100;
      imc = (peso / (altura * altura)).toFixed(1);

      if (imc < 18.5) classificacao = "Abaixo do peso";
      else if (imc < 25) classificacao = "Peso normal";
      else if (imc < 30) classificacao = "Sobrepeso";
      else classificacao = "Obesidade";
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10">
          <h4 className="font-semibold text-white mb-3">📋 Resumo do seu perfil</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Sexo:</span>
              <span className="text-white ml-2 capitalize">{data.sexo || "--"}</span>
            </div>
            <div>
              <span className="text-slate-400">Idade:</span>
              <span className="text-white ml-2">{data.idade || "--"} anos</span>
            </div>
            <div>
              <span className="text-slate-400">Peso:</span>
              <span className="text-white ml-2">{data.peso || "--"} kg</span>
            </div>
            <div>
              <span className="text-slate-400">Altura:</span>
              <span className="text-white ml-2">{data.altura || "--"} cm</span>
            </div>
            <div>
              <span className="text-slate-400">Nível:</span>
              <span className="text-white ml-2 capitalize">{data.nivel || "--"}</span>
            </div>
            <div>
              <span className="text-slate-400">Objetivo:</span>
              <span className="text-white ml-2 capitalize">{data.objetivo || "--"}</span>
            </div>
            <div>
              <span className="text-slate-400">Local:</span>
              <span className="text-white ml-2 capitalize">{data.local || "--"}</span>
            </div>
            <div>
              <span className="text-slate-400">Exercícios/grupo:</span>
              <span className="text-white ml-2">{data.exerciciosPorGrupo || "3"}</span>
            </div>
          </div>
        </div>

        {imc && (
          <div
            className={`p-4 rounded-xl border ${
              imc < 18.5 || imc >= 30
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-green-500/10 border-green-500/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Seu IMC</div>
                <div className="text-2xl font-bold text-white">{imc}</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold ${
                    imc < 18.5 || imc >= 30 ? "text-orange-300" : "text-green-300"
                  }`}
                >
                  {classificacao}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <p className="text-sm text-primary-300">
            ✨ Tudo pronto! Clique em <strong>"Gerar Plano"</strong> para criar seu treino
            personalizado
          </p>
        </div>
      </div>
    );
  };

  const wizardSteps = [
    {
      label: "Perfil",
      title: "Dados Pessoais",
      description: "Conte-nos um pouco sobre você",
      component: Step1Personal,
      validate: (data) => data.sexo && data.idade && data.peso && data.altura,
    },
    {
      label: "Meta",
      title: "Objetivos e Nível",
      description: "Qual é o seu objetivo principal?",
      component: Step2Goals,
      validate: (data) => data.nivel && data.objetivo,
    },
    {
      label: "Local",
      title: "Preferências de Treino",
      description: "Onde você vai treinar?",
      component: Step3Location,
      validate: (data) => data.local,
    },
    {
      label: "Confirmar",
      title: "Revisar Informações",
      description: "Confira seus dados antes de gerar o plano",
      component: Step4Summary,
      validate: () => true,
    },
  ];

  // ========== RENDER ==========
  if (loading) {
    return (
      <Container className="py-8">
        <SkeletonCard />
        <SkeletonStats />
      </Container>
    );
  }

async function handleRegenerarDia(novoDia) {
  if (!novoDia || !Array.isArray(novoDia) || !plan?.treinos) return;

  // nomes de grupos já usados na semana (exceto o dia atual)
  const gruposExistentes = new Set(
    (plan.treinos || [])
      .filter((g, idx) => {
        const dia = DIAS[idx % DIAS.length];
        return dia !== diaSelecionado;
      })
      .map((g) => (g?.grupo || "").toLowerCase())
  );

  // remove grupos que já existem em outros dias
  const novoDiaFiltrado = novoDia.filter(
    (g) => !gruposExistentes.has((g?.grupo || "").toLowerCase())
  );

  const gruposAplicar = novoDiaFiltrado.length ? novoDiaFiltrado : novoDia;

  const novoTreinos = [...plan.treinos];

  treinosDoDia.forEach((g, idx) => {
    const globalIndex = g._globalIndex;
    if (globalIndex != null && gruposAplicar[idx]) {
      novoTreinos[globalIndex] = gruposAplicar[idx];
    }
  });

  const novoPlan = { ...plan, treinos: novoTreinos };
  setPlan(novoPlan);

  if (user) {
    await setDoc(
      doc(db, "planos", user.uid),
      { plan: novoPlan },
      { merge: true }
    );
  }
}




async function handleRegenerarSemana(flatTreinos) {
  if (!flatTreinos || !Array.isArray(flatTreinos)) return;

  const novoPlan = { ...plan, treinos: flatTreinos };
  setPlan(novoPlan);
  if (user) {
    await setDoc(
      doc(db, "planos", user.uid),
      { plan: novoPlan },
      { merge: true }
    );
  }
}





  return (
    <>
      {/* Overlay IA */}
      {iaOverlayOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center">
          <div className="text-center p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full"
            />
            <p className="text-xl font-bold text-white mb-2">{iaOverlayText}</p>
            <p className="text-sm text-slate-400">Não feche a página. Isso pode levar alguns segundos.</p>
          </div>
        </div>
      )}

      {/* Modal Insights */}
      <WeeklyInsightsModal
        open={openInsights}
        onClose={() => setOpenInsights(false)}
        insights={weeklyInsights}
        nivel={nivel}
      />

      {/* Modal Edição */}
<EditGroupModal
  open={!!editingGroup}
  onClose={() => setEditingGroup(null)}
  grupoOriginal={editingGroup || { grupo: "", exercicios: [] }}
  objetivo={form.objetivo}
  local={form.local}
  form={form}
  userPlan={nivel}
  onReplaceGroup={async (novoGrupo) => {
    if (!user || !plan || !editingGroup) return;
    
    const idx = editingGroup._globalIndex;
    const novosTreinos = [...plan.treinos];
    novosTreinos[idx] = { 
      grupo: novoGrupo.grupo, 
      exercicios: novoGrupo.exercicios 
    };
    
    const novoPlan = { ...plan, treinos: novosTreinos };
    setPlan(novoPlan);
    
    await salvarPlano(user.uid, { 
      plan: novoPlan, 
      updatedAt: serverTimestamp() 
    });
    
    setEditingGroup(null);
    setSkipInsights(true);
    setStatusMsg("✅ Grupo atualizado com sucesso!");
  }}
/>


      {!plan || isEditingForm ? (
  <Container className="py-8">
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Crie seu Plano de Treino Personalizado
      </h1>
      <p className="text-slate-400 max-w-2xl mx-auto">
        Responda algumas perguntas e gere um treino adaptado aos seus objetivos
      </p>
    </div>

    <FormWizard
      steps={wizardSteps}
      initialData={form}
      onComplete={handleGenerate}
      loading={saving}
      onCancel={() => setIsEditingForm(false)} // se o componente aceitar
    />
  </Container>
) : (
  <Container className="py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Seu Plano de Treino</h1>
              {statusMsg && <p className="text-sm text-primary-300">{statusMsg}</p>}
            </div>
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
<button
  onClick={() => setIsEditingForm(true)}
  className="h-11 px-4 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-100 text-sm font-medium flex items-center justify-center gap-2 transition"
>
  ✏️ Editar Dados
</button>

  <div className="flex-1 flex flex-col gap-3 sm:flex-row sm:gap-3">
{isUltra && plan?.treinos && treinosDoDia.length > 0 && (
  <RegenerateDayButton
    form={form}
    diaSelecionado={diaSelecionado}
    dayData={treinosDoDia}
    onRegenerated={handleRegenerarDia}
  />
)}



    {isUltra && plan?.treinos && (
      <RegenerateWeekButton
        nivel={nivel}
        isUltra={isUltra}
        form={form}
        onRegenerated={handleRegenerarSemana}
      />
    )}

    {weeklyInsights && (
      <button
        onClick={() => setOpenInsights(true)}
        className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
      >
        📊 Ver Insights
      </button>
    )}
  </div>
</div>



          </div>

          {/* Análise */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div {...fadeIn} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-slate-400">IMC</span>
                </div>
                <div className="text-2xl font-bold text-white">{analysis.imc}</div>
                <div className="text-xs text-slate-500 mt-1">{analysis.classificacao}</div>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-slate-400">Gasto Calórico</span>
                </div>
                <div className="text-2xl font-bold text-white">{analysis.gasto}</div>
                <div className="text-xs text-slate-500 mt-1">kcal/dia</div>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Apple className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Meta Calórica</span>
                </div>
                <div className="text-2xl font-bold text-white">{nutrition?.total || "--"}</div>
                <div className="text-xs text-slate-500 mt-1">kcal/dia</div>
              </motion.div>
            </div>
          )}

{/* Seletor de Dias */}
<div className="glass-card p-4">
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
    {DIAS.map((dia) => (
      <button
        key={dia}
        onClick={() => setDiaSelecionado(dia)}
        className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
          diaSelecionado === dia
            ? "bg-primary-500 text-white"
            : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
        }`}
      >
        {dia.charAt(0).toUpperCase() + dia.slice(1)}
      </button>
    ))}
  </div>
</div>

{/* Treinos do dia ATUAL */}
<div data-treino-section className="space-y-4">
  {bloqueado ? (
    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
      <p className="text-orange-300 text-sm">{mensagem}</p>
    </div>
  ) : (
    <>
      {treinosDoDia.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">Nenhum treino para este dia</p>
        </div>
      ) : (
        treinosDoDia.map((treino, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary-400" />
                {treino.grupo || "Grupo sem nome"}
              </h3>
              {isPro && (
                <button
                  onClick={() => setEditingGroup(treino)}
                  className="text-sm px-3 py-1 rounded-lg bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 transition-all"
                >
                  Editar
                </button>
              )}
            </div>

            <WorkoutChecklist
              treino={treino.exercicios}
              dia={diaAtual}
              grupo={treino.grupo}
              bloqueado={bloqueado}
            />

            {!isPro && (
              <p className="text-xs text-slate-500 mt-4">
                Personalização de grupo disponível no plano Pro.
              </p>
            )}
          </motion.div>
        ))
      )}
    </>
  )}
</div>



        </Container>
      )}
    </>
  );
}

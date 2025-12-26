import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

// ========== FUNÇÃO PARA COLETAR DADOS REAIS DO LOCALSTORAGE ==========
function obterDadosReaisDoLocalStorage() {
  try {
    const raw = localStorage.getItem("fyzen-checklist-v1");
    if (!raw) return {};

    const data = JSON.parse(raw);
    const estatisticas = {};

    // Percorre todos os registros salvos
    Object.entries(data).forEach(([chave, valor]) => {
      // Formato da chave: "dia::grupo"
      const [dia, grupo] = chave.split("::");
      
      if (!dia || !grupo || !valor.checked) return;

      // Conta quantos foram marcados como completos
      const completados = valor.checked.filter(Boolean).length;
      const total = valor.checked.length;

      if (!estatisticas[dia]) {
        estatisticas[dia] = {
          gruposCompletados: 0,
          exerciciosCompletados: 0,
          exerciciosTotais: 0,
          grupos: []
        };
      }

      estatisticas[dia].gruposCompletados += completados === total ? 1 : 0;
      estatisticas[dia].exerciciosCompletados += completados;
      estatisticas[dia].exerciciosTotais += total;
      estatisticas[dia].grupos.push({
        nome: grupo,
        completados,
        total
      });
    });

    return estatisticas;
  } catch (err) {
    console.error("Erro ao obter dados do localStorage:", err);
    return {};
  }
}

// ========== FUNÇÃO PRINCIPAL ==========
export async function gerarWeeklyInsights(treinos = [], dias = [], userPlan) {
  if (!Array.isArray(treinos) || treinos.length === 0) return null;

  const DIAS = dias && dias.length ? dias : ["segunda", "terça", "quarta", "quinta", "sexta"];

  // 1️⃣ DADOS PLANEJADOS (do plano de treino)
  const porDiaMap = {};
  DIAS.forEach((dia) => {
    porDiaMap[dia] = { dia, grupos: 0, exercicios: 0 };
  });

  let totalTreinosPlaneados = 0;
  let totalExerciciosPlaneados = 0;
  const volumeGrupoPlanejado = {};

  treinos.forEach((grupo, index) => {
    const dia = DIAS[index % DIAS.length];
    if (!porDiaMap[dia]) {
      porDiaMap[dia] = { dia, grupos: 0, exercicios: 0 };
    }

    const qtdExercicios = Array.isArray(grupo.exercicios) ? grupo.exercicios.length : 0;
    porDiaMap[dia].grupos += 1;
    porDiaMap[dia].exercicios += qtdExercicios;
    totalTreinosPlaneados += 1;
    totalExerciciosPlaneados += qtdExercicios;

    const nomeGrupo = grupo.grupo || "Outro";
    volumeGrupoPlanejado[nomeGrupo] = (volumeGrupoPlanejado[nomeGrupo] || 0) + qtdExercicios;
  });

  // 2️⃣ DADOS REAIS (do localStorage)
  const dadosReais = obterDadosReaisDoLocalStorage();

  // 3️⃣ MESCLAR DADOS PLANEJADOS COM DADOS REAIS
  const porDia = DIAS.map((dia) => {
    const planejado = porDiaMap[dia] || { grupos: 0, exercicios: 0 };
    const real = dadosReais[dia] || { exerciciosCompletados: 0, exerciciosTotais: 0, gruposCompletados: 0 };

    return {
      dia,
      gruposPlaneados: planejado.grupos,
      exerciciosPlaneados: planejado.exercicios,
      exerciciosCompletados: real.exerciciosCompletados,
      exerciciosTotais: real.exerciciosTotais || planejado.exercicios,
      gruposCompletados: real.gruposCompletados,
      percentualConclusao: real.exerciciosTotais > 0 
        ? Math.round((real.exerciciosCompletados / real.exerciciosTotais) * 100)
        : 0
    };
  });

  // 4️⃣ ESTATÍSTICAS GERAIS
  const totalExerciciosCompletados = porDia.reduce((acc, d) => acc + d.exerciciosCompletados, 0);
  const diasAtivos = porDia.filter((d) => d.exerciciosCompletados > 0).length;
  const diasComTreinoCompleto = porDia.filter((d) => d.percentualConclusao === 100).length;

  const diaMaisForte = porDia.reduce(
    (prev, cur) => (cur.exerciciosCompletados > (prev?.exerciciosCompletados || 0) ? cur : prev),
    porDia[0]
  );

  const nivel = userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "FREE";

  return {
    totalTreinosPlaneados,
    totalExerciciosPlaneados,
    totalExerciciosCompletados,
    diasAtivos,
    diasComTreinoCompleto,
    diaMaisForte,
    porDia,
    volume: volumeGrupoPlanejado,
    dadosReais,
    nivel,
  };
}

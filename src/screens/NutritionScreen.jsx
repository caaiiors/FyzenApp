import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Apple, Plus, Calendar, Flame, Utensils, Trash, Sparkles, ChefHat } from "lucide-react";
import { useToast } from "../components/Toast.jsx";
import { auth, db } from "../lib/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import Container from "@/components/Container";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionScreen() {
  const [user, setUser] = useState(null);
  const [metaCalorica, setMetaCalorica] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO());
  const [refeicoes, setRefeicoes] = useState([]);
  const [totalConsumido, setTotalConsumido] = useState(0);
  const [novaRef, setNovaRef] = useState({
    nome: "",
    calorias: "",
    tipo: "almoço",
  });
  const [carregandoDia, setCarregandoDia] = useState(false);
  
  // ✨ NOVO: Estado para cardápio gerado por IA
  const [mealPlan, setMealPlan] = useState(null);
  const [showMealPlan, setShowMealPlan] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setUser(u);
      await carregarMeta(u.uid);
      await carregarMealPlan(u.uid); // ✨ NOVO
      await carregarDia(u.uid, diaSelecionado);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    carregarDia(user.uid, diaSelecionado);
  }, [diaSelecionado, user]);

  // ✨ NOVO: Carregar cardápio gerado
  const carregarMealPlan = async (uid) => {
    try {
      const ref = doc(db, "planos", uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().meal) {
        setMealPlan(snap.data().meal);
      }
    } catch (err) {
      console.error("Erro ao carregar cardápio:", err);
    }
  };

  const carregarMeta = async (uid) => {
    try {
      const ref = doc(db, "planos", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        // Tenta pegar a meta do cardápio IA primeiro, senão usa nutrition.total
        const meal = snap.data().meal;
        if (meal && meal.nutritionProfile) {
          setMetaCalorica(meal.nutritionProfile.targetCalories || 0);
        } else if (snap.data().nutrition) {
          setMetaCalorica(snap.data().nutrition.total || 0);
        } else {
          setMetaCalorica(0);
        }
      } else {
        setMetaCalorica(0);
      }
    } catch (err) {
      console.error("Erro ao carregar meta:", err);
      setMetaCalorica(0);
    }
  };

  const getDiaRef = (uid, diaISO) => doc(db, "nutrition", uid, "days", diaISO);

  const carregarDia = async (uid, diaISO) => {
    setCarregandoDia(true);
    try {
      const ref = getDiaRef(uid, diaISO);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setRefeicoes(data.refeicoes || []);
        setTotalConsumido(data.totalConsumido || 0);
      } else {
        setRefeicoes([]);
        setTotalConsumido(0);
      }
    } catch (err) {
      console.error("Erro ao carregar dia de nutrição:", err);
      setRefeicoes([]);
      setTotalConsumido(0);
    } finally {
      setCarregandoDia(false);
    }
  };

  const salvarDia = async (refeicoesAtualizadas, totalAtualizado) => {
    if (!user) return;
    try {
      const ref = getDiaRef(user.uid, diaSelecionado);
      await setDoc(
        ref,
        {
          refeicoes: refeicoesAtualizadas,
          totalConsumido: totalAtualizado,
          metaCalorica,
          dia: diaSelecionado,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Erro ao salvar nutrição:", err);
    }
  };

  const { showToast } = useToast();

  const adicionarRefeicao = async () => {
    if (!novaRef.nome || !novaRef.calorias) {
      showToast("Preencha o nome e as calorias.");
      return;
    }
    const caloriasNum = parseInt(novaRef.calorias, 10);
    if (isNaN(caloriasNum) || caloriasNum <= 0) {
      showToast("Calorias inválidas.");
      return;
    }
    const novaLista = [
      ...refeicoes,
      {
        nome: novaRef.nome,
        calorias: caloriasNum,
        tipo: novaRef.tipo,
      },
    ];
    const novoTotal = totalConsumido + caloriasNum;
    setRefeicoes(novaLista);
    setTotalConsumido(novoTotal);
    setNovaRef({ ...novaRef, nome: "", calorias: "" });
    await salvarDia(novaLista, novoTotal);
  };

  const removerRefeicao = async (index) => {
    const alvo = refeicoes[index];
    if (!alvo) return;
    const novaLista = refeicoes.filter((_, i) => i !== index);
    const novoTotal = totalConsumido - (alvo.calorias || 0);
    setRefeicoes(novaLista);
    setTotalConsumido(novoTotal < 0 ? 0 : novoTotal);
    await salvarDia(novaLista, novoTotal < 0 ? 0 : novoTotal);
  };

  const handleChangeDia = (e) => {
    setDiaSelecionado(e.target.value);
  };

  const percent =
    metaCalorica > 0
      ? Math.min((totalConsumido / metaCalorica) * 100, 160)
      : 0;

  let barClass = "bg-gradient-to-r from-emerald-400 to-teal-400";
  if (percent >= 90 && percent < 100) {
    barClass = "bg-gradient-to-r from-amber-300 to-yellow-400";
  } else if (percent >= 100) {
    barClass = "bg-gradient-to-r from-red-400 to-rose-500";
  }

  const passouMeta = metaCalorica > 0 && totalConsumido > metaCalorica;

  // ✨ NOVO: Função para renderizar cardápio IA
  const renderMealPlan = () => {
    if (!mealPlan || !showMealPlan) return null;

    const mealNames = {
      breakfast: "🌅 Café da Manhã",
      lunch: "☀️ Almoço",
      snack: "🍎 Lanche",
      dinner: "🌙 Jantar",
    };

    const translateGoal = (goal) => {
      const goals = {
        weight_loss: "🔥 Perda de Peso",
        muscle_gain: "💪 Ganho de Massa",
        maintenance: "⚖️ Manutenção",
        recomp: "🎯 Recomposição",
      };
      return goals[goal] || goal;
    };

    return (
      <motion.div {...fadeIn} className="mb-6">
        {/* Header do Cardápio */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">
              Seu Cardápio Personalizado
            </h2>
            {mealPlan.type === "ai_generated" && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                IA
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMealPlan(!showMealPlan)}
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            {showMealPlan ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {/* Resumo Nutricional */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Meta Diária</span>
            <span className="text-sm text-emerald-400 font-medium">
              {translateGoal(mealPlan.nutritionProfile.goal)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">
                {mealPlan.nutritionProfile.targetCalories}
              </div>
              <div className="text-xs text-slate-400">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {mealPlan.nutritionProfile.macros.protein}g
              </div>
              <div className="text-xs text-slate-400">Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">
                {mealPlan.nutritionProfile.macros.carbs}g
              </div>
              <div className="text-xs text-slate-400">Carbos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-rose-400">
                {mealPlan.nutritionProfile.macros.fat}g
              </div>
              <div className="text-xs text-slate-400">Gorduras</div>
            </div>
          </div>
        </div>

        {/* Refeições do Cardápio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(mealPlan.meals).map(([mealType, meal]) => (
            <div
              key={mealType}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-emerald-400 text-sm mb-1">
                    {mealNames[mealType]}
                  </h3>
                  <p className="text-slate-200 font-medium">{meal.name}</p>
                </div>
              </div>

              <div className="flex gap-4 mb-3 text-xs">
                <span className="text-slate-400">
                  <span className="font-semibold text-slate-200">{meal.calories}</span> kcal
                </span>
                <span className="text-slate-400">
                  <span className="font-semibold text-blue-400">{meal.protein}g</span> P
                </span>
                <span className="text-slate-400">
                  <span className="font-semibold text-amber-400">{meal.carbs}g</span> C
                </span>
                <span className="text-slate-400">
                  <span className="font-semibold text-rose-400">{meal.fat}g</span> G
                </span>
              </div>

              <div className="space-y-1">
                {meal.foods.map((food, idx) => (
                  <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>
                      <span className="font-medium">{food.item}</span>
                      <span className="text-slate-500"> - {food.amount}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Apple className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Faça login para acessar sua nutrição.
            </h2>
            <p className="text-slate-400">
              Registre suas refeições e acompanhe suas calorias diárias baseadas
              no seu plano Fyzen.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 px-4 max-w-5xl mx-auto">
        {/* Título */}
        <motion.h1
          {...fadeIn}
          className="text-3xl md:text-4xl font-bold text-slate-100 mb-6 flex items-center gap-3"
        >
          <Apple className="w-8 h-8 text-emerald-400" />
          Nutrição
        </motion.h1>

        {/* ✨ NOVO: Cardápio Gerado por IA */}
        {renderMealPlan()}

        {/* Seletor de Dia */}
        <motion.div {...fadeIn} className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={diaSelecionado}
            onChange={handleChangeDia}
            className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          />
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          {...fadeIn}
          className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Meta diária:{" "}
              {metaCalorica > 0 ? `${metaCalorica} kcal` : "não definida"}
            </span>
            <span className="text-sm text-slate-400">
              {totalConsumido} / {metaCalorica} kcal
            </span>
          </div>

          <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${barClass} transition-all duration-500`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {passouMeta && (
            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4" />⚠ Você ultrapassou sua meta diária de
              calorias. Tente compensar nas próximas refeições ou amanhã.
            </p>
          )}
        </motion.div>

        {/* Formulário de Adicionar Refeição */}
        <motion.div
          {...fadeIn}
          className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Adicionar Refeição Manual
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nome da refeição
              </label>
              <input
                type="text"
                value={novaRef.nome}
                onChange={(e) =>
                  setNovaRef((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder="Ex: Arroz, frango e salada"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Calorias (kcal)
              </label>
              <input
                type="number"
                value={novaRef.calorias}
                onChange={(e) =>
                  setNovaRef((prev) => ({ ...prev, calorias: e.target.value }))
                }
                placeholder="Ex: 450"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tipo
              </label>
              <select
                value={novaRef.tipo}
                onChange={(e) =>
                  setNovaRef((prev) => ({ ...prev, tipo: e.target.value }))
                }
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              >
                <option value="café">Café</option>
                <option value="almoço">Almoço</option>
                <option value="lanche">Lanche</option>
                <option value="jantar">Jantar</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <button
            onClick={adicionarRefeicao}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Refeição
          </button>
        </motion.div>

        {/* Lista de Refeições */}
        <motion.div {...fadeIn} className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Refeições Registradas
          </h2>

          {carregandoDia && (
            <p className="text-center text-slate-400 py-6">
              Carregando refeições…
            </p>
          )}

          {refeicoes.length === 0 && !carregandoDia && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 text-center">
              <p className="text-slate-400">
                Nenhuma refeição registrada para este dia.
              </p>
            </div>
          )}

          {refeicoes.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all"
            >
              <div>
                <p className="font-semibold text-slate-100">{r.nome}</p>
                <p className="text-xs text-slate-400">
                  {r.tipo} ·{" "}
                  <span className="text-emerald-400 font-medium">
                    {r.calorias} kcal
                  </span>
                </p>
              </div>

              <button
                onClick={() => removerRefeicao(idx)}
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              >
                <Trash className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Container>
  );
}

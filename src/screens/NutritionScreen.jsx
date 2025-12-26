import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Apple, Plus, Calendar, Flame, Utensils, Trash } from "lucide-react";
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

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return;
      setUser(u);
      await carregarMeta(u.uid);
      await carregarDia(u.uid, diaSelecionado);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    carregarDia(user.uid, diaSelecionado);
  }, [diaSelecionado, user]);

  const carregarMeta = async (uid) => {
    try {
      const ref = doc(db, "planos", uid);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().nutrition) {
        setMetaCalorica(snap.data().nutrition.total || 0);
      } else {
        setMetaCalorica(0);
      }
    } catch (err) {
      console.error("Erro ao carregar meta:", err);
      setMetaCalorica(0);
    }
  };

  const getDiaRef = (uid, diaISO) =>
    doc(db, "nutrition", uid, "days", diaISO);

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
    metaCalorica > 0 ? Math.min((totalConsumido / metaCalorica) * 100, 160) : 0;

  let barClass =
    "bg-gradient-to-r from-emerald-400 to-teal-400";
  if (percent >= 90 && percent < 100) {
    barClass = "bg-gradient-to-r from-amber-300 to-yellow-400";
  } else if (percent >= 100) {
    barClass = "bg-gradient-to-r from-red-400 to-rose-500";
  }

  const passouMeta = metaCalorica > 0 && totalConsumido > metaCalorica;

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-slate-400 text-sm">
          Faça login para acessar sua nutrição.
        </p>
      </div>
    );
  }

  return (
     <Container className="py-8">
    <div className="space-y-6">
      <motion.div {...fadeIn} className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
          <Apple className="w-6 h-6 text-emerald-300" />
          Nutrição diária
        </h2>
        <p className="text-sm text-slate-400">
          Registre suas refeições e acompanhe suas calorias diárias baseadas no
          seu plano Fyzen.
        </p>
      </motion.div>

      <motion.div
        {...fadeIn}
        className="glass-card rounded-3xl p-5 border border-white/5 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-300" />
            <input
              type="date"
              value={diaSelecionado}
              onChange={handleChangeDia}
              className="bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>

          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-amber-300" />
            <p className="text-sm text-slate-300">
              Meta diária:{" "}
              <span className="font-semibold text-amber-200">
                {metaCalorica > 0 ? `${metaCalorica} kcal` : "não definida"}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Consumido:{" "}
              <span className="text-slate-100 font-semibold">
                {totalConsumido} kcal
              </span>
            </span>
            {metaCalorica > 0 && (
              <span>
                {Math.round(percent)}% da meta
              </span>
            )}
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${barClass}`}
              style={{ width: `${metaCalorica > 0 ? percent : 0}%` }}
            />
          </div>

          {passouMeta && (
            <p className="text-xs text-red-300 mt-1">
              ⚠ Você ultrapassou sua meta diária de calorias. Tente
              compensar nas próximas refeições ou amanhã.
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        {...fadeIn}
        className="glass-card p-5 rounded-3xl border border-white/5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-300" />
          Registrar refeição
        </h3>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Nome da refeição</p>
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

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Calorias (kcal)</p>
            <input
              type="number"
              min="0"
              value={novaRef.calorias}
              onChange={(e) =>
                setNovaRef((prev) => ({ ...prev, calorias: e.target.value }))
              }
              placeholder="Ex: 450"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Tipo</p>
            <select
              value={novaRef.tipo}
              onChange={(e) =>
                setNovaRef((prev) => ({ ...prev, tipo: e.target.value }))
              }
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            >
              <option value="café da manhã">Café da manhã</option>
              <option value="almoço">Almoço</option>
              <option value="lanche">Lanche</option>
              <option value="jantar">Jantar</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={adicionarRefeicao}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 text-sm font-semibold shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar refeição
        </button>
      </motion.div>

      <motion.div
        {...fadeIn}
        className="glass-card p-5 rounded-3xl border border-white/5 space-y-3"
      >
        <h3 className="text-lg font-semibold text-slate-50">
          Refeições do dia
        </h3>

        {carregandoDia && (
          <p className="text-xs text-slate-500">Carregando refeições…</p>
        )}

        {refeicoes.length === 0 && !carregandoDia && (
          <p className="text-slate-400 text-sm">
            Nenhuma refeição registrada para este dia.
          </p>
        )}

        <div className="space-y-3">
          {refeicoes.map((r, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between"
            >
              <div>
                <p className="text-slate-50 font-medium text-sm">
                  {r.nome}
                </p>
                <p className="text-slate-400 text-xs">
                  {r.tipo} ·{" "}
                  <span className="text-emerald-300">
                    {r.calorias} kcal
                  </span>
                </p>
              </div>

              <button
                onClick={() => removerRefeicao(i)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
    </Container>
  );
}

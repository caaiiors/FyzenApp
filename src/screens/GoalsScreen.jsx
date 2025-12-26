import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "../components/Toast.jsx";
import Container from "@/components/Container";

export default function GoalsScreen() {
  const [user, setUser] = useState(null);

  const [minutosAlvo, setMinutosAlvo] = useState(30);
  const [treinosSemanaisAlvo, setTreinosSemanaisAlvo] = useState(20);

  const [personalGoals, setPersonalGoals] = useState([]);
  const [novoGoal, setNovoGoal] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return setUser(null);
      setUser(u);
      await carregarMetas(u.uid);
    });
    return () => unsub();
  }, []);

  const carregarMetas = async (uid) => {
    try {
      const ref = doc(db, "metas", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setMinutosAlvo(data.minutosDiariosAlvo ?? 30);
        setTreinosSemanaisAlvo(data.treinosSemanaisAlvo ?? 20);
        setPersonalGoals(data.personalGoals ?? []);
      }
    } catch (err) {
      console.error("Erro ao carregar metas:", err);
    }
  };


const salvarMetas = async () => {
  if (!user) return;

  try {
    const ref = doc(db, "metas", user.uid);

    await setDoc(
      ref,
      {
        minutosDiariosAlvo: Number(minutosAlvo),
        treinosSemanaisAlvo: Number(treinosSemanaisAlvo),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    showToast("Metas automáticas salvas!", "success");
  } catch (err) {
    console.error("Erro ao salvar metas:", err);
  }
};


  const salvarMetasPersonalizadas = async (lista) => {
    if (!user) return;

    try {
      const ref = doc(db, "metas", user.uid);

      await setDoc(
        ref,
        {
          personalGoals: lista,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Erro ao salvar metas personalizadas:", err);
    }
  };


  const adicionarGoal = () => {
    if (!novoGoal.trim()) return;

    setPersonalGoals((prev) => {
      const lista = [...prev, { id: Date.now(), texto: novoGoal.trim() }];
      salvarMetasPersonalizadas(lista);
      return lista;
    });

    setNovoGoal("");
  };

  const removerGoal = (id) => {
    setPersonalGoals((prev) => {
      const lista = prev.filter((g) => g.id !== id);
      salvarMetasPersonalizadas(lista);
      return lista;
    });
  };

  return (
        <Container className="py-8">
    <div className="space-y-8 p-4 md:p-8">

      <section className="glass-card p-6 rounded-3xl border border-white/5 space-y-5">
        <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
          ✓ Metas automáticas
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Meta diária de minutos</label>
            <input
              type="number"
              className="w-full bg-slate-900/40 mt-1 p-3 rounded-xl border border-slate-700 text-slate-200"
              value={minutosAlvo}
              onChange={(e) => setMinutosAlvo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Meta semanal de exercícios</label>
              <input
                type="number"
                className="w-full bg-slate-900/40 mt-1 p-3 rounded-xl border border-slate-700 text-slate-200"
                value={treinosSemanaisAlvo}
                onChange={(e) => setTreinosSemanaisAlvo(e.target.value)}
              />
          </div>
        </div>

        <button
          onClick={salvarMetas}
          className="px-5 py-3 bg-emerald-400 text-slate-900 rounded-xl font-semibold hover:bg-emerald-300 transition"
        >
          Salvar metas
        </button>
      </section>
      <section className="glass-card p-6 rounded-3xl border border-white/5 space-y-5">
        <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
          + Metas personalizadas
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 bg-slate-900/40 p-3 rounded-xl border border-slate-700 text-slate-200"
            placeholder="Ex: Beber 2L de água"
            value={novoGoal}
            onChange={(e) => setNovoGoal(e.target.value)}
          />
          <button
            onClick={adicionarGoal}
            className="px-5 py-3 bg-emerald-400 rounded-xl text-slate-900 font-semibold hover:bg-emerald-300"
          >
            Adicionar
          </button>
        </div>

        {personalGoals.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma meta adicionada.</p>
        )}

        <ul className="space-y-3">
          {personalGoals.map((goal) => (
            <li
              key={goal.id}
              className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-700"
            >
              <span className="text-slate-200">{goal.texto}</span>
              <button
                onClick={() => removerGoal(goal.id)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
    </Container>
  );
}

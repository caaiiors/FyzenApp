import { useEffect, useState } from "react";
import { subscriptionEngine } from "../lib/subscriptionEngine";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../lib/firebaseConfig";
import { Bell } from "lucide-react";
import Card from "../components/Card.jsx";
import Container from "@/components/Container";

export default function HomeScreen({ friendlyName = "Atleta" }) {
  const name = friendlyName;
  const passos = [
    {
      eyebrow: "Etapa 1",
      title: "Definir metas",
      description: "Registre peso atual, objetivo e prazo realista.",
    },
    {
      eyebrow: "Etapa 2",
      title: "Gerar plano de treino",
      description: "Treinos para casa ou academia alinhados ao seu nível.",
    },
    {
      eyebrow: "Etapa 3",
      title: "Planejar alimentação",
      description: "Refeições práticas e equilibradas para sustentar o progresso.",
    },
  ];
  
  const [notif, setNotif] = useState(null);

useEffect(() => {
  const qNotif = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const unsub = onSnapshot(qNotif, (snap) => {
    if (snap.empty) {
      setNotif(null);
    } else {
      setNotif({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  });

  return () => unsub();
}, []);


  const [streak, setStreak] = useState(
    Number(localStorage.getItem("fitmind-streak") || 0)
  );

  useEffect(() => {
    const atualizar = () => {
      setStreak(Number(localStorage.getItem("fitmind-streak") || 0));
    };

    window.addEventListener("streakUpdate", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("streakUpdate", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return (
     <Container className="py-8">
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-50">
        Bem-vindo, {name}! 💪
      </h2>
      <p className="text-sm text-slate-300 max-w-xl">
        Aqui começa sua jornada Fyzen — treinos inteligentes, nutrição equilibrada e progresso real.
      </p>
        {notif && (
      <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 flex items-start gap-3">
        <Bell className="w-4 h-4 text-amber-300 mt-0.5" />
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-300">
            Aviso importante
          </p>
          <p className="text-sm text-slate-100">
            {notif.message}
          </p>
        </div>
      </div>
    )}
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        {passos.map((passo) => (
          <Card key={passo.title} {...passo} />
        ))}
      </div>
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
  <div className="p-3 rounded-xl bg-teal-400/10">
    <span className="text-teal-300 text-xl">🔥</span>
  </div>
  <div>
    <p className="text-sm text-slate-400">Streak de treinos</p>
    <p className="text-lg font-semibold text-slate-50">{streak} dias seguidos</p>
  </div>
</div>
    </div>
    </Container>
  );
}

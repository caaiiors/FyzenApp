import React, { useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { subscriptionEngine } from "../lib/subscriptionEngine";
import { Crown, CreditCard, AlertTriangle } from "lucide-react";
import { cancelarRenovacaoStripe } from "../lib/stripeService";
import Container from "../components/Container";

export default function BillingScreen({ onSelectScreen }) {
  const [assinatura, setAssinatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("free");

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);

      try {
        const ref = doc(db, "assinaturas", user.uid);
        const snap = await getDoc(ref);
        const subData = snap.exists() ? snap.data() : null;

        setAssinatura(subData);
        const result = await subscriptionEngine(user.uid);

        setStatus(result.plano);
      } catch (err) {
        console.error("Erro ao carregar billing:", err);
      }

      setLoading(false);
    }

    load();
  }, []);

  const agora = Date.now();
  const cancelado = assinatura?.canceladoEm && assinatura.canceladoEm <= agora;
  const futuroCancelado = assinatura?.canceladoEm && assinatura.canceladoEm > agora;
  const expirado = assinatura?.renovaEm && assinatura.renovaEm <= agora;

const pm = assinatura?.paymentMethod;

const metodo =
  pm?.brand && pm?.last4
    ? `${String(pm.brand).toUpperCase()} •••• ${pm.last4}`
    : pm?.type
      ? String(pm.type)
      : (assinatura?.stripeCustomerId ? "Cartão (Stripe)" : "desconhecido");



  const plano = assinatura?.plano || "free";

  async function cancelarRenovacao() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await cancelarRenovacaoStripe({ uid: user.uid, cancel: true });
    alert("Renovação cancelada com sucesso (no Stripe).");

    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao cancelar renovação.");
  }
}

  if (loading) {
    return <p className="text-slate-400 text-sm">Carregando assinatura…</p>;
  }

  if (status === "free") {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-50">Minha assinatura</h2>
        <p className="text-slate-400 text-sm">
          Você está no plano <span className="text-teal-300">FREE</span>.
        </p>

        <button
          onClick={() => onSelectScreen("premium")}
          className="bg-teal-500/20 border border-teal-300/30 px-4 py-2 rounded-xl text-teal-300 hover:bg-teal-400/20 transition"
        >
          Ver planos Premium
        </button>
      </div>
    );
  }

  const nomePlano = plano.toUpperCase();

  return (
        <Container className="py-8">
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-teal-300" />
        Minha assinatura
      </h2>

      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-300" />
          <div>
            <p className="text-slate-50 font-semibold">{nomePlano}</p>

            {!cancelado && !expirado && (
              <p className="text-emerald-400 text-sm">Assinatura ativa</p>
            )}

            {cancelado && (
              <p className="text-red-400 text-sm">Cancelada — sem acesso</p>
            )}

            {futuroCancelado && (
              <p className="text-yellow-300 text-sm">
                Renovação cancelada — acesso até {new Date(assinatura.canceladoEm).toLocaleDateString()}
              </p>
            )}

            {expirado && !cancelado && (
              <p className="text-red-400 text-sm">Plano expirado</p>
            )}
          </div>
        </div>

        <div className="text-sm text-slate-300 space-y-1">
          <p>
            <strong>Renovação em:</strong>{" "}
            {assinatura?.renovaEm
              ? new Date(assinatura.renovaEm).toLocaleDateString()
              : "--"}
          </p>
          <p>
            <strong>Método:</strong> {metodo}
          </p>

          {cancelado && (
            <p className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Cancelado em:{" "}
              {new Date(assinatura.canceladoEm).toLocaleDateString()}
            </p>
          )}
        </div>

{!cancelado && !futuroCancelado && !expirado && (
  <div className="flex gap-4">
    <button
      onClick={cancelarRenovacao}
      className="flex-1 bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/20 transition"
    >
      Cancelar renovação
    </button>

    <button
      onClick={() => onSelectScreen("premium")}
      className="flex-1 bg-slate-700/40 border border-white/10 text-slate-200 px-4 py-2 rounded-xl hover:bg-slate-700/60 transition"
    >
      Mudar de plano
    </button>
  </div>
)}

{!cancelado && futuroCancelado && !expirado && (
  <div className="flex gap-4">
    <button
      onClick={async () => {
        const user = auth.currentUser;
        if (!user) return;
        await cancelarRenovacaoStripe({ uid: user.uid, cancel: false });
        alert("Renovação reativada com sucesso (no Stripe).");
        window.location.reload();
      }}
      className="flex-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition"
    >
      Reativar renovação
    </button>

    <button
      onClick={() => onSelectScreen("premium")}
      className="flex-1 bg-slate-700/40 border border-white/10 text-slate-200 px-4 py-2 rounded-xl hover:bg-slate-700/60 transition"
    >
      Mudar de plano
    </button>
  </div>
)}

{expirado && !cancelado && (
  <button
    onClick={() => onSelectScreen("premium")}
    className="w-full bg-teal-500/20 border border-teal-300/30 text-teal-300 px-4 py-2 rounded-xl hover:bg-teal-400/20 transition"
  >
    Renovar assinatura
  </button>
)}

      </div>
    </div>
    </Container>
  );
}

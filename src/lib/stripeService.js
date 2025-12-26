// src/lib/stripeService.js
const BACKEND_URL =
  import.meta.env.VITE_AI_SERVER_URL || "https://fyzenbackend.onrender.com";

export async function iniciarCheckoutStripe({ priceId, uid, email, plano }) {
  console.log("🚀 ========================================");
  console.log("🚀 ENVIANDO PARA O BACKEND:");
  console.log("📌 UID:", uid);
  console.log("📌 Email:", email);
  console.log("📌 Plano:", plano);
  console.log("🚀 ========================================");

  const res = await fetch(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priceId, uid, email, plano }),
  });

  const data = await res.json();

  if (!res.ok || !data.url) {
    console.error("❌ Erro ao criar checkout:", data);
    throw new Error(data.error || "Erro ao criar sessão de pagamento.");
  }

  console.log("✅ URL do Stripe recebida:", data.url);
  window.location.href = data.url;
}

// ✅ NOVO: cancelar renovação no Stripe (cancel_at_period_end)
export async function cancelarRenovacaoStripe({ uid, cancel = true }) {
  const res = await fetch(`${BACKEND_URL}/api/stripe/cancel-renewal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid, cancel }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    console.error("❌ Erro ao cancelar renovação:", data);
    throw new Error(data.error || "Erro ao cancelar renovação.");
  }

  return data;
}

import React from "react";
import StripeCheckoutButton from "../components/premium/StripeCheckoutButton.jsx";

const PRICE_ID_ULTRA_MONTHLY = "price_1ScrikRw5LzzuwFsekQBkj9Y"; // seu mensal atual [file:114]
const PRICE_ID_ULTRA_YEARLY = "price_1SjUGN2LPaSfKXCCZsi0tIpU";  // anual (R$ 259,90)

export default function CheckoutUltraPage() {
  const billing = sessionStorage.getItem("fyzen_billing") || "month";
  const isYearly = billing === "year";

  const priceId = isYearly ? PRICE_ID_ULTRA_YEARLY : PRICE_ID_ULTRA_MONTHLY;
  const label = isYearly ? "R$ 259,90 / ano" : "R$ 24,90 / mês";

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Fyzen ULTRA</h1>
        <p className="text-zinc-400 mt-1">{label}</p>
        {isYearly && (
          <p className="text-xs text-emerald-400 mt-2">
            Cobrança anual (equivale a R$ 21,66/mês).
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-6">
        <ul className="space-y-3 text-zinc-200 text-sm">
          <li>✓ Tudo do PRO</li>
          <li>✓ Painel Ultra com análises avançadas</li>
          <li>✓ Relatório alimentar mais detalhado</li>
          <li>✓ Ajustes finos de treino e nutrição</li>
        </ul>

        <div className="mt-6">
          <StripeCheckoutButton priceId={priceId} />
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          Pagamento seguro via Stripe.
        </p>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react'; // <--- Importe useEffect
import StripeCheckoutButton from "../components/premium/StripeCheckoutButton.jsx";

const PRICE_ID_PRO_MONTHLY = "price_1SdDk5Rw5LzzuwFsY91tjPeB";
const PRICE_ID_PRO_YEARLY = "price_1SjUH52LPaSfKXCCPkN4A0sG";

export default function CheckoutProPage() {
  const billing = sessionStorage.getItem("fyzen_billing") || "month";
  const isYearly = billing === "year";
  const priceId = isYearly ? PRICE_ID_PRO_YEARLY : PRICE_ID_PRO_MONTHLY;
  const label = isYearly ? "R$ 149,90 / ano" : "R$ 14,90 / mês";
  const precoNumerico = isYearly ? 149.90 : 14.90;

  // 📊 TRACKING: Dispara quando a página de checkout carrega
  useEffect(() => {
    try {
      window.fbq?.('track', 'ViewContent', {
        currency: 'BRL',
        value: precoNumerico,
        content_name: 'Checkout Plano PRO - Fyzen',
        content_type: 'product',
        content_id: 'pro'
      });
      console.log(`[Tracking] ViewContent: Checkout PRO - R$ ${precoNumerico}`);
    } catch (err) {
      console.error('[Tracking] Erro Pixel ViewContent:', err);
    }
  }, []); // Dispara apenas 1x quando o componente monta

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Fyzen PRO</h1>
        <p className="text-zinc-400 mt-1">{label}</p>
        {isYearly && (
          <p className="text-xs text-emerald-400 mt-2">
            Cobrança anual (equivale a R$ 12,49/mês).
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-6">
        <ul className="space-y-3 text-zinc-200 text-sm">
          <li>✓ Tudo do Free</li>
          <li>✓ Trocar exercícios da semana</li>
          <li>✓ Relatório semanal (básico)</li>
          <li>✓ Plano alimentar completo (5 refeições)</li>
          <li>✓ Treinos melhores e variados</li>
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

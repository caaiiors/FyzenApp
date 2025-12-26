import React from "react";
import StripeCheckoutButton from "../components/premium/StripeCheckoutButton.jsx";

const PRICE_ID_PRO = "price_1Scqen2LPaSfKXCC1IJ9q3XO";

export default function CheckoutProPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#0b1020] border border-white/5 shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Assinatura PRO
        </h1>
        <p className="text-center text-white/60 mb-6">R$ 14,90 / mês</p>

        <div className="space-y-2 text-sm text-white/80 mb-8">
          <p>✓ Tudo do Free</p>
          <p>✓ Trocar exercícios da semana</p>
          <p>✓ Relatório semanal (básico)</p>
          <p>✓ Plano alimentar completo (5 refeições)</p>
          <p>✓ Treinos melhores e variados</p>
        </div>

        <p className="text-xs text-center text-white/40 mb-4">
          Pagamento seguro via Stripe.
        </p>

        <StripeCheckoutButton priceId={PRICE_ID_PRO} plano="pro" />

        <button
          onClick={() => history.back()}
          className="mt-4 w-full text-sm text-white/60 hover:text-white transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

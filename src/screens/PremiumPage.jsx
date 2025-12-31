import React, { useState } from "react";
import { Check, Rocket, Crown, Star, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumPage({
  user,
  userPlan = "free",
  onPlanChange,
  onSelectScreen,
}) {
  const [billing, setBilling] = useState("year"); // Padrão: Anual (Melhor para conversão)
  const isYearly = billing === "year";
  const currentPlan = (userPlan || "free").toUpperCase();

  // Função que direciona para o checkout correto salvando a escolha
const handleSubscribe = (planType) => {
  // 📊 ENCONTRA OS DADOS DO PLANO SELECIONADO
  const planoSelecionado = planos.find(p => p.id === planType);
  
  if (!planoSelecionado) {
    console.error('[Checkout] Plano não encontrado:', planType);
    return;
  }

  // Calcula o preço real baseado no período (mensal ou anual)
  const precoNumerico = parseFloat(planoSelecionado.precoDisplay?.replace(',', '.')) || 0;

  // 📊 TRACKING: Dispara evento no Facebook Pixel (Frontend)
  try {
    window.fbq?.('track', 'InitiateCheckout', {
      currency: 'BRL',
      value: precoNumerico,
      content_name: `Plano ${planoSelecionado.nome} - Fyzen`,
      content_type: 'product',
      content_id: planType,
      predicted_ltv: billing === 'year' ? precoNumerico * 12 : precoNumerico * 6
    });
    console.log(`[Tracking] InitiateCheckout: ${planoSelecionado.nome} - R$ ${precoNumerico} (${billing})`);
  } catch (err) {
    console.error('[Tracking] Erro ao disparar Pixel:', err);
  }

  // Salva a escolha de período no sessionStorage
  sessionStorage.setItem("fyzen_billing", billing); // 'month' ou 'year'
  
  // Navega para a tela de checkout
  if (planType === "pro") onSelectScreen("checkout-pro");
  if (planType === "ultra") onSelectScreen("checkout-ultra");
};


  async function handleSubscribeClick(planName, planPrice, checkoutUrl) {
  const userEmail = auth.currentUser?.email;
  
  if (!userEmail) {
    alert('Faça login para assinar.');
    return;
  }

  // 📊 TRACKING: Envia evento "InitiateCheckout" para o Facebook Pixel
  try {
    window.fbq?.('track', 'InitiateCheckout', {
      currency: 'BRL',
      value: planPrice, // Preço passado como parâmetro
      content_name: `Plano ${planName} - Fyzen`, // Ex: "Plano Ultra - Fyzen"
      content_type: 'product',
      content_id: planName.toLowerCase() // Ex: "ultra", "pro"
    });
    console.log(`[Tracking] InitiateCheckout disparado: ${planName} - R$ ${planPrice}`);
  } catch (err) {
    console.error('[Tracking] Erro ao disparar Pixel:', err);
  }

  // Redireciona para checkout do Stripe
  window.location.href = checkoutUrl;
}

  const planos = [
    {
      id: "free",
      nome: "Free",
      preco: "0",
      periodo: "/sempre",
      descricao: "Para conhecer a plataforma.",
      cor: "from-slate-700 to-slate-800",
      icone: Star,
      beneficios: [
        "Gerar treinos básicos",
        "Acesso limitado aos treinos",
        "Salvar histórico simples",
      ],
      destaque: false,
    },
    {
      id: "pro",
      nome: "PRO",
      // Lógica de Preço Visual
      precoDisplay: isYearly ? "12,49" : "14,90",
      faturaTexto: isYearly ? "Faturado R$ 149,90 anualmente" : "Faturado mensalmente",
      economizaBadge: isYearly ? "ECONOMIZE 16%" : null,
      descricao: "Para quem quer resultados reais.",
      cor: "from-teal-500 to-emerald-500",
      icone: Rocket,
      beneficios: [
        "Tudo do Free",
        "Trocar exercícios da semana",
        "Relatório semanal (básico)",
        "Plano alimentar completo",
        "Treinos variados e avançados",
        "Treinos com IA ilimitados",
      ],
      destaque: false,
      acao: () => handleSubscribe("pro"),
    },
    {
      id: "ultra",
      nome: "ULTRA",
      // Lógica de Preço Visual
      precoDisplay: isYearly ? "21,66" : "24,90",
      faturaTexto: isYearly ? "Faturado R$ 259,90 anualmente" : "Faturado mensalmente",
      economizaBadge: isYearly ? "2 MESES GRÁTIS 🔥" : null,
      descricao: "A experiência definitiva com IA.",
      cor: "from-violet-600 to-fuchsia-600",
      icone: Crown,
      beneficios: [
        "Tudo do PRO",
        "Painel Ultra completo",
        "Treinos com IA ilimitados",
        "Volume por grupo muscular",
        "Insights semanais completos",
        "Plano alimentar completo com IA",
      ],
      destaque: true, // Card maior/brilhante
      acao: () => handleSubscribe("ultra"),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Escolha o plano ideal para sua evolução
        </h1>
        <p className="text-zinc-400">
          Cancele ou troque de plano quando quiser.
        </p>
      </div>

      {/* 🔄 TOGGLE MENSAL / ANUAL */}
      <div className="flex justify-center mb-12">
        <div className="bg-zinc-900 border border-white/10 p-1 rounded-full flex items-center relative">
          
          {/* Fundo deslizante (Indicador Ativo) */}
          <motion.div 
            className="absolute top-1 bottom-1 bg-zinc-800 rounded-full shadow-sm z-0"
            initial={false}
            animate={{
              left: isYearly ? "50%" : "4px",
              width: isYearly ? "calc(50% - 4px)" : "calc(50% - 4px)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <button
            onClick={() => setBilling("month")}
            className={`relative z-10 w-32 py-2 text-sm font-medium rounded-full transition-colors ${
              !isYearly ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mensal
          </button>
          
          <button
            onClick={() => setBilling("year")}
            className={`relative z-10 w-32 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${
              isYearly ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Anual
          </button>

          {/* Badge Flutuante "Desconto" */}
          <div className="absolute -top-3 -right-6 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            -20% OFF
          </div>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {planos.map((plano) => {
          const isCurrent = currentPlan === plano.nome.toUpperCase();
          const Icone = plano.icone;
          const isUltra = plano.nome === "ULTRA";

          return (
            <div
              key={plano.nome}
              className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full ${
                plano.destaque
                  ? "bg-zinc-900/80 border-fuchsia-500/50 shadow-[0_0_30px_rgba(192,38,211,0.15)] scale-105 z-10"
                  : "bg-zinc-900/40 border-white/10 hover:border-white/20"
              }`}
            >
              {/* Badge de Economia (Só Anual) */}
              {plano.economizaBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  {plano.economizaBadge}
                </div>
              )}

              {/* Cabeçalho do Card */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plano.cor} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icone className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{plano.nome}</h3>
                <p className="text-xs text-zinc-400 h-8">{plano.descricao}</p>
              </div>

              {/* Preço */}
              <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                <div className="flex items-end gap-1">
                  <span className="text-sm text-zinc-400 mb-1">R$</span>
                  <span className="text-3xl font-bold text-white">{plano.preco === "0" ? "0" : plano.precoDisplay}</span>
                  <span className="text-sm text-zinc-500 mb-1">/mês</span>
                </div>
                {plano.preco !== "0" && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                    {plano.faturaTexto}
                  </p>
                )}
              </div>

              {/* Lista de Benefícios */}
              <ul className="space-y-3 mb-8 flex-1">
                {plano.beneficios.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check size={16} className={`shrink-0 mt-0.5 ${isUltra ? "text-fuchsia-400" : "text-emerald-400"}`} />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Botão de Ação */}
              <div className="mt-auto">
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-zinc-400 text-sm font-medium cursor-default">
                    Seu plano atual
                  </div>
                ) : plano.preco === "0" ? (
                  <div className="w-full py-3 text-center text-zinc-500 text-sm">
                    Plano padrão
                  </div>
                ) : (
                    <button
                      onClick={plano.acao}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                        isUltra 
                          ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-fuchsia-900/20"
                          : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {isUltra && <Zap size={16} fill="currentColor" />}
                      Assinar {plano.nome}
                    </button>
                )}
              </div>
              
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck size={14} />
          Pagamento processado com segurança pelo Stripe. Garantia de 7 dias.
        </p>
      </div>

    </div>
  );
}

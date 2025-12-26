import React from "react";
import { Check, Rocket, Crown, Star, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/Container";

export default function PremiumPage({
  user,
  userPlan = "free",
  onPlanChange,
  onSelectScreen,
}) {
  const currentPlan = (userPlan || "free").toUpperCase();

  const planos = [
    {
      nome: "Free",
      preco: "0",
      descricao: "Perfeito para começar!",
      cor: "from-slate-700 to-slate-800",
      icone: Star,
      beneficios: [
        "Gerar treinos básicos",
        "Gerar plano alimentar reduzido",
        "Salvar plano na nuvem",
        "Acessar histórico",
        "Acesso limitado aos treinos",
      ],
      bloqueados: [
        "Relatório semanal",
        "Análise muscular",
        "Trocar exercícios",
        "Coach Fyzen IA",
        "Plano alimentar completo",
        "Treinos ilimitados",
      ],
      destaque: false,
    },
    {
      nome: "PRO",
      preco: "14.90",
      descricao: "Para quem quer resultados de verdade.",
      cor: "from-teal-500 to-emerald-500",
      icone: Rocket,
      beneficios: [
        "Tudo do Free",
        "Trocar exercícios da semana",
        "Relatório semanal (básico)",
        "Plano alimentar completo (5 refeições)",
        "Treinos melhores e variados",
      ],
      bloqueados: [
        "Análise avançada ULTRA",
        "Coach IA Turbo",
        "Insights de musculatura",
      ],
      destaque: true,
      moeda: "BRL",
      simbolo: "R$",
    },
    {
      nome: "ULTRA",
      preco: "24.90",
      descricao: "A experiência mais completa.",
      cor: "from-purple-500 to-pink-500",
      icone: Crown,
      beneficios: [
        "Tudo do PRO",
        "Painel Ultra completo",
        "Coach ULTRA — análise avançada",
        "Volume por grupo muscular",
        "Insights semanais completos",
      ],
      bloqueados: [],
      destaque: false,
      moeda: "BRL",
      simbolo: "R$",
    },
  ];

  function renderStatus(planoNome) {
    const nome = planoNome.toUpperCase();

    if (nome === "PRO" && currentPlan === "PRO") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          Plano Atual
        </span>
      );
    }

    if (nome === "ULTRA" && currentPlan === "ULTRA") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Plano Atual
        </span>
      );
    }

    if (nome === "FREE" && currentPlan === "FREE") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
          Plano Atual
        </span>
      );
    }

    return null;
  }

  function handleSelectPlan(planoNome) {
    const nome = planoNome.toUpperCase();

    // 3️⃣ Se o usuário tem ULTRA, não pode assinar PRO
    if (currentPlan === "ULTRA" && nome === "PRO") {
      alert("❌ Você já tem o plano ULTRA! Não é possível fazer downgrade para PRO.");
      return;
    }

    if (nome === "FREE") {
      alert("Você já tem acesso ao plano Free!");
      return;
    }

    if (nome === "PRO") {
      onSelectScreen?.("checkout-pro");
    } else if (nome === "ULTRA") {
      onSelectScreen?.("checkout-ultra");
    }
  }

  // Verifica se o botão deve ser desabilitado
  function isButtonDisabled(planoNome) {
    const nome = planoNome.toUpperCase();
    const isCurrentPlan = nome === currentPlan;
    
    // Desabilita PRO se o usuário tem ULTRA
    const isDowngrade = currentPlan === "ULTRA" && nome === "PRO";
    
    return isCurrentPlan || isDowngrade;
  }

  // Texto do botão
  function getButtonText(planoNome) {
    const nome = planoNome.toUpperCase();
    const isCurrentPlan = nome === currentPlan;
    
    if (isCurrentPlan) return "Plano Atual";
    if (currentPlan === "ULTRA" && nome === "PRO") return "Você é ULTRA";
    if (planoNome === "0") return "Plano Gratuito";
    
    return "Assinar Agora";
  }

  return (
    <Container className="py-12">
      {/* 2️⃣ Fundo mais bonito com gradiente */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Escolha seu plano
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Escolha o plano que combina com o seu momento. Você pode mudar de
            plano sempre que quiser.
          </p>
        </motion.div>

        {/* 1️⃣ Cards de Planos - LARGURA AUMENTADA */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {planos.map((plano, idx) => {
            const Icon = plano.icone;
            const isCurrentPlan = plano.nome.toUpperCase() === currentPlan;
            const isDisabled = isButtonDisabled(plano.nome);

            return (
              <motion.div
                key={plano.nome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-3xl p-6 border-2 transition-all hover:scale-[1.02] ${
                  plano.destaque
                    ? "border-teal-500/50 bg-gradient-to-b from-teal-500/5 to-transparent shadow-xl shadow-teal-500/10"
                    : isCurrentPlan
                    ? "border-white/20 bg-slate-900/50"
                    : "border-white/10 bg-slate-900/30"
                } ${plano.destaque ? "transform md:scale-105" : ""}`}
              >
                {/* Badge "Mais Popular" */}
                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900 shadow-lg">
                      🔥 Mais Popular
                    </span>
                  </div>
                )}

                {/* Ícone e Nome */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plano.cor} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {plano.nome}
                      </h3>
                    </div>
                  </div>
                  {renderStatus(plano.nome)}
                </div>

                {/* Descrição */}
                <p className="text-slate-400 text-sm mb-4">{plano.descricao}</p>

                {/* Preço */}
                {plano.preco !== "0" && (
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">
                        {plano.simbolo} {plano.preco}
                      </span>
                      <span className="text-slate-400 text-lg">/mês</span>
                    </div>
                  </div>
                )}

                {/* Benefícios */}
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Inclui:
                  </p>
                  {plano.beneficios.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{b}</span>
                    </div>
                  ))}

                  {/* Bloqueados */}
                  {plano.bloqueados.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">
                        Não inclui:
                      </p>
                      {plano.bloqueados.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-500">{b}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Botão */}
                <button
                  onClick={() => handleSelectPlan(plano.nome)}
                  disabled={isDisabled}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all text-sm ${
                    isDisabled
                      ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                      : plano.destaque
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-teal-500/50 hover:scale-105"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {getButtonText(plano.nome)}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-slate-500 text-sm">
            ✨ Todos os planos incluem acesso à plataforma e atualizações
            gratuitas.
          </p>
          <p className="text-slate-500 text-sm">
            🔒 Cancele quando quiser. Sem multas ou taxas escondidas.
          </p>
        </motion.div>
      </div>
    </Container>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, TrendingUp, Heart, Sparkles, ChevronDown, X } from 'lucide-react';

const FacebookLandingPage = ({ onSelectScreen, user }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [scrollY, setScrollY] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Planos com cupom FYZEN20 (20% desconto até 31/01/2026)
  const plans = {
    monthly: [
      {
        id: 'pro-monthly',
        name: 'PRO',
        originalPrice: 14.90,
        discountedPrice: 11.92,
        period: '/mês',
        description: 'Treinos inteligentes com IA',
        features: [
          '✅ Treinos personalizados com IA',
          '✅ Acompanhamento de progresso',
          '✅ Suporte por email',
          '✅ Acesso básico à nutrição',
          '✅ Salvar plano na nuvem'
        ],
        color: 'from-cyan-400 to-cyan-600',
        borderColor: 'border-cyan-500',
        badge: 'POPULAR'
      },
      {
        id: 'ultra-monthly',
        name: 'ULTRA',
        originalPrice: 24.90,
        discountedPrice: 19.92,
        period: '/mês',
        description: 'Tudo do Pro + análise avançada',
        features: [
          '✅ Tudo do plano Pro',
          '✅ Dieta 100% personalizada',
          '✅ Análise corporal com IA',
          '✅ Suporte prioritário 24/7',
          '✅ Integração com wearables'
        ],
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-500',
        highlight: true,
        badge: 'RECOMENDADO'
      }
    ],
    annual: [
      {
        id: 'pro-annual',
        name: 'PRO',
        originalPrice: 149.90,
        discountedPrice: 119.92,
        period: '/ano',
        description: 'Treinos inteligentes com IA',
        features: [
          '✅ Treinos personalizados com IA',
          '✅ Acompanhamento de progresso',
          '✅ Suporte por email',
          '✅ Acesso básico à nutrição',
          '✅ Salvar plano na nuvem'
        ],
        color: 'from-cyan-400 to-cyan-600',
        borderColor: 'border-cyan-500',
        savings: 'Economize R$ 30',
        badge: 'POPULAR'
      },
      {
        id: 'ultra-annual',
        name: 'ULTRA',
        originalPrice: 259.90,
        discountedPrice: 207.92,
        period: '/ano',
        description: 'Tudo do Pro + análise avançada',
        features: [
          '✅ Tudo do plano Pro',
          '✅ Dieta 100% personalizada',
          '✅ Análise corporal com IA',
          '✅ Suporte prioritário 24/7',
          '✅ Integração com wearables'
        ],
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-500',
        highlight: true,
        savings: 'Economize R$ 52',
        badge: 'RECOMENDADO'
      }
    ]
  };

  const currentPlans = plans[billingPeriod];

  // Script do Pixel do Facebook
  useEffect(() => {
    // Rastrear visualização de página
    if (window.fbq) {
      window.fbq('track', 'PageView');
      window.fbq('track', 'ViewContent', {
        content_type: 'landing_page',
        content_name: 'Fyzen Ads Landing Page',
        currency: 'BRL'
      });
    }

    // Scroll listener
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectPlan = (planId) => {
    // Rastrear seleção de plano
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: planId,
        content_type: 'plan',
        currency: 'BRL'
      });
    }
    setSelectedPlan(planId);
    // Redirecionar para checkout
    window.location.href = `https://fyzen.app/checkout?plan=${planId}&coupon=FYZEN20&source=facebook`;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 30 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0" />
      
      {/* Aurora Effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10">
        {/* HEADER FIXO */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <motion.div className="flex items-center gap-3" {...fadeInLeft}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/50">
                F
              </div>
              <div>
                <h1 className="font-bold text-xl">Fyzen</h1>
                <p className="text-cyan-400 text-xs font-semibold">TREINO INTELIGENTE</p>
              </div>
            </motion.div>
            
            <div className="text-sm text-cyan-400 font-semibold">
              ⏰ Oferta válida até 31 de janeiro
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div 
              className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full"
              {...fadeInUp}
            >
              <span className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                🔥 20% OFF na primeira assinatura
              </span>
            </motion.div>

            {/* Headline Principal */}
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              Transforme seu corpo com
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
                Treino Inteligente
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p 
              className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              Treinos 100% personalizados com IA, dieta adaptada e progresso garantido em 30 dias. 
              <br />
              <span className="font-bold text-cyan-400">Aprovado por atletas profissionais.</span>
            </motion.p>

            {/* CTA Principal */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            >
            <button
                onClick={() => {
                    window.location.href = 'https://fyzen.app';
                }}
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-lg transition-all"
                >
                Crie sua conta
            </button>

            </motion.div>

            {/* Social Proof */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-slate-400 mb-12"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>+10.000 usuários ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Média de 8kg perdidos</span>
              </div>
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>Utilizado por atletas profissionais</span>
             </div>
            </motion.div>
          </div>

          {/* HERO VIDEO/IMAGE */}
          <motion.div 
            className="mb-16 relative"
            {...fadeInUp}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          >
            <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30 flex items-center justify-center overflow-hidden relative group cursor-pointer"
              onClick={() => setShowVideo(true)}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              <div className="text-center relative z-10">
                <motion.div 
                  className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-0 h-0 border-l-8 border-r-0 border-t-5 border-b-5 border-l-white border-t-transparent border-b-transparent ml-1" />
                </motion.div>
                <p className="text-slate-300 font-semibold">Clique para ver o trailer</p>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 rounded-2xl blur-3xl -z-10" />
          </motion.div>
        </section>

                {/* BENEFÍCIOS SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h3 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Por que Fyzen é diferente?
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'IA Personalizada',
                description: 'Treinos adaptados ao seu corpo, meta e estilo de vida com algoritmos avançados'
              },
              {
                icon: '📊',
                title: 'Análise Corporal 3D',
                description: 'Acompanhamento de progresso com análise de antes/depois em tempo real'
              },
              {
                icon: '🥗',
                title: 'Dieta Inteligente',
                description: 'Planos alimentares personalizados com 5 refeições diárias'
              },
              {
                icon: '⚡',
                title: 'Treinos Curtos',
                description: 'Resultados em apenas 20-30 minutos por dia, 5 dias por semana'
              },
              {
                icon: '📱',
                title: 'App + Web',
                description: 'Sincronização perfeita entre celular, tablet e computador'
              },
              {
                icon: '🏆',
                title: 'Garantia 30 Dias',
                description: 'Ou seu dinheiro de volta, sem perguntas'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all group"
                {...fadeInUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                <h4 className="font-bold text-lg mb-2 text-white">{benefit.title}</h4>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.h3 
                className="text-3xl md:text-4xl font-bold text-center mb-12"
                {...fadeInUp}
            >
                Resultados reais de nossos usuários
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                {
                    name: 'João Silva',
                    result: 'Perdi 12kg em 60 dias',
                    text: 'Nunca imaginei que conseguiria manter consistência. A IA do Fyzen adapta tudo perfeitamente.'
                },
                {
                    name: 'Ana Santos',
                    result: 'Ganho de 8kg de músculo',
                    text: 'Os treinos são científicos e funcionam. Meu shape mudou completamente em 3 meses!'
                },
                {
                    name: 'Carlos Oliveira',
                    result: 'Resistência aumentada 40%',
                    text: 'Treino há anos e Fyzen foi game-changer. Recomendo para todos meus amigos.'
                }
                ].map((testimonial, idx) => (
                <motion.div
                    key={idx}
                    className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl"
                    {...fadeInUp}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
                >
                    <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                    </div>
                    <p className="text-cyan-400 font-bold mb-2">{testimonial.result}</p>
                    <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
                    <p className="text-slate-400 text-sm font-semibold">— {testimonial.name}</p>
                </motion.div>
                ))}
            </div>
            </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Escolha seu plano
            </h3>
            <p className="text-slate-400 mb-8">
                Comece <span className="text-cyan-400 font-bold">completamente grátis</span> com o plano Free. 
                <br />
                Upgrade para PRO ou ULTRA e use o cupom <span className="text-cyan-400 font-bold">FYZEN20</span> no checkout para 20% OFF
                </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <motion.button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mensal
                </motion.button>
                <motion.button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all relative ${
                    billingPeriod === 'annual'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Anual
                  <span className="absolute -top-2 -right-2 text-xs bg-red-500 px-2 py-1 rounded text-white font-bold">
                    SAVE 20%
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {currentPlans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                className={`relative p-8 rounded-2xl border-2 transition-all ${
                  plan.highlight
                    ? `border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-xl shadow-purple-500/20 md:col-span-1 md:row-span-2 md:scale-105`
                    : `border-cyan-500/30 bg-slate-800/50 hover:border-cyan-500`
                } ${selectedPlan === plan.id ? 'ring-2 ring-cyan-400' : ''}`}
                {...fadeInUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.2 }}
                whileHover={{ y: plan.highlight ? -10 : -5 }}
              >
                {/* Badge */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}

                {/* Nombre del plan */}
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Precio */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">R$ {plan.discountedPrice.toFixed(2)}</span>
                    <span className="text-sm text-slate-400 line-through">R$ {plan.originalPrice.toFixed(2)}</span>
                    <span className={plan.name === 'PRO' ? 'text-cyan-400 font-bold' : 'text-pink-400 font-bold'}>
                      {plan.name === 'PRO' ? '-20%' : '-20%'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{plan.period}</p>
                  {plan.savings && (
                    <p className="text-emerald-400 text-sm font-semibold mt-2">🎉 {plan.savings}</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => window.location.href = `https://fyzen.app`}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Assinar agora
                </motion.button>

                {/* Disclaimer */}
                <p className="text-xs text-slate-500 text-center mt-4">
                  7 dias grátis. Cancelamento sem multa a qualquer momento.
                </p>
              </motion.div>
            ))}
          </div>

          {/* Comparação de Planos */}
          <motion.div 
            className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8"
            {...fadeInUp}
          >
            <h4 className="text-xl font-bold mb-6 text-center">Comparação de recursos</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Recurso</th>
                    <th className="text-center py-3 px-4 font-semibold text-cyan-400">PRO</th>
                    <th className="text-center py-3 px-4 font-semibold text-pink-400">ULTRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {[
                    { name: 'Treinos com IA', pro: true, ultra: true },
                    { name: 'Dieta personalizada', pro: true, ultra: true },
                    { name: 'Análise corporal avançada', pro: false, ultra: true },
                    { name: 'Coach IA 24/7', pro: false, ultra: true },
                    { name: 'Insights semanais', pro: false, ultra: true },
                    { name: 'Suporte prioritário', pro: false, ultra: true }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-300">{row.name}</td>
                      <td className="text-center py-3 px-4">
                        {row.pro ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.ultra ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

               {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h3 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            {...fadeInUp}
          >
            Dúvidas Frequentes
          </motion.h3>

          <div className="space-y-4">
            {[
              {
                question: 'Como funciona o período de 7 dias grátis?',
                answer: 'Você tem 7 dias completos para testar Fyzen sem cobranças. Cancelar é fácil e sem multa. Se gostar, continua automaticamente após os 7 dias.'
              },
              {
                question: 'Qual a diferença entre PRO e ULTRA?',
                answer: 'PRO inclui treinos e dieta básica com IA. ULTRA adiciona análise corporal avançada, coach IA 24/7 e insights semanais detalhados.'
              },
              {
                question: 'Posso cancelar a qualquer momento?',
                answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento no seu painel. Sem taxas de cancelamento, sem complicações.'
              },
            {
                question: 'Como usar o cupom FYZEN20?',
                answer: 'Primeiro, crie sua conta Free no Fyzen. Depois, acesse a seção "Seu Plano" (ou "Premium"), escolha PRO ou ULTRA, e clique em "Assinar PRO" (ou "Assinar ULTRA"). No checkout do Stripe, você verá um campo para adicionar cupom. Cole FYZEN20 e receba 20% de desconto na primeira assinatura. Válido até 31 de janeiro de 2026.'
                },
              {
                question: 'Os treinos funcionam em casa também?',
                answer: 'Sim! Fyzen oferece treinos para academia, casa e ao ar livre. A IA se adapta ao seu local disponível.'
              },
              {
                question: 'Preciso de equipamento?',
                answer: 'Não obrigatoriamente. Oferecemos planos com peso corporal, com halteres, com barra e muito mais.'
              }
            ].map((item, idx) => (
              <FAQItem key={idx} item={item} index={idx} />
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-3xl p-12 text-center"
            {...fadeInUp}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para transformar seu corpo?
            </h3>
            <p className="text-slate-300 text-lg mb-8">
              Comece agora. Sem compromisso. Sem cartão.
            </p>
            <motion.button
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/50 active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Planos e Preços
            </motion.button>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-700 mt-20 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Sobre */}
              <div>
                <h4 className="font-bold text-white mb-4">Sobre Fyzen</h4>
                <p className="text-sm text-slate-400">
                  A plataforma de treinos inteligentes mais avançada do Brasil. Ciência + IA.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold text-white mb-4">Recursos</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-400 transition">Treinos</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Nutrição</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Análise</a></li>
                </ul>
              </div>

              {/* Suporte */}
              <div>
                <h4 className="font-bold text-white mb-4">Suporte</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-400 transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Contato</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Status</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-400 transition">Privacidade</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Termos</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Cookies</a></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
              <p>© 2025 Fyzen. Todos os direitos reservados.</p>
              <p className="mt-2">Desenvolvido com ❤️ para transformar vidas</p>
            </div>
          </div>
        </footer>
      </div>

      {/* VIDEO MODAL */}
      {showVideo && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            className="relative w-full max-w-4xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/rzTp46wdXK4" // Substitua pela URL do seu vídeo
                title="Fyzen Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Componente FAQ Item
const FAQItem = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-left font-semibold text-white">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-cyan-400" />
        </motion.div>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-slate-300 border-t border-slate-700">
          {item.answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FacebookLandingPage;

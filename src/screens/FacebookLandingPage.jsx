import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, TrendingUp, Heart, Sparkles, ChevronDown, X, Clock, Users, Award, Target, Phone, Dumbbell } from 'lucide-react';

const FacebookLandingPage = ({ onSelectScreen, user }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [scrollY, setScrollY] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const [signupCount, setSignupCount] = useState(47);

  // Countdown timer até 31/01/2026
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2026-01-31T23:59:59');
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return {};
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular cadastros dinâmicos (aumenta 1 a cada 5-10 min)
  useEffect(() => {
    const interval = setInterval(() => {
      setSignupCount(prev => prev + Math.floor(Math.random() * 2));
    }, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  // Planos com cupom FYZEN20 (20% desconto até 31/01/2026)
  const plans = {
    monthly: [
      {
        id: 'pro-monthly',
        name: 'PRO',
        originalPrice: 14.90,
        discountedPrice: 11.92,
        period: 'mês',
        description: 'Treinos inteligentes com IA',
        features: [
          'Treinos personalizados com IA',
          'Acompanhamento de progresso',
          'Suporte por email',
          'Acesso básico à nutrição',
          'Salvar plano na nuvem'
        ],
        color: 'from-cyan-400 to-cyan-600',
        borderColor: 'border-cyan-500',
        badge: 'POPULAR',
        valueAnchors: [
          '💰 Menos que 1 café por dia',
          '🏋️ Economize R$ 200/mês vs Personal Trainer'
        ]
      },
      {
        id: 'ultra-monthly',
        name: 'ULTRA',
        originalPrice: 24.90,
        discountedPrice: 19.92,
        period: 'mês',
        description: 'Tudo do Pro + análise avançada',
        features: [
          'Tudo do plano Pro',
          'Dieta 100% personalizada',
          'Análise corporal com IA',
          'Suporte prioritário 24/7',
          'Integração com wearables'
        ],
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-500',
        highlight: true,
        badge: 'RECOMENDADO',
        valueAnchors: [
          '💰 Apenas R$ 0,66 por dia',
          '📊 Menos de R$ 0,40 por treino'
        ]
      }
    ],
    annual: [
      {
        id: 'pro-annual',
        name: 'PRO',
        originalPrice: 149.90,
        discountedPrice: 119.92,
        period: 'ano',
        description: 'Treinos inteligentes com IA',
        features: [
          'Treinos personalizados com IA',
          'Acompanhamento de progresso',
          'Suporte por email',
          'Acesso básico à nutrição',
          'Salvar plano na nuvem'
        ],
        color: 'from-cyan-400 to-cyan-600',
        borderColor: 'border-cyan-500',
        savings: 'Economize R$ 30',
        badge: 'POPULAR',
        valueAnchors: [
          '💰 Menos que 1 café por dia',
          '🏋️ Economize R$ 200/mês vs Personal Trainer'
        ]
      },
      {
        id: 'ultra-annual',
        name: 'ULTRA',
        originalPrice: 259.90,
        discountedPrice: 207.92,
        period: 'ano',
        description: 'Tudo do Pro + análise avançada',
        features: [
          'Tudo do plano Pro',
          'Dieta 100% personalizada',
          'Análise corporal com IA',
          'Suporte prioritário 24/7',
          'Integração com wearables'
        ],
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-500',
        highlight: true,
        savings: 'Economize R$ 52',
        badge: 'RECOMENDADO',
        valueAnchors: [
          '💰 Apenas R$ 0,57 por dia',
          '📊 Menos de R$ 0,35 por treino'
        ]
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
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0"></div>
      {/* Aurora Effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        {/* 🔥 COUNTDOWN BANNER FIXO */}
        <motion.div 
          className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-3 px-4 shadow-lg"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <span className="animate-pulse">🔥</span>
              OFERTA LIMITADA: Use o cupom <span className="bg-white text-red-600 px-2 py-1 rounded font-mono mx-1">FYZEN20</span> e ganhe 20% OFF
            </div>
            <div className="flex items-center gap-2 font-mono font-bold">
              <Clock className="w-4 h-4" />
              <span>Termina em:</span>
              {timeLeft.days !== undefined && (
                <div className="flex gap-1">
                  <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.days).padStart(2, '0')}d</span>
                  <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* HEADER FIXO */}
        <header className="sticky top-14 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10 py-4">
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
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12">
            {/* Headline Principal */}
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              Transforme seu corpo com{' '}
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
              Treinos 100% personalizados com Inteligência Artificial, dieta adaptada e{' '}
              <span className="text-cyan-400 font-bold">progresso garantido em 30 dias.</span>
            </motion.p>

            {/* CTA Principal - OTIMIZADO */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              {...fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            >
              <motion.button
                onClick={() => window.location.href = 'https://fyzen.app'}
                className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-bold text-xl shadow-2xl shadow-emerald-500/50 transition-all min-h-[60px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(16, 185, 129, 0.5)',
                    '0 0 40px rgba(16, 185, 129, 0.8)',
                    '0 0 20px rgba(16, 185, 129, 0.5)'
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                🚀 Começar Meu Treino Grátis Agora
              </motion.button>
            </motion.div>

                      {/* SOCIAL PROOF MELHORADO */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12" {...fadeInUp}>
              <motion.div 
                className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-cyan-400" />
                  <span className="text-4xl font-black text-cyan-400">+{signupCount}</span>
                </div>
                <p className="text-slate-200 font-bold text-lg">Usuários Ativos</p>
                <p className="text-cyan-400 text-sm">✅ {Math.floor(signupCount * 0.15)} cadastros nas últimas 24h</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-4xl font-black text-purple-400">8kg</span>
                </div>
                <p className="text-slate-200 font-bold text-lg">Média Perdida</p>
                <p className="text-purple-400 text-sm">📉 Em apenas 60 dias</p>
              </motion.div>
            </motion.div>

            {/* GATILHO DE ESCASSEZ */}
            <motion.div 
              className="inline-block bg-yellow-500/20 border border-yellow-500/50 rounded-full px-6 py-3 mb-8"
              {...fadeInUp}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-yellow-400 font-bold flex items-center gap-2">
                ⚡ Restam apenas <span className="text-white bg-yellow-600 px-2 py-1 rounded">23 vagas</span> para o plano ULTRA este mês
              </p>
            </motion.div>
          </div>

          {/* ANTES/DEPOIS SLIDER */}
          <motion.div className="mb-16" {...fadeInUp}>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Transformações Reais em 30 Dias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'João Mattos, 34', result: '-12kg em 60 dias', before: '🧍‍♂️', after: '💪' },
                { name: 'Ana Vieira, 28', result: '+8kg músculo', before: '🙋‍♀️', after: '🏋️‍♀️' },
                { name: 'Carlos Souza, 41', result: '+40% resistência', before: '🚶‍♂️', after: '🏃‍♂️' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition-all"
                  whileHover={{ y: -10 }}
                >
                  <div className="flex justify-around mb-4 text-6xl">
                    <div className="opacity-50">{item.before}</div>
                    <span className="text-cyan-400 text-3xl">→</span>
                    <div>{item.after}</div>
                  </div>
                  <p className="text-cyan-400 font-bold text-lg mb-2">{item.result}</p>
                  <p className="text-slate-400 text-sm">{item.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA INTERMEDIÁRIO 1 */}
        <motion.section className="max-w-4xl mx-auto px-4 py-12" {...fadeInUp}>
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-3xl p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para começar sua transformação?
            </h3>
            <motion.button
              onClick={() => window.location.href = 'https://fyzen.app'}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-xl font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Começar Agora Grátis
            </motion.button>
          </div>
        </motion.section>

        {/* BENEFÍCIOS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h3 className="text-3xl md:text-4xl font-bold text-center mb-12" {...fadeInUp}>
            Por que Fyzen é diferente?
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'IA Personalizada', description: 'Algoritmo proprietário treinado com +100 transformações reais que se adapta a cada treino' },
              { icon: '📊', title: 'Análise Corporal 3D', description: 'Acompanhamento de progresso com análise de antes/depois em tempo real' },
              { icon: '🥗', title: 'Dieta Inteligente', description: 'Planos alimentares personalizados com 5 refeições diárias adaptados ao seu objetivo' },
              { icon: '⚡', title: 'Treinos Curtos', description: 'Resultados em apenas 20-30 minutos por dia, 5 dias por semana' },
              { icon: '📱', title: 'App + Web', description: 'Sincronização perfeita entre celular, tablet e computador' },
              { icon: '🏆', title: 'Garantia 30 Dias', description: 'Ou seu dinheiro de volta, sem perguntas' }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all group"
                {...fadeInUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                <h4 className="font-bold text-lg mb-2 text-white">{benefit.title}</h4>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS MELHORADOS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h3 className="text-3xl md:text-4xl font-bold text-center mb-12" {...fadeInUp}>
            Resultados reais de nossos usuários
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: 'João Mattos', 
                age: 34, 
                city: 'São Paulo', 
                profession: 'Engenheiro de Software',
                result: 'Perdi 12kg em 60 dias', 
                text: 'Nunca imaginei que conseguiria manter consistência. A IA do Fyzen adapta tudo perfeitamente.',
                avatar: '👨‍💼'
              },
              { 
                name: 'Ana Vieira', 
                age: 28, 
                city: 'Rio de Janeiro', 
                profession: 'Designer',
                result: 'Ganho de 8kg de músculo', 
                text: 'Os treinos são científicos e funcionam. Meu shape mudou completamente em 3 meses!',
                avatar: '👩‍💼'
              },
              { 
                name: 'Carlos Souza', 
                age: 41, 
                city: 'Belo Horizonte', 
                profession: 'Médico',
                result: 'Resistência aumentada 40%', 
                text: 'Treino há anos e Fyzen foi game-changer. Recomendo para todos meus amigos.',
                avatar: '👨‍⚕️'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl"
                {...fadeInUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}, {testimonial.age}</p>
                    <p className="text-slate-400 text-xs">{testimonial.city} - {testimonial.profession}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-cyan-400 font-bold mb-2">{testimonial.result}</p>
                <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA INTERMEDIÁRIO 2 */}
        <motion.section className="max-w-4xl mx-auto px-4 py-12" {...fadeInUp}>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Junte-se a +{signupCount} pessoas transformando seus corpos
            </h3>
            <motion.button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 rounded-xl font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Meus Resultados em 30 Dias
            </motion.button>
          </div>
        </motion.section>

        {/* PRICING SECTION */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Escolha seu plano</h3>
            <p className="text-slate-400 mb-8">
              Comece <span className="text-cyan-400 font-bold">completamente grátis</span> com o plano Free.<br />
              Upgrade para PRO ou ULTRA e use o cupom <span className="text-cyan-400 font-bold">FYZEN20</span> no checkout para 20% OFF
            </p>

            {/* CUPOM HIGHLIGHT BOX */}
            <motion.div 
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-2xl font-bold text-yellow-400 mb-3">💎 BÔNUS EXCLUSIVO</h4>
              <p className="text-white text-lg mb-3">
                Digite <span className="bg-yellow-600 px-3 py-1 rounded font-mono font-bold">FYZEN20</span> no checkout do Stripe
              </p>
              <p className="text-yellow-300 font-semibold">
                ✨ Ganhe 20% OFF na primeira assinatura
              </p>
              <div className="mt-4 text-sm text-slate-300">
                <p>📍 Onde colocar? No checkout, procure por "Adicionar cupom de desconto"</p>
              </div>
            </motion.div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
    className="relative p-8 rounded-2xl border-2 border-slate-600 bg-slate-800/50 hover:border-slate-500 transition-all"
    {...fadeInUp}
    transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
    whileHover={{ y: -5 }}
  >
    {/* Nome do plano */}
    <h4 className="text-2xl font-bold mb-2">FREE</h4>
    <p className="text-slate-400 text-sm mb-6">Experimente grátis para sempre</p>

    {/* Preço */}
    <div className="mb-6">
      <div className="text-4xl font-bold text-white mb-2">
        R$ 0,00
      </div>
      <p className="text-slate-400 text-sm">/mês</p>
    </div>

    {/* Features */}
    <div className="space-y-3 mb-6">
      <div className="flex items-start gap-3">
        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="text-slate-200 text-sm">3 treinos básicos</span>
      </div>
      <div className="flex items-start gap-3">
        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="text-slate-200 text-sm">Acompanhamento manual</span>
      </div>
      <div className="flex items-start gap-3">
        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <span className="text-slate-200 text-sm">Acesso limitado</span>
      </div>
      
      {/* Limitações */}
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <span className="text-slate-500 text-sm">Sem dieta personalizada</span>
      </div>
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <span className="text-slate-500 text-sm">Sem análise corporal</span>
      </div>
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <span className="text-slate-500 text-sm">Sem suporte prioritário</span>
      </div>
    </div>

    {/* CTA Button */}
    <motion.button
      onClick={() => window.location.href = 'https://fyzen.app'}
      className="w-full py-3 rounded-xl font-bold transition-all bg-slate-700 hover:bg-slate-600 text-white"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Começar Grátis
    </motion.button>
  </motion.div>
            {currentPlans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                className={`relative p-8 rounded-2xl border-2 transition-all ${
                  plan.highlight
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-xl shadow-purple-500/20 md:scale-105'
                    : plan.id === 'free'
                    ? 'border-slate-600 bg-slate-800/50'
                    : 'border-cyan-500/30 bg-slate-800/50 hover:border-cyan-500'
                } ${selectedPlan === plan.id ? 'ring-2 ring-cyan-400' : ''}`}
                {...fadeInUp}
                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.2 }}
                whileHover={{ y: plan.highlight ? -10 : -5 }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-6 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}

                {/* Nome do plano */}
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Preço */}
                <div className="mb-6">
                  {plan.id !== 'free' ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">
                          R$ {plan.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          R$ {plan.originalPrice.toFixed(2)}
                        </span>
                        <span className={`${plan.name === 'PRO' ? 'text-cyan-400' : 'text-pink-400'} font-bold`}>
                          -20%
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">/{plan.period}</p>
                      {plan.savings && (
                        <p className="text-emerald-400 text-sm font-semibold mt-2">
                          ✨ {plan.savings}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-white mb-2">
                      R$ 0,00
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                      <span className="text-slate-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* Âncoras de Valor */}
                {plan.valueAnchors && (
                  <div className="mb-6 space-y-2 border-t border-slate-700 pt-4">
                    {plan.valueAnchors.map((anchor, aIdx) => (
                      <p key={aIdx} className="text-xs text-cyan-400 font-semibold">
                        {anchor}
                      </p>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <motion.button
                  onClick={() => window.location.href = 'https://fyzen.app'}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : plan.id === 'free'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.ctaText || 'Assinar agora'}
                </motion.button>

                {/* Disclaimer */}
                {plan.id !== 'free' && (
                  <p className="text-xs text-slate-500 text-center mt-4">
                    Cancelamento sem multa a qualquer momento.
                  </p>
                )}
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
                    <th className="text-center py-3 px-4 font-semibold text-slate-400">FREE</th>
                    <th className="text-center py-3 px-4 font-semibold text-cyan-400">PRO</th>
                    <th className="text-center py-3 px-4 font-semibold text-pink-400">ULTRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {[
                    { name: 'Treinos básicos', free: true, pro: false, ultra: false },
                    { name: 'Treinos com IA', free: false, pro: true, ultra: true },
                    { name: 'Dieta personalizada', free: false, pro: true, ultra: true },
                    { name: 'Análise corporal avançada', free: false, pro: false, ultra: true },
                    { name: 'Coach IA 24/7', free: false, pro: false, ultra: true },
                    { name: 'Insights semanais', free: false, pro: false, ultra: true },
                    { name: 'Suporte prioritário', free: false, pro: false, ultra: true }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-300">{row.name}</td>
                      <td className="text-center py-3 px-4">
                        {row.free ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.pro ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.ultra ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* CTA INTERMEDIÁRIO 3 */}
        <motion.section className="max-w-4xl mx-auto px-4 py-12" {...fadeInUp}>
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ainda tem dúvidas? Veja as perguntas frequentes
            </h3>
            <motion.button
              onClick={() => document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 rounded-xl font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver FAQ
            </motion.button>
          </div>
        </motion.section>

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h3 className="text-3xl md:text-4xl font-bold text-center mb-12" {...fadeInUp}>
            Dúvidas Frequentes
          </motion.h3>
          <div className="space-y-4">
            {[
              {
                question: 'Posso cancelar a qualquer momento?',
                answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento no seu painel. Sem taxas de cancelamento, sem complicações.'
              },
              {
                question: 'Como usar o cupom FYZEN20?',
                answer: 'Primeiro, crie sua conta grátis no Fyzen. Depois, acesse a seção "Seu Plano" (ou "Premium"), escolha PRO ou ULTRA, e clique em "Assinar PRO" (ou "Assinar ULTRA"). No checkout do Stripe, você verá um campo para adicionar cupom. Cole FYZEN20 e receba 20% de desconto na primeira assinatura. Válido até 31 de janeiro de 2026.'
              },
              {
                question: 'Os treinos funcionam em casa também?',
                answer: 'Sim! Fyzen oferece treinos para academia, casa e ao ar livre. A IA se adapta ao seu local disponível.'
              },
              {
                question: 'Preciso de equipamento?',
                answer: 'Não obrigatoriamente. Oferecemos planos de treino com peso corporal, com halteres, com barra e muito mais.'
              }
            ].map((item, idx) => (
              <FAQItem key={idx} item={item} index={idx} />
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <motion.section className="max-w-4xl mx-auto px-4 py-12" {...fadeInUp}>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Escolher Meu Plano Agora
            </h3>
            <motion.button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 rounded-xl font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Planos e Preços
            </motion.button>
          </div>
        </motion.section>

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
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
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
                  <li><a href="https://linktr.ee/fyzenapp" className="hover:text-cyan-400 transition">Contato</a></li>
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

        {/* CTA FLUTUANTE MOBILE */}
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: scrollY > 500 ? 0 : 100, opacity: scrollY > 500 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => window.location.href = 'https://fyzen.app'}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-lg shadow-2xl shadow-emerald-500/50"
            whileTap={{ scale: 0.95 }}
          >
            🚀 Começar Grátis Agora
          </motion.button>
        </motion.div>
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
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
                  src="https://www.youtube.com/embed/rzTp46wdXK4"
                  title="Fyzen Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <div className="px-6 pb-6 text-slate-300 border-t border-slate-700 pt-4">
          {item.answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FacebookLandingPage;

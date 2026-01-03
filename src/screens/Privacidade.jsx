import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const Privacidade = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0"></div>
      <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="flex items-center gap-3" {...fadeInUp}>
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold">Política de Privacidade</h1>
            </motion.div>
            <motion.p 
              className="text-slate-400 mt-2"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              Última atualização: 02 de janeiro de 2026
            </motion.p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Introdução */}
            <motion.section {...fadeInUp}>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-slate-300 leading-relaxed">
                  A <strong className="text-white">Fyzen</strong> ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nosso aplicativo e serviços.
                </p>
              </div>
            </motion.section>

            {/* 1. Informações que Coletamos */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">1. Informações que Coletamos</h2>
              </div>
              
              <div className="space-y-6 text-slate-300">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">1.1 Informações Fornecidas por Você</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Dados pessoais: nome, e-mail, telefone</li>
                    <li>Dados físicos: peso, altura, idade, sexo</li>
                    <li>Objetivos de treino e preferências</li>
                    <li>Informações de pagamento (processadas pelo Stripe)</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">1.2 Informações Coletadas Automaticamente</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Dados de uso do aplicativo</li>
                    <li>Progresso de treinos e métricas</li>
                    <li>Informações do dispositivo (modelo, sistema operacional)</li>
                    <li>Endereço IP e dados de localização aproximada</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* 2. Como Usamos Suas Informações */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">2. Como Usamos Suas Informações</h2>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <ul className="space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 shrink-0">✓</span>
                    <span>Personalizar treinos e dietas com Inteligência Artificial</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 shrink-0">✓</span>
                    <span>Processar pagamentos e gerenciar assinaturas</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 shrink-0">✓</span>
                    <span>Melhorar nossos serviços e desenvolver novos recursos</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 shrink-0">✓</span>
                    <span>Enviar notificações importantes sobre sua conta</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 shrink-0">✓</span>
                    <span>Analisar tendências e estatísticas de uso</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* 3. Compartilhamento de Dados */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-pink-400" />
                <h2 className="text-2xl font-bold">3. Compartilhamento de Dados</h2>
              </div>
              
              <div className="text-slate-300 space-y-4">
                <p>Não vendemos suas informações pessoais. Compartilhamos dados apenas com:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Provedores de Serviço</h4>
                    <p className="text-sm">Stripe (pagamentos), Firebase (armazenamento), OpenRouter (IA)</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Requisitos Legais</h4>
                    <p className="text-sm">Quando exigido por lei ou para proteger nossos direitos</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4. Segurança */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">4. Segurança dos Dados</h2>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
                <p className="text-slate-300 mb-4">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
                </p>
                <ul className="space-y-2 text-slate-300">
                  <li>• Criptografia SSL/TLS para transmissão de dados</li>
                  <li>• Armazenamento seguro em servidores Firebase</li>
                  <li>• Autenticação de dois fatores disponível</li>
                  <li>• Acesso restrito aos dados pessoais</li>
                </ul>
              </div>
            </motion.section>

            {/* 5. Seus Direitos */}
            <motion.section {...fadeInUp}>
              <h2 className="text-2xl font-bold mb-6">5. Seus Direitos (LGPD)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Acessar seus dados pessoais',
                  'Corrigir dados incompletos ou incorretos',
                  'Solicitar exclusão de dados',
                  'Revogar consentimento',
                  'Portabilidade de dados',
                  'Opor-se ao processamento'
                ].map((right, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-slate-300">{right}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 6. Cookies e Rastreamento */}
            <motion.section {...fadeInUp}>
              <h2 className="text-2xl font-bold mb-4">6. Cookies e Tecnologias de Rastreamento</h2>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <p className="text-slate-300 mb-4">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência. Consulte nossa{' '}
                  <a href="/cookies" className="text-cyan-400 hover:underline">Política de Cookies</a> para mais informações.
                </p>
              </div>
            </motion.section>

            {/* 7. Retenção de Dados */}
            <motion.section {...fadeInUp}>
              <h2 className="text-2xl font-bold mb-4">7. Retenção de Dados</h2>
              <p className="text-slate-300">
                Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços. 
                Após a exclusão da conta, seus dados serão removidos em até 90 dias, exceto quando exigido por lei.
              </p>
            </motion.section>

            {/* 8. Menores de Idade */}
            <motion.section {...fadeInUp}>
              <h2 className="text-2xl font-bold mb-4">8. Menores de Idade</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <p className="text-slate-300">
                  Nossos serviços não são direcionados a menores de 18 anos. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.
                </p>
              </div>
            </motion.section>

            {/* Contato */}
            <motion.section {...fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">Contato</h2>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl p-8 text-center">
                <p className="text-slate-300 mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
                </p>
                <a 
                  href="mailto:support@fyzen.app" 
                  className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-semibold transition-all"
                >
                  support@fyzen.app
                </a>
              </div>
            </motion.section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
            <p>© 2026 Fyzen. Todos os direitos reservados.</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/termos" className="hover:text-cyan-400 transition">Termos de Uso</a>
              <a href="/cookies" className="hover:text-cyan-400 transition">Cookies</a>
              <a href="/" className="hover:text-cyan-400 transition">Voltar ao Início</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Privacidade;

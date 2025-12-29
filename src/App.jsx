import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";

// Importação das Telas
import UltraDashboardProtected from "./screens/UltraDashboard.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import PlanScreen from "./screens/PlanScreen.jsx";
import NutritionScreen from "./screens/NutritionScreen.jsx";
import ProgressScreen from "./screens/ProgressScreen.jsx";
import GoalsScreen from "./screens/GoalsScreen.jsx";
import AdminScreen from "./screens/AdminScreen.jsx";
import PremiumPage from "./screens/PremiumPage.jsx";
import VerifyEmailScreen from "./screens/VerifyEmailScreen.jsx";
import EmailActionHandler from "./screens/EmailActionHandler.jsx";
import CheckoutProPage from "./screens/CheckoutProPage.jsx";
import CheckoutUltraPage from "./screens/CheckoutUltraPage.jsx";
import BillingScreen from "./screens/BillingScreen.jsx";

// Contextos e Serviços
import { subscriptionEngine } from "./lib/subscriptionEngine";
import { PremiumProvider } from "./context/PremiumContext.jsx";

// Ícones e Motion
import {
  Home, Dumbbell, Apple, TrendingUp, Target, 
  Sparkles, CreditCard, Activity, LogOut, Flame, Menu, X, User, ChevronRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SCREENS = {
  HOME: "home",
  PLAN: "plan",
  NUTRITION: "nutrition",
  PROGRESS: "progress",
  GOALS: "goals",
  PREMIUM: "premium",
  CHECKOUT_PRO: "checkout-pro",
  CHECKOUT_ULTRA: "checkout-ultra",
  BILLING: "billing",
  ULTRA_DASHBOARD: "ultra-dashboard",
  ADMIN: "admin",
};

function getFriendlyName(user) {
  if (!user) return "Atleta";
  if (user.displayName?.trim()) return user.displayName.trim();
  const raw = user.email?.split("@")[0] ?? "atleta";
  return raw.replace(/[._-]+/g, " ").split(" ").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Lógica de Auth e Plano (Mantida) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "verifyEmail") return;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingAuth(false);
      if (!firebaseUser) {
        setUser(null);
        setUserPlan("free");
        return;
      }
      setUser(firebaseUser);
      setLoadingPlan(true);
      try {
        const status = await subscriptionEngine(firebaseUser.uid);
        setUserPlan(status.plano || "free");
      } catch (err) {
        console.error("Erro no subscriptionEngine:", err);
        setUserPlan("free");
      }
      setLoadingPlan(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "sucesso" && user) {
      [1000, 3000, 5000].forEach((delay) => {
        setTimeout(async () => {
          try {
            const result = await subscriptionEngine(user.uid);
            if (result.plano !== "free") setUserPlan(result.plano);
          } catch (e) {}
        }, delay);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserPlan("free");
    setCurrentScreen(SCREENS.HOME);
  };

  if (loadingAuth) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 font-medium tracking-tight">Carregando Fyzen...</div>;
  if (!user) return <LoginScreen onLoginSuccess={setUser} />;
  
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "verifyEmail") return <EmailActionHandler />;
  if (user && !user.emailVerified) return <VerifyEmailScreen onVerified={setUser} />;

  const friendlyName = getFriendlyName(user);
  const isAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL;

  // --- Navegação ---
  const navItems = [
    { icon: Home, label: "Início", value: SCREENS.HOME },
    { icon: Dumbbell, label: "Treino", value: SCREENS.PLAN },
    { icon: Apple, label: "Dieta", value: SCREENS.NUTRITION },
    { icon: TrendingUp, label: "Evolução", value: SCREENS.PROGRESS },
    { icon: Target, label: "Metas", value: SCREENS.GOALS },
    {
      icon: Sparkles,
      label: userPlan !== "free" ? "Seu plano" : "Premium",
      value: SCREENS.PREMIUM,
    },
    { icon: CreditCard, label: "Minha assinatura", value: SCREENS.BILLING },
  ];

  if (userPlan?.toLowerCase() === "ultra") {
    navItems.splice(2, 0, { icon: Activity, label: "Ultra", value: SCREENS.ULTRA_DASHBOARD });
  }

  if (isAdmin) {
    navItems.push({ icon: Flame, label: "Admin", value: SCREENS.ADMIN });
  }

  const renderScreen = () => {
    const commonProps = { user, userPlan, onSelectScreen: setCurrentScreen, friendlyName };
    switch (currentScreen) {
      case SCREENS.HOME: return <HomeScreen {...commonProps} />;
      case SCREENS.PLAN: return <PlanScreen />;
      case SCREENS.NUTRITION: return <NutritionScreen user={user} userPlan={userPlan} />;
      case SCREENS.PROGRESS: return <ProgressScreen userPlan={userPlan} />;
      case SCREENS.GOALS: return <GoalsScreen />;
      case SCREENS.PREMIUM: return <PremiumPage {...commonProps} onPlanChange={setUserPlan} />;
      case SCREENS.BILLING: return <BillingScreen onSelectScreen={setCurrentScreen} />;
      case SCREENS.CHECKOUT_PRO: return <CheckoutProPage onSelectScreen={setCurrentScreen} />;
      case SCREENS.CHECKOUT_ULTRA: return <CheckoutUltraPage onSelectScreen={setCurrentScreen} />;
      case SCREENS.ADMIN: return isAdmin ? <AdminScreen user={user} isAdmin={true} /> : null;
      case SCREENS.ULTRA_DASHBOARD: return <UltraDashboardProtected onSelectScreen={setCurrentScreen} />;
      default: return <HomeScreen {...commonProps} />;
    }
  };

  return (
    <PremiumProvider userPlan={userPlan}>
      {/* Container Principal com Fundo Avançado */}
      <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden antialiased">
        
        {/* 🌌 BACKGROUND EFFECTS (Aurora & Noise) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Noise Texture (para textura de filme) */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          
          {/* Aurora Gradient Top */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] opacity-60"></div>
          {/* Aurora Gradient Bottom */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/10 rounded-full blur-[100px] opacity-50"></div>
        </div>

        {/* 💻 SIDEBAR (Desktop) - Estilo Glass Sofisticado */}
        <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl z-50 py-8 px-6">
          {/* Logo Area */}
          <div className="flex items-center gap-4 mb-12 pl-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black text-xl shadow-inner">
                F
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Fyzen</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{userPlan}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentScreen === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setCurrentScreen(item.value)}
                  className={`w-full relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {/* Active Background Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavDesktop"
                      className="absolute inset-0 bg-white/[0.06] border border-white/[0.05] rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'group-hover:scale-105'}`} 
                  />
                  <span className="relative z-10 font-medium tracking-wide text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Mini */}
          <div className="mt-auto pt-6 border-t border-white/[0.06]">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-zinc-400 group-hover:text-white transition-colors">
                <User size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-zinc-200 truncate max-w-[120px]">{friendlyName.split(' ')[0]}</p>
                <p className="text-xs text-zinc-500">Sair da conta</p>
              </div>
              <LogOut size={16} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </aside>

        {/* 📱 HEADER MOBILE - Minimalista */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-5 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-black text-xs shadow-lg shadow-emerald-900/20">F</div>
            <span className="font-bold text-lg tracking-tight">Fyzen</span>
          </div>
          
          <div className="flex items-center gap-4">
             {userPlan === 'free' && (
                <button onClick={() => setCurrentScreen(SCREENS.PREMIUM)} className="text-[10px] font-bold px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-full hover:brightness-110 transition-all">
                  UPGRADE
                </button>
             )}
            <div className="w-8 h-8 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center">
              <User size={16} className="text-zinc-400" />
            </div>
          </div>
        </div>

        {/* 🚀 CONTEÚDO PRINCIPAL - Espaçamento Otimizado */}
        <main className="lg:ml-[280px] pt-[76px] lg:pt-8 pb-32 lg:pb-12 px-5 lg:px-12 min-h-screen relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // Curva "Apple" easing
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 📱 BOTTOM DOCK (Mobile) - Estilo iOS Glass */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-[72px] bg-[#09090b]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[24px] flex items-center justify-between px-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 ring-1 ring-white/5">
          {navItems.slice(0, 5).map((item) => {
             const isActive = currentScreen === item.value;
             return (
              <button
                key={item.value}
                onClick={() => setCurrentScreen(item.value)}
                className="relative flex flex-col items-center justify-center w-full h-full group"
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavMobile"
                    className="absolute -top-3 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : 'translate-y-0 group-active:scale-90'}`}>
                   <item.icon 
                     size={24} 
                     strokeWidth={isActive ? 2.5 : 2}
                     className={`transition-colors duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-zinc-500'}`} 
                   />
                </div>
              </button>
             );
          })}
           
           {/* Botão Menu (More) */}
           <button 
             onClick={() => setMobileMenuOpen(true)}
             className="relative flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-zinc-300 active:scale-90 transition-transform"
           >
             <Menu size={24} />
           </button>
        </div>

        {/* 📱 DRAWER MENU (Mobile Overlay) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-[#121214] rounded-t-[32px] p-6 z-[70] border-t border-white/[0.08] lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8"></div>
                
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 px-1">Menu</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {navItems.slice(5).map((item) => (
                    <button 
                      key={item.value} 
                      onClick={() => { setCurrentScreen(item.value); setMobileMenuOpen(false); }}
                      className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-zinc-900 border border-white/5 active:scale-95 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400">
                         <item.icon size={20} />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300">{item.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 font-medium active:scale-98 transition-transform"
                >
                  <LogOut size={18} />
                  Sair da conta
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PremiumProvider>
  );
}

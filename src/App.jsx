import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";

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
import Navbar from "./components/Navbar.jsx";
import CheckoutProPage from "./screens/CheckoutProPage.jsx";
import CheckoutUltraPage from "./screens/CheckoutUltraPage.jsx";
import BillingScreen from "./screens/BillingScreen.jsx";

import { subscriptionEngine } from "./lib/subscriptionEngine";
import { PremiumProvider } from "./context/PremiumContext.jsx";

import {
  Flame,
  Home as HomeIcon,
  Dumbbell,
  Apple,
  TrendingUp,
  LogOut,
  Sparkles,
  Target,
  Activity,
  CreditCard,
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

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: "easeOut" },
};

function getFriendlyName(user) {
  if (!user) return "Atleta";
  if (user.displayName?.trim()) return user.displayName.trim();

  const raw = user.email?.split("@")[0] ?? "atleta";
  return raw
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "verifyEmail") {
    return <EmailActionHandler />;
  }

  useEffect(() => {
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
    const status = params.get("status");
    
    if (status === "sucesso" && user) {
      const tentativas = [1000, 3000, 5000, 10000];
      
      tentativas.forEach((delay) => {
        setTimeout(async () => {
          try {
            const result = await subscriptionEngine(user.uid);
            
            if (result.plano !== "free") {
              setUserPlan(result.plano);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (err) {
            console.error("Erro ao recarregar plano:", err);
          }
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

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200">
        Carregando Fyzen...
      </div>
    );
  }

  if (!user) return <LoginScreen onLoginSuccess={setUser} />;

  if (user && !user.emailVerified)
    return <VerifyEmailScreen onVerified={setUser} />;

  const friendlyName = getFriendlyName(user);
  const isAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL;

  const navItems = [
    { icon: HomeIcon, label: "Início", value: SCREENS.HOME },
    { icon: Dumbbell, label: "Treino", value: SCREENS.PLAN },
    { icon: Apple, label: "Alimentação", value: SCREENS.NUTRITION },
    { icon: TrendingUp, label: "Progresso", value: SCREENS.PROGRESS },
    { icon: Target, label: "Metas", value: SCREENS.GOALS },
    {
      icon: Sparkles,
      label: userPlan !== "free" ? "Seu plano" : "Premium",
      value: SCREENS.PREMIUM,
      highlight: userPlan !== "free",
    },
    { icon: CreditCard, label: "Minha assinatura", value: SCREENS.BILLING },
  ];

  if (userPlan?.toLowerCase() === "ultra") {
    navItems.splice(2, 0, {
      icon: Activity,
      label: "Painel Ultra",
      value: SCREENS.ULTRA_DASHBOARD,
    });
  }

  if (isAdmin) {
    navItems.push({ icon: Flame, label: "Admin", value: SCREENS.ADMIN });
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return <HomeScreen friendlyName={friendlyName} />;
      case SCREENS.PLAN:
        return <PlanScreen />;
      case SCREENS.NUTRITION:
        return <NutritionScreen user={user} userPlan={userPlan} />;
      case SCREENS.PROGRESS:
        return <ProgressScreen userPlan={userPlan} />;
      case SCREENS.GOALS:
        return <GoalsScreen />;
      case SCREENS.PREMIUM:
        return (
          <PremiumPage
            user={user}
            userPlan={userPlan}
            onPlanChange={setUserPlan}
            onSelectScreen={setCurrentScreen}
          />
        );
      case SCREENS.BILLING:
        return <BillingScreen onSelectScreen={setCurrentScreen} />;
      case SCREENS.CHECKOUT_PRO:
        return <CheckoutProPage onSelectScreen={setCurrentScreen} />;
      case SCREENS.CHECKOUT_ULTRA:
        return <CheckoutUltraPage onSelectScreen={setCurrentScreen} />;
      case SCREENS.ADMIN:
        return isAdmin ? (
          <AdminScreen user={user} isAdmin={true} />
        ) : (
          <p className="text-slate-300">
            Você não tem acesso ao painel administrativo.
          </p>
        );
      case SCREENS.ULTRA_DASHBOARD:
        return <UltraDashboardProtected onSelectScreen={setCurrentScreen} />;
      default:
        return <HomeScreen friendlyName={friendlyName} />;
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200">
        Carregando plano Premium...
      </div>
    );
  }

  return (
    <PremiumProvider userPlan={userPlan}>
      <div className="relative min-h-screen flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8 overflow-hidden">
        {/* Fundo */}
        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.15),transparent_60%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.15),transparent_60%)] pointer-events-none" />

        {/* BOX PRINCIPAL */}
<div className="max-w-[1400px] w-full mx-auto relative rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden min-h-[85vh]">

  <div className="flex flex-col sm:flex-row h-full">
    {/* SIDEBAR */}
    <aside className="w-full sm:w-[280px] border-b sm:border-r border-white/10 bg-slate-950/40 backdrop-blur-lg flex flex-col sm:flex-shrink-0 h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-400/20 border border-teal-300/30">
            <Flame className="w-5 h-5 text-teal-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Fyzen
            </p>
            <p className="font-semibold text-sm text-slate-50 truncate max-w-[150px]">
              {friendlyName.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação – ocupa o meio e empurra o footer para baixo */}
      <div className="flex-1 p-5 overflow-y-auto">
        <Navbar
          items={navItems}
          active={currentScreen}
          onSelect={setCurrentScreen}
          className="hidden sm:flex"
        />
      </div>

      {/* Footer encostado no fundo da sidebar */}
      <div className="p-5 border-t border-white/10 text-xs text-slate-400 space-y-2">
        <p>
          Plano atual:{" "}
          <span className="text-teal-300 font-medium uppercase">
            {String(userPlan).toUpperCase()}
          </span>
        </p>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>

    {/* CONTEÚDO */}
    <main className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scroll pb-28 sm:pb-7">
      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} {...fadeSlide}>
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </main>
  </div>
</div>

        {/* Navbar mobile */}
        <div className="fixed bottom-2 inset-x-3 sm:hidden z-20 pb-[env(safe-area-inset-bottom)]">
          <div className="glass-card rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl px-2 py-1.5">
            <div className="flex items-stretch gap-1 overflow-x-auto no-scrollbar overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() => setCurrentScreen(item.value)}
                    className={`flex flex-col items-center justify-center shrink-0 min-w-[72px] px-2 py-2 rounded-xl text-[11px] leading-none gap-1 transition whitespace-nowrap ${
                      isActive
                        ? "bg-teal-400/20 text-teal-300"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PremiumProvider>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

const PremiumContext = createContext({
  nivel: "free",
  isFree: true,
  isPro: false,
  isUltra: false,
});

export function PremiumProvider({ children }) {
  const [nivel, setNivel] = useState("free");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setNivel("free");
        return;
      }

      const ref = doc(db, "assinaturas", user.uid);

      const unsubSub = onSnapshot(ref, (snap) => {
        const data = snap.data();

        if (!data || !data.ativo) {
          setNivel("free");
          return;
        }

        // ✅ VALIDA EXPIRAÇÃO IGUAL AO subscriptionEngine
        const agora = Date.now();
        const naoExpirado = typeof data.renovaEm !== "number" || data.renovaEm > agora;

        if (!naoExpirado) {
          console.warn("⚠️ Plano expirado detectado no PremiumContext");
          setNivel("free");
          return;
        }

        const plano = String(data.plano || "free").toLowerCase();
        setNivel(plano);
      });

      return () => unsubSub();
    });

    return () => unsub();
  }, []);

  const value = {
    nivel,
    isFree: nivel === "free",
    isPro: nivel === "pro" || nivel === "ultra",
    isUltra: nivel === "ultra",
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}

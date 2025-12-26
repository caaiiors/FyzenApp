import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

const PremiumContext = createContext({
  nivel: "free",
  isFree: true,
  isPro: false,
  isUltra: false,
});

export function PremiumProvider({ children }) {
  const [nivel, setNivel] = useState("free");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setNivel("free");
        return;
      }

      // 🔥 Checa primeiro o users/{uid}.plan
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userPlan = userSnap.exists() ? userSnap.data().plan : "free";

        if (userPlan === "ultra") {
          setNivel("ultra");
          // continua ouvindo assinaturas só para caso deseje rebaixar depois
        }
      } catch (e) {
        console.warn("Erro ao ler users plan:", e);
      }

      const ref = doc(db, "assinaturas", user.uid);

      const unsubSub = onSnapshot(ref, (snap) => {
        const data = snap.data();

        if (!data || !data.ativo) {
          // se users.plan já é ultra, mantém ultra; senão free
          setNivel((prev) => (prev === "ultra" ? "ultra" : "free"));
          return;
        }

        const agora = Date.now();
        const naoExpirado =
          typeof data.renovaEm !== "number" || data.renovaEm > agora;

        if (!naoExpirado) {
          console.warn("⚠️ Plano expirado detectado no PremiumContext");
          setNivel((prev) => (prev === "ultra" ? "ultra" : "free"));
          return;
        }

        const planoAssinatura = String(data.plano || "free").toLowerCase();

        // se o users.plan for ultra, mantemos ultra mesmo que assinatura diga free
        setNivel((prev) =>
          prev === "ultra" ? "ultra" : planoAssinatura
        );
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

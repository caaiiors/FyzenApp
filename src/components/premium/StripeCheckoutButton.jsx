// src/components/premium/StripeCheckoutButton.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { iniciarCheckoutStripe } from "../../lib/stripeService";

export default function StripeCheckoutButton({ priceId, plano = "pro" }) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log("🔥 Firebase Auth user carregado:", user);
    });

    return () => unsub();
  }, []);

  const handleClick = async () => {
    try {
      if (!currentUser) {
        alert("Você precisa estar logado para assinar.");
        return;
      }

      setLoading(true);

      await iniciarCheckoutStripe({
        priceId,
        uid: currentUser.uid,
        email: currentUser.email,
        plano,
      });
    } catch (err) {
      console.error("Erro Stripe:", err);
      alert("Erro ao iniciar o checkout.");
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all disabled:opacity-50 justify-center w-full flex"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Redirecionando..." : "Assinar com Stripe"}
    </button>
  );
}

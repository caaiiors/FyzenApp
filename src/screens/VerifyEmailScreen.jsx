import React, { useState } from "react";
import { auth } from "../lib/firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import { Sparkles } from "lucide-react";

export default function VerifyEmailScreen({ onVerified }) {
  const [error, setError] = useState("");

async function checkVerification() {
  try {
    await auth.currentUser.reload();

    if (auth.currentUser && auth.currentUser.emailVerified) {
      onVerified(auth.currentUser);

      window.location.reload();
    } else {
      setError("Seu email ainda não foi verificado.");
    }
  } catch (err) {
    setError("Erro ao verificar.");
  }
}

  async function resendEmail() {
    try {
      await sendEmailVerification(auth.currentUser);
      setError("Novo email enviado!");
    } catch (err) {
      setError("Erro ao reenviar email.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a,#0e1e33,#0f2938)] opacity-90" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <Sparkles className="text-teal-300 w-10 h-10 mb-4 relative z-10" />

      <h1 className="text-2xl font-semibold text-white relative z-10">
        Verifique seu e-mail 📬
      </h1>

      <p className="text-slate-300 mt-2 max-w-sm relative z-10">
        Enviamos um link de verificação para seu e-mail.<br />
        Clique no link e depois volte aqui.
      </p>
      <p className="text-slate-300 mt-2 max-w-sm relative z-10">
        Cheque sua caixa de spam.
      </p>

      {error && (
        <p className="text-red-400 mt-3 text-sm relative z-10">{error}</p>
      )}

      <button
        onClick={checkVerification}
        className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-300 to-purple-300 text-black font-medium relative z-10 hover:brightness-105"
      >
        Já verifiquei meu e-mail
      </button>

      <p
        onClick={resendEmail}
        className="mt-4 text-sm text-teal-300 underline cursor-pointer relative z-10 hover:text-teal-200 transition"
      >
        Reenviar email de verificação
      </p>
      <p
        onClick={() => auth.signOut()}
        className="mt-4 text-sm text-purple-300 underline cursor-pointer relative z-10 hover:text-purple-200 transition"
      >
        Colocou o e-mail errado? Clique aqui e insira outro.
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { auth } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import Card from "../components/Card";
import Button from "../components/Button";

export default function LoginScreen({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function createUserDataIfMissing(user) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      plan: "free",
      createdAt: Date.now(),
    });
  }
}

  const provider = new GoogleAuthProvider();

  
async function forgotPassword() {
    if (!email) {
      setError("Digite seu email primeiro.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Enviamos um link de recuperação para seu email!");
    } catch (err) {
      setError("Não foi possível enviar o email.");
    }
  }
  async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    onLoginSuccess(user);
  } catch (err) {
    setError("Erro ao tentar logar com o Google");
  }
}


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    if (isRegistering) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (name.trim()) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }

      await createUserDataIfMissing(userCredential.user);
      await sendEmailVerification(userCredential.user);

      setTimeout(() => {
        onLoginSuccess(userCredential.user);
      }, 300);

      return;
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await createUserDataIfMissing(userCredential.user);

    onLoginSuccess(userCredential.user);

  } catch (err) {
    console.error(err);
    setError("❌ " + (err.message || "Erro ao autenticar"));
  } finally {
    setLoading(false);
  }
};


  // Substitua o return principal por:
return (
  <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-glow-teal mb-4"
        >
          <Flame className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Fyzen
        </h1>
        <p className="text-slate-400 text-sm">
          {isRegistering 
            ? "Crie sua conta para começar sua transformação" 
            : "Entre para continuar sua jornada fitness"}
        </p>
      </div>

      <Card elevated className="p-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="input-style"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span>Senha</span>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Esqueci minha senha
                </button>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-style"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            {isRegistering ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-slate-900/80 text-slate-400">
              ou continue com
            </span>
          </div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="ml-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            {isRegistering ? "Entrar" : "Criar conta"}
          </button>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-500">
        🔒 Suas informações são protegidas por criptografia de ponta a ponta
      </p>
    </motion.div>
  </div>
);
}

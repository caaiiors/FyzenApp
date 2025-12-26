import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function subscriptionEngine(uid) {
  try {
    const ref = doc(db, "assinaturas", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { plano: "free" };
    }

    const data = snap.data();
    const agora = Date.now();

    const ativo = data.ativo !== false;
    const naoExpirado =
      typeof data.renovaEm !== "number" || data.renovaEm > agora;

    if (!ativo || !naoExpirado) {
      return { plano: "free" };
    }

    const rawPlano = typeof data.plano === "string" ? data.plano : "free";
    const plano = rawPlano.toLowerCase();
    
    return { plano };
  } catch (err) {
    return { plano: "free" };
  }
}

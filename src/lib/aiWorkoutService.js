const API_URL =
  import.meta.env.VITE_AI_WORKOUT_API_URL ||
  "https://fyzenbackend.onrender.com/api";

// --------- GERAR SEMANA COMPLETA ----------
export async function gerarPlanoSemanaIA(form) {
  try {
    const res = await fetch(`${API_URL}/workout/week`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form }),
    });

    const data = await res.json().catch(() => ({}));

    console.log("📩 IA /workout/week status:", res.status);
    console.log("📩 IA /workout/week payload:", data);

    if (!res.ok)
      throw new Error(
        data.error || "Erro ao gerar plano semanal via IA"
      );

    // backend retorna { treinosSemana: [...] }
    return data.treinosSemana || null;
  } catch (err) {
    console.error("Erro IA semana:", err);
    return null;
  }
}

// --------- REGENERAR DIA ----------
export async function regenerarDiaIA(form, dia, gruposAtuais) {
  try {
    const res = await fetch(`${API_URL}/workout/day`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, dia, gruposAtuais }),
    });

    const data = await res.json().catch(() => ({}));

    console.log("📩 IA /workout/day status:", res.status);
    console.log("📩 IA /workout/day payload:", data);

    if (!res.ok)
      throw new Error(data.error || "Erro ao regenerar dia via IA");

    // backend retorna { grupos: [...] }
    return data.grupos || null;
  } catch (err) {
    console.error("Erro IA dia:", err);
    return null;
  }
}

// --------- REGENERAR SEMANA (ALIAS / COMPATIBILIDADE) ----------
export async function regenerarSemanaIA(form) {
  return await gerarPlanoSemanaIA(form);
}
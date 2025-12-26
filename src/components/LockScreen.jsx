export default function LockScreen({ title, description, onUpgrade }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">

      <div className="max-w-md glass-card rounded-3xl p-8 bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">

        <h2 className="text-2xl font-bold text-slate-50">{title}</h2>

        <p className="text-slate-300">{description}</p>

        <button
          onClick={onUpgrade}
          className="w-full py-2 rounded-xl bg-teal-500/20 border border-teal-300/30 text-teal-300 hover:bg-teal-500/30 transition"
        >
          Ver planos premium
        </button>

      </div>
    </div>
  );
}

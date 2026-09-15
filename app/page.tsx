export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        HardZ <span className="text-[#4f7cff]">Leads</span>
      </h1>
      <p className="max-w-xl text-lg text-slate-300">
        Busque empresas em todo o mundo, qualifique automaticamente os leads sem site,
        gere mensagens individuais com IA e controle seu funil de prospecção.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-xl bg-[#4f7cff] px-6 py-3 font-semibold text-white transition hover:bg-[#3d66e0]"
        >
          Entrar / Criar conta
        </a>
      </div>
    </main>
  );
}

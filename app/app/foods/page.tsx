"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-browser";

// ─── Types ────────────────────────────────────────────────────────────────────
type FoodResult = {
  osmId: string;
  nome: string;
  categoria: string;
  cidade: string;
  pais: string;
  telefone: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  fonte: string;
  score: number;
  nivel: "quente" | "morno" | "frio";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFonteStyle(fonte: string) {
  if (fonte.includes("ifood"))
    return { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)", color: "#ef4444", label: "iFood" };
  if (fonte.includes("uber"))
    return { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)", color: "#22c55e", label: "UberEats" };
  if (fonte.includes("glovo"))
    return { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.35)", color: "#eab308", label: "Glovo" };
  if (fonte.includes("tripadvisor"))
    return { bg: "rgba(52,224,161,0.15)", border: "rgba(52,224,161,0.35)", color: "#34e0a1", label: "TripAdvisor" };
  if (fonte.includes("rappi"))
    return { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.35)", color: "#f97316", label: "Rappi" };
  if (fonte.includes("overpass"))
    return { bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", color: "#38bdf8", label: "OpenStreetMap" };
  return { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", color: "#94a3b8", label: fonte };
}

// ─── Animation variants ───────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const formVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } },
};

const errorVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
};

const resultsVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const cardVariants = (i: number) => ({
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.045, duration: 0.38,  },
  },
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function FoodsRadarPage() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultados, setResultados] = useState<FoodResult[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());
  const [salvandoTodos, setSalvandoTodos] = useState(false);

  // ── Business logic (unchanged) ─────────────────────────────────────────────
  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    setResultados(null);
    setSalvos(new Set());
    const res = await fetch("/api/buscar-foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicho, cidade }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) return setErro(json.erro || "Erro na busca");
    setResultados(json.resultados);
  }

  async function salvar(emp: FoodResult) {
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb
      .from("leads")
      .insert({
        user_id: user.id,
        nome: emp.nome,
        categoria: emp.categoria,
        cidade: emp.cidade,
        pais: emp.pais,
        telefone: emp.telefone,
        website: emp.website,
        instagram: emp.instagram,
        email: emp.email,
        fonte: emp.fonte,
        osm_id: emp.osmId,
        score: emp.score,
        nivel: emp.nivel,
      })
      .select("id")
      .single();
    if (!error && data) setSalvos((s) => new Set(s).add(emp.osmId));
    else if (error)
      setErro(error.code === "23505" ? `${emp.nome} já está salvo` : error.message);
  }

  async function salvarTodos() {
    if (!resultados) return;
    const naoSalvos = resultados.filter((e) => !salvos.has(e.osmId));
    if (naoSalvos.length === 0) return;
    setSalvandoTodos(true);
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setSalvandoTodos(false);
      return;
    }
    for (const emp of naoSalvos) {
      const { error } = await sb.from("leads").insert({
        user_id: user.id,
        nome: emp.nome,
        categoria: emp.categoria,
        cidade: emp.cidade,
        pais: emp.pais,
        telefone: emp.telefone,
        website: emp.website,
        instagram: emp.instagram,
        email: emp.email,
        fonte: emp.fonte,
        osm_id: emp.osmId,
        score: emp.score,
        nivel: emp.nivel,
      });
      if (!error || error.code === "23505")
        setSalvos((s) => new Set(s).add(emp.osmId));
    }
    setSalvandoTodos(false);
  }

  const naoSalvosCount = resultados
    ? resultados.filter((e) => !salvos.has(e.osmId)).length
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div variants={pageVariants} initial="hidden" animate="visible">
        <p className="eyebrow" style={{ color: "#f97316" }}>
          Food Intelligence
        </p>
        <h1
          className="headline mt-1 text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, #ff6b35, #f7931e, #ff4b4b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Radar Foods 🍕
        </h1>
        <p
          className="mono mt-1 text-[11px] uppercase tracking-widest"
          style={{ color: "var(--ink-dim)" }}
        >
          iFood · UberEats · Glovo · Rappi · TripAdvisor · OpenStreetMap Global
        </p>
      </motion.div>

      {/* ── Search Form ─────────────────────────────────────────────────────── */}
      <motion.form
        onSubmit={buscar}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="panel mt-6 flex flex-wrap gap-2 rounded-2xl p-3"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <AnimatePresence>
          {carregando && (
            <motion.div
              key="progress"
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 8, ease: "easeInOut" }}
              style={{
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                height: 2,
                background: "linear-gradient(90deg, #ff6b35, #f7931e, #ff4b4b)",
                transformOrigin: "left",
                borderRadius: 999,
              }}
            />
          )}
        </AnimatePresence>

        <input
          value={nicho}
          onChange={(e) => setNicho(e.target.value)}
          placeholder="Nicho (ex: Hamburgueria, Sushi, Pizzaria…)"
          className="field mono min-w-44 flex-1 text-xs"
        />
        <input
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade (ex: São Paulo, Roma, Mundial)"
          className="field mono min-w-36 text-xs"
        />

        <motion.button
          type="submit"
          disabled={carregando}
          whileHover={
            carregando
              ? {}
              : {
                  y: -2,
                  boxShadow: "0 6px 0 #9a3900, 0 12px 28px rgba(249,115,22,0.5)",
                }
          }
          whileTap={carregando ? {} : { y: 2, boxShadow: "0 2px 0 #9a3900" }}
          style={{
            background: carregando
              ? "rgba(249,115,22,0.3)"
              : "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.5rem 1.25rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: carregando ? "not-allowed" : "pointer",
            boxShadow: "0 4px 0 #9a3900, 0 6px 20px rgba(249,115,22,0.4)",
            transition: "box-shadow 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            whiteSpace: "nowrap",
          }}
        >
          {carregando ? (
            <>
              <span
                className="pulse-dot"
                style={{ background: "#f97316", display: "inline-block" }}
              />
              Caçando…
            </>
          ) : (
            "🍕 Caçar Delivery"
          )}
        </motion.button>
      </motion.form>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {erro && (
          <motion.p
            key="error"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mono mt-4 rounded-xl px-4 py-2.5 text-xs"
            style={{
              border: "1px solid rgba(255,93,93,0.4)",
              background: "rgba(255,93,93,0.1)",
              color: "var(--alert)",
            }}
          >
            ⚠ {erro}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Loading radar ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {carregando && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="panel mt-6 rounded-2xl py-16 text-center"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="radar" style={{ width: 80, height: 80 }}>
                <div className="radar-sweep" />
                <span
                  className="blip"
                  style={{ left: "30%", top: "40%", animationDelay: "0.5s" }}
                />
                <span
                  className="blip"
                  style={{
                    left: "65%",
                    top: "55%",
                    animationDelay: "1.5s",
                    background: "#f97316",
                    boxShadow: "0 0 6px #f97316",
                  }}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p
                  className="mono text-xs uppercase tracking-widest"
                  style={{ color: "var(--ink-dim)" }}
                >
                  <span
                    className="pulse-dot mr-2 inline-block align-middle"
                    style={{ background: "#f97316" }}
                  />
                  Varrendo apps de delivery globais…
                </p>
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#f97316" }}
                >
                  iFood · UberEats · Glovo · Rappi · TripAdvisor
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {resultados && !carregando && (
          <motion.div
            key="results"
            variants={resultsVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Toolbar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p
                className="mono text-[11px] uppercase tracking-widest"
                style={{ color: "var(--ink-dim)" }}
              >
                <span style={{ color: "#f97316" }}>●</span>{" "}
                {resultados.length} restaurantes detectados
              </p>

              <motion.button
                onClick={salvarTodos}
                disabled={salvandoTodos || naoSalvosCount === 0}
                whileHover={
                  salvandoTodos || naoSalvosCount === 0
                    ? {}
                    : {
                        y: -2,
                        borderColor: "rgba(249,115,22,0.65)",
                        boxShadow:
                          "0 5px 0 rgba(249,115,22,0.25), 0 15px 40px rgba(249,115,22,0.12)",
                      }
                }
                whileTap={
                  salvandoTodos || naoSalvosCount === 0 ? {} : { y: 2 }
                }
                style={{
                  background: "transparent",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.35)",
                  borderRadius: "0.75rem",
                  padding: "0.45rem 1.1rem",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor:
                    salvandoTodos || naoSalvosCount === 0
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    "0 3px 0 rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                  opacity: naoSalvosCount === 0 ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {salvandoTodos
                  ? "Salvando…"
                  : `+ Salvar todos (${naoSalvosCount})`}
              </motion.button>
            </div>

            {/* Cards */}
            <div className="mt-3 flex flex-col gap-3">
              {resultados.length === 0 && (
                <div className="panel rounded-2xl py-16 text-center">
                  <p
                    className="mono text-xs uppercase tracking-widest"
                    style={{ color: "var(--ink-dim)" }}
                  >
                    Nenhum restaurante encontrado. Tente outros termos.
                  </p>
                </div>
              )}

              {resultados.map((emp, i) => {
                const salvo = salvos.has(emp.osmId);
                const fonteInfo = getFonteStyle(emp.fonte);
                return (
                  <motion.div
                    key={emp.osmId}
                    variants={cardVariants(i)}
                    initial="hidden"
                    animate="visible"
                    className="panel panel-hover rounded-2xl p-4 flex flex-wrap items-center gap-3"
                    style={{
                      borderLeft: `3px solid ${fonteInfo.color}`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* accent glow stripe */}
                    <div
                      style={{
                        position: "absolute",
                        insetBlock: 0,
                        left: 0,
                        width: 3,
                        background: `linear-gradient(180deg, ${fonteInfo.color}, transparent)`,
                        opacity: 0.6,
                        borderRadius: "4px 0 0 4px",
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className="font-semibold tracking-tight"
                          style={{ color: "var(--ink)" }}
                        >
                          {emp.nome}
                        </h2>

                        <span
                          className="mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest border"
                          style={{
                            background: fonteInfo.bg,
                            borderColor: fonteInfo.border,
                            color: fonteInfo.color,
                          }}
                        >
                          {fonteInfo.label}
                        </span>

                        {emp.email && (
                          <span
                            className="mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest border"
                            style={{
                              background: "rgba(56,189,248,0.1)",
                              borderColor: "rgba(56,189,248,0.3)",
                              color: "#38bdf8",
                            }}
                          >
                            ✉ Email
                          </span>
                        )}

                        {emp.nivel === "quente" && (
                          <span
                            className="mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest border"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              borderColor: "rgba(239,68,68,0.3)",
                              color: "#ef4444",
                            }}
                          >
                            🔥 Quente
                          </span>
                        )}
                      </div>

                      <p
                        className="mono mt-1 text-[11px]"
                        style={{ color: "var(--ink-dim)" }}
                      >
                        {emp.cidade}
                        {emp.pais ? ` · ${emp.pais}` : ""}
                        {emp.website && (
                          <a
                            href={emp.website}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 font-semibold hover:underline"
                            style={{ color: fonteInfo.color }}
                          >
                            ↗ Ver no app
                          </a>
                        )}
                      </p>
                    </div>

                    <motion.button
                      onClick={() => salvar(emp)}
                      disabled={salvo}
                      whileHover={
                        salvo
                          ? {}
                          : {
                              y: -2,
                              boxShadow:
                                "0 6px 0 #9a3900, 0 12px 28px rgba(249,115,22,0.5)",
                            }
                      }
                      whileTap={
                        salvo ? {} : { y: 2, boxShadow: "0 2px 0 #9a3900" }
                      }
                      style={
                        salvo
                          ? {
                              background: "rgba(56,189,248,0.1)",
                              color: "#38bdf8",
                              border: "1px solid rgba(56,189,248,0.25)",
                              borderRadius: "0.65rem",
                              padding: "0.4rem 1rem",
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              cursor: "default",
                              boxShadow: "none",
                              whiteSpace: "nowrap",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #f97316, #ea580c)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "0.65rem",
                              padding: "0.4rem 1rem",
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow:
                                "0 4px 0 #9a3900, 0 6px 20px rgba(249,115,22,0.4)",
                              transition: "box-shadow 0.15s ease",
                              whiteSpace: "nowrap",
                            }
                      }
                    >
                      {salvo ? "✓ Travado" : "+ Travar Alvo"}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

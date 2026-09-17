"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-browser";

// ─── Types ────────────────────────────────────────────────────────────────────
type InstaResult = {
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
  if (fonte.includes("instagram"))
    return {
      bg: "rgba(131,58,180,0.15)",
      border: "rgba(131,58,180,0.35)",
      color: "#833ab4",
      label: "Instagram",
    };
  if (fonte.includes("facebook"))
    return {
      bg: "rgba(24,119,242,0.15)",
      border: "rgba(24,119,242,0.35)",
      color: "#1877f2",
      label: "Facebook",
    };
  if (fonte.includes("overpass"))
    return {
      bg: "rgba(45,255,180,0.12)",
      border: "rgba(45,255,180,0.3)",
      color: "#2dffb4",
      label: "OpenStreetMap",
    };
  return {
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
    color: "#94a3b8",
    label: fonte,
  };
}

// Instagram gradient helper for reuse
const IG_GRADIENT = "linear-gradient(135deg, #833ab4, #d6249f, #fcaf45)";
const IG_SHADOW_DARK = "#4a1a6e";

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
export default function InstaRadarPage() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultados, setResultados] = useState<InstaResult[] | null>(null);
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
    const res = await fetch("/api/buscar-insta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicho, cidade }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) return setErro(json.erro || "Erro na busca");
    setResultados(json.resultados);
  }

  async function salvar(emp: InstaResult) {
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
      setErro(
        error.code === "23505" ? `${emp.nome} já está salvo` : error.message
      );
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
        <p className="eyebrow" style={{ color: "#d6249f" }}>
          Social Intelligence
        </p>
        <h1
          className="headline mt-1 text-3xl font-bold"
          style={{
            background: IG_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Radar Insta 📸
        </h1>
        <p
          className="mono mt-1 text-[11px] uppercase tracking-widest"
          style={{ color: "var(--ink-dim)" }}
        >
          Instagram · Facebook · OpenStreetMap Global
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
                background: IG_GRADIENT,
                transformOrigin: "left",
                borderRadius: 999,
              }}
            />
          )}
        </AnimatePresence>

        <input
          value={nicho}
          onChange={(e) => setNicho(e.target.value)}
          placeholder="Nicho (ex: Barbearia, Estúdio de Tatuagem…)"
          className="field mono min-w-44 flex-1 text-xs"
        />
        <input
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade (ex: São Paulo, Lisboa, Mundial)"
          className="field mono min-w-36 text-xs"
        />

        {/* 3D Instagram button */}
        <motion.button
          type="submit"
          disabled={carregando}
          whileHover={
            carregando
              ? {}
              : {
                  y: -2,
                  boxShadow: `0 6px 0 ${IG_SHADOW_DARK}, 0 12px 28px rgba(214,36,159,0.5)`,
                }
          }
          whileTap={
            carregando
              ? {}
              : { y: 2, boxShadow: `0 2px 0 ${IG_SHADOW_DARK}` }
          }
          style={{
            background: carregando ? "rgba(131,58,180,0.3)" : IG_GRADIENT,
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.5rem 1.25rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: carregando ? "not-allowed" : "pointer",
            boxShadow: `0 4px 0 ${IG_SHADOW_DARK}, 0 6px 20px rgba(214,36,159,0.4)`,
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
                style={{ background: "#d6249f", display: "inline-block" }}
              />
              Caçando…
            </>
          ) : (
            "📸 Caçar Perfis"
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
                  style={{
                    left: "30%",
                    top: "40%",
                    animationDelay: "0.5s",
                    background: "#833ab4",
                    boxShadow: "0 0 6px #833ab4",
                  }}
                />
                <span
                  className="blip"
                  style={{
                    left: "65%",
                    top: "55%",
                    animationDelay: "1.5s",
                    background: "#fcaf45",
                    boxShadow: "0 0 6px #fcaf45",
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
                    style={{ background: "#d6249f" }}
                  />
                  Varrendo perfis no Instagram…
                </p>
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#d6249f" }}
                >
                  Instagram · Facebook · OpenStreetMap
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
                <span style={{ color: "#d6249f" }}>●</span>{" "}
                {resultados.length} perfis detectados
              </p>

              {/* 3D ghost button — IG theme */}
              <motion.button
                onClick={salvarTodos}
                disabled={salvandoTodos || naoSalvosCount === 0}
                whileHover={
                  salvandoTodos || naoSalvosCount === 0
                    ? {}
                    : {
                        y: -2,
                        borderColor: "rgba(214,36,159,0.65)",
                        boxShadow:
                          "0 5px 0 rgba(214,36,159,0.25), 0 15px 40px rgba(214,36,159,0.12)",
                      }
                }
                whileTap={
                  salvandoTodos || naoSalvosCount === 0 ? {} : { y: 2 }
                }
                style={{
                  background: "transparent",
                  color: "#d6249f",
                  border: "1px solid rgba(214,36,159,0.35)",
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
                    "0 3px 0 rgba(214,36,159,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
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
                    Nenhum perfil encontrado. Tente outros termos.
                  </p>
                </div>
              )}

              {resultados.map((emp, i) => {
                const salvo = salvos.has(emp.osmId);
                const fonteInfo = getFonteStyle(emp.fonte);
                // Build Instagram URL if handle available
                const igHandle = emp.instagram
                  ? emp.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")
                  : null;
                const igUrl = igHandle
                  ? `https://www.instagram.com/${igHandle}/`
                  : null;

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
                    {/* IG gradient accent stripe */}
                    <div
                      style={{
                        position: "absolute",
                        insetBlock: 0,
                        left: 0,
                        width: 3,
                        background: IG_GRADIENT,
                        opacity: 0.7,
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

                        {/* Fonte badge */}
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

                        {/* Email badge */}
                        {emp.email && (
                          <span
                            className="mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest border"
                            style={{
                              background: "rgba(45,255,180,0.1)",
                              borderColor: "rgba(45,255,180,0.3)",
                              color: "#2dffb4",
                            }}
                          >
                            ✉ Email
                          </span>
                        )}

                        {/* Instagram handle badge */}
                        {igHandle && (
                          <span
                            className="mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest border"
                            style={{
                              background: "rgba(131,58,180,0.12)",
                              borderColor: "rgba(131,58,180,0.3)",
                              color: "#833ab4",
                            }}
                          >
                            @{igHandle}
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
                        {igUrl && (
                          <a
                            href={igUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 font-semibold hover:underline"
                            style={{ color: "#d6249f" }}
                          >
                            ↗ Ver no Instagram
                          </a>
                        )}
                      </p>
                    </div>

                    {/* Save button — IG 3D */}
                    <motion.button
                      onClick={() => salvar(emp)}
                      disabled={salvo}
                      whileHover={
                        salvo
                          ? {}
                          : {
                              y: -2,
                              boxShadow: `0 6px 0 ${IG_SHADOW_DARK}, 0 12px 28px rgba(214,36,159,0.5)`,
                            }
                      }
                      whileTap={
                        salvo
                          ? {}
                          : { y: 2, boxShadow: `0 2px 0 ${IG_SHADOW_DARK}` }
                      }
                      style={
                        salvo
                          ? {
                              background: "rgba(45,255,180,0.1)",
                              color: "#2dffb4",
                              border: "1px solid rgba(45,255,180,0.25)",
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
                              background: IG_GRADIENT,
                              color: "#fff",
                              border: "none",
                              borderRadius: "0.65rem",
                              padding: "0.4rem 1rem",
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: `0 4px 0 ${IG_SHADOW_DARK}, 0 6px 20px rgba(214,36,159,0.4)`,
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

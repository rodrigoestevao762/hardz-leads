"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup, LeafletMouseEvent } from "leaflet";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";
import { motion, AnimatePresence } from "framer-motion";

type Resultado = {
  osmId: string; nome: string; categoria: string; cidade: string; pais: string;
  lat: number; lng: number;
  telefone: string | null; website: string | null; instagram: string | null; email: string | null;
  endereco: string; score: number; nivel: "quente" | "morno" | "frio";
};

const CORES: Record<Resultado["nivel"], string> = { quente: "#ff5470", morno: "#ffb020", frio: "#9aa5b1" };

export default function MapaPage() {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const camadaRef = useRef<LayerGroup | null>(null);

  const [pronto, setPronto] = useState(false);
  const [cidade, setCidade] = useState("");
  const [cat, setCat] = useState("barbearia");
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [centro, setCentro] = useState<{ cidade: string; pais: string } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvos, setSalvos] = useState<Set<string>>(new Set());
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const ocupadoRef = useRef(false);
  const catRef = useRef(cat);
  catRef.current = cat;

  useEffect(() => {
    let cancel = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancel || !divRef.current || mapRef.current) return;
      const map = L.map(divRef.current, { worldCopyJump: true }).setView([38.7223, -9.1393], 6);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      camadaRef.current = L.layerGroup().addTo(map);
      map.on("click", (e: LeafletMouseEvent) => buscar({ lat: e.latlng.lat, lng: e.latlng.lng }));
      mapRef.current = map;
      setPronto(true);
    })();
    return () => {
      cancel = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buscar(p: { cidade?: string; lat?: number; lng?: number }) {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setCarregando(true); setErro(null); setSelecionado(null); setSalvos(new Set());
    try {
      const res = await fetch("/api/buscar-mapa", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, categoriaId: catRef.current }),
      });
      const json = await res.json();
      if (!res.ok) { setErro(json.erro || "Erro na busca"); return; }
      setResultados(json.resultados);
      setCentro({ cidade: json.cidade, pais: json.pais });
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (map && camadaRef.current) {
        map.flyTo([json.lat, json.lng], p.cidade ? 12 : 13);
        camadaRef.current.clearLayers();
        for (const r of json.resultados as Resultado[]) {
          const cor = CORES[r.nivel];
          const m = L.circleMarker([r.lat, r.lng], {
            radius: 6, color: cor, weight: 2, fillColor: cor, fillOpacity: 0.45,
          });
          m.bindPopup(`<b>${r.nome}</b><br>score ${r.score} · ${r.nivel}`);
          m.on("click", () => destacar(r.osmId));
          camadaRef.current.addLayer(m);
        }
      }
    } finally {
      setCarregando(false);
      ocupadoRef.current = false;
    }
  }

  function destacar(osmId: string) {
    setSelecionado(osmId);
    document.getElementById("emp-" + osmId.replace(/[^\w-]/g, "_"))?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function salvar(emp: Resultado) {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb.from("leads").insert({
      user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
      telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
      fonte: "osm", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
    }).select("id").single();
    if (!error && data) setSalvos((s) => new Set(s).add(emp.osmId));
    else if (error) setErro(error.code === "23505" ? `${emp.nome} já está nos seus leads` : error.message);
  }

  async function salvarTodos() {
    if (!resultados) return;
    const naoSalvos = resultados.filter(e => !salvos.has(e.osmId));
    if (naoSalvos.length === 0) return;
    
    setCarregando(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return setCarregando(false);
    
    for (const emp of naoSalvos) {
      const { error } = await sb.from("leads").insert({
        user_id: user.id, nome: emp.nome, categoria: emp.categoria, cidade: emp.cidade, pais: emp.pais,
        telefone: emp.telefone, website: emp.website, instagram: emp.instagram, email: emp.email,
        fonte: "osm", osm_id: emp.osmId, score: emp.score, nivel: emp.nivel,
      });
      if (!error || error.code === "23505") {
        setSalvos(s => new Set(s).add(emp.osmId));
      }
    }
    setCarregando(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Radar orbital</p>
          <h1 className="headline mt-2 text-2xl font-bold">Mapa mundial</h1>
          <p className="mono mt-2 text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
            escolha o tipo · busque a cidade ou clique no mapa · salve os leads direto no CRM
          </p>
        </div>
      </div>

      {/* Controles */}
      <form onSubmit={(e) => { e.preventDefault(); if (cidade.trim()) buscar({ cidade: cidade.trim() }); }}
        className="panel mb-4 flex flex-wrap gap-2 rounded-2xl p-3 items-center">
        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="field-premium mono rounded-lg px-3 py-2 text-xs outline-none bg-black/40 border border-white/10 text-white min-w-[200px]">
          <option value="todos">Todos os Comércios</option>
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade (ex: Porto, Açailândia...)"
          className="field-premium mono min-w-44 flex-1 rounded-lg px-3 py-2 text-xs outline-none bg-black/40 border border-white/10 text-white" />
        <button type="submit" disabled={carregando || !pronto}
          className="btn-3d btn-3d-primary py-2 px-6 text-[11px]">
          {carregando ? "varrendo..." : "▶ varrer cidade"}
        </button>
      </form>

      <AnimatePresence>
        {(erro || aviso) && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`mono mb-4 rounded-xl px-4 py-2.5 text-xs ${erro
            ? "border border-[var(--alert)]/40 bg-[var(--alert)]/10 text-[var(--alert)]"
            : "border border-[var(--signal)]/30 bg-[var(--signal)]/8 text-[var(--signal)]"}`}>
            ▸ {erro || aviso}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Mapa */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--signal)]/20 shadow-[0_0_20px_rgba(0,255,100,0.05)]">
          <div ref={divRef} className="h-[60vh] min-h-[420px] w-full lg:h-[70vh] bg-[#030603]" />
          <AnimatePresence>
            {carregando && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[500] flex flex-col place-items-center justify-center bg-[rgba(3,6,9,0.7)] backdrop-blur-sm"
              >
                <div className="radar w-16 h-16 mb-4">
                  <div className="radar-sweep" />
                </div>
                <p className="mono text-xs uppercase tracking-widest text-[var(--signal)] drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">
                  consultando rede global...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mono absolute bottom-2 left-2 z-[500] rounded-lg bg-[rgba(3,6,9,0.8)] px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink-dim)] backdrop-blur">
            clique em qualquer ponto para varredura orbital
          </p>
        </div>

        {/* Lista */}
        <div className="w-full lg:w-96 lg:shrink-0">
          {centro && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 mb-2 items-start">
              <p className="mono text-[11px] uppercase tracking-widest text-[var(--signal)] drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">
                📍 {centro.cidade}{centro.pais ? `, ${centro.pais}` : ""} — {resultados?.length} alvos encontrados
              </p>
              {resultados && resultados.length > 0 && (
                <button onClick={salvarTodos} disabled={carregando || resultados.every(e => salvos.has(e.osmId))}
                  className="btn-3d btn-3d-primary py-1.5 px-4 text-[10px]">
                  + salvar todos
                </button>
              )}
            </motion.div>
          )}
          {!resultados && !carregando && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel rounded-2xl border-dashed border-white/10 p-8 text-center bg-black/40 backdrop-blur">
              <p className="mono text-xs uppercase tracking-widest text-[var(--ink-faint)]">
                busque uma cidade acima ou clique no mapa para iniciar
              </p>
            </motion.div>
          )}
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {resultados?.map((emp, index) => {
                const id = "emp-" + emp.osmId.replace(/[^\w-]/g, "_");
                const salvo = salvos.has(emp.osmId);
                return (
                  <motion.div 
                    key={emp.osmId} id={id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className={`panel lead-card rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] ${selecionado === emp.osmId ? "shadow-[0_0_15px_rgba(56,189,248,0.3)] border-[var(--signal)]" : ""}`}
                    style={{ "--lead-color": CORES[emp.nivel] } as any}
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{emp.nome}</h2>
                      <span className="badge shrink-0 border-[var(--line-strong)] bg-white/5 text-[var(--ink-dim)]"
                        style={emp.nivel === "quente" ? { color: CORES.quente, borderColor: "rgba(255,84,112,.5)" } : emp.nivel === "morno" ? { color: CORES.morno, borderColor: "rgba(255,176,32,.5)" } : undefined}>
                        {emp.nivel} · {emp.score}
                      </span>
                    </div>
                    <p className="mono mt-1 truncate text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                      {CATEGORIAS.find((c) => c.id === emp.categoria)?.label || emp.categoria}
                      {emp.telefone ? " · ☎" : ""}{emp.email ? " · ✉" : ""}{emp.instagram ? " · ◆" : ""}
                      {emp.website ? " · ▣ site" : " · sem site ✓"}
                    </p>
                    <button onClick={() => salvar(emp)} disabled={salvo}
                      className={`mt-3 w-full text-[10px] py-1.5 px-3 ${salvo ? "btn-3d btn-3d-ghost opacity-50" : "btn-3d btn-3d-primary"}`}>
                      {salvo ? "✓ SALVO NO CRM" : "+ EXTRAIR ALVO"}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

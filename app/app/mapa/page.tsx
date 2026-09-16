"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup, LeafletMouseEvent } from "leaflet";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { CATEGORIAS } from "@/lib/categorias";

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
    <div>
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
        className="panel mb-4 flex flex-wrap gap-2 rounded-2xl p-3">
        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="field mono rounded-lg px-3 py-2 text-xs">
          {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade (ex: Porto, Açailândia...)"
          className="field mono min-w-44 flex-1 rounded-lg px-3 py-2 text-xs" />
        <button type="submit" disabled={carregando || !pronto}
          className="btn-signal mono rounded-lg px-6 py-2 text-[11px] uppercase tracking-widest disabled:opacity-50">
          {carregando ? "varrendo..." : "▶ varrer cidade"}
        </button>
      </form>

      {(erro || aviso) && (
        <p className={`mono mb-4 rounded-xl px-4 py-2.5 text-xs ${erro
          ? "border border-[var(--alert)]/40 bg-[var(--alert)]/10 text-[var(--alert)]"
          : "border border-[var(--signal)]/30 bg-[var(--signal)]/8 text-[var(--signal)]"}`}>
          ▸ {erro || aviso}
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Mapa */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--line)]">
          <div ref={divRef} className="h-[60vh] min-h-[420px] w-full lg:h-[70vh]" />
          {carregando && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-[rgba(3,6,9,0.55)]">
              <p className="mono text-xs uppercase tracking-widest text-[var(--signal)]">
                <span className="pulse-dot mr-2 inline-block align-middle" /> consultando openstreetmap... (até 20s)
              </p>
            </div>
          )}
          <p className="mono absolute bottom-2 left-2 z-[500] rounded-lg bg-[rgba(3,6,9,0.8)] px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink-dim)]">
            clique em qualquer ponto do mapa para varrer a área
          </p>
        </div>

        {/* Lista */}
        <div className="w-full lg:w-96 lg:shrink-0">
          {centro && (
            <div className="flex flex-col gap-2 mb-2 items-start">
              <p className="mono text-[11px] uppercase tracking-widest text-[var(--ink-dim)]">
                📍 {centro.cidade}{centro.pais ? `, ${centro.pais}` : ""} — {resultados?.length} alvos, melhores primeiro
              </p>
              {resultados && resultados.length > 0 && (
                <button onClick={salvarTodos} disabled={carregando || resultados.every(e => salvos.has(e.osmId))}
                  className="btn-signal mono rounded-lg px-4 py-1.5 text-[10px] uppercase tracking-widest disabled:opacity-50">
                  + salvar todos
                </button>
              )}
            </div>
          )}
          {!resultados && !carregando && (
            <div className="panel rounded-2xl border-dashed p-8 text-center">
              <p className="mono text-xs uppercase tracking-widest text-[var(--ink-faint)]">
                busque uma cidade acima ou clique no mapa
              </p>
            </div>
          )}
          <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
            {resultados?.map((emp) => {
              const id = "emp-" + emp.osmId.replace(/[^\w-]/g, "_");
              const salvo = salvos.has(emp.osmId);
              return (
                <div key={emp.osmId} id={id}
                  className={`panel rounded-xl p-3 transition ${selecionado === emp.osmId ? "shadow-[inset_0_0_0_1px_rgba(45,255,180,0.5)]" : ""}`}>
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
                    className="btn-ghost mono mt-2 w-full rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-widest disabled:opacity-40">
                    {salvo ? "✓ salvo no CRM" : "+ salvar lead"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

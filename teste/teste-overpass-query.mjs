const tags = ["shop=hairdresser", "shop~barber"];
const lat = 38.736946, lng = -9.142685, radiusM = 15000;
const esc = (s) => s;
const around = `(around:${radiusM},${lat},${lng})`;
const selectors = tags.map((t) => {
  if (t.includes("~")) {
    const [k, v] = t.split("~");
    return `nwr["${k}"~"${esc(v)}",i]${around};`;
  }
  const [k, v] = t.split("=");
  return `nwr["${k}"="${esc(v)}"]${around};`;
});
const query = `[out:json][timeout:40];(${selectors.join("")} out center 120;);`;
console.log("QUERY:", query);
const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "HardZLeads/1.0 (prospeccao de empresas)" },
  body: "data=" + encodeURIComponent(query),
});
const body = await res.text();
console.log("STATUS:", res.status);
if (!res.ok) console.log("ERRO:", body.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 600));
else { const j = JSON.parse(body); console.log("ELEMENTOS:", j.elements.length); }

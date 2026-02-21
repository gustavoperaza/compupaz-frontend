"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const fmt = (n:number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
const fmtK = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;
const fmtPct = (n:number) => `${(n * 100).toFixed(1)}%`;

/* ─── Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f1117", border: "1px solid #2a2d3a",
      borderRadius: 10, padding: "10px 16px", fontSize: 13,
    }}>
      <p style={{ color: "#8b8fa8", marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "2px 0", fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ─── KPI Card ─────────────────────────────────────────── */
const KpiCard = ({ label, value, sub, accent, delay = 0 }: { label: string; value: string; sub?: string; accent: string; delay?: number }) => (
  <div style={{
    background: "linear-gradient(135deg, #13151f 0%, #1a1d2e 100%)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: "24px 28px",
    flex: 1,
    minWidth: 160,
    position: "relative",
    overflow: "hidden",
    animation: `fadeUp 0.5s ease ${delay}ms both`,
  }}>
    <div style={{
      position: "absolute", top: -20, right: -20,
      width: 80, height: 80, borderRadius: "50%",
      background: `${accent}18`, filter: "blur(16px)",
    }} />
    <div style={{ position: "absolute", top: 0, left: 0, width: 36, height: 2, background: accent, borderRadius: 1 }} />
    <p style={{ color: "#5a5f7a", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace" }}>
      {label}
    </p>
    <p style={{ color: "#f0f2ff", fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: sub ? 6 : 0 }}>
      {value}
    </p>
    {sub && <p style={{ color: accent, fontSize: 11, fontFamily: "monospace" }}>{sub}</p>}
  </div>
);

/* ─── Chart Card ───────────────────────────────────────── */
const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{
    background: "linear-gradient(135deg, #13151f 0%, #1a1d2e 100%)",
    border: "1px solid #2a2d3a",
    borderRadius: 16,
    padding: "24px 20px",
  }}>
    <h2 style={{ color: "#c8ccee", fontSize: 15, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 3, height: 16, background: "#6c63ff", borderRadius: 2 }} />
      {title}
    </h2>
    {children}
  </div>
);

/* ─── Skeleton ─────────────────────────────────────────── */
const Skeleton = ({ h = 300 }) => (
  <div style={{ height: h, borderRadius: 12, background: "linear-gradient(90deg, #1a1d2e 25%, #22253a 50%, #1a1d2e 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
);

/* ─── Bar Row ──────────────────────────────────────────── */
const BarRow = ({ label, value, max, color, delay = 0 }: { label: string; value: number; max: number; color: string; delay?: number }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 100 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#c8ccee", fontSize: 12 }}>{label}</span>
        <span style={{ color: color, fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 3, background: "#1e2030", borderRadius: 2 }}>
        <div style={{
          height: "100%", width: `${width}%`, borderRadius: 2,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
    </div>
  );
};

/* ─── Date Filter ──────────────────────────────────────── */
const DateFilter = ({ startDate, endDate, onChange }: { startDate: string; endDate: string; onChange: (type: string, val: string) => void }) => {
  const inputStyle = {
    background: "#0f1117", border: "1px solid #2a2d3a",
    borderRadius: 8, color: "#c8ccee",
    padding: "6px 10px", fontSize: 12,
    fontFamily: "monospace", outline: "none", cursor: "pointer",
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ color: "#5a5f7a", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" }}>DESDE</span>
      <input type="date" value={startDate} onChange={(e) => onChange("start", e.target.value)} style={inputStyle} />
      <span style={{ color: "#5a5f7a", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" }}>HASTA</span>
      <input type="date" value={endDate} onChange={(e) => onChange("end", e.target.value)} style={inputStyle} />
    </div>
  );
};

/* ─── MAIN ─────────────────────────────────────────────── */
export default function SalesDashboard() {
  const [resumen, setResumen] = useState(null);
  const [ventasDia, setVentasDia] = useState([]);
  const [margenDia, setMargenDia] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (startDate) p.append("start_date", startDate);
    if (endDate) p.append("end_date", endDate);
    return p.toString();
  }, [startDate, endDate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const query = buildParams();
    try {
      const [r, v, m, p, c] = await Promise.all([
        fetch(`${API}/resumen_general?${query}`).then((r) => r.json()),
        fetch(`${API}/ventas_por_dia?${query}`).then((r) => r.json()),
        fetch(`${API}/margen_por_dia?${query}`).then((r) => r.json()),
        fetch(`${API}/top_productos?limit=5&${query}`).then((r) => r.json()),
        fetch(`${API}/top_clientes?limit=5&${query}`).then((r) => r.json()),
      ]);
      setResumen(r);
      setVentasDia(v);
      setMargenDia(m);
      setTopProductos(p);
      setTopClientes(c);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDateChange = (type, val) => {
    if (type === "start") setStartDate(val);
    else setEndDate(val);
  };

  const combinedDia = ventasDia.map((v) => {
    const m = margenDia.find((d) => String(d.Fecha_Venta) === String(v.Fecha_Venta));
    return { fecha: v.Fecha_Venta, ventas: v.total_ventas, margen: m?.total_margen ?? 0 };
  });

  const maxProducto = topProductos[0]?.total_ventas || 1;
  const maxCliente  = topClientes[0]?.total_compras  || 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b0d14; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0b0d14", padding: "32px 28px", maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#26de81", animation: "pulse 2s ease infinite", boxShadow: "0 0 8px #26de8199" }} />
              <span style={{ color: "#26de81", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em" }}>LIVE ANALYTICS</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: "#f0f2ff", letterSpacing: "-0.02em", lineHeight: 1 }}>
              Sales Dashboard
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* ✅ Filtro de fechas en el header — aplica a TODO */}
            <DateFilter startDate={startDate} endDate={endDate} onChange={handleDateChange} />
            <button
              onClick={fetchAll}
              style={{
                background: "linear-gradient(135deg, #6c63ff, #4ecdc4)",
                border: "none", borderRadius: 10,
                color: "#fff", padding: "8px 18px",
                fontSize: 12, fontFamily: "monospace",
                cursor: "pointer", letterSpacing: "0.08em",
              }}
            >
              ↻ ACTUALIZAR
            </button>
          </div>
        </div>

        {/* ── Indicador de período activo ── */}
        {(startDate || endDate) && (
          <div style={{
            background: "#6c63ff11", border: "1px solid #6c63ff33",
            borderRadius: 8, padding: "8px 16px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#8b8fa8", fontSize: 12, fontFamily: "monospace" }}>
              📅 Mostrando datos del período:{" "}
              <span style={{ color: "#c8ccee" }}>{startDate || "—"}</span>
              {" → "}
              <span style={{ color: "#c8ccee" }}>{endDate || "—"}</span>
            </span>
            <button
              onClick={() => { setStartDate(""); setEndDate(""); }}
              style={{ background: "none", border: "none", color: "#5a5f7a", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}
            >
              ✕ limpiar filtro
            </button>
          </div>
        )}

        {/* ── KPI Cards ── */}
        {loading ? (
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, minWidth: 160 }}><Skeleton h={108} /></div>)}
          </div>
        ) : resumen && (
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            <KpiCard label="Total Ventas"    value={fmt(resumen.total_ventas)}             accent="#6c63ff" delay={0}   />
            <KpiCard label="Total Margen"    value={fmt(resumen.total_margen)}             accent="#4ecdc4" delay={80}  />
            <KpiCard label="Total Órdenes"   value={resumen.total_ordenes.toLocaleString()} accent="#f7b731" delay={160} />
            <KpiCard label="Ticket Promedio" value={fmt(resumen.ticket_promedio)}          accent="#fd9644" delay={240} />
            <KpiCard label="Rentabilidad"    value={fmtPct(resumen.rentabilidad)}          accent="#26de81" sub="margen / ventas" delay={320} />
          </div>
        )}

        {/* ── Gráfica Ventas y Margen por Día ── */}
        <div style={{ marginBottom: 24 }}>
          <ChartCard title="Ventas y Margen por Día">
            {loading ? <Skeleton /> : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={combinedDia} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4ecdc4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fill: "#5a5f7a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#5a5f7a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={58} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#8b8fa8", fontSize: 12, paddingTop: 14 }} />
                  <Area type="monotone" dataKey="ventas" name="Ventas MXN" stroke="#6c63ff" strokeWidth={2} fill="url(#gV)" dot={false} />
                  <Area type="monotone" dataKey="margen" name="Margen ERP" stroke="#4ecdc4" strokeWidth={2} fill="url(#gM)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* ── Top Productos + Top Clientes ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>

          <ChartCard title="Top 5 Productos">
            {loading ? <Skeleton h={220} /> : (
              topProductos.map((p, i) => (
                <BarRow key={p.Producto} label={p.Producto} value={p.total_ventas}
                  max={maxProducto} color={i === 0 ? "#6c63ff" : "#4a3fa8"} delay={i * 70} />
              ))
            )}
          </ChartCard>

          <ChartCard title="Top 5 Clientes">
            {loading ? <Skeleton h={220} /> : (
              topClientes.map((c, i) => (
                <BarRow key={c.Cliente} label={c.Cliente} value={c.total_compras}
                  max={maxCliente} color={i === 0 ? "#4ecdc4" : "#2a8a87"} delay={i * 70} />
              ))
            )}
          </ChartCard>

        </div>

        {/* ── Footer ── */}
        <p style={{ color: "#1e2030", fontSize: 11, textAlign: "center", marginTop: 40, fontFamily: "monospace", letterSpacing: "0.1em" }}>
          SALES ANALYTICS © {new Date().getFullYear()} · {startDate && endDate ? `${startDate} → ${endDate}` : "Todos los períodos"}
        </p>

      </div>
    </>
  );
}
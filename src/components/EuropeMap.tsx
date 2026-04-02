import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Types ─── */
interface RbuInfo {
  code: string;
  countries: string;
  wsAdj: number;
  stock: number;
  model: string;
  color: string;
}

interface EuropeMapProps {
  rbus: RbuInfo[];
  region: string;
  regionKey: string;
  onHover: (code: string | null) => void;
  hover: string | null;
  splitTotal: number;
}

/* ─── Simplified but recognizable country outlines ─── */
/* ViewBox: 0 0 900 520. Coordinates chosen to produce
   shapes that are immediately identifiable as their real countries. */
const shapes: { d: string; rbu: string }[] = [
  // ── UK ──
  // Great Britain
  { d: "M265,165 L272,150 L280,140 L288,135 L296,132 L302,138 L306,148 L304,158 L298,170 L294,182 L288,192 L282,198 L276,196 L270,188 L266,180 L264,172 Z", rbu: "UK" },
  // Scotland bump
  { d: "M274,135 L282,125 L296,120 L306,126 L310,134 L302,138 L296,132 L288,135 L280,140 Z", rbu: "UK" },
  // Ireland
  { d: "M235,158 L250,148 L262,152 L266,164 L264,176 L256,184 L246,182 L238,174 L234,166 Z", rbu: "UK" },

  // ── WEST ──
  // France
  { d: "M310,230 L318,218 L330,210 L344,206 L356,210 L368,218 L376,228 L380,242 L376,258 L368,270 L354,278 L340,280 L326,276 L316,266 L308,252 L306,240 Z", rbu: "WEST" },
  // Netherlands
  { d: "M340,172 L352,168 L360,174 L358,184 L350,188 L340,184 Z", rbu: "WEST" },
  // Belgium + Luxembourg
  { d: "M330,190 L344,186 L354,192 L350,202 L338,206 L328,200 Z", rbu: "WEST" },

  // ── IBERIA ──
  // Spain
  { d: "M262,290 L276,278 L296,272 L320,276 L340,282 L348,296 L344,314 L330,326 L310,332 L288,330 L270,322 L260,310 L258,298 Z", rbu: "IBERIA" },
  // Portugal
  { d: "M242,296 L256,290 L262,302 L260,318 L252,326 L242,322 L238,310 Z", rbu: "IBERIA" },

  // ── NORDICS ──
  // Norway coast
  { d: "M360,52 L370,40 L384,32 L396,38 L402,50 L398,64 L392,82 L386,100 L378,116 L370,126 L364,122 L358,110 L354,94 L356,76 L358,62 Z", rbu: "NORDICS" },
  // Sweden
  { d: "M398,50 L410,42 L420,48 L424,60 L422,78 L418,96 L412,114 L406,128 L398,136 L390,130 L386,118 L388,100 L392,82 L396,64 Z", rbu: "NORDICS" },
  // Finland
  { d: "M432,38 L446,32 L458,40 L462,56 L458,74 L452,92 L444,108 L434,116 L426,108 L420,92 L422,74 L426,56 Z", rbu: "NORDICS" },
  // Denmark
  { d: "M362,146 L374,140 L384,144 L386,154 L378,162 L368,160 L360,154 Z", rbu: "NORDICS" },

  // ── ITA ──
  // Italy boot shape
  { d: "M386,248 L396,238 L410,234 L416,242 L414,256 L418,268 L424,280 L428,294 L422,304 L414,310 L406,304 L400,292 L396,278 L392,264 L384,254 Z", rbu: "ITA" },
  // North Italy / Po valley
  { d: "M366,236 L380,228 L396,232 L410,234 L396,238 L386,248 L372,244 Z", rbu: "ITA" },
  // Sardinia
  { d: "M370,286 L380,280 L386,288 L384,300 L376,306 L368,298 Z", rbu: "ITA" },
  // Sicily
  { d: "M396,312 L412,308 L422,314 L418,324 L406,328 L396,322 Z", rbu: "ITA" },

  // ── CENTER ──
  // Switzerland
  { d: "M346,228 L362,224 L374,228 L372,238 L360,242 L348,238 Z", rbu: "CENTER" },
  // Austria
  { d: "M382,220 L406,216 L422,220 L420,230 L406,234 L388,232 L380,226 Z", rbu: "CENTER" },

  // ── CEE ──
  // Germany
  { d: "M348,164 L366,158 L384,162 L392,174 L396,190 L392,206 L384,216 L370,220 L356,216 L344,208 L340,194 L342,178 Z", rbu: "CEE" },
  // Poland
  { d: "M410,156 L436,150 L456,158 L462,172 L456,190 L444,202 L428,208 L414,204 L404,192 L400,176 L404,164 Z", rbu: "CEE" },
  // Czech Republic
  { d: "M392,206 L412,202 L426,208 L422,218 L408,222 L394,218 Z", rbu: "CEE" },
  // Hungary
  { d: "M426,222 L448,218 L462,224 L460,236 L446,242 L430,238 L424,230 Z", rbu: "CEE" },
  // Romania
  { d: "M466,224 L490,218 L510,226 L514,242 L506,256 L488,262 L472,256 L464,240 Z", rbu: "CEE" },
  // Bulgaria
  { d: "M482,264 L504,258 L518,266 L516,280 L502,288 L486,282 L480,272 Z", rbu: "CEE" },
  // Greece
  { d: "M468,296 L484,288 L500,294 L504,308 L498,322 L484,328 L470,322 L466,308 Z", rbu: "CEE" },

  // ── RUSSIA ──
  // Russia western part (massive shape stretching east)
  { d: "M478,68 L530,48 L600,38 L680,34 L760,42 L830,60 L860,96 L850,140 L820,174 L774,194 L720,202 L660,198 L600,190 L544,180 L502,170 L476,158 L462,138 L458,114 L464,90 Z", rbu: "RUSSIA" },
  // Kaliningrad area
  { d: "M436,154 L446,148 L456,152 L458,162 L450,168 L440,164 Z", rbu: "RUSSIA" },
  // Ukraine (part of Russia RBU for Nissan)
  { d: "M468,196 L500,188 L536,194 L556,210 L552,228 L530,240 L504,244 L480,236 L464,218 Z", rbu: "RUSSIA" },
  // Belarus
  { d: "M456,164 L476,158 L490,164 L492,178 L484,190 L468,194 L456,186 L452,174 Z", rbu: "RUSSIA" },
];

/* ─── Background context shapes (non-RBU) ─── */
const bgShapes = [
  // Turkey
  "M530,272 L560,264 L600,268 L640,276 L660,290 L656,306 L636,314 L600,316 L560,312 L538,300 L528,286 Z",
  // Morocco/North Africa coast hint
  "M230,360 L300,348 L380,350 L440,356 L440,380 L230,380 Z",
  // Iceland
  "M192,42 L212,34 L226,42 L224,54 L210,60 L196,54 Z",
];

/* ─── Stable label positions per RBU ─── */
const labelPos: Record<string, { x: number; y: number }> = {
  UK: { x: 282, y: 165 },
  WEST: { x: 342, y: 245 },
  IBERIA: { x: 300, y: 305 },
  NORDICS: { x: 408, y: 80 },
  ITA: { x: 405, y: 275 },
  CENTER: { x: 380, y: 232 },
  CEE: { x: 440, y: 200 },
  RUSSIA: { x: 670, y: 110 },
};

export default function EuropeMap({ rbus, region, regionKey, onHover, hover, splitTotal }: EuropeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(4, z * 1.4)), []);
  const handleZoomOut = useCallback(() => {
    setZoom((z) => { const nz = Math.max(1, z / 1.4); if (nz <= 1) setPan({ x: 0, y: 0 }); return nz; });
  }, []);
  const handleReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Wheel zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) setZoom((z) => Math.min(4, z * 1.15));
      else setZoom((z) => { const nz = Math.max(1, z / 1.15); if (nz <= 1) setPan({ x: 0, y: 0 }); return nz; });
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [zoom, pan]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setPan({ x: dragStart.current.px + (e.clientX - dragStart.current.x) / zoom, y: dragStart.current.py + (e.clientY - dragStart.current.y) / zoom });
  }, [dragging, zoom]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  const rbuMap = Object.fromEntries(rbus.map((r) => [r.code, r]));
  const hovRbu = hover ? rbuMap[hover] : null;

  return (
    <div className="relative select-none">
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        {[
          { label: "+", fn: handleZoomIn, title: "Zoom in" },
          { label: "−", fn: handleZoomOut, title: "Zoom out" },
          { label: "⟲", fn: handleReset, title: "Reset" },
        ].map((b) => (
          <button key={b.label} onClick={b.fn} title={b.title} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-[15px] font-bold text-slate-600 shadow ring-1 ring-slate-200/80 backdrop-blur-sm hover:bg-slate-50 transition-colors">
            {b.label}
          </button>
        ))}
      </div>

      {zoom > 1.05 && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {zoom.toFixed(1)}×
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 900 420"
        className="h-[340px] w-full rounded-lg"
        style={{
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          background: "linear-gradient(145deg, #edf2f7 0%, #dfe6ee 50%, #d5dde6 100%)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <filter id="region-glow">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.18" />
          </filter>
          <pattern id="sea" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" />
            <path d="M0 20 Q10 17 20 20 Q30 23 40 20" stroke="#c4d0dc" strokeWidth="0.6" fill="none" opacity="0.35" />
          </pattern>
        </defs>

        {/* Ocean texture */}
        <rect width="900" height="420" fill="url(#sea)" />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={{ transformOrigin: "450px 210px" }}>
          {/* Background context shapes */}
          {bgShapes.map((d, i) => (
            <path key={`bg-${i}`} d={d} fill="#d8dee4" stroke="#c0c8d0" strokeWidth="0.5" opacity="0.45" />
          ))}

          {/* Country shapes */}
          {shapes.map((s, i) => {
            const rbu = rbuMap[s.rbu];
            if (!rbu) return null;
            const isActive = region === "All Europe" || rbu.code === regionKey;
            const isHov = hover === rbu.code;
            return (
              <path
                key={`s-${i}`}
                d={s.d}
                fill={rbu.color}
                fillOpacity={isActive ? (isHov ? 0.95 : 0.78) : 0.12}
                stroke={isHov ? "#fff" : isActive ? "rgba(255,255,255,0.7)" : "#b8c4d0"}
                strokeWidth={isHov ? 2 : 0.8}
                strokeLinejoin="round"
                filter={isHov ? "url(#region-glow)" : undefined}
                style={{ transition: "fill-opacity 0.25s, stroke-width 0.2s", cursor: "pointer" }}
                onMouseEnter={() => onHover(s.rbu)}
                onMouseLeave={() => onHover(null)}
              />
            );
          })}

          {/* RBU Labels — dark pill badges */}
          {rbus.map((rbu) => {
            const p = labelPos[rbu.code];
            if (!p) return null;
            const isActive = region === "All Europe" || rbu.code === regionKey;
            const isHov = hover === rbu.code;
            const w = rbu.code === "RUSSIA" ? 72 : 58;
            return (
              <g
                key={`lbl-${rbu.code}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => onHover(rbu.code)}
                onMouseLeave={() => onHover(null)}
              >
                <rect
                  x={p.x - w / 2}
                  y={p.y - 12}
                  width={w}
                  height={28}
                  rx={5}
                  fill={isHov ? "rgba(0,0,0,0.82)" : isActive ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.12)"}
                  style={{ transition: "fill 0.2s" }}
                />
                <text x={p.x} y={p.y + 1} fontSize="10" fontWeight="700" fill={isActive ? "#fff" : "#94a3b8"} textAnchor="middle" style={{ pointerEvents: "none" }}>
                  {rbu.code}
                </text>
                <text x={p.x} y={p.y + 12} fontSize="8.5" fill={isActive ? "#e0e7ee" : "#94a3b8"} textAnchor="middle" style={{ pointerEvents: "none" }}>
                  {rbu.wsAdj.toLocaleString()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip */}
      {hovRbu && (
        <div className="absolute right-4 top-14 z-20 w-52 rounded-lg border border-slate-200/80 bg-white/95 p-3 text-[12px] shadow-xl backdrop-blur-sm">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ background: hovRbu.color }} />
            <span className="font-bold text-slate-800">{hovRbu.code}</span>
          </div>
          <p className="text-[11px] text-slate-500">{hovRbu.countries}</p>
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            <p>WS Volume: <span className="font-semibold">{hovRbu.wsAdj.toLocaleString()}</span></p>
            <p>Stock: <span className="font-semibold">{hovRbu.stock.toLocaleString()}</span></p>
            <p>Key Model: <span className="font-semibold">{hovRbu.model}</span></p>
            <p>Share: <span className="font-semibold">{Math.round((hovRbu.wsAdj / splitTotal) * 100)}%</span></p>
          </div>
        </div>
      )}

      {/* RBU Volume Split bar */}
      <div className="mt-3">
        <p className="mb-1 text-[12px] font-semibold text-slate-700">RBU Volume Split</p>
        <div className="flex h-7 overflow-hidden rounded-md border border-slate-200 shadow-sm">
          {rbus.map((r) => (
            <div
              key={r.code}
              className="flex items-center justify-center text-[10px] font-semibold text-white transition-opacity"
              style={{ width: `${Math.max(3, Math.round((r.wsAdj / splitTotal) * 100))}%`, background: r.color, opacity: hover && hover !== r.code ? 0.35 : 1 }}
              onMouseEnter={() => onHover(r.code)}
              onMouseLeave={() => onHover(null)}
            >
              {Math.round((r.wsAdj / splitTotal) * 100) >= 5 ? `${r.code} ${Math.round((r.wsAdj / splitTotal) * 100)}%` : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

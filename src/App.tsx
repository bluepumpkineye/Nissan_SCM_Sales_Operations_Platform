import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from "react";
import StockReconciliationPageNew from "./pages/StockReconciliationPage";
import PipelineSystemPage from './pages/PipelineSystemPage';
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,

  ChartColumn,
  ClipboardList,
  Download,
  Factory,
  HandCoins,
  MapPin,
  Package,
  Printer,
  RefreshCcw,
  Search,
  Settings2,
  TriangleAlert,
  Truck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Select } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { cn } from "./utils/cn";
import EuropeMap from "./components/EuropeMap";

type PageId =
  | "executive"
  | "inventory"
  | "pipeline"
  | "cycle"
  | "process"
  | "operations"
  | "reconciliation"
  | "initiatives";

type TargetMode = "MSR" | "BP" | "LY";
type ExecutiveKpi = "Wholesale" | "Retail" | "Stock" | "Market Share" | "Order Bank";

const regionOptions = [
  "All Europe",
  "WEST (France + Netherlands)",
  "NORDICS",
  "ITA (Italy)",
  "CEE (Central & Eastern Europe)",
  "RUSSIA (Russia + Ukraine)",
  "UK",
  "IBERIA (Spain + Portugal)",
  "CENTER",
  "MEA (Middle East & Africa)",
];

const navItems: { id: PageId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "executive", label: "Executive Overview", icon: ChartColumn },
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "pipeline", label: "Pipeline System", icon: Settings2 },
  { id: "cycle", label: "Monthly Production Cycle", icon: RefreshCcw },
  { id: "process", label: "Process Optimization", icon: Search },
  { id: "operations", label: "Operations Dashboard", icon: TrendingUp },
  { id: "reconciliation", label: "Stock Reconciliation", icon: HandCoins },
  { id: "initiatives", label: "Strategic Initiatives", icon: Wrench },
];

const panelClass = "rounded-md border border-slate-200 bg-white shadow-sm";
const compactText = "text-[12px] text-slate-700";

const horizonColumns: Record<Horizon, string[]> = {
  "6-Month": ["May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026"],
  "4-Week": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "5-Day": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

const regionFactor: Record<string, number> = {
  "All Europe": 1,
  WEST: 0.28,
  NORDICS: 0.11,
  ITA: 0.14,
  CEE: 0.09,
  RUSSIA: 0.16,
  UK: 0.17,
  IBERIA: 0.08,
  CENTER: 0.04,
  MEA: 0.05,
};

const targetFactor: Record<TargetMode, number> = {
  MSR: 1,
  BP: 1.08,
  LY: 0.93,
};

const baseModelVolume = [
  { model: "EX", value: 500 },
  { model: "JUKE", value: 14500 },
  { model: "NAVARA", value: 2000 },
  { model: "New Almera", value: 5000 },
  { model: "New Note", value: 8000 },
  { model: "NK", value: 1000 },
  { model: "QASHQAI", value: 16000 },
  { model: "QASHQAI+2", value: 1500 },
];

const fiscalMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const stockRowsBase = [
  { rbu: "WEST", target: 12000, actual: 11500, coverage: 2.3 },
  { rbu: "NORDICS", target: 5000, actual: 5200, coverage: 2.6 },
  { rbu: "ITA", target: 6000, actual: 6800, coverage: 2.8 },
  { rbu: "CEE", target: 4000, actual: 3500, coverage: 2.1 },
  { rbu: "RUSSIA", target: 8000, actual: 7200, coverage: 2.0 },
  { rbu: "UK", target: 9000, actual: 9500, coverage: 2.5 },
  { rbu: "IBERIA", target: 3000, actual: 3100, coverage: 2.4 },
  { rbu: "CENTER", target: 1500, actual: 1400, coverage: 2.2 },
  { rbu: "MEA", target: 1500, actual: 1800, coverage: 2.7 },
];

const factoryLeadBase = [
  { source: "Sunderland, UK", production: 14, transit: 3, mode: "land", compound: 5 },
  { source: "Barcelona, Spain", production: 14, transit: 5, mode: "land", compound: 5 },
  { source: "Japan Plants", production: 21, transit: 42, mode: "sea", compound: 7 },
  { source: "Chennai, India", production: 21, transit: 35, mode: "sea", compound: 7 },
  { source: "USA", production: 18, transit: 28, mode: "sea", compound: 7 },
  { source: "South Africa", production: 18, transit: 25, mode: "sea", compound: 7 },
];

const inventoryRowsBase = [
  { rbu: "WEST", monthly: 4800, mix: "Japan 40%, UK 35%, Spain 25%", weightedLead: 35, current: 11500 },
  { rbu: "NORDICS", monthly: 2000, mix: "Japan 50%, UK 30%, Spain 20%", weightedLead: 40, current: 5200 },
  { rbu: "ITA", monthly: 2400, mix: "Japan 35%, Spain 40%, UK 25%", weightedLead: 32, current: 6800 },
  { rbu: "CEE", monthly: 1600, mix: "Japan 60%, UK 20%, Spain 20%", weightedLead: 45, current: 3500 },
  { rbu: "RUSSIA", monthly: 3200, mix: "Japan 70%, UK 15%, India 15%", weightedLead: 52, current: 7200 },
  { rbu: "UK", monthly: 3600, mix: "UK 60%, Japan 25%, Spain 15%", weightedLead: 22, current: 9500 },
  { rbu: "IBERIA", monthly: 1200, mix: "Spain 55%, Japan 30%, UK 15%", weightedLead: 28, current: 3100 },
  { rbu: "CENTER", monthly: 600, mix: "Japan 45%, UK 30%, Spain 25%", weightedLead: 36, current: 1400 },
  { rbu: "MEA", monthly: 600, mix: "Japan 50%, India 30%, SA 20%", weightedLead: 48, current: 1800 },
];

const endItemCodes = [
  "J10DFD2WDLHDSV01FR",
  "J10PET4WDRHDSV02FR",
  "T31DSD4ATTEBLK03NL",
  "C11PBD2MTHSILV04IT",
  "Z50DSD4ATLEGRN05DE",
  "R51DTD4ATSEBLK06SE",
  "K12PBD2MTHBLUE07RU",
  "D40DSD4ATNAVRED08PL",
  "P12PET2MTSGRY09ES",
  "E11DSD2MTVWHIT10NO",
];

const decodePreset = [
  { model: "X-Trail", engine: "2.2 dCi Diesel", dest: "FRA" },
  { model: "Qashqai", engine: "1.6 Petrol", dest: "NLD" },
  { model: "Navara", engine: "2.5 dCi Diesel", dest: "GBR" },
  { model: "Micra", engine: "1.2 Petrol", dest: "ITA" },
  { model: "Murano", engine: "3.5 Petrol", dest: "SWE" },
  { model: "Pathfinder", engine: "2.5 dCi Diesel", dest: "RUS" },
  { model: "Note", engine: "1.5 dCi Diesel", dest: "POL" },
  { model: "Almera", engine: "1.8 Petrol", dest: "ESP" },
  { model: "Primera", engine: "2.0 Petrol", dest: "CHE" },
  { model: "Terrano", engine: "2.0 dCi Diesel", dest: "FRA" },
];

function normalizeRegionKey(region: string) {
  return region.split(" ")[0];
}

function withFactor(value: number, region: string, target: TargetMode) {
  const regionKey = normalizeRegionKey(region);
  const rf = regionFactor[regionKey] ?? 1;
  return Math.round(value * (region === "All Europe" ? 1 : rf * 3.3) * targetFactor[target]);
}

function statusClass(percentDiff: number) {
  const p = Math.abs(percentDiff);
  if (p <= 5) return "text-emerald-600";
  if (p <= 10) return "text-amber-500";
  return "text-red-600";
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this logged for quick troubleshooting during local development.
    console.error("Page render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">This page failed to render.</p>
            <p className="mt-1">Error: {this.state.message || "Unknown render error"}</p>
            <p className="mt-1">Switch to another module and back. If the issue persists, refresh the app.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TopBar({ pageTitle, region, setRegion, showRegion = true }: { pageTitle: string; region: string; setRegion: (v: string) => void; showRegion?: boolean }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-300 bg-[#f7f7f7]/95 px-4 py-3 backdrop-blur lg:px-6">
      <h1 className="text-sm font-semibold tracking-wide text-slate-800">{pageTitle}</h1>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <div className={cn("hidden items-center gap-2 sm:flex", !showRegion && "invisible")}>
          <span>Region:</span>
          <Select options={regionOptions} value={region} onChange={(e) => setRegion(e.target.value)} className="h-8 min-w-44 border-slate-300 bg-white text-xs text-slate-700" />
        </div>
        <Bell size={15} className="text-slate-500" />
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">NE</div>
        <span className="hidden sm:block">As of: 02-Apr-2026</span>
      </div>
    </div>
  );
}

function ExecutiveOverviewPage({ region }: { region: string }) {
  const [target, setTarget] = useState<TargetMode>("MSR");
  const [kpi, setKpi] = useState<ExecutiveKpi>("Wholesale");
  const [hoverRbu, setHoverRbu] = useState<{ name: string; ws: number; stock: number; x: number; y: number } | null>(null);

  const headlineMetrics = useMemo(() => {
    return {
      ws: withFactor(6819, region, target),
      retail: withFactor(4300, region, target),
      marketShare: Number((1.8 * (target === "BP" ? 0.98 : target === "LY" ? 1.05 : 1)).toFixed(1)),
    };
  }, [region, target]);

  const modelBars = useMemo(() => {
    return baseModelVolume.map((item, idx) => ({
      ...item,
      value: withFactor(item.value, region, target) + idx * 20,
    }));
  }, [region, target]);

  const fyChartData = useMemo(() => {
    let cumWs = 0;
    let cumMsr = 0;
    return fiscalMonths.map((month, idx) => {
      const ws = withFactor(47000 + (idx % 5) * 3800, region, target);
      const msr = withFactor(52000 + ((idx + 2) % 4) * 3200, region, "MSR");
      cumWs += ws;
      cumMsr += msr;
      return { month, ws, msr, cumWs, cumMsr };
    });
  }, [region, target]);

  const mapNodes = [
    { name: "WEST", x: 145, y: 152, ws: withFactor(2100, region, target), stock: withFactor(3600, region, target) },
    { name: "NORDICS", x: 188, y: 78, ws: withFactor(850, region, target), stock: withFactor(1400, region, target) },
    { name: "ITA", x: 214, y: 188, ws: withFactor(960, region, target), stock: withFactor(1600, region, target) },
    { name: "CEE", x: 260, y: 150, ws: withFactor(780, region, target), stock: withFactor(1300, region, target) },
    { name: "RUSSIA", x: 320, y: 98, ws: withFactor(1230, region, target), stock: withFactor(2100, region, target) },
    { name: "UK", x: 132, y: 122, ws: withFactor(1150, region, target), stock: withFactor(1700, region, target) },
    { name: "IBERIA", x: 95, y: 182, ws: withFactor(600, region, target), stock: withFactor(900, region, target) },
  ];

  const stockRows = stockRowsBase.map((row) => {
    const variance = row.actual - row.target;
    const diffPct = (variance / row.target) * 100;
    return { ...row, variance, diffPct };
  });

  const stockAging = [
    { name: "0-30", value: 38 },
    { name: "31-60", value: 30 },
    { name: "61-90", value: 20 },
    { name: "90+", value: 12 },
  ];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Card className="rounded-md border border-slate-300 bg-[#e8e8e8] shadow-none">
        <CardContent className="grid items-center gap-3 p-3 lg:grid-cols-[1.1fr,2fr,1fr]">
          <div>
            <p className="text-2xl font-extrabold tracking-wider text-[#C3002F]">NISSAN</p>
            <p className="text-[11px] text-slate-500">Innovation that excites</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: `${(headlineMetrics.ws / 1000).toFixed(1)}K`, label: "NE Wholesale", red: false }, { value: `${(headlineMetrics.retail / 1000).toFixed(1)}K`, label: "NE Retail", red: false }, { value: `${headlineMetrics.marketShare.toFixed(1)}%`, label: "Market Share", red: true }].map((box) => (
              <div key={box.label} className={cn("rounded border border-slate-300 px-3 py-2", box.red ? "bg-[#C3002F] text-white" : "bg-[#f2f2f2]") }>
                <p className="text-center text-2xl font-bold">{box.value}</p>
                <p className="text-center text-[11px]">{box.label}</p>
              </div>
            ))}
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <p>Powered by DBT WS3</p>
            <p>As 09 OCT. 13</p>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(panelClass, "shadow-sm") }>
        <CardContent className="space-y-3 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Europe Sales</h3>
              {(["MSR", "BP", "LY"] as TargetMode[]).map((item) => (
                <button key={item} onClick={() => setTarget(item)} className={cn("rounded border px-2 py-1 text-[11px]", target === item ? "border-slate-500 bg-slate-200 font-semibold" : "border-slate-300 bg-white")}>{item}</button>
              ))}
              <span className="text-[11px] text-slate-500">MSR = Most Suitable Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600">Region</span>
              <Select options={regionOptions} value={region} onChange={() => undefined} className="h-8 min-w-52 border-slate-300 bg-white text-[11px] text-slate-700" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["Wholesale", "Retail", "Stock", "Market Share", "Order Bank"] as ExecutiveKpi[]).map((tab) => (
              <button key={tab} onClick={() => setKpi(tab)} className={cn("rounded border px-3 py-1.5 text-[11px]", kpi === tab ? "border-[#C3002F] bg-[#C3002F]/10 text-[#8a001f]" : "border-slate-300 bg-white text-slate-700")}>
                {tab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={`${kpi}-${target}-${region}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {kpi === "Wholesale" && (
            <div className="grid gap-3 lg:grid-cols-[220px,1.3fr,1fr]">
              <Card className={panelClass}>
                <CardContent className="space-y-2 p-2">
                  {[
                    { label: "Nissan WS", value: `${Math.round(headlineMetrics.ws / 1000)}K`, red: false },
                    { label: "Nissan Leaf", value: "216", red: false },
                    { label: "Russia Sales", value: `${Math.round(withFactor(970, region, target) / 1000)}K`, red: false },
                    { label: "Focus Areas", value: "Q4 execution", red: true },
                  ].map((item) => (
                    <div key={item.label} className={cn("rounded border-l-4 px-2 py-2", item.red ? "border-[#C3002F] bg-[#C3002F] text-white" : "border-[#C3002F] bg-slate-50") }>
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-[11px]">{item.label}</p>
                    </div>
                  ))}
                  <div className="flex justify-center py-2">
                    <div className="h-8 w-8 rounded-full bg-[#C3002F]/90" />
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 p-2">
                  <CardTitle className="text-[12px] text-slate-700">Europe RBU Footprint</CardTitle>
                </CardHeader>
                <CardContent className="relative p-2">
                  <svg viewBox="0 0 390 260" className="h-[260px] w-full rounded bg-[#f5f5f5]">
                    <path d="M38 178 L78 162 L110 170 L138 150 L170 155 L192 186 L214 191 L236 171 L259 172 L281 158 L320 150 L338 129 L331 111 L313 96 L279 86 L259 94 L239 86 L212 86 L178 74 L158 81 L145 95 L122 102 L104 96 L85 109 L64 110 L54 128 L44 146 Z" fill="#d3d3d3" stroke="#b9b9b9" strokeWidth="1" />
                    {mapNodes.map((node) => (
                      <g key={node.name} onMouseEnter={() => setHoverRbu({ ...node, x: node.x + 10, y: node.y - 8 })} onMouseLeave={() => setHoverRbu(null)}>
                        <circle cx={node.x} cy={node.y} r="5" fill="white" stroke="#C3002F" strokeWidth="2" />
                        <MapPin x={node.x - 4} y={node.y - 18} size={8} color="#C3002F" />
                      </g>
                    ))}
                  </svg>
                  {hoverRbu && (
                    <div className="pointer-events-none absolute z-20 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] shadow" style={{ left: hoverRbu.x, top: hoverRbu.y }}>
                      <p className="font-semibold">{hoverRbu.name}</p>
                      <p>WS: {hoverRbu.ws.toLocaleString()}</p>
                      <p>Stock: {hoverRbu.stock.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Card className={panelClass}>
                  <CardHeader className="border-b border-slate-200 bg-slate-100 p-2">
                    <CardTitle className="text-[12px] text-slate-800">April 2026 Europe Sales Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-[1fr,110px] gap-2 p-2">
                    <table className="w-full text-[11px] text-slate-700">
                      <tbody>
                        {[{ k: "Actual", v: headlineMetrics.ws.toLocaleString() }, { k: "GAP vs MSR", v: "-89.9%" }, { k: "GAP vs MSR", v: "(60,875)" }, { k: "Captives", v: "0.0%" }].map((row) => (
                          <tr key={row.k} className="border-b border-slate-100">
                            <td className="py-1">{row.k}:</td>
                            <td className="py-1 text-right font-semibold">{row.v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="rounded bg-emerald-50 p-2 text-center text-[11px] text-emerald-700">
                      <p className="text-lg font-bold">10%</p>
                      <p>Day to Day Ramp Up</p>
                    </div>
                    <div className="col-span-2 flex gap-3 text-[11px]">
                      <a href="#" className="text-[#C3002F] underline">Detailed WS</a>
                      <a href="#" className="text-[#C3002F] underline">Detailed Profile</a>
                      <a href="#" className="text-[#C3002F] underline">Export&OEM</a>
                    </div>
                  </CardContent>
                </Card>

                <Card className={panelClass}>
                  <CardHeader className="border-b border-slate-200 p-2">
                    <CardTitle className="text-[12px] text-slate-800">Top 8 Europe Sales Models Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelBars} layout="vertical" margin={{ left: 34, right: 4, top: 2, bottom: 2 }}>
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="model" type="category" tick={{ fontSize: 10 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#4b5563" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 h-12 rounded border border-slate-200 bg-slate-50 p-1">
                      <div className="h-full rounded bg-slate-500" style={{ width: "28%" }} />
                      <p className="text-[10px] text-slate-600">Infiniti 800 units</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className={cn(panelClass, "lg:col-start-2 lg:col-end-4") }>
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 p-2">
                  <CardTitle className="text-[12px] text-slate-800">FY Europe Sales Performance</CardTitle>
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </CardHeader>
                <CardContent className="h-80 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fyChartData}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="msr" fill="#d1d5db" name="MSR" />
                      <Bar yAxisId="left" dataKey="ws" fill="#374151" name="WS" />
                      <Line yAxisId="right" dataKey="cumWs" stroke="#111827" name="Cumulative WS" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="right" dataKey="cumMsr" stroke="#6b7280" name="Cumulative MSR" strokeWidth={2} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {kpi === "Stock" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 p-2">
                  <CardTitle className="text-[12px] text-slate-800">Nissan Europe Stock Target: 50,000 units</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="text-xl font-bold">50,000</p><p>Target</p></div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="text-xl font-bold">50,000</p><p>Actual</p></div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="text-xl font-bold text-emerald-600">2.5</p><p>Coverage (months)</p></div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockRows}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis dataKey="rbu" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="target" fill="#d1d5db" />
                        <Bar dataKey="actual" fill="#C3002F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Stock by RBU</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto p-2">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-2 py-1 text-left">RBU</th><th className="px-2 py-1 text-right">Target</th><th className="px-2 py-1 text-right">Actual</th><th className="px-2 py-1 text-right">Variance</th><th className="px-2 py-1 text-right">Coverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockRows.map((row) => (
                        <tr key={row.rbu} className="border-b border-slate-100 even:bg-slate-50">
                          <td className="px-2 py-1">{row.rbu}</td>
                          <td className="px-2 py-1 text-right">{row.target.toLocaleString()}</td>
                          <td className="px-2 py-1 text-right">{row.actual.toLocaleString()}</td>
                          <td className={cn("px-2 py-1 text-right font-semibold", statusClass(row.diffPct))}>{row.variance > 0 ? `+${row.variance}` : row.variance}</td>
                          <td className="px-2 py-1 text-right">{row.coverage.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Inventory/Wholesale Ratio</CardTitle></CardHeader>
                <CardContent className="p-3">
                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                    <div className="h-4 rounded-full bg-slate-200">
                      <div className="h-4 rounded-full bg-[#C3002F]" style={{ width: "66%" }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-700">Current ratio: 2.5 months (target range: 2.3 - 2.7)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Stock Aging</CardTitle></CardHeader>
                <CardContent className="h-56 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockAging} dataKey="value" nameKey="name" outerRadius={84} label>
                        {["#C3002F", "#ef4444", "#9ca3af", "#4b5563"].map((c) => <Cell key={c} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {kpi === "Retail" && (
            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Retail Performance</CardTitle></CardHeader>
              <CardContent className="grid gap-3 p-3 lg:grid-cols-3">
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-center"><p className="text-2xl font-bold">{headlineMetrics.retail.toLocaleString()}</p><p className={compactText}>Retail Volume</p></div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-center"><p className="text-2xl font-bold">92.4%</p><p className={compactText}>Plan Achievement</p></div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-center"><p className="text-2xl font-bold">24.8</p><p className={compactText}>Days in Stock</p></div>
              </CardContent>
            </Card>
          )}

          {kpi === "Market Share" && (
            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Market Share by RBU</CardTitle></CardHeader>
              <CardContent className="h-80 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockRows.map((row) => ({ rbu: row.rbu, share: Number((2 + (row.target / 12000) * 4).toFixed(1)) }))}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis dataKey="rbu" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="share" fill="#374151" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {kpi === "Order Bank" && (
            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Order Bank Snapshot</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto p-2">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Model</th><th className="px-2 py-1 text-left">Open Orders</th><th className="px-2 py-1 text-left">Backlog Days</th><th className="px-2 py-1 text-left">Service Level</th></tr></thead>
                  <tbody>
                    {modelBars.slice(0, 6).map((m) => (
                      <tr key={m.model} className="border-b border-slate-100 even:bg-slate-50"><td className="px-2 py-1">{m.model}</td><td className="px-2 py-1">{Math.round(m.value / 6)}</td><td className="px-2 py-1">{14 + (m.value % 8)}</td><td className="px-2 py-1">{88 + (m.value % 9)}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

void ExecutiveOverviewPage;

function ExecutiveOverviewEnterprisePage({ region, setRegion }: { region: string; setRegion: (v: string) => void }) {
  const [target, setTarget] = useState<TargetMode>("MSR");
  const [kpi, setKpi] = useState<ExecutiveKpi>("Wholesale");
  const [hover, setHover] = useState<string | null>(null);
  const embedMode = typeof window !== "undefined" && window.location.search.includes("embed=true");

  const targetLabel: Record<TargetMode, string> = { MSR: "Most Suitable Rate", BP: "Business Plan", LY: "Last Year" };
  const regionKey = normalizeRegionKey(region);

  const rbus = [
    { code: "UK", countries: "United Kingdom", ws: 1890, stock: 4700, model: "Qashqai", color: "#b1002a", path: "M130 100 L160 90 L168 112 L150 130 L126 122 Z", lx: 131, ly: 93 },
    { code: "WEST", countries: "France + Netherlands", ws: 2450, stock: 7800, model: "Juke", color: "#cc4b68", path: "M176 138 L220 122 L238 148 L214 176 L176 168 L162 150 Z", lx: 193, ly: 143 },
    { code: "IBERIA", countries: "Spain + Portugal", ws: 620, stock: 2700, model: "Micra", color: "#c98d71", path: "M120 170 L168 160 L178 184 L146 210 L108 198 Z", lx: 126, ly: 178 },
    { code: "NORDICS", countries: "Nordics", ws: 760, stock: 3200, model: "Qashqai", color: "#9eabb6", path: "M198 62 L244 52 L266 80 L248 108 L204 102 L186 80 Z", lx: 214, ly: 69 },
    { code: "ITA", countries: "Italy", ws: 980, stock: 3500, model: "New Note", color: "#7b7f86", path: "M236 174 L264 166 L276 194 L258 224 L244 216 L246 194 Z", lx: 249, ly: 185 },
    { code: "CENTER", countries: "Germany + Switzerland + Austria", ws: 410, stock: 1400, model: "X-Trail", color: "#8da099", path: "M232 146 L262 142 L268 162 L240 170 Z", lx: 236, ly: 150 },
    { code: "CEE", countries: "Central & Eastern Europe", ws: 710, stock: 2900, model: "Navara", color: "#c8a256", path: "M270 126 L324 118 L338 150 L296 176 L262 164 Z", lx: 285, ly: 131 },
    { code: "RUSSIA", countries: "Russia + Ukraine", ws: 1360, stock: 6600, model: "X-Trail", color: "#566071", path: "M334 84 L462 74 L494 126 L450 154 L356 152 L326 124 Z", lx: 392, ly: 90 },
  ].map((row) => ({ ...row, wsAdj: Math.round(row.ws * targetFactor[target]) }));

  const inScope = region === "All Europe" ? rbus : rbus.filter((r) => r.code === regionKey);
  const totalWs = inScope.reduce((acc, r) => acc + r.wsAdj, 0);
  const retail = Math.round(totalWs * 0.61);

  const modelBars = baseModelVolume
    .map((item) => ({ model: item.model, value: Math.round(item.value * (region === "All Europe" ? 1 : 0.34) * targetFactor[target]) }))
    .sort((a, b) => b.value - a.value);

  const fyData = fiscalMonths.map((m, idx) => ({
    month: m,
    ws: Math.round((6200 + idx * 240 + (idx % 3) * 330) * (region === "All Europe" ? 1 : 0.35)),
    // Avoid the reserved React prop name "ref" in chart payload objects.
    targetValue: Math.round((6500 + idx * 200 + (idx % 2) * 250) * (region === "All Europe" ? 1 : 0.35) * targetFactor[target]),
  }));
  let cumA = 0;
  let cumB = 0;
  const fy = fyData.map((d) => {
    cumA += d.ws;
    cumB += d.targetValue;
    return { ...d, cumWs: cumA, cumTarget: cumB, future: fiscalMonths.indexOf(d.month) > 6 };
  });

  const splitTotal = rbus.reduce((acc, r) => acc + r.wsAdj, 0);

  const contextCards = [
    { title: "Nissan Wholesale (WS)", value: "7,042", note: "Monthly wholesale volume", series: [6500, 6700, 6890, 7010, 6980, 7042], a: "vs MSR: -2.3%", b: "vs LY: +5.1%", border: "#C3002F" },
    { title: "Nissan LEAF (EV)", value: "216", note: "Electric vehicle sales", series: [122, 138, 154, 178, 201, 216], a: "EV Mix: 3.1% of total WS", b: "", border: "#00A651" },
    { title: "Russia & CIS Sales", value: "1,024", note: "Fastest growing region", series: [740, 810, 880, 930, 978, 1024], a: "vs MSR: +12.4%", b: "", border: "#C3002F" },
  ];

  return (
    <div className="space-y-4 bg-[#F0F0F0] p-4 text-[14px] lg:p-6">
      <Card className="rounded-md border border-slate-300 bg-[#e8e8e8] shadow-sm">
        <CardContent className="grid items-center gap-4 border-b-[3px] border-[#C3002F] p-4 lg:grid-cols-[1.2fr,2.2fr,1fr]">
          <div>
            <p className="text-[28px] font-bold tracking-wide text-[#C3002F]">NISSAN</p>
            <p className="text-[11px] italic text-slate-500">Innovation that excites</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ value: "6.8K", label: "NE Wholesale", red: false }, { value: "4.3K", label: "NE Retail", red: false }, { value: "1.8%", label: "Market Share", red: true }].map((box) => (
              <div key={box.label} className={cn("rounded-md border border-slate-400 px-3 py-3 text-white", box.red ? "bg-[#C3002F]" : "bg-[#333333]") }>
                <p className="text-center text-[36px] font-bold leading-none">{box.value}</p>
                <p className="mt-1 text-center text-[13px]">{box.label}</p>
              </div>
            ))}
          </div>
          <div className="text-right text-[11px] text-slate-600">Powered by DBT WS3 | As 09 OCT. 13</div>
        </CardContent>
      </Card>

      <Card className={panelClass}>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[18px] font-bold text-slate-800">Europe Sales - {region}</p>
              {(["MSR", "BP", "LY"] as TargetMode[]).map((item) => (
                <button key={item} onClick={() => setTarget(item)} className={cn("rounded-md border px-3 py-1.5 text-[13px]", target === item ? "border-[#C3002F] bg-[#C3002F] text-white" : "border-slate-300 bg-white text-slate-700")}>{item}</button>
              ))}
              <span className="text-[11px] italic text-slate-500">{target} = {targetLabel[target]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-700">Region</span>
              <Select options={regionOptions} value={region} onChange={(e) => setRegion(e.target.value)} className="h-9 min-w-56 border-slate-300 bg-white text-[13px]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Wholesale", "Retail", "Stock", "Market Share", "Order Bank"] as ExecutiveKpi[]).map((tab) => (
              <button key={tab} onClick={() => setKpi(tab)} className={cn("relative rounded-md border px-3 py-2 text-[14px]", kpi === tab ? "border-[#C3002F] bg-[#C3002F] text-white" : "border-slate-300 bg-white text-slate-700")}>{tab}{kpi === tab && <span className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-[#7a001d]" />}</button>
            ))}
            <span className="ml-auto self-center text-[11px] italic text-slate-500">Comparing against: {targetLabel[target]} ({target})</span>
          </div>
        </CardContent>
      </Card>

      {kpi === "Stock" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className={cn(panelClass, "xl:col-span-3")}><CardContent className="grid gap-3 p-5 md:grid-cols-4"><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Nissan Europe Stock Target</p><p className="text-[30px] font-bold">50,000</p></div><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Current Stock</p><p className="text-[30px] font-bold">48,200</p></div><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Variance</p><p className="text-[30px] font-bold text-amber-600">-1,800</p></div><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Coverage</p><p className="text-[30px] font-bold text-emerald-600">2.4 mo</p></div></CardContent></Card>
          <Card className={cn(panelClass, "xl:col-span-2")}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Stock by RBU (Actual vs Target)</CardTitle></CardHeader><CardContent className="h-72 p-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={stockRowsBase}><CartesianGrid stroke="#e5e7eb" /><XAxis dataKey="rbu" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="target" fill="#d1d5db" /><Bar dataKey="actual" fill="#C3002F" /></BarChart></ResponsiveContainer></CardContent></Card>
          <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Stock Aging Breakdown</CardTitle></CardHeader><CardContent className="h-72 p-5"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: "0-30", value: 38 }, { name: "31-60", value: 30 }, { name: "61-90", value: 20 }, { name: "90+", value: 12 }]} dataKey="value" outerRadius={96} label>{["#C3002F", "#ef4444", "#9ca3af", "#4b5563"].map((c) => <Cell key={c} fill={c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card className={cn(panelClass, "xl:col-span-3")}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">RBU Stock Table</CardTitle></CardHeader><CardContent className="overflow-x-auto p-5"><table className="w-full text-[13px]"><thead className="bg-slate-100"><tr><th className="px-3 py-2 text-left">RBU</th><th className="px-3 py-2 text-right">Target</th><th className="px-3 py-2 text-right">Actual</th><th className="px-3 py-2 text-right">Variance</th><th className="px-3 py-2 text-right">Coverage (months)</th></tr></thead><tbody>{stockRowsBase.map((row) => { const variance = row.actual - row.target; const pct = Math.abs((variance / row.target) * 100); const tone = pct <= 5 ? "text-emerald-600" : pct <= 10 ? "text-amber-600" : "text-red-600"; return <tr key={row.rbu} className="border-b border-slate-100 even:bg-slate-50"><td className="px-3 py-2">{row.rbu}</td><td className="px-3 py-2 text-right">{row.target.toLocaleString()}</td><td className="px-3 py-2 text-right">{row.actual.toLocaleString()}</td><td className={cn("px-3 py-2 text-right font-semibold", tone)}>{variance > 0 ? `+${variance}` : variance}</td><td className="px-3 py-2 text-right">{row.coverage.toFixed(1)}</td></tr>; })}</tbody></table></CardContent></Card>
        </div>
      )}

      {kpi !== "Wholesale" && kpi !== "Stock" && (
        <Card className={panelClass}><CardContent className="grid gap-3 p-5 md:grid-cols-3"><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">{kpi} KPI</p><p className="text-[30px] font-bold">{kpi === "Retail" ? retail.toLocaleString() : "48,200"}</p></div><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Plan Achievement</p><p className="text-[30px] font-bold">93.2%</p></div><div className="rounded border border-slate-200 bg-slate-50 p-4"><p className="text-[12px] text-slate-600">Status</p><p className="text-[30px] font-bold text-emerald-600">On Track</p></div></CardContent></Card>
      )}

      {kpi === "Wholesale" && !embedMode && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[320px,1.25fr,1fr]">
            <div className="space-y-3">
              {contextCards.map((card) => (
                <Card key={card.title} className={panelClass}><CardContent className="space-y-2 p-5" style={{ borderLeft: `4px solid ${card.border}` }}><p className="text-[16px] font-semibold">{card.title}</p><p className="text-[32px] font-bold leading-none">{card.value}</p><p className="text-[12px] text-slate-600">{card.note}</p><div className="h-[60px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={card.series.map((v, i) => ({ i, v }))}><Line dataKey="v" stroke={card.border} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div><p className={card.a.includes("-") ? "text-[12px] text-amber-600" : "text-[12px] text-emerald-600"}>{card.a}</p>{card.b && <p className="text-[12px] text-emerald-600">{card.b}</p>}</CardContent></Card>
              ))}
              <Card className="rounded-md border border-[#9f1736] bg-[#C3002F] text-white shadow-sm"><CardContent className="p-5"><p className="text-[16px] font-bold">Q4 Execution Priorities</p><ul className="mt-2 space-y-1 text-[13px]"><li>Qashqai ramp-up to full capacity</li><li>Year-end fleet order acceleration</li><li>Russia stock build for winter demand</li><li>New Note launch support - dealer stock fill</li></ul></CardContent></Card>
              <Card className={panelClass}><CardContent className="space-y-2 p-5" style={{ borderLeft: "4px solid #333333" }}><p className="text-[16px] font-semibold">Stock Position</p><p className="text-[32px] font-bold leading-none">48.2K</p><p className="text-[12px] text-slate-600">European stock (vs 50K target)</p><div className="h-3 rounded-full bg-slate-200"><div className="h-3 rounded-full bg-emerald-500" style={{ width: "96.4%" }} /></div><p className="text-[12px]">Coverage: 2.4 months</p></CardContent></Card>
            </div>

            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 px-5 py-4"><CardTitle className="text-[16px]">Europe RBU Footprint & Sales Distribution</CardTitle><p className="text-[12px] text-slate-500">Monthly wholesale volume by Regional Business Unit — scroll to zoom, drag to pan</p></CardHeader>
              <CardContent className="relative p-5">
                <EuropeMap rbus={rbus} region={region} regionKey={regionKey} onHover={setHover} hover={hover} splitTotal={splitTotal} />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 bg-slate-100 px-5 py-3"><CardTitle className="text-[16px]">April 2026 Europe Sales Performance</CardTitle></CardHeader><CardContent className="space-y-3 p-5"><table className="w-full text-[14px]"><tbody><tr className="border-b border-slate-100"><td className="py-2 font-medium">Actual</td><td className="py-2 text-right text-[18px] font-bold">{totalWs.toLocaleString()}</td></tr><tr className="border-b border-slate-100"><td className="py-2 font-medium">GAP vs {target}</td><td className="bg-red-50 py-2 text-right text-[18px] font-bold text-red-600">-89.9%</td></tr><tr className="border-b border-slate-100"><td className="py-2 font-medium">GAP vs {target} (units)</td><td className="bg-red-50 py-2 text-right text-[18px] font-bold text-red-600">(60,875)</td></tr><tr><td className="py-2 font-medium">Captives</td><td className="py-2 text-right text-[18px] font-bold text-slate-600">0.0%</td></tr></tbody></table><div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700"><TrendingUp size={14} /> 10% Day to Day Ramp Up</div><div className="flex flex-wrap gap-2"><Button variant="outline" className="h-8 border-[#C3002F]/50 text-[12px] text-[#8a001f]">Detailed WS</Button><Button variant="outline" className="h-8 border-[#C3002F]/50 text-[12px] text-[#8a001f]">Detailed Profile</Button><Button variant="outline" className="h-8 border-[#C3002F]/50 text-[12px] text-[#8a001f]">Export&OEM</Button></div></CardContent></Card>
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Top 8 Europe Sales Models Performance</CardTitle></CardHeader><CardContent className="space-y-2 p-5"><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={modelBars} layout="vertical" margin={{ left: 40, right: 22 }} barCategoryGap={10}><CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis dataKey="model" type="category" tick={{ fontSize: 14 }} width={102} /><Tooltip /><Bar dataKey="value" fill="#C3002F" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div><div className="border-t border-dashed border-slate-300 pt-2"><p className="text-[12px] italic text-slate-600">Infiniti Brand</p><div className="mt-1 h-3 rounded bg-slate-200"><div className="h-3 rounded bg-slate-500" style={{ width: `${region === "All Europe" ? 18 : 26}%` }} /></div><p className="text-[11px] text-slate-600">{region === "All Europe" ? "800" : "260"} units</p></div></CardContent></Card>
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Stock vs Wholesale Ratio by RBU</CardTitle></CardHeader><CardContent className="p-5"><table className="w-full text-[12px]"><thead><tr className="text-left text-slate-500"><th className="pb-2">RBU</th><th className="pb-2">Ratio</th><th className="pb-2">Status</th></tr></thead><tbody>{rbus.map((r) => { const ratio = Number((r.stock / r.wsAdj).toFixed(1)); const c = ratio >= 2.3 && ratio <= 2.7 ? "text-emerald-600" : ratio >= 2.1 && ratio <= 3 ? "text-amber-600" : "text-red-600"; return <tr key={r.code} className="border-t border-slate-100"><td className="py-1.5">{r.code}</td><td className="py-1.5 font-semibold">{ratio}</td><td className={cn("py-1.5 font-semibold", c)}>{c === "text-emerald-600" ? "Healthy" : c === "text-amber-600" ? "Watch" : "Action"}</td></tr>; })}</tbody></table></CardContent></Card>
            </div>
          </div>

          <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-5 py-4"><CardTitle className="text-[16px]">FY2026 Europe Sales Performance (Apr 2026 - Mar 2027)</CardTitle><p className="text-[12px] text-slate-500">Monthly and cumulative wholesale vs {target} target</p></CardHeader><CardContent className="h-[380px] p-5"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={fy}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis yAxisId="left" tick={{ fontSize: 12 }} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} /><Tooltip /><ReferenceLine x="Oct" stroke="#94a3b8" label={{ value: "Current Month <-", position: "insideTopLeft", fontSize: 11 }} /><Bar yAxisId="left" dataKey="targetValue" name={target} fill="#CCCCCC" barSize={20}>{fy.map((d) => <Cell key={`r-${d.month}`} fill={d.future ? "#e5e7eb" : "#CCCCCC"} stroke={d.future ? "#9ca3af" : "#CCCCCC"} strokeDasharray={d.future ? "4 2" : undefined} />)}</Bar><Bar yAxisId="left" dataKey="ws" name="WS" fill="#C3002F" barSize={14} /><Line yAxisId="right" dataKey="cumWs" stroke="#111111" strokeWidth={2} dot={{ r: 3 }} name="Cumulative WS" /><Line yAxisId="right" dataKey="cumTarget" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name={`Cumulative ${target}`} /></ComposedChart></ResponsiveContainer></CardContent></Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card className={panelClass}><CardContent className="space-y-2 p-5"><Factory size={18} className="text-[#C3002F]" /><p className="text-[16px] font-semibold">Production Allocation</p><p className="text-[13px]">18 models allocated across 6 global factories</p><p className="text-[12px] text-slate-600">Sunderland: 3 | Barcelona: 2 | Japan: 8 | Other: 5</p></CardContent></Card>
            <Card className={panelClass}><CardContent className="space-y-2 p-5"><Truck size={18} className="text-[#C3002F]" /><p className="text-[16px] font-semibold">Distribution Actions This Month</p><ul className="space-y-1 text-[12px]"><li>New Note launch: 2,400 units to compounds</li><li>X-Trail fleet push: 340 units</li><li>Almera phase-out: last 180 units</li></ul></CardContent></Card>
            <Card className={panelClass}><CardContent className="space-y-2 p-5"><ClipboardList size={18} className="text-[#C3002F]" /><p className="text-[16px] font-semibold">Order Bank Health</p><p className="text-[24px] font-bold">12,847 orders</p><p className="text-[13px]">Open dealer orders across Europe</p><p className="text-[12px] text-slate-600">Avg age: 23 days | Oldest: 67 days | At risk: 312 orders</p></CardContent></Card>
            <Card className={panelClass}><CardContent className="space-y-2 border-l-4 border-[#C3002F] p-5"><TriangleAlert size={18} className="text-[#C3002F]" /><p className="text-[16px] font-semibold">Key Alerts</p><ul className="space-y-1 text-[13px]"><li>Russia compound at 94% capacity</li><li>Qashqai UK: 3-week wait time exceeds target</li><li>LEAF sales ahead of plan (+14%)</li><li>CEE stock coverage below 2.0 months</li></ul></CardContent></Card>
          </div>
        </div>
      )}

      {kpi === "Wholesale" && embedMode && (
        <div className="space-y-4">
          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-4">
              <CardTitle className="text-[16px]">Wholesale Snapshot (Embed Safe Mode)</CardTitle>
              <p className="text-[12px] text-slate-500">Charts are simplified in embedded view to ensure stable rendering.</p>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 md:grid-cols-3">
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] text-slate-600">Total Wholesale</p>
                <p className="text-[32px] font-bold">{totalWs.toLocaleString()}</p>
                <p className="text-[12px] text-amber-600">vs {target}: -89.9%</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] text-slate-600">Top Model</p>
                <p className="text-[32px] font-bold text-[#C3002F]">QASHQAI</p>
                <p className="text-[12px] text-slate-600">16,000 units</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] text-slate-600">Stock Position</p>
                <p className="text-[32px] font-bold">48.2K</p>
                <p className="text-[12px] text-emerald-600">Coverage: 2.4 months</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 px-5 py-3">
                <CardTitle className="text-[16px]">Europe RBU Footprint & Sales Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-5">
                {rbus.map((r) => (
                  <div key={r.code} className="grid grid-cols-[80px,1fr,90px] items-center gap-2 text-[12px]">
                    <span className="font-semibold">{r.code}</span>
                    <div className="h-2 rounded bg-slate-200">
                      <div className="h-2 rounded" style={{ width: `${Math.max(6, Math.round((r.wsAdj / splitTotal) * 100))}%`, background: r.color }} />
                    </div>
                    <span className="text-right">{r.wsAdj.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 px-5 py-3">
                <CardTitle className="text-[16px]">FY2026 Europe Sales Performance</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-5">
                <table className="w-full text-[12px]">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Month</th>
                      <th className="px-2 py-1 text-right">WS</th>
                      <th className="px-2 py-1 text-right">{target}</th>
                      <th className="px-2 py-1 text-right">Cum WS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fy.map((d) => (
                      <tr key={d.month} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="px-2 py-1">{d.month}</td>
                        <td className="px-2 py-1 text-right">{d.ws.toLocaleString()}</td>
                        <td className="px-2 py-1 text-right">{d.targetValue.toLocaleString()}</td>
                        <td className="px-2 py-1 text-right">{d.cumWs.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryManagementPage() {
  const [factoryRows, setFactoryRows] = useState(factoryLeadBase);
  const [selectedFactory, setSelectedFactory] = useState(factoryLeadBase[0].source);
  const [coverageMonths, setCoverageMonths] = useState(2.5);
  const [selectedRbu, setSelectedRbu] = useState("WEST");

  const selectedFactoryData = factoryRows.find((f) => f.source === selectedFactory) ?? factoryRows[0];

  const inventoryRows = useMemo(() => {
    return inventoryRowsBase.map((row) => {
      const target = Math.round(row.monthly * coverageMonths);
      const variance = row.current - target;
      const pct = Math.abs((variance / target) * 100);
      const status = pct <= 5 ? "healthy" : pct <= 10 ? "watch" : "action";
      return { ...row, target, variance, status };
    });
  }, [coverageMonths]);

  const totals = inventoryRows.reduce(
    (acc, row) => {
      acc.monthly += row.monthly;
      acc.target += row.target;
      acc.current += row.current;
      return acc;
    },
    { monthly: 0, target: 0, current: 0 }
  );

  const selectedRbuData = inventoryRows.find((row) => row.rbu === selectedRbu) ?? inventoryRows[0];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Inventory Management - Lead Time Based Stock Targeting</h2>
        <p className="text-xs text-slate-600">Stock targets calculated as 2.5 months of forward sales coverage based on logistic lead times</p>
      </div>

      <Card className={panelClass}>
        <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Logistic Lead Time Parameters (Days)</CardTitle></CardHeader>
        <CardContent className="space-y-3 p-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-[11px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-2 py-1 text-left">Source Factory</th>
                  <th className="px-2 py-1 text-left">Production Lead Time</th>
                  <th className="px-2 py-1 text-left">Transit</th>
                  <th className="px-2 py-1 text-left">Compound Handling</th>
                  <th className="px-2 py-1 text-left">Total Lead Time</th>
                  <th className="px-2 py-1 text-left">Equivalent Months</th>
                </tr>
              </thead>
              <tbody>
                {factoryRows.map((row, idx) => {
                  const total = row.production + row.transit + row.compound;
                  return (
                    <tr key={row.source} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-2 py-1">{row.source}</td>
                      <td className="px-2 py-1"><input type="number" className="w-20 rounded border border-slate-300 px-1 py-0.5" value={row.production} onChange={(e) => setFactoryRows((prev) => prev.map((it, i) => (i === idx ? { ...it, production: Number(e.target.value) } : it)))} /> days</td>
                      <td className="px-2 py-1"><input type="number" className="w-20 rounded border border-slate-300 px-1 py-0.5" value={row.transit} onChange={(e) => setFactoryRows((prev) => prev.map((it, i) => (i === idx ? { ...it, transit: Number(e.target.value) } : it)))} /> days ({row.mode})</td>
                      <td className="px-2 py-1"><input type="number" className="w-20 rounded border border-slate-300 px-1 py-0.5" value={row.compound} onChange={(e) => setFactoryRows((prev) => prev.map((it, i) => (i === idx ? { ...it, compound: Number(e.target.value) } : it)))} /> days</td>
                      <td className="px-2 py-1 font-semibold">{total} days</td>
                      <td className="px-2 py-1">{(total / 30).toFixed(1)} months</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span>Select Factory:</span>
            <Select options={factoryRows.map((f) => f.source)} value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)} className="h-8 min-w-56 border-slate-300 bg-white text-xs text-slate-700" />
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700">
              <Badge className="rounded border border-slate-300 bg-white text-slate-700">Factory</Badge>
              <span>Production ({selectedFactoryData.production} days)</span>
              <span>-</span>
              <span>Transit ({selectedFactoryData.transit} days)</span>
              <span>-</span>
              <span>Compound ({selectedFactoryData.compound} days)</span>
              <span>-</span>
              <Badge className="rounded border border-[#C3002F]/30 bg-[#C3002F]/10 text-[#8a001f]">
                Total: {selectedFactoryData.production + selectedFactoryData.transit + selectedFactoryData.compound} days ~ {((selectedFactoryData.production + selectedFactoryData.transit + selectedFactoryData.compound) / 30).toFixed(1)} months
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={panelClass}>
        <CardHeader className="border-b border-slate-200 p-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-[12px] text-slate-800">RBU Stock Target Derivation</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span>Target Coverage (months)</span>
              <input type="number" step="0.1" value={coverageMonths} onChange={(e) => setCoverageMonths(Number(e.target.value))} className="h-7 w-16 rounded border border-slate-300 px-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-2">
          <table className="w-full min-w-[1040px] text-[11px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-2 py-1 text-left">RBU</th><th className="px-2 py-1 text-left">Monthly Sales Forecast</th><th className="px-2 py-1 text-left">Source Mix</th><th className="px-2 py-1 text-left">Weighted Avg Lead Time</th><th className="px-2 py-1 text-left">Target Coverage</th><th className="px-2 py-1 text-left">Stock Target</th><th className="px-2 py-1 text-left">Current Stock</th><th className="px-2 py-1 text-left">Variance</th><th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map((row) => {
                const pct = Math.abs((row.variance / row.target) * 100);
                return (
                  <tr key={row.rbu} className="border-b border-slate-100 even:bg-slate-50">
                    <td className="px-2 py-1 font-medium">{row.rbu}</td>
                    <td className="px-2 py-1">{row.monthly.toLocaleString()}</td>
                    <td className="px-2 py-1">
                      <div className="w-44 rounded border border-slate-200 bg-white">
                        <div className="flex h-2 overflow-hidden rounded-t">
                          {row.mix.split(", ").map((piece, idx) => {
                            const pctValue = Number(piece.split(" ").at(-1)?.replace("%", "") ?? "0");
                            const colors = ["#C3002F", "#f59e0b", "#9ca3af"];
                            return <div key={`${row.rbu}-${idx}`} style={{ width: `${pctValue}%`, background: colors[idx] }} />;
                          })}
                        </div>
                        <p className="px-1 py-0.5 text-[10px] text-slate-600">{row.mix}</p>
                      </div>
                    </td>
                    <td className="px-2 py-1">{row.weightedLead} days</td>
                    <td className="px-2 py-1">{coverageMonths.toFixed(1)}</td>
                    <td className="px-2 py-1 font-semibold">{row.target.toLocaleString()}</td>
                    <td className="px-2 py-1">{row.current.toLocaleString()}</td>
                    <td className={cn("px-2 py-1 font-semibold", statusClass(pct))}>{row.variance > 0 ? `+${row.variance}` : row.variance}</td>
                    <td className="px-2 py-1"><span className={cn("inline-block h-2.5 w-2.5 rounded-full", row.status === "healthy" ? "bg-emerald-500" : row.status === "watch" ? "bg-amber-500" : "bg-red-500")} /></td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-semibold">
                <td className="px-2 py-1">TOTAL</td><td className="px-2 py-1">{totals.monthly.toLocaleString()}</td><td className="px-2 py-1" /><td className="px-2 py-1" /><td className="px-2 py-1">{coverageMonths.toFixed(1)}</td><td className="px-2 py-1">{totals.target.toLocaleString()}</td><td className="px-2 py-1">{totals.current.toLocaleString()}</td><td className="px-2 py-1" /><td className="px-2 py-1" />
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Stock Target vs Actual by RBU</CardTitle></CardHeader>
          <CardContent className="h-72 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryRows}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="rbu" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={50000} stroke="#9ca3af" strokeDasharray="4 4" />
                <Bar dataKey="target" fill="#e5e7eb" />
                <Bar dataKey="current" fill="#C3002F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 p-2">
            <CardTitle className="text-[12px] text-slate-800">Lead Time Waterfall by Source</CardTitle>
            <Select options={inventoryRows.map((r) => r.rbu)} value={selectedRbu} onChange={(e) => setSelectedRbu(e.target.value)} className="h-8 border-slate-300 bg-white text-[11px] text-slate-700" />
          </CardHeader>
          <CardContent className="h-72 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factoryRows.map((f) => ({ source: f.source.split(",")[0], production: f.production, transit: f.transit, compound: f.compound }))}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar stackId="a" dataKey="production" fill="#9ca3af" />
                <Bar stackId="a" dataKey="transit" fill="#6b7280" />
                <Bar stackId="a" dataKey="compound" fill="#C3002F" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-600">Selected RBU: {selectedRbuData.rbu}</p>
          </CardContent>
        </Card>
      </div>

      <Card className={panelClass}>
        <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-[12px] text-slate-800">Stock Coverage Map</CardTitle></CardHeader>
        <CardContent className="p-2">
          <svg viewBox="0 0 460 180" className="h-44 w-full rounded bg-[#f6f6f6]">
            <rect x="20" y="20" width="420" height="140" rx="6" fill="#ececec" />
            {inventoryRows.map((row, idx) => {
              const coverage = row.current / row.monthly;
              const color = coverage >= 2.3 && coverage <= 2.7 ? "#10b981" : (coverage >= 2.0 && coverage < 2.3) || (coverage > 2.7 && coverage <= 3.0) ? "#f59e0b" : "#ef4444";
              return <circle key={row.rbu} cx={50 + idx * 44} cy={92 + (idx % 2) * 18} r="10" fill={color} />;
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

type CycleTab = "Cycle Overview" | "Volume Request & Plant Reply" | "Job Schedule" | "Pipeline Horizon" | "OCF/CCF Constraints";

function MonthlyProductionCyclePage() {
  const [tab, setTab] = useState<CycleTab>("Cycle Overview");
  const [model, setModel] = useState("K123 (Qashqai)");
  const [ordertake, setOrdertake] = useState("May Ordertake");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [todayDay, setTodayDay] = useState(9);

  const tabs: CycleTab[] = ["Cycle Overview", "Volume Request & Plant Reply", "Job Schedule", "Pipeline Horizon", "OCF/CCF Constraints"];
  const markerColor: Record<string, string> = {
    E: "bg-emerald-500",
    M: "bg-sky-600",
    I: "bg-amber-500",
    EMI: "bg-red-600",
    EM: "bg-violet-600",
    R: "bg-rose-600",
  };

  const timelineNodes = [
    "W-6: Ordertake Guidelines",
    "W-5: Volume Request",
    "W-5: NESAS VR Meeting",
    "W-5: Submission to Plants",
    "W-4: Plant Pre-SRVC",
    "W-4: SRVC Meeting",
    "W-4: Allocation Meeting",
    "W-4: Provisional Stage",
    "W-3: OCF Breach",
    "W-3: Confirmation Stage",
    "W-3: Forecast Generation",
    "W-3: Monthly Confirmation",
    "Pipeline Update",
  ];
  const currentTimelineIndex = 8;

  const ganttDays = [
    { day: 1, name: "Thu" },
    { day: 2, name: "Fri" },
    { day: 3, name: "Sat" },
    { day: 4, name: "Sun" },
    { day: 5, name: "Mon" },
    { day: 6, name: "Tue" },
    { day: 7, name: "Wed" },
    { day: 8, name: "Thu" },
    { day: 9, name: "Fri" },
    { day: 10, name: "Sat" },
    { day: 11, name: "Sun" },
    { day: 12, name: "Mon" },
    { day: 13, name: "Tue" },
    { day: 14, name: "Wed" },
    { day: 15, name: "Thu" },
    { day: 16, name: "Fri" },
  ];

  const activities = [
    { name: "Scheduling Bulletin submission from plant", responsible: "Plants", time: "17:00", day: 1, markers: ["E"], phase: 1, desc: "Plant bulletin alignment for cycle entry." },
    { name: "Critical Parts Meeting", responsible: "PP/RPC", time: "15:00", day: 1, markers: ["M"], phase: 1, desc: "Critical components check and impact review." },
    { name: "DRAGON Draft Order Open", responsible: "Export Sales", time: "2:00", day: 2, markers: ["M"], phase: 1, desc: "Draft export order window opens." },
    { name: "Sales & SCM review meeting", responsible: "PP & Sales", time: "12:00", day: 2, markers: ["EM"], phase: 1, desc: "Joint review of demand and supply readiness." },
    { name: "Key Points issue to NSCs", responsible: "PP & Sales", time: "12:00", day: 2, markers: ["EM"], phase: 1, desc: "Guidance shared with NSCs." },
    { name: "Static data maintenance / Horizon set up", responsible: "PP", time: "17:00", day: 3, markers: ["EMI"], phase: 1, desc: "Master data and horizon preparation." },
    { name: "Carflow open for VR", responsible: "PP", time: "15:00", day: 4, markers: ["EMI"], phase: 1, desc: "Volume request intake opened." },
    { name: "NSC volume request (12:00 deadline)", responsible: "NSCs/Sales", time: "12:00", day: 5, markers: ["EMI"], phase: 1, desc: "Market request cut-off." },
    { name: "DRAGON Draft Order Deadline", responsible: "Export Sales", time: "12:00", day: 5, markers: ["EMI"], phase: 1, desc: "Draft order lock point." },
    { name: "Volume request meeting", responsible: "PP & Sales", time: "14:00", day: 6, markers: ["EMI"], phase: 1, desc: "Review requested monthly volume." },
    { name: "Volume request and OCF forecast", responsible: "PP", time: "18:00", day: 6, markers: ["EMI"], phase: 1, desc: "Volume + OCF baseline forecast issued." },
    { name: "GOM / PP meeting", responsible: "PP & Export", time: "15:00", day: 7, markers: ["E"], phase: 2, desc: "Global order management coordination." },
    { name: "DRAGON Final Order Open", responsible: "Export Sales", time: "22:00", day: 7, markers: ["E"], phase: 2, desc: "Final order cycle opens." },
    { name: "Plant Pre-SRVC Volume Confirmation", responsible: "-", time: "-", day: 8, markers: ["EMI"], phase: 2, desc: "Plant initial response before SRVC." },
    { name: "Plant Volume & OCF change feedback", responsible: "Plants", time: "9:30", day: 8, markers: ["EM"], phase: 2, desc: "Plant feedback on volume and constraints." },
    { name: "SRVC meeting", responsible: "Plants/NE", time: "13:00", day: 9, markers: ["EMI"], phase: 2, desc: "Sales review and volume confirmation." },
    { name: "Plant volume confirmation", responsible: "Plants", time: "9:00", day: 9, markers: ["EMI"], phase: 2, desc: "Confirmed volume by plant." },
    { name: "Revised Euro OCF/CCF", responsible: "Plants", time: "9:00", day: 9, markers: ["EMI"], phase: 2, desc: "Updated OCF/CCF constraints." },
    { name: "Allocation meeting", responsible: "PP/Sales", time: "13:00", day: 9, markers: ["EMI"], phase: 2, desc: "RBU allocation review." },
    { name: "Volumes & Revised Region OCF/CCF", responsible: "PP", time: "15:00", day: 9, markers: ["EMI"], phase: 2, desc: "Revised allocation issued." },
    { name: "Final allocation issue Sales + Euro NSC OCF", responsible: "Sales", time: "17:00", day: 9, markers: ["EMI"], phase: 2, desc: "Final output distribution." },
    { name: "DRAGON Final Order Closed", responsible: "Export Sales", time: "11:00", day: 10, markers: ["E"], phase: 3, desc: "Final order lock." },
    { name: "Final Order: Provisional stage", responsible: "NSCs/Sales", time: "13:00", day: 11, markers: ["EMI"], phase: 3, desc: "Provisional EI submission." },
    { name: "OCF breach request", responsible: "PP/Plants", time: "15:00", day: 11, markers: ["EMI"], phase: 3, desc: "Breach raised for review." },
    { name: "Revised Euro OCF/CCF", responsible: "Plants", time: "13:00", day: 12, markers: ["EMI"], phase: 3, desc: "Plant revised OCF/CCF." },
    { name: "Revised region OCF/CCF", responsible: "PP", time: "15:00", day: 12, markers: ["EMI"], phase: 3, desc: "Regional OCF update." },
    { name: "Allocation / OCF tweaking", responsible: "Sales", time: "16:00", day: 12, markers: ["EMI", "EM"], phase: 3, desc: "Final balancing before confirmation." },
    { name: "Final Order: Confirmation stage", responsible: "NSCs/Sales", time: "13:00-15:00", day: 13, markers: ["R", "EMI"], phase: 3, desc: "Confirmed EI mix submission." },
    { name: "Forecast generation", responsible: "PP", time: "15:00", day: 13, markers: ["EM"], phase: 4, desc: "Forecast generation for tail months." },
    { name: "Partial net-off", responsible: "Plants", time: "15:30", day: 14, markers: ["EM"], phase: 4, desc: "Net-off process started." },
    { name: "Final to NSA", responsible: "PP", time: "9:00", day: 15, markers: ["EM"], phase: 4, desc: "Final transfer to NSA." },
    { name: "Monthly confirmation", responsible: "Plants", time: "16:00", day: 15, markers: ["EM"], phase: 4, desc: "Monthly confirmation returned." },
    { name: "Euro OCF/CCF", responsible: "Plants", time: "16:00", day: 15, markers: ["EM"], phase: 4, desc: "Final OCF/CCF package." },
    { name: "Pipeline update", responsible: "NE", time: "7:00", day: 16, markers: ["EM"], phase: 4, desc: "Live pipeline updated." },
  ];

  const overtime = [
    { month: "Jun-26", value: 6.4 },
    { month: "Jul-26", value: 10.2 },
    { month: "Aug-26", value: 14.3 },
    { month: "Sep-26", value: 1.3 },
    { month: "Oct-26", value: 0.7 },
  ];

  const pipelineSteps = [
    "Plants Set Volume & Flexibility",
    "NE Production Planning Breaks Down by Market",
    "RBUs/NSCs Provide Sales Forecast (3 Months)",
    "System Validates Against Volume & Constraints",
    "System Generates Extra 2 Months",
    "Plant Creates Schedule & Copies to Live Pipeline",
  ];

  const stepDescriptions = [
    "Plants set model volume and manufacturing flexibility for each of the 5 separate months. Two empty months are created at the far end of the horizon.",
    "Nissan Europe Production Planning breaks monthly volumes by RBU destination and allocates by market code.",
    "RBUs and NSCs submit detailed EI forecast for the 3-month ordering horizon. Pipeline narrows as detail increases.",
    "System validates EI forecast against agreed volume and OCF/CCF constraints. Breaches are iteratively resolved.",
    "System generates the last 2 months using customer order conditions and calculation rules as system forecast.",
    "Plant creates production schedule and copies all 5 months into the live operational pipeline. Cycle then restarts.",
  ];

  return (
    <div className="space-y-4 bg-[#F0F0F0] p-4 lg:p-6">
      <Card className={panelClass}>
        <CardContent className="space-y-3 p-5">
          <p className="text-[12px] text-slate-500">SCM Operations &gt; Monthly Production Cycle &gt; {tab}</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900">Monthly Production Cycle</h2>
              <p className="text-[13px] text-slate-500">S&amp;OP Cadence - Volume Planning, Allocation &amp; Forecast Management</p>
            </div>
            <Badge className="rounded border border-emerald-300 bg-emerald-100 px-3 py-1 text-[12px] text-emerald-800">Current Cycle: May Ordertake | Status: W-4 Forecasting</Badge>
          </div>
          <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-1">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cn(
                  "border-b-2 px-1 pb-2 text-[13px] font-medium",
                  tab === item ? "border-[#C3002F] text-[#C3002F]" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {tab === "Cycle Overview" && (
        <div className="space-y-4">
          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3">
              <CardTitle className="text-[16px]">Monthly Cycle Key Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-md bg-[#C3002F] px-3 py-2 text-white">
                <p className="text-[14px] font-semibold">PHASE 1: VOLUME REQUEST</p>
                <p className="text-[12px] opacity-90">Weeks W-6 to W-5 - Demand Aggregation</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: "🏢", title: "Countries Volume Request", d: "Each RBU/NSC submits volume request for a 5-month horizon based on market demand and priorities.", tag: "W-5", s: ["RBU", "NSCs"] },
                  { icon: "🤝", title: "NESAS Volume Request Meeting", d: "NESAS Sales and SCM review aggregated requests, specific OCF needs, and OCF change simulations.", tag: "W-5", s: ["NESAS Sales", "PP"] },
                  { icon: "📤", title: "Volume Request Submission to Plants", d: "Consolidated request with ideal allocation by RBU and volume change submitted to plants.", tag: "W-5", s: ["PP", "Plants"] },
                ].map((step) => (
                  <div key={step.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between"><p className="text-lg">{step.icon}</p><Badge className="rounded border border-slate-300 bg-slate-100 text-[11px] text-slate-700">{step.tag}</Badge></div>
                    <p className="mt-1 text-[14px] font-semibold">{step.title}</p>
                    <p className="mt-1 text-[12px] text-slate-600">{step.d}</p>
                    <div className="mt-2 flex gap-1">{step.s.map((st) => <span key={st} className={cn("rounded px-2 py-0.5 text-[10px] text-white", st === "PP" ? "bg-amber-500" : st.includes("Sales") ? "bg-emerald-600" : st === "Plants" ? "bg-red-600" : "bg-sky-600")}>{st}</span>)}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-[#C3002F]">↓</div>

              <div className="rounded-md bg-[#333333] px-3 py-2 text-white">
                <p className="text-[14px] font-semibold">PHASE 2: PLANT REPLY &amp; ALLOCATION</p>
                <p className="text-[12px] opacity-90">Weeks W-4 to W-3 - Planning &amp; Negotiation</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: "🏭", title: "SRVC Meeting", d: "Plants provide volume responses and production conditions. 5-month volumes agreed.", tag: "W-4", s: ["Plants", "NE"], keypoint: true },
                  { icon: "📊", title: "Plant Reply (Volume + OCF/CCF)", d: "Volume reply includes capacity utilization, linespeed, overtime, and OCF/CCF constraints.", tag: "W-4", s: ["Plants"] },
                  { icon: "⚖️", title: "NESAS Final Allocation Meeting", d: "Final volume and OCF allocation per RBU distributed.", tag: "W-4", s: ["PP", "Sales"], keypoint: true },
                  { icon: "📋", title: "Provisional Stage", d: "RBUs submit 3-month EI mix forecast by 18-digit code and market.", tag: "W-4 to W-3", s: ["NSCs", "Sales"], alert: true },
                  { icon: "🔍", title: "Revised OCF/CCF & Breach Analysis", d: "OCF breach analysis completed and sent for plant approval with tweaks.", tag: "W-3", s: ["PP", "Plants"] },
                  { icon: "✅", title: "Confirmation Stage", d: "Final EI mix confirmed and 3-month horizon locked.", tag: "W-3", s: ["NSCs", "Sales"] },
                ].map((step) => (
                  <div key={step.title} className={cn("rounded-md border border-slate-200 bg-white p-4 shadow-sm", step.keypoint && "border-l-4 border-l-amber-400", step.alert && "border-l-4 border-l-[#C3002F]") }>
                    <div className="flex items-center justify-between"><p className="text-lg">{step.icon}</p><Badge className="rounded border border-slate-300 bg-slate-100 text-[11px] text-slate-700">{step.tag}</Badge></div>
                    <p className="mt-1 text-[14px] font-semibold">{step.title}</p>
                    <p className="mt-1 text-[12px] text-slate-600">{step.d}</p>
                    <div className="mt-2 flex gap-1">{step.s.map((st) => <span key={st} className={cn("rounded px-2 py-0.5 text-[10px] text-white", st === "PP" ? "bg-amber-500" : st.includes("Sales") ? "bg-emerald-600" : st === "Plants" ? "bg-red-600" : st === "NE" ? "bg-slate-600" : "bg-sky-600")}>{st}</span>)}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-[#C3002F]">↓</div>

              <div className="rounded-md bg-[#2E7D32] px-3 py-2 text-white">
                <p className="text-[14px] font-semibold">PHASE 3: MONTHLY CONFIRMATION</p>
                <p className="text-[12px] opacity-90">Week W-3 Completion - Forecast Generation &amp; Plant Scheduling</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: "⚙️", title: "Forecast Generation", d: "System generates the last 2 months and uploads SCOPE pipeline forecast.", tag: "W-3", s: ["PP"] },
                  { icon: "🏭", title: "Plant Scheduling", d: "Plants create production schedule, process partial net-off, and submit final volume to NSA.", tag: "W-3", s: ["Plants", "PP"] },
                  { icon: "🔄", title: "Monthly Confirmation & Pipeline Update", d: "Plant transmits monthly confirmation and pipeline is updated with the new 5-month forecast.", tag: "W-3", s: ["Plants", "NE"] },
                ].map((step) => (
                  <div key={step.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between"><p className="text-lg">{step.icon}</p><Badge className="rounded border border-slate-300 bg-slate-100 text-[11px] text-slate-700">{step.tag}</Badge></div>
                    <p className="mt-1 text-[14px] font-semibold">{step.title}</p>
                    <p className="mt-1 text-[12px] text-slate-600">{step.d}</p>
                    <div className="mt-2 flex gap-1">{step.s.map((st) => <span key={st} className={cn("rounded px-2 py-0.5 text-[10px] text-white", st === "PP" ? "bg-amber-500" : st === "Plants" ? "bg-red-600" : "bg-slate-600")}>{st}</span>)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Stakeholder RACI Matrix</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-5">
              <table className="w-full min-w-[780px] text-[12px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Activity</th>
                    <th className="px-3 py-2 text-left">RBU/NSCs</th>
                    <th className="px-3 py-2 text-left">NESAS Sales</th>
                    <th className="px-3 py-2 text-left">Production Planning (PP)</th>
                    <th className="px-3 py-2 text-left">Plants</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Volume Request", "R", "A", "C", "I"],
                    ["OCF Simulation", "I", "C", "R", "A"],
                    ["SRVC Meeting", "I", "C", "R", "A"],
                    ["Volume Allocation", "I", "A", "R", "C"],
                    ["EI Mix Forecast (Provisional)", "R", "A", "C", "I"],
                    ["OCF Breach Resolution", "C", "I", "R", "A"],
                    ["EI Mix (Confirmation)", "R", "A", "C", "I"],
                    ["Forecast Generation", "I", "I", "R", "C"],
                    ["Plant Scheduling", "I", "I", "C", "R"],
                    ["Monthly Confirmation", "I", "I", "C", "R"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-3 py-2">{row[0]}</td>
                      {row.slice(1).map((v, idx) => (
                        <td key={`${row[0]}-${idx}`} className="px-3 py-2">
                          <span className={cn("inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white", v === "R" && "bg-red-600", v === "A" && "bg-amber-500", v === "C" && "bg-sky-600", v === "I" && "bg-slate-500")}>{v}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[11px] text-slate-600">Legend: R = Responsible | A = Accountable | C = Consulted | I = Informed</p>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Current Cycle Status Indicator</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-5">
              <div className="min-w-[980px]">
                <div className="relative flex items-center justify-between">
                  {timelineNodes.map((n, idx) => (
                    <div key={n} className="flex w-20 flex-col items-center text-center">
                      <div className={cn("h-3 w-3 rounded-full", idx < currentTimelineIndex ? "bg-emerald-500" : idx === currentTimelineIndex ? "animate-pulse bg-[#C3002F]" : "bg-slate-300")} />
                      <p className="mt-1 text-[10px] text-slate-600">{n}</p>
                    </div>
                  ))}
                  <div className="absolute left-0 right-0 top-1.5 -z-10 h-0.5 bg-slate-200" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-[#C3002F]">WE ARE HERE - W-3: OCF Breach</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "Volume Request & Plant Reply" && (
        <div className="space-y-4">
          <Card className={panelClass}>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Select options={["K123 (Qashqai)", "J10 (X-Trail)", "E11 (Note)", "K12 (Micra)"]} value={model} onChange={(e) => setModel(e.target.value)} className="h-9 min-w-52 border-slate-300 bg-white text-[13px]" />
              <Select options={["May Ordertake", "September Ordertake", "October Ordertake"]} value={ordertake} onChange={(e) => setOrdertake(e.target.value)} className="h-9 min-w-52 border-slate-300 bg-white text-[13px]" />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 px-5 py-3">
                <CardTitle className="text-[16px]">VOLUME REQUEST - {ordertake}</CardTitle>
                <p className="text-[12px] text-slate-500">Model: {model}</p>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <table className="w-full text-[12px]">
                  <thead className="bg-slate-700 text-white">
                    <tr><th className="px-2 py-2 text-left">Metric</th><th className="px-2 py-2 text-right">Jun-26</th><th className="px-2 py-2 text-right">Jul-26</th><th className="px-2 py-2 text-right">Aug-26</th><th className="px-2 py-2 text-right">Sep-26</th><th className="px-2 py-2 text-right">Oct-26</th><th className="bg-slate-600 px-2 py-2 text-right">Total</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="px-2 py-2 font-semibold">MS (Market Sizing)</td><td className="px-2 py-2 text-right">6,886</td><td className="px-2 py-2 text-right">6,578</td><td className="px-2 py-2 text-right">4,893</td><td className="px-2 py-2 text-right">8,233</td><td className="px-2 py-2 text-right">9,570</td><td className="bg-slate-100 px-2 py-2 text-right">-</td></tr>
                    <tr className="border-b border-slate-100 bg-slate-50"><td className="px-2 py-2">Total Request Vol</td><td className="px-2 py-2 text-right">7,193</td><td className="px-2 py-2 text-right">7,004</td><td className="px-2 py-2 text-right">5,173</td><td className="px-2 py-2 text-right">8,190</td><td className="px-2 py-2 text-right">6,016</td><td className="bg-slate-100 px-2 py-2 text-right">-</td></tr>
                    <tr className="border-b border-slate-100"><td className="px-2 py-2 font-bold">DIFF</td><td className="px-2 py-2 text-right font-bold text-emerald-600">307</td><td className="px-2 py-2 text-right font-bold text-emerald-600">426</td><td className="px-2 py-2 text-right font-bold text-emerald-600">280</td><td className="px-2 py-2 text-right font-bold text-red-600">-43</td><td className="px-2 py-2 text-right font-bold text-red-600">-3,554</td><td className="bg-slate-100 px-2 py-2 text-right font-bold text-red-600">-2,584</td></tr>
                    <tr><td className="px-2 py-1" colSpan={7} /></tr>
                    <tr className="border-b border-slate-100 bg-slate-50"><td className="px-2 py-2">Group Stock</td><td className="px-2 py-2 text-right">13,502</td><td className="px-2 py-2 text-right">13,027</td><td className="px-2 py-2 text-right">13,689</td><td className="px-2 py-2 text-right">12,848</td><td className="px-2 py-2 text-right">12,989</td><td className="bg-slate-100 px-2 py-2 text-right">-</td></tr>
                    <tr><td className="px-2 py-2">Stock Variance</td><td className="bg-red-50 px-2 py-2 text-right text-red-600">-605</td><td className="px-2 py-2 text-right">618</td><td className="bg-red-50 px-2 py-2 text-right text-red-600">-2,308</td><td className="px-2 py-2 text-right">-29</td><td className="px-2 py-2 text-right">96</td><td className="bg-slate-100 px-2 py-2 text-right">-</td></tr>
                  </tbody>
                </table>
                <p className="text-[12px] italic text-slate-500">• The volume request is sent to the plants defining required total production volume per month.</p>
                <p className="text-[12px] italic text-slate-500">• Also included is a system-generated OCF simulation based on this request.</p>
              </CardContent>
            </Card>

            <Card className={panelClass}>
              <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">PLANT REPLY - Capacity &amp; Flexibility</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="mb-2 text-[13px] font-semibold">Plant Reply Volume</p>
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-700 text-white"><tr><th className="px-2 py-1 text-left">Metric</th><th className="px-2 py-1 text-right">Jun</th><th className="px-2 py-1 text-right">Jul</th><th className="px-2 py-1 text-right">Aug</th><th className="px-2 py-1 text-right">Sep</th><th className="px-2 py-1 text-right">Oct</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1">Sub #2</td><td className="px-2 py-1 text-right">6,333</td><td className="px-2 py-1 text-right">7,189</td><td className="px-2 py-1 text-right">5,844</td><td className="px-2 py-1 text-right">9,763</td><td className="px-2 py-1 text-right">8,702</td></tr>
                      <tr className="border-b border-slate-100 bg-slate-50"><td className="px-2 py-1">MS</td><td className="px-2 py-1 text-right">6,886</td><td className="px-2 py-1 text-right">6,578</td><td className="px-2 py-1 text-right">4,893</td><td className="px-2 py-1 text-right">8,233</td><td className="px-2 py-1 text-right">9,570</td></tr>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1">Request</td><td className="px-2 py-1 text-right">7,193</td><td className="px-2 py-1 text-right">7,004</td><td className="px-2 py-1 text-right">5,173</td><td className="px-2 py-1 text-right">8,190</td><td className="px-2 py-1 text-right">6,016</td></tr>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1 font-bold">DIFF</td><td className="px-2 py-1 text-right font-bold text-emerald-600">307</td><td className="px-2 py-1 text-right font-bold text-emerald-600">426</td><td className="px-2 py-1 text-right font-bold text-emerald-600">280</td><td className="px-2 py-1 text-right font-bold text-red-600">-43</td><td className="px-2 py-1 text-right font-bold text-red-600">-3,554</td></tr>
                      <tr><td className="px-2 py-1" colSpan={6} /></tr>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1">G16 Stock</td><td className="px-2 py-1 text-right">14,197</td><td className="px-2 py-1 text-right">13,722</td><td className="px-2 py-1 text-right">14,384</td><td className="px-2 py-1 text-right">13,543</td><td className="px-2 py-1 text-right">13,684</td></tr>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1">vs. Target</td><td className="px-2 py-1 text-right">90</td><td className="px-2 py-1 text-right">1,313</td><td className="px-2 py-1 text-right">-1,613</td><td className="px-2 py-1 text-right">666</td><td className="px-2 py-1 text-right">791</td></tr>
                      <tr className="bg-emerald-100 font-semibold"><td className="px-2 py-1">REPLY</td><td className="px-2 py-1 text-right">7,193</td><td className="px-2 py-1 text-right">7,004</td><td className="px-2 py-1 text-right">5,173</td><td className="px-2 py-1 text-right">8,190</td><td className="px-2 py-1 text-right">9,570</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded border border-slate-200 p-3">
                    <p className="text-[12px] font-semibold">Line #2 - Production Conditions</p>
                    <p className="mb-2 text-[11px] text-slate-600">Capacity: 414 units/day [195k p.a.]</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={[{ label: "Request", value: 360 }, { label: "Reply", value: 401 }]}>
                        <CartesianGrid stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <ReferenceLine y={414} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: "Max 414", position: "insideTopRight", fontSize: 10 }} />
                        <Bar dataKey="value">
                          <Cell fill="#C3002F" />
                          <Cell fill="#16a34a" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded border border-slate-200 p-3">
                    <p className="mb-2 text-[12px] font-semibold">Overtime % by Month</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={overtime}>
                        <CartesianGrid stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: "Max: 20%", position: "insideTopRight", fontSize: 10 }} />
                        <ReferenceLine y={17.6} stroke="#64748b" strokeDasharray="4 3" label={{ value: "Current max approved", position: "insideTopLeft", fontSize: 10 }} />
                        <Bar dataKey="value">
                          {overtime.map((o) => <Cell key={o.month} fill={o.value < 10 ? "#16a34a" : o.value <= 15 ? "#f59e0b" : "#ef4444"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] font-semibold">Volume Flexibility - Stand Downs &amp; Stand Ups</p>
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-100 text-slate-700"><tr><th className="px-2 py-1 text-left">Type</th><th className="px-2 py-1 text-right">Taken YTD</th><th className="px-2 py-1 text-right">Jun</th><th className="px-2 py-1 text-right">Jul</th><th className="px-2 py-1 text-right">Aug</th><th className="px-2 py-1 text-right">Sep</th><th className="px-2 py-1 text-right">Oct</th><th className="px-2 py-1 text-right">New Total</th><th className="px-2 py-1 text-right">Balance</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-slate-100"><td className="px-2 py-1">Stand Downs</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">14</td></tr>
                      <tr><td className="px-2 py-1">Stand Ups</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">0</td><td className="px-2 py-1 text-right">12</td></tr>
                    </tbody>
                  </table>
                  <p className="mt-1 text-[11px] text-slate-500">Balance represents remaining flexibility available for the fiscal year</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "Job Schedule" && (
        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-5 py-3">
            <CardTitle className="text-[16px]">Monthly Cycle - Job Schedule</CardTitle>
            <p className="text-[12px] text-slate-500">Issued by: NE Production Planning | NMUK, NSIO, NMEX, MSIL Monthly Cycle</p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] text-slate-600">Plant Scope: E = European Plants | M = Japanese/Multi | I = Indian Plants | R = Russia</p>
              <div className="flex items-center gap-2 text-[12px]">
                <label>Today Marker (Cycle Day)</label>
                <input type="range" min={1} max={16} value={todayDay} onChange={(e) => setTodayDay(Number(e.target.value))} />
                <input type="number" min={1} max={16} value={todayDay} onChange={(e) => setTodayDay(Math.max(1, Math.min(16, Number(e.target.value))))} className="h-7 w-14 rounded border border-slate-300 px-1" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1450px] text-[11px]">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="px-2 py-2 text-left">Activity Name</th>
                    <th className="px-2 py-2 text-left">Responsible</th>
                    <th className="px-2 py-2 text-left">Deadline/Time CET</th>
                    <th colSpan={5} className="px-2 py-2 text-center">Industrial Week 9</th>
                    <th colSpan={5} className="px-2 py-2 text-center">Industrial Week 10</th>
                    <th colSpan={6} className="px-2 py-2 text-center">Week 10 cont.</th>
                  </tr>
                  <tr className="bg-slate-600 text-white">
                    <th />
                    <th />
                    <th />
                    {ganttDays.map((d) => <th key={`day-${d.day}`} className={cn("px-1 py-1 text-center", d.day === todayDay && "bg-[#C3002F]")}>{d.day}</th>)}
                  </tr>
                  <tr className="bg-slate-500 text-white">
                    <th />
                    <th />
                    <th />
                    {ganttDays.map((d) => <th key={`name-${d.day}`} className={cn("px-1 py-1 text-center", ["Sat", "Sun"].includes(d.name) && "bg-slate-400", d.day === todayDay && "bg-[#C3002F]")}>{d.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, idx) => (
                    <tr
                      key={a.name}
                      title={`${a.name} | ${a.responsible} | ${a.time} | Scope: ${a.markers.join(", ")} | ${a.desc}`}
                      className={cn(
                        "border-b border-slate-200",
                        a.phase === 1 && "bg-red-50/50",
                        a.phase === 2 && "bg-amber-50/50",
                        a.phase === 3 && "bg-sky-50/50",
                        a.phase === 4 && "bg-emerald-50/50"
                      )}
                    >
                      <td className="px-2 py-1.5">{idx + 1}. {a.name}</td>
                      <td className="px-2 py-1.5">{a.responsible}</td>
                      <td className="px-2 py-1.5">{a.time}</td>
                      {ganttDays.map((d) => (
                        <td key={`${a.name}-${d.day}`} className={cn("h-8 border-l border-slate-100 px-1 text-center", ["Sat", "Sun"].includes(d.name) && "bg-slate-200/50", d.day === todayDay && "border-l-2 border-l-[#C3002F] bg-red-50/50") }>
                          {d.day === a.day && (
                            <div className="flex flex-wrap justify-center gap-0.5">
                              {a.markers.map((m) => <span key={`${a.name}-${m}`} className={cn("rounded px-1 py-0.5 text-[9px] font-semibold text-white", markerColor[m])}>{m}</span>)}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "Pipeline Horizon" && (
        <div className="space-y-4">
          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Production Ordering - Logical Pipeline (6-Month Horizon)</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-100 to-white p-4">
                <div className="flex flex-wrap-reverse overflow-hidden rounded-md border border-slate-300 shadow-inner">
                  {[
                    { label: "Dec (N-1)", color: "bg-emerald-800", note: "Completion" },
                    { label: "Jan (N)", color: "bg-emerald-600", note: "Volume Fixed / EI Flex" },
                    { label: "Feb (N+1)", color: "bg-emerald-300", note: "Free Forecast" },
                    { label: "Mar (N+2)", color: "bg-emerald-200", note: "Free Forecast" },
                    { label: "Apr (N+3)", color: "bg-fuchsia-200", note: "System Forecast" },
                    { label: "May (N+4)", color: "bg-yellow-300", note: "System Forecast" },
                  ].map((m, idx) => (
                    <div key={m.label} className={cn("relative min-h-[72px] flex-1 border-r border-white/60 p-2 text-[11px]", m.color, idx >= 2 && idx <= 3 && "bg-[linear-gradient(45deg,rgba(255,255,255,0.35)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.35)_75%,transparent_75%,transparent)] bg-[length:10px_10px]") }>
                      <p className="font-semibold">{m.label}</p>
                      <p>{m.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-[2fr,1fr,1fr,1fr] gap-2 text-[11px]">
                  <div className="rounded border border-slate-300 bg-white p-2">6 Months (Monthly Buckets)</div>
                  <div className="rounded border border-slate-300 bg-white p-2">4 Weeks</div>
                  <div className="rounded border border-slate-300 bg-white p-2">2 Weeks</div>
                  <div className="rounded border border-slate-300 bg-white p-2">9 Days / Day 6 EI+Color Fixed</div>
                </div>
                <p className="mt-2 text-[11px] text-slate-600">&larr; Operationally shrinks - granularity increases as production approaches &rarr;</p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {pipelineSteps.map((s, idx) => (
                    <button key={s} onClick={() => setPipelineStep(idx)} className={cn("rounded border px-3 py-1.5 text-[12px]", pipelineStep === idx ? "border-[#C3002F] bg-[#C3002F] text-white" : "border-slate-300 bg-white text-slate-700")}>Step {idx + 1}</button>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[14px] font-semibold">{pipelineSteps[pipelineStep]}</p>
                  <p className="mt-1 text-[12px] text-slate-600">{stepDescriptions[pipelineStep]}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {pipelineStep === 0 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">Plant input + empty months created</Badge>}
                    {pipelineStep === 1 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">Market codes FRA/GBR/ITA split applied</Badge>}
                    {pipelineStep === 2 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">RBU forecast loaded into 3-month horizon</Badge>}
                    {pipelineStep === 3 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">Validation loop active (OCF/CCF checks)</Badge>}
                    {pipelineStep === 4 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">System forecast months generated</Badge>}
                    {pipelineStep === 5 && <Badge className="rounded border border-slate-300 bg-white text-slate-700">Copied to LIVE operational pipeline</Badge>}
                  </div>
                </div>
              </div>

              <div className="rounded border border-slate-200 bg-white p-4">
                <p className="text-[14px] font-semibold">Forecast Granularity Breakdown</p>
                <div className="mt-2 flex h-10 overflow-hidden rounded border border-slate-300 text-[11px]">
                  <div className="flex-[6] bg-slate-200 px-2 py-2">6 Months (Monthly)</div>
                  <div className="flex-[2] bg-slate-300 px-2 py-2">4 Weeks</div>
                  <div className="flex-[1.5] bg-slate-400 px-2 py-2 text-white">2 Weeks</div>
                  <div className="relative flex-1 bg-slate-500 px-2 py-2 text-white">9 Days
                    <span className="absolute left-[55%] top-0 h-full w-0.5 bg-red-500" />
                  </div>
                  <div className="flex-[0.8] bg-slate-700 px-2 py-2 text-white">6 Days</div>
                </div>
                <p className="mt-2 text-[11px] text-red-600">Flexibility cutoff: EI + Color fixed at Day 6. Weekly Order Take occurs every Thursday.</p>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Planning Horizon - May Ordertake Example</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-5">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100 text-slate-700"><tr><th className="px-2 py-2 text-left">Month</th><th className="px-2 py-2 text-left">Calendar</th><th className="px-2 py-2 text-left">Horizon Position</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-left">Flexibility</th></tr></thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="px-2 py-2">September</td><td className="px-2 py-2">Month N-1</td><td className="px-2 py-2">Completion</td><td className="px-2 py-2">🟢 In Production</td><td className="px-2 py-2">None - Schedule fixed</td></tr>
                  <tr className="border-b border-slate-100 bg-slate-50"><td className="px-2 py-2">October</td><td className="px-2 py-2">Month N</td><td className="px-2 py-2">Current</td><td className="px-2 py-2">🟢 Volume Fixed</td><td className="px-2 py-2">EI mix flex only</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-2 py-2">November</td><td className="px-2 py-2">Month N+1</td><td className="px-2 py-2">Near term</td><td className="px-2 py-2">🟡 Free Forecast</td><td className="px-2 py-2">Volume + EI flex</td></tr>
                  <tr className="border-b border-slate-100 bg-slate-50"><td className="px-2 py-2">December</td><td className="px-2 py-2">Month N+2</td><td className="px-2 py-2">Medium term</td><td className="px-2 py-2">🟡 Free Forecast</td><td className="px-2 py-2">Volume + EI flex</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-2 py-2">January</td><td className="px-2 py-2">Month N+3</td><td className="px-2 py-2">Far term</td><td className="px-2 py-2">🔵 System Forecast</td><td className="px-2 py-2">Full flexibility</td></tr>
                  <tr className="bg-slate-50"><td className="px-2 py-2">February</td><td className="px-2 py-2">Month N+4</td><td className="px-2 py-2">Far term</td><td className="px-2 py-2">🔵 System Forecast</td><td className="px-2 py-2">Full flexibility</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "OCF/CCF Constraints" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className={panelClass}><CardContent className="space-y-2 border-t-4 border-[#C3002F] p-5"><p className="text-[16px] font-semibold">🔒 OCF - Order Control Frame</p><p className="text-[12px] text-slate-700">Constraints monitored during ordering due to build, supplier, and cost limits.</p><p className="text-[12px] text-slate-600">Controls demand within plant capability and long lead-time parts availability.</p><ul className="space-y-1 text-[12px] text-slate-700"><li>New model preparation activity</li><li>Iterative control on high-value/high-cube parts</li><li>Production and supplier capability confirmation</li><li>On-going maintenance activity</li></ul></CardContent></Card>
            <Card className={panelClass}><CardContent className="space-y-2 border-t-4 border-sky-600 p-5"><p className="text-[16px] font-semibold">🎨 CCF - Colour Control Frame</p><p className="text-[12px] text-slate-700">Constraints controlling exterior and interior colour mix.</p><p className="text-[12px] text-slate-600">Manages paint shop capacity, colour batch sequencing, and colour-specific supplier limits.</p></CardContent></Card>
          </div>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">End Item to Feature Translation</CardTitle><p className="text-[12px] text-slate-500">Each end-item code is linked to manufacturing features. OCF limits control max usage.</p></CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-4 xl:grid-cols-[1fr,40px,1fr]">
                <div className="rounded border border-slate-300 bg-[#003B4F] p-4 font-mono text-[12px] text-cyan-100">
                  <p className="mb-2 text-yellow-200">N+1 Forecast - End Item Input</p>
                  <p>EAEALBFK11EFA12345 FRA AJ4K x10</p>
                  <p>FAEALDFK11EFA56789 FRA KL0K x15</p>
                  <p>FANALDZK11EFA23127 GER KH3K x5</p>
                </div>
                <div className="flex items-center justify-center text-2xl text-[#C3002F]">→</div>
                <div className="rounded border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-[13px] font-semibold">OCF Fixed at N+1 - Feature Limits</p>
                  <table className="w-full text-[12px]">
                    <thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Feature</th><th className="px-2 py-1 text-right">Forecast Usage</th><th className="px-2 py-1 text-right">Flex %</th><th className="px-2 py-1 text-right">Limit</th></tr></thead>
                    <tbody>{[["3 door", 10, "10%", 12], ["5 door", 20, "10%", 22], ["1.0 litre", 25, "20%", 30], ["1.4 litre", 5, "20%", 6], ["Manual T/X", 25, "10%", 28], ["CVT", 5, "20%", 6], ["A/CON", 15, "40%", 21]].map((r) => <tr key={String(r[0])} className="border-b border-slate-100"><td className="px-2 py-1">{r[0]}</td><td className="px-2 py-1 text-right">{r[1]}</td><td className="px-2 py-1 text-right">{r[2]}</td><td className="px-2 py-1 text-right font-bold text-red-600">{r[3]}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded border border-slate-300 bg-[#003B4F] p-4 font-mono text-[12px] text-cyan-100">
                  <p className="mb-2 text-yellow-200">N Forecast</p>
                  <p>EAEALBFK11EFA12345 FRA AJ4K x8</p>
                  <p>FAEALDFK11EFA56789 FRA KL0K x16</p>
                  <p>FANALDZK11EFA23127 GER KH3K x6</p>
                </div>
                <div className="rounded border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-[13px] font-semibold">Feature Usage vs Carried Limits</p>
                  <table className="w-full text-[12px]">
                    <thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Feature</th><th className="px-2 py-1 text-right">Usage</th><th className="px-2 py-1 text-center">→</th><th className="px-2 py-1 text-right">Limit (carried)</th></tr></thead>
                    <tbody>
                      {[["3 door", 8, 12], ["5 door", 22, 22], ["1.0 litre", 24, 30], ["1.4 litre", 6, 6], ["Manual T/X", 24, 28], ["CVT", 6, 6], ["A/CON", 14, 21]].map((r) => {
                        const status = Number(r[1]) < Number(r[2]) ? "✅" : Number(r[1]) === Number(r[2]) ? "⚠️" : "❌";
                        return <tr key={String(r[0])} className="border-b border-slate-100"><td className="px-2 py-1">{r[0]}</td><td className="px-2 py-1 text-right">{r[1]}</td><td className="px-2 py-1 text-center">→</td><td className="px-2 py-1 text-right">{r[2]} {status}</td></tr>;
                      })}
                    </tbody>
                  </table>
                  <p className="mt-1 text-[11px] text-red-600">Limits carry forward across N+1 to N unless breach approval is granted.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">OCF Breach Resolution Process</CardTitle><p className="text-[12px] text-slate-500">When forecast demand exceeds OCF limits, a breach request is initiated.</p></CardHeader>
            <CardContent className="space-y-3 p-5">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100"><tr><th className="px-2 py-2 text-left">OCF Feature</th><th className="px-2 py-2 text-right">Ideal Usage</th><th className="px-2 py-2 text-right">Current Limit</th><th className="px-2 py-2 text-right">Difference</th><th className="px-2 py-2 text-center">→</th><th className="px-2 py-2 text-right">Revised TTL Limit</th></tr></thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="px-2 py-2">EGB region</td><td className="px-2 py-2 text-right">40</td><td className="px-2 py-2 text-right">50</td><td className="px-2 py-2 text-right text-emerald-600">+10 ✅</td><td className="px-2 py-2 text-center"> </td><td className="px-2 py-2 text-right">-</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-2 py-2">CEN region</td><td className="px-2 py-2 text-right">80</td><td className="px-2 py-2 text-right">60</td><td className="px-2 py-2 text-right font-bold text-red-600">-20 ❌</td><td className="px-2 py-2 text-center"> </td><td className="px-2 py-2 text-right">-</td></tr>
                  <tr className="bg-red-50 font-semibold"><td className="px-2 py-2">TOTAL</td><td className="px-2 py-2 text-right">120</td><td className="px-2 py-2 text-right">110</td><td className="px-2 py-2 text-right text-red-600">-10 ❌ Breach</td><td className="px-2 py-2 text-center">→</td><td className="px-2 py-2 text-right">120</td></tr>
                </tbody>
              </table>
              <div className="grid gap-2 md:grid-cols-4">
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px]">Breach Identified</div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px]">Request Sent to Plant</div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px]">Key Parties Review<br />RPC, supplier assessment, plant capacity, supply calendarisation</div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px]">Decision &amp; Resolution<br />✅ Breach supported or ❌ forecast adjusted</div>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[16px]">Legacy System Interface - SCOPE Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-3 p-5">
              {[`
LINDA - myEXTRA! Enterprise
SPF111 **** PRODUCTION ORDERING **** 02/04/26
EURO LIVE - Period Selection - 12:33:11

          Car Series : E112      NOTE MC1
L 2026/04/13 _ 2026/04/14 _ 2026/04/15 _ 2026/04/16 _ 2026/16 (w)
_ 2026/17 (w) _ 2026/18 (w) _ 2026/19 (w) _ 2026/20 (w) _ 2026/21 (w)
_ 2026/22 (w) _ 2026/23 (w) _ 2026/24 (w) _ 2026/25 (w) _ 2026/26 (w)
_ 2026/27 (w) _ 2026/28 (w) _ 2026/29 (w) _ 2026/30 (w) _ 2026/31 (w)
_ 2026/32 (w)

                    Enter 'S' to select a period
Enter-PF1---PF2---PF3---PF4---PF5---PF6---PF7---PF8---PF9---PF10--PF11--PF12
Exit Main
`, `
LINDA - myEXTRA! Enterprise
CPM926 **** SUPPLY CHAIN MANAGEMENT SYSTEM **** 05/03/12
LIVE - Physical Pipeline Enquiry - 12:46:08

                Model Grp: E11B
                          BBSS Rc    Offline     Comp In
All Vehicles/Orders Total (11) (16) (18)
==================== Vins Vin Ord Vin Ord Vin Ord
Model Variant 28226 1527 783 42 22 118 60
_ FDLALBFE11EGA----A 1
_ FDLALBFE11EGAA---- 732 1
_ FDLALBFE11EGAA---A 250 42 37 1 1 6 6
_ FDLALBFE11EGAC---- 439 1
_ FDLALBFE11EGAC---A 298 1
_ FDLALBFE11EGAC---B 9
_ FDLALBFE11EGAC---C 4 4
_ FDLALBFE11EGAC---D 31 5
_ FDLALBFE11EGAE---A 4
_ FDLALBFE11EG5+0004 1
_ FDLALBFE11EG5+0133 1
Enter-PF1---PF2---PF3---PF4---PF5---PF6---PF7---PF8---PF9---PF10--PF11--PF12
Exit Main Totals Colour Vin Order Logic Right
`].map((screen, idx) => (
                <div key={idx} className="relative overflow-hidden rounded border border-slate-700 bg-[#003B4F] p-4 font-mono text-[12px] leading-5 text-cyan-100 shadow-inner">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)]" />
                  <pre className="relative whitespace-pre-wrap">{screen}</pre>
                </div>
              ))}
              <p className="text-[11px] text-slate-600">SCOPE Pipeline Management System - Terminal-based legacy interface used for production ordering and physical pipeline enquiry (2003-2010)</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProcessOptimizationPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const steps = [
    "Request Intake",
    "Pipeline Analysis",
    "Production Cycle Engagement",
    "Japan SCM Coordination",
    "Pipeline Pull-Forward",
    "Logistics Planning",
    "Financial & Ownership Control",
    "Delivery & Invoicing",
  ];

  const navigate = (index: number) => {
    if (index === step) return;
    setDirection(index > step ? 1 : -1);
    setStep(Math.max(0, Math.min(steps.length - 1, index)));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") navigate(step + 1);
      if (event.key === "ArrowLeft") navigate(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="space-y-4 bg-[#F0F0F0] p-4 lg:p-6">
      <section className="space-y-1">
        <h2 className="text-[20px] font-bold text-slate-900">Process Optimization - Fleet Pipeline Acceleration</h2>
        <p className="text-[13px] text-slate-500">Case Study: France X-Trail Fleet Delivery - End-to-End Pipeline Management</p>
      </section>

      <Card className="rounded-md border border-[#d7d9e0] bg-[#E8EAF6] shadow-sm">
        <CardContent className="grid gap-3 p-4 lg:grid-cols-3">
          <div className="space-y-1 text-[12px]">
            <p className="text-[14px] font-semibold">📋 The Request</p>
            <p>France NSC (WEST RBU)</p>
            <p>20 x X-Trail 2.2 dCi Diesel (T31)</p>
            <p>Fleet customer: Entreprise Bouygues</p>
            <p className="font-semibold">Required: Invoiced before 30-Jun-2026</p>
          </div>
          <div className="space-y-1 text-[12px]">
            <p className="text-[14px] font-semibold">⏱️ The Challenge</p>
            <p>Current date: 02-Apr-2026</p>
            <p>Available time: ~12 weeks</p>
            <p>Source factory: Japan (Kyushu Plant)</p>
            <p className="font-semibold text-[#C3002F]">Standard lead time: 70 days (too tight)</p>
          </div>
          <div className="space-y-1 text-[12px]">
            <p className="text-[14px] font-semibold">📊 Key Metrics</p>
            <p>X-Trail monthly allocation FRA: 85 units</p>
            <p>Current pipeline for FRA: 62 units (Dec bucket)</p>
            <p>Fleet priority: Must pull forward from Jan bucket</p>
            <p className="font-semibold">Financial value: ~€600,000</p>
          </div>
        </CardContent>
      </Card>

      <Card className={panelClass}>
        <CardContent className="sticky top-[52px] z-20 bg-white p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {steps.map((label, idx) => {
              const done = idx < step;
              const active = idx === step;
              return (
                <button key={label} onClick={() => navigate(idx)} className="flex flex-col items-center gap-1">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-bold", done && "border-emerald-600 bg-emerald-600 text-white", active && "h-10 w-10 border-[#C3002F] bg-[#C3002F] text-white", !done && !active && "border-slate-300 bg-white text-slate-500")}>{done ? "✓" : idx + 1}</div>
                  <p className={cn("text-center text-[11px] leading-tight", active ? "font-semibold text-[#8a001f]" : "text-slate-600")}>{label}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }} transition={{ duration: 0.22 }} className="space-y-4">
          {step === 0 && (
            <div className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
              <Card className={panelClass}>
                <CardHeader className="border-b border-slate-200 bg-[#C3002F] px-4 py-3 text-white"><CardTitle className="text-[16px]">FLEET ORDER REQUEST - PRIORITY</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-[12px]"><tbody>{[["Request ID","FLT-2026-1847"],["Date Received","28-Mar-2026"],["Requesting NSC","Nissan France (WEST RBU)"],["Fleet Customer","Entreprise Bouygues Construction"],["Fleet Type","Corporate - Long-term rental"],["Model","X-Trail 2.2 dCi (T31)"],["Specification","End Item: J10DFD2WDLHDSV01FR"],["Engine","2.2 dCi Diesel, 150hp"],["Drivetrain","2WD"],["Transmission","Manual 6-speed"],["Trim","SVE"],["Exterior Color","Blade Silver (KY0)"],["Quantity","20 units"],["Required Delivery","Le Havre compound, France"],["Invoice Deadline","30-Jun-2026"],["Priority","HIGH - Year-end fleet target"]].map((r)=><tr key={r[0] as string} className="border-b border-slate-100 even:bg-slate-50"><td className="w-[35%] px-3 py-2 font-semibold text-slate-700">{r[0]}</td><td className="px-3 py-2">{r[1]}</td></tr>)}</tbody></table>
                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2"><Badge className="rounded bg-amber-100 text-amber-800">RECEIVED - PENDING PIPELINE REVIEW</Badge><span className="text-[12px] text-slate-500">Assigned to SCM & Sales Operations - NE Paris</span></div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                <Card className={panelClass}><CardContent className="space-y-2 border-l-4 border-[#C3002F] p-4 text-[13px]"><p className="text-[15px] font-semibold">Why This Matters</p><p>€600K wholesale revenue and critical contribution to France Q4 fleet target.</p><p>Bouygues is a strategic customer with 2027 renewal exposure.</p><p>X-Trail source lane is Japan, with longest lead time in the network.</p></CardContent></Card>
                <Card className={panelClass}><CardContent className="space-y-2 p-4 text-[13px]"><p className="text-[15px] font-semibold">Standard Timeline Assessment</p><div className="rounded border border-slate-200 bg-slate-50 p-3 font-mono text-[12px]">07-Oct to Production(21d) to Sea(42d) to Compound(7d) to Delivery (~16-Dec)</div><p>Only five business days of buffer remain before 31-Dec.</p><p className="font-semibold text-[#C3002F]">Standard process is too risky. Acceleration required.</p></CardContent></Card>
                <Card className={panelClass}><CardContent className="space-y-1 p-4 text-[13px]"><p className="text-[15px] font-semibold">Available Options</p><p>✅ Pull forward Jan units into Dec sequence.</p><p>✅ Prioritize daily slots with Japan SCM.</p><p>✅ Pre-arrange UK compound to Le Havre routing.</p><p>❌ New order entry too late for Dec schedule.</p><p>❌ No open spec match without stock reallocation.</p></CardContent></Card>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">X-Trail (T31) - France Pipeline Snapshot</CardTitle></CardHeader><CardContent className="overflow-x-auto p-4"><table className="w-full text-[12px]"><thead className="bg-slate-800 text-white"><tr><th className="px-2 py-2 text-left">End Item Code</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-right">Oct-13</th><th className="px-2 py-2 text-right">Nov-13</th><th className="bg-amber-100 px-2 py-2 text-right text-slate-800">Dec-13</th><th className="bg-amber-100 px-2 py-2 text-right text-slate-800">Jan-14</th><th className="px-2 py-2 text-right">Feb-14</th><th className="px-2 py-2 text-right">Mar-14</th><th className="px-2 py-2 text-right">Total</th></tr></thead><tbody>{[["J10DFD2WDLHDSV01FR","Forecast",12,15,18,22,20,18,105],["J10DFD2WDLHDAC01FR","Forecast",8,10,12,14,12,10,66],["J10DFD4WDRHDSV01FR","Forecast",5,6,8,10,8,6,43],["J10PET2WDLHDSV01FR","Forecast",4,5,6,8,6,5,34],["J10DFD2WDLHDSV02FR","Forecast",3,4,5,6,5,4,27]].map((r,i)=><tr key={r[0] as string} className={cn("border-b border-slate-100", i===0 ? "bg-yellow-50" : "even:bg-slate-50")}><td className="px-2 py-1.5 font-mono">{r[0]}</td><td className="px-2 py-1.5">{r[1]}</td><td className="px-2 py-1.5 text-right">{r[2]}</td><td className="px-2 py-1.5 text-right">{r[3]}</td><td className="bg-amber-50 px-2 py-1.5 text-right">{r[4]}</td><td className="bg-amber-50 px-2 py-1.5 text-right">{r[5]}</td><td className="px-2 py-1.5 text-right">{r[6]}</td><td className="px-2 py-1.5 text-right">{r[7]}</td><td className="px-2 py-1.5 text-right font-semibold">{r[8]}</td></tr>)}</tbody><tfoot className="bg-slate-100 font-semibold"><tr><td className="px-2 py-2">France Total</td><td /><td className="px-2 py-2 text-right">32</td><td className="px-2 py-2 text-right">40</td><td className="px-2 py-2 text-right">49</td><td className="px-2 py-2 text-right">60</td><td className="px-2 py-2 text-right">51</td><td className="px-2 py-2 text-right">43</td><td className="px-2 py-2 text-right">275</td></tr></tfoot></table></CardContent></Card>
              <div className="grid gap-3 lg:grid-cols-2"><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">What We Have</CardTitle></CardHeader><CardContent className="space-y-1 p-4 text-[13px]"><p>Dec target spec: 18 units</p><p>Jan target spec: 22 units</p><p>Timing conflict with standard sea transit</p><p>Earliest standard arrival would be mid-Jan</p></CardContent></Card><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">What We Need</CardTitle></CardHeader><CardContent className="space-y-1 p-4 text-[13px]"><p>20 units by 20-Dec for invoicing</p><p>Dec +2 / Jan -2 rebalance</p><p>Acceleration in schedule and distribution required</p><p>No net impact to 5-month budget</p></CardContent></Card></div>
              <div className="rounded border border-red-300 bg-red-50 p-3 text-[13px] font-semibold text-red-700">Gap identified: 2 units short in Dec and timing mismatch for standard logistics. Pull-forward required.</div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 xl:grid-cols-[1.25fr,1fr]">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">October Ordertake - Monthly Cycle Status</CardTitle></CardHeader><CardContent className="overflow-x-auto p-4"><table className="w-full text-[12px]"><thead className="bg-slate-100"><tr><th className="px-2 py-2 text-left">Week</th><th className="px-2 py-2 text-left">Phase</th><th className="px-2 py-2 text-left">Activity</th><th className="px-2 py-2 text-left">Status</th></tr></thead><tbody>{[["W-6","Preparation","Ordertake guidelines sent","✅ Complete"],["W-5","Volume Request","NSC requests submitted","✅ Complete"],["W-5","Volume Request","NESAS meeting held","✅ Complete"],["W-5","Volume Request","Request sent to plants","✅ Complete"],["W-4","Planning","SRVC meeting - today","🔴 IN PROGRESS"],["W-4","Planning","Plant confirmation","⏳ Pending"],["W-4","Planning","Allocation meeting","⏳ Pending"],["W-3","Forecasting","Provisional stage","⏳ Pending"],["W-3","Forecasting","Confirmation stage","⏳ Pending"],["W-3","Confirmation","Forecast generation","⏳ Pending"],["W-3","Confirmation","Monthly confirmation","⏳ Pending"]].map((r)=> <tr key={r[2] as string} className={cn("border-b border-slate-100 even:bg-slate-50", r[3]==="🔴 IN PROGRESS" && "bg-red-50")}><td className="px-2 py-1.5">{r[0]}</td><td className="px-2 py-1.5">{r[1]}</td><td className="px-2 py-1.5">{r[2]}</td><td className="px-2 py-1.5 font-semibold">{r[3]}</td></tr>)}</tbody></table><div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">Window of opportunity is open during SRVC to influence Dec/Jan allocation.</div></CardContent></Card>
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Action Plan - Stakeholder Coordination</CardTitle></CardHeader><CardContent className="space-y-2 p-4">{[["#16a34a","Contact Japan SCM","Daily slot and pull-forward confirmation requested before SRVC close.","🟢 Sent 07-Oct 08:30"],["#f59e0b","Raise in SRVC","Pull-forward request on agenda item #4.","🟡 Scheduled"],["#94a3b8","OCF check","Diesel and trim limit validation.","⏳ Pending"],["#94a3b8","Revised EI mix","Dec +2 / Jan -2 submission path.","⏳ Pending"]].map((r)=> <div key={r[1] as string} className="rounded border border-slate-200 bg-slate-50 p-3" style={{ borderLeft: `4px solid ${r[0] as string}` }}><p className="text-[13px] font-semibold">{r[1]}</p><p className="text-[12px] text-slate-700">{r[2]}</p><p className="mt-1 text-[11px] text-slate-500">{r[3]}</p></div>)}</CardContent></Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Communication Log</CardTitle></CardHeader><CardContent className="grid gap-3 p-4 lg:grid-cols-2"><div className="rounded border border-slate-200 bg-white p-3"><p className="text-[12px] font-semibold">Outbound - NE Paris to Kyushu Plant (02-Apr 08:30 CET)</p><p className="text-[12px] text-slate-600">Urgent request to move 20 units from Jul-26 to early Jun-26 slots and confirm OCF viability.</p><div className="mt-2 rounded bg-slate-900 p-3 font-mono text-[11px] text-slate-100">Request ID FLT-2026-1847 | End item J10DFD2WDLHDSV01FR | Quantity 20</div></div><div className="rounded border border-emerald-200 bg-emerald-50 p-3"><p className="text-[12px] font-semibold">Reply - Kyushu Plant to NE Paris (02-Apr 22:15 CET)</p><p className="text-[12px] text-slate-600">W49/W50/W51 adjusted to 7/7/6. Dec diesel limit remains within tolerance.</p><div className="mt-2 rounded bg-slate-900 p-3 font-mono text-[11px] text-emerald-200">Dec original 18, revised 20 (+2) | OCF Diesel 30/35 | No breach</div></div></CardContent></Card>
              <div className="grid gap-3 lg:grid-cols-2"><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">Before Schedule</CardTitle></CardHeader><CardContent className="p-4"><table className="w-full text-[12px]"><tbody>{[["W49",5],["W50",5],["W51",4],["W52",4]].map((r)=><tr key={r[0] as string} className="border-b border-slate-100"><td className="px-2 py-1.5">{r[0]}</td><td className="px-2 py-1.5 text-right font-semibold">{r[1]}</td></tr>)}</tbody><tfoot><tr><td className="px-2 py-1.5 font-semibold">Total</td><td className="px-2 py-1.5 text-right font-semibold">18</td></tr></tfoot></table></CardContent></Card><Card className="rounded-md border-2 border-emerald-500 bg-white shadow-sm"><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">After Schedule (Fleet Priority)</CardTitle></CardHeader><CardContent className="p-4"><table className="w-full text-[12px]"><tbody>{[["W49",7],["W50",7],["W51",6],["W52",0]].map((r)=><tr key={r[0] as string} className="border-b border-slate-100"><td className="px-2 py-1.5">{r[0]}</td><td className="px-2 py-1.5 text-right font-semibold text-[#C3002F]">{r[1]}</td></tr>)}</tbody><tfoot><tr><td className="px-2 py-1.5 font-semibold">Total</td><td className="px-2 py-1.5 text-right font-semibold">20 ✅</td></tr></tfoot></table></CardContent></Card></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Pipeline Bucket Decomposition</CardTitle></CardHeader><CardContent className="space-y-3 p-4"><div className="grid gap-2 md:grid-cols-3">{[["Nov-13","40"],["Dec-13","49 -> 51"],["Jan-14","60 -> 58"]].map((r, i)=><div key={r[0] as string} className={cn("rounded border p-3 text-center", i===1 ? "border-emerald-300 bg-emerald-50" : i===2 ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50")}><p className="text-[12px] font-semibold">{r[0]}</p><p className="text-[18px] font-bold">{r[1]}</p></div>)}</div><p className="text-center text-[13px] font-semibold text-[#C3002F]">2 units moved from Jan to Dec</p><div className="grid gap-2 md:grid-cols-4">{["W49 7", "W50 7", "W51 6", "W52 0"].map((w, i)=><div key={w} className={cn("rounded border p-2 text-center text-[12px]", i < 3 ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50")}>{w}</div>)}</div><div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px]">Day-6 flexibility cutoff respected. EI + Color lock completed ahead of W49.</div></CardContent></Card>
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">OCF Constraint Validation</CardTitle></CardHeader><CardContent className="overflow-x-auto p-4"><table className="w-full text-[12px]"><thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Feature</th><th className="px-2 py-1 text-right">Dec Limit</th><th className="px-2 py-1 text-right">Usage Revised</th><th className="px-2 py-1 text-left">Status</th></tr></thead><tbody>{[["2.2 dCi Diesel",35,30,"✅ Within limit"],["Manual 6-spd",40,34,"✅ Within limit"],["SVE Trim",28,24,"✅ Within limit"],["Silver KY0",22,20,"✅ Within limit"],["2WD",42,37,"✅ Within limit"]].map((r)=><tr key={r[0] as string} className="border-b border-slate-100 even:bg-slate-50"><td className="px-2 py-1.5">{r[0]}</td><td className="px-2 py-1.5 text-right">{r[1]}</td><td className="px-2 py-1.5 text-right">{r[2]}</td><td className="px-2 py-1.5 text-emerald-700">{r[3]}</td></tr>)}</tbody></table><div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-[13px] font-semibold text-emerald-700">No OCF breach request required.</div></CardContent></Card>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Logistics Route - Japan to France</CardTitle></CardHeader><CardContent className="space-y-3 p-4"><svg viewBox="0 0 520 260" className="h-[260px] w-full rounded bg-slate-50"><rect x="20" y="20" width="480" height="220" fill="#f8fafc" stroke="#cbd5e1" /><circle cx="430" cy="90" r="7" fill="#C3002F" /><text x="440" y="94" fontSize="11">Kyushu</text><circle cx="125" cy="130" r="7" fill="#2563eb" /><text x="136" y="134" fontSize="11">Portbury UK</text><circle cx="210" cy="165" r="7" fill="#0f766e" /><text x="220" y="169" fontSize="11">Le Havre</text><line x1="430" y1="90" x2="132" y2="128" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" /><line x1="132" y1="132" x2="206" y2="162" stroke="#16a34a" strokeWidth="3" /><text x="222" y="84" fontSize="11" fill="#ef4444">Sea route too late for 31-Dec invoice</text><text x="108" y="190" fontSize="11" fill="#166534">Actual route: UK compound reallocation (3-4 days)</text></svg><div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">✅ Working solution: transfer 20 units from Portbury compound to Le Havre and backfill UK in January.</div></CardContent></Card>
              <div className="space-y-3"><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">Delivery Timeline</CardTitle></CardHeader><CardContent className="space-y-2 p-4 text-[12px]"><div className="rounded border border-slate-200 bg-slate-50 p-2">Apr: request intake, SRVC confirmation, EI revision path.</div><div className="rounded border border-slate-200 bg-slate-50 p-2">Nov: Portbury stock check and reservation of 20 units.</div><div className="rounded border border-emerald-200 bg-emerald-50 p-2">Dec: transport, PDI, dealer dispatch, invoicing on 20-Jun.</div></CardContent></Card><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">Freight Forwarder Details</CardTitle></CardHeader><CardContent className="overflow-x-auto p-4"><table className="w-full text-[12px]"><tbody>{[["Carrier","GEFCO"],["Route","Portbury to Eurotunnel to Le Havre"],["Mode","Road transporter"],["Trucks","2"],["Departure","02-Jun-2026 06:00 GMT"],["ETA","05-Jun-2026 14:00 CET"],["Cost","€6,400 total"]].map((r)=><tr key={r[0] as string} className="border-b border-slate-100 even:bg-slate-50"><td className="px-2 py-1.5 font-semibold">{r[0]}</td><td className="px-2 py-1.5">{r[1]}</td></tr>)}</tbody></table></CardContent></Card></div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Financial Ownership & Invoice Control</CardTitle><p className="text-[13px] text-slate-500">Physical movement does not transfer financial ownership.</p></CardHeader><CardContent className="space-y-3 p-4"><div className="grid gap-2 md:grid-cols-5">{["Nissan Motor Co. Japan","Nissan Europe NV","Nissan France NSC","Dealer","Bouygues"].map((s)=><div key={s} className="rounded border border-slate-200 bg-slate-50 p-2 text-center text-[12px] font-semibold">{s}</div>)}</div><div className="rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-700">Financial ownership remains with Nissan Europe NV until wholesale invoice generation on 20-Dec.</div></CardContent></Card>
              <div className="grid gap-3 lg:grid-cols-[1.3fr,1fr]"><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">Financial Summary - FLT-2026-1847</CardTitle></CardHeader><CardContent className="overflow-x-auto p-4"><table className="w-full text-[12px]"><thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Line Item</th><th className="px-2 py-1 text-right">Value (€)</th></tr></thead><tbody>{[["Wholesale price x 20","497,000"],["Fleet discount","-42,245"],["Net wholesale revenue","454,755"],["Logistics","-6,400"],["Compound handling","-1,600"],["Net contribution","446,755"]].map((r,i)=><tr key={r[0] as string} className={cn("border-b border-slate-100", i===2 || i===5 ? "bg-slate-100 font-semibold" : "even:bg-slate-50")}><td className="px-2 py-1.5">{r[0]}</td><td className="px-2 py-1.5 text-right">{r[1]}</td></tr>)}</tbody></table></CardContent></Card><Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px]">Invoice Timeline</CardTitle></CardHeader><CardContent className="space-y-2 p-4 text-[12px]"><div className="rounded border border-slate-200 bg-slate-50 p-2">05-Jun: Le Havre arrival, owner remains Nissan Europe.</div><div className="rounded border border-slate-200 bg-slate-50 p-2">12-Jun: Dealer dispatch, owner remains Nissan Europe.</div><div className="rounded border border-emerald-200 bg-emerald-50 p-2">20-Jun: Wholesale invoice issued, ownership transfers ✅</div></CardContent></Card></div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <Card className="rounded-md border border-emerald-700 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white shadow-sm"><CardContent className="p-6 text-center"><p className="text-4xl">✅</p><p className="text-[28px] font-bold">FLEET ORDER COMPLETE</p><p className="text-[16px]">20 x X-Trail delivered and invoiced on 20-Jun-2026</p><p className="text-[14px] text-emerald-100">11 days ahead of 30-Jun deadline</p></CardContent></Card>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Units Delivered","20","All 20 invoiced"],["Revenue Booked","€454,755","Net wholesale"],["Lead Time Achieved","58 days","17% faster vs standard"],["Days Before Deadline","11 days","Buffer to year-end"]].map((r)=><Card key={r[0]} className={panelClass}><CardContent className="space-y-1 p-4"><p className="text-[13px] text-slate-600">{r[0]}</p><p className="text-[34px] font-bold text-emerald-700">{r[1]}</p><p className="text-[12px] text-slate-600">{r[2]}</p></CardContent></Card>)}</div>
              <Card className={panelClass}><CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[16px]">Process Insights & Replication Guide</CardTitle></CardHeader><CardContent className="grid gap-3 p-4 lg:grid-cols-3"><div className="rounded border border-slate-200 bg-slate-50 p-3 text-[13px]" style={{ borderLeft: "4px solid #16a34a" }}><p className="font-semibold">Supply Chain Agility</p><p>SRVC-timed intervention enabled Dec/Jan rebalance with neutral five-month volume impact.</p></div><div className="rounded border border-slate-200 bg-slate-50 p-3 text-[13px]" style={{ borderLeft: "4px solid #2563eb" }}><p className="font-semibold">Compound Stock Leverage</p><p>Portbury compound buffer reduced route lead time to 3-4 days.</p></div><div className="rounded border border-slate-200 bg-slate-50 p-3 text-[13px]" style={{ borderLeft: "4px solid #f59e0b" }}><p className="font-semibold">Financial Control</p><p>Ownership remained controlled to invoice timing in the Q4 reporting window.</p></div></CardContent></Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Card className={panelClass}><CardContent className="flex items-center justify-between p-4"><Button variant="outline" onClick={() => navigate(step - 1)} className="border-slate-300 text-slate-700" disabled={step === 0}>Previous</Button><p className="text-[12px] text-slate-500">Keyboard: Left/Right arrow navigation enabled</p><Button onClick={() => navigate(step + 1)} className="bg-[#C3002F] hover:bg-[#a10027]" disabled={step === steps.length - 1}>Next</Button></CardContent></Card>
    </div>
  );
}

function OperationsDashboardPage() {
  const format = (v: number) => v.toLocaleString();
  const pct = (v: number) => `${v.toFixed(1)}%`;
  const statusColor = (variancePct: number) => {
    if (variancePct <= 5) return "#2E7D32";
    if (variancePct <= 10) return "#FF8F00";
    return "#C3002F";
  };
  const heatColor = (value: number) => {
    if (value >= 100) return "#1B5E20";
    if (value >= 80) return "#4CAF50";
    if (value >= 60) return "#C8E6C9";
    if (value >= 40) return "#FFB300";
    if (value >= 20) return "#FF6D00";
    return "#C62828";
  };

  const topKpis = [
    { title: "Total European Stock", value: "48,247", trend: "▼ 1.2% vs LM", trendTone: "text-emerald-700", context: "Target: 50,000", border: "border-t-emerald-600", progress: 96.5 },
    { title: "Stock Coverage", value: "2.4 months", trend: "● Watch", trendTone: "text-amber-600", context: "Target: 2.5 months", border: "border-t-amber-500" },
    { title: "In-Transit Units", value: "14,820", trend: "→ Stable", trendTone: "text-slate-500", context: "Avg transit: 38 days", border: "border-t-slate-500" },
    { title: "Monthly Wholesale (MTD)", value: "6,819", trend: "▼ vs MSR", trendTone: "text-[#C3002F]", context: "MSR Target: 67,694 | 10.1% achieved", border: "border-t-[#C3002F]" },
    { title: "Order Bank", value: "12,847", trend: "● Healthy", trendTone: "text-emerald-700", context: "Avg age: 23 days", border: "border-t-emerald-600" },
    { title: "OCF Breaches Active", value: "7", trend: "⚠ Active", trendTone: "text-amber-700", context: "3 critical, 4 minor", border: "border-t-amber-500" },
  ];

  const statusBreakdown = [
    { status: "In Production", units: 12062, pct: 25, dwell: "14 days", trend: "+340", trendTone: "text-[#C3002F]", color: "#1A237E" },
    { status: "In Transit (Sea)", units: 9649, pct: 20, dwell: "42 days", trend: "-215", trendTone: "text-emerald-700", color: "#1565C0" },
    { status: "In Transit (Land)", units: 4825, pct: 10, dwell: "5 days", trend: "flat", trendTone: "text-slate-600", color: "#42A5F5" },
    { status: "At Compound", units: 9649, pct: 20, dwell: "12 days", trend: "+520", trendTone: "text-[#C3002F]", color: "#FF8F00" },
    { status: "Dealer Stock", units: 12062, pct: 25, dwell: "18 days", trend: "-180", trendTone: "text-emerald-700", color: "#2E7D32" },
  ];

  const rbuStock = [
    { rbu: "WEST", target: 12000, actual: 11500, coverage: 2.3 },
    { rbu: "UK", target: 9000, actual: 9500, coverage: 2.5 },
    { rbu: "NORDICS", target: 5000, actual: 5200, coverage: 2.6 },
    { rbu: "ITA", target: 6000, actual: 6800, coverage: 2.8 },
    { rbu: "CEE", target: 4000, actual: 3500, coverage: 2.1 },
    { rbu: "RUSSIA", target: 8000, actual: 7200, coverage: 2.0 },
    { rbu: "IBERIA", target: 3000, actual: 3100, coverage: 2.4 },
    { rbu: "CENTER", target: 1500, actual: 1400, coverage: 2.2 },
    { rbu: "MEA", target: 1500, actual: 1800, coverage: 2.7 },
  ];

  const rbuChartData = rbuStock.map((row) => {
    const variance = row.actual - row.target;
    const variancePct = Math.abs((variance / row.target) * 100);
    return {
      ...row,
      variance,
      variancePct,
      tone: statusColor(variancePct),
    };
  });

  const trendData = [
    { month: "Oct-12", stock: 52400, wholesale: 23800 },
    { month: "Nov-12", stock: 51800, wholesale: 22400 },
    { month: "Dec-12", stock: 48200, wholesale: 25700 },
    { month: "Jan-13", stock: 53100, wholesale: 19400 },
    { month: "Feb-13", stock: 52600, wholesale: 20900 },
    { month: "Mar-13", stock: 51900, wholesale: 21500 },
    { month: "Apr-13", stock: 50200, wholesale: 19800 },
    { month: "May-13", stock: 49800, wholesale: 20100 },
    { month: "Jun-13", stock: 48500, wholesale: 21300 },
    { month: "Jul-13", stock: 47200, wholesale: 17600 },
    { month: "Aug-13", stock: 46800, wholesale: 15800 },
    { month: "Sep-13", stock: 48850, wholesale: 18700 },
    { month: "Oct-13", stock: 48247, wholesale: 6819 },
  ];

  const modelRbuHeat = [
    { model: "Qashqai", WEST: 82, UK: 91, NORDICS: 78, ITA: 85, CEE: 74, RUSSIA: 68, IBERIA: 80, CENTER: 88, MEA: 45, Total: 81 },
    { model: "Juke", WEST: 88, UK: 95, NORDICS: 82, ITA: 72, CEE: 81, RUSSIA: 55, IBERIA: 76, CENTER: 90, MEA: 38, Total: 79 },
    { model: "Note", WEST: 75, UK: 86, NORDICS: 91, ITA: 68, CEE: 62, RUSSIA: 71, IBERIA: 69, CENTER: 82, MEA: 52, Total: 74 },
    { model: "X-Trail", WEST: 71, UK: 65, NORDICS: 88, ITA: 79, CEE: 85, RUSSIA: 92, IBERIA: 58, CENTER: 74, MEA: 61, Total: 76 },
    { model: "Micra", WEST: 92, UK: 78, NORDICS: 45, ITA: 95, CEE: 88, RUSSIA: 42, IBERIA: 102, CENTER: 68, MEA: 72, Total: 78 },
    { model: "Navara", WEST: 55, UK: 72, NORDICS: 68, ITA: 48, CEE: 91, RUSSIA: 38, IBERIA: 82, CENTER: 55, MEA: 88, Total: 64 },
    { model: "Pathfinder", WEST: 42, UK: 58, NORDICS: 35, ITA: 52, CEE: 45, RUSSIA: 105, IBERIA: 28, CENTER: 42, MEA: 95, Total: 55 },
    { model: "Almera", WEST: 68, UK: 52, NORDICS: 72, ITA: 88, CEE: 95, RUSSIA: 82, IBERIA: 91, CENTER: 62, MEA: 48, Total: 73 },
  ];

  const rbuTotals = { WEST: 78, UK: 82, NORDICS: 72, ITA: 76, CEE: 79, RUSSIA: 65, IBERIA: 74, CENTER: 71, MEA: 58, Total: 75 };
  const heatColumns = ["WEST", "UK", "NORDICS", "ITA", "CEE", "RUSSIA", "IBERIA", "CENTER", "MEA", "Total"] as const;

  const factoryStack = [
    { factory: "Sunderland", capacity: 18000, Qashqai: 6500, Note: 4200, Juke: 4240 },
    { factory: "Barcelona", capacity: 9000, Micra: 3600, Navara: 2100, NV200: 1950 },
    { factory: "Japan", capacity: 25000, "X-Trail": 5200, Pathfinder: 3800, Patrol: 2600, Almera: 4000, Murano: 2550, "350Z": 2100 },
    { factory: "Chennai", capacity: 8000, Micra: 5200 },
  ];

  const capacityTable = [
    { factory: "Sunderland", line: "Line 1", speed: 420, max: "21,000/mo", overtime: 8.5, stand: 6 },
    { factory: "Sunderland", line: "Line 2", speed: 360, max: "18,000/mo", overtime: 12.2, stand: 4 },
    { factory: "Barcelona", line: "Line 1", speed: 380, max: "9,500/mo", overtime: 5.0, stand: 8 },
    { factory: "Japan (Oppama)", line: "Line 1", speed: 520, max: "26,000/mo", overtime: 3.2, stand: 10 },
    { factory: "Japan (Kyushu)", line: "Line 2", speed: 480, max: "24,000/mo", overtime: 6.1, stand: 12 },
    { factory: "Chennai", line: "Line 1", speed: 280, max: "8,400/mo", overtime: 0, stand: 14 },
  ];

  const orderBankSparkline = [
    { w: "W1", value: 11050 },
    { w: "W2", value: 11400 },
    { w: "W3", value: 11840 },
    { w: "W4", value: 12110 },
    { w: "W5", value: 12690 },
    { w: "W6", value: 12420 },
    { w: "W7", value: 12970 },
    { w: "W8", value: 13340 },
    { w: "W9", value: 12840 },
    { w: "W10", value: 12620 },
    { w: "W11", value: 12720 },
    { w: "W12", value: 12847 },
  ];

  const throughput = [
    { stage: "Production -> Ship", in: 20250, out: 19800, dwell: "3 days", bottleneck: "No" },
    { stage: "Sea Transit", in: 14200, out: 13800, dwell: "42 days", bottleneck: "No" },
    { stage: "Land Transit", in: 5600, out: 5500, dwell: "5 days", bottleneck: "No" },
    { stage: "Compound", in: 18400, out: 17200, dwell: "12 days", bottleneck: "WEST compound at 92% capacity" },
    { stage: "Compound -> Dealer", in: 17200, out: 16800, dwell: "3 days", bottleneck: "No" },
    { stage: "Dealer -> Wholesale", in: 16800, out: 6819, dwell: "18 days", bottleneck: "Russia retail slow" },
  ];

  const totalTarget = rbuChartData.reduce((sum, row) => sum + row.target, 0);
  const totalActual = rbuChartData.reduce((sum, row) => sum + row.actual, 0);
  const totalVariance = totalActual - totalTarget;

  return (
    <div className="space-y-4 bg-[#F0F0F0] p-4 lg:p-6">
      <section className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[20px] font-bold text-slate-900">Operations Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-700 px-2 py-1 text-[11px] font-semibold text-white">Current Month: April 2026</span>
          </div>
        </div>
        <p className="text-[13px] text-slate-500">European Supply Chain &amp; Sales Operations - Performance Monitoring</p>
        <p className="text-[11px] text-slate-500">Last Refresh: 02-Apr-2026 08:15 CET</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {topKpis.map((kpi) => (
          <Card key={kpi.title} className={cn(panelClass, "border-t-4", kpi.border)}>
            <CardContent className="space-y-1 p-3">
              <p className="text-[12px] font-semibold text-slate-700">{kpi.title}</p>
              <p className="text-[24px] font-bold text-slate-900">{kpi.value}</p>
              <p className={cn("text-[11px] font-semibold", kpi.trendTone)}>{kpi.trend}</p>
              <p className="text-[11px] text-slate-500">{kpi.context}</p>
              {kpi.progress ? (
                <div className="h-1.5 w-full rounded bg-slate-200">
                  <div className="h-full rounded bg-emerald-600" style={{ width: `${kpi.progress}%` }} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">European Stock by Pipeline Status</CardTitle>
            <p className="text-[12px] text-slate-500">48,247 total units as of 02-Apr-2026</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex h-10 overflow-hidden rounded border border-slate-200">
              {statusBreakdown.map((row) => (
                <div key={row.status} className="flex h-full items-center justify-center text-[11px] font-semibold text-white" style={{ width: `${row.pct}%`, backgroundColor: row.color }} title={`${row.status}: ${format(row.units)} units`}>
                  {row.pct}%
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-right">Units</th>
                    <th className="px-2 py-1 text-right">% of Total</th>
                    <th className="px-2 py-1 text-right">Avg Dwell Time</th>
                    <th className="px-2 py-1 text-right">Trend vs LM</th>
                  </tr>
                </thead>
                <tbody>
                  {statusBreakdown.map((row) => (
                    <tr key={row.status} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-2 py-1">{row.status}</td>
                      <td className="px-2 py-1 text-right">{format(row.units)}</td>
                      <td className="px-2 py-1 text-right">{pct(row.pct)}</td>
                      <td className="px-2 py-1 text-right">{row.dwell}</td>
                      <td className={cn("px-2 py-1 text-right font-semibold", row.trendTone)}>{row.trend === "flat" ? "▬ flat" : row.trend.startsWith("+") ? `▲ ${row.trend}` : `▼ ${row.trend}`}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-semibold">
                    <td className="px-2 py-1">Total</td>
                    <td className="px-2 py-1 text-right">48,247</td>
                    <td className="px-2 py-1 text-right">100.0%</td>
                    <td className="px-2 py-1 text-right">-</td>
                    <td className="px-2 py-1 text-right text-emerald-700">▼ -585 vs LM</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[12px] text-amber-800">
              ⚠ Compound stock +520 units vs last month - check distribution throughput for WEST and NORDICS
            </div>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">Stock by RBU - Actual vs Target</CardTitle>
            <p className="text-[12px] text-slate-500">Coverage target: 2.5 months of forward sales</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={rbuChartData} layout="vertical" margin={{ left: 12, right: 18, top: 10, bottom: 4 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis type="category" width={70} dataKey="rbu" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value, key) => [format(Number(value ?? 0)), key === "target" ? "Target" : "Actual"]} />
                  <Bar dataKey="target" fill="#d9d9d9" name="Target" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="actual" name="Actual" radius={[0, 2, 2, 0]}>
                    {rbuChartData.map((row) => (
                      <Cell key={row.rbu} fill={row.tone} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-1 text-[12px]">
              {rbuChartData.map((row) => (
                <div key={`${row.rbu}-cov`} className="flex items-center justify-between text-slate-600">
                  <span>{row.rbu}</span>
                  <span>Coverage: {row.coverage.toFixed(1)} mo</span>
                </div>
              ))}
            </div>
            <div className="h-2 rounded bg-slate-200">
              <div className="h-full rounded bg-[#C3002F]" style={{ width: `${(totalActual / totalTarget) * 100}%` }} />
            </div>
            <p className="text-[12px] font-semibold text-slate-700">Total: {format(totalActual)} actual vs {format(totalTarget)} target (▼ {format(Math.abs(totalVariance))} units / 3.5% below target)</p>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">European Stock Evolution - 12 Month Trend</CardTitle>
            <p className="text-[12px] text-slate-500">Total stock vs target band (Apr 2025 - Apr 2026)</p>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <ComposedChart data={trendData} margin={{ left: 12, right: 12, top: 10, bottom: 6 }}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" domain={[40000, 55000]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 30000]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(value, key) => [format(Number(value ?? 0)), key === "stock" ? "Actual Stock" : "Monthly Wholesale"]} />
                  <ReferenceArea yAxisId="left" y1={48000} y2={52000} fill="#A5D6A7" fillOpacity={0.24} />
                  <ReferenceLine yAxisId="left" y={50000} stroke="#2E7D32" strokeDasharray="6 4" label={{ value: "Target (50K)", position: "insideTopRight", fill: "#2E7D32", fontSize: 10 }} />
                  <ReferenceLine x="Dec-12" stroke="#9ca3af" label={{ value: "Year-end fleet push", position: "insideTop", fontSize: 10 }} />
                  <ReferenceLine x="Jan-13" stroke="#9ca3af" label={{ value: "Post-holiday stock build", position: "insideBottom", fontSize: 10 }} />
                  <ReferenceLine x="Jul-13" stroke="#9ca3af" label={{ value: "Summer shutdown", position: "insideBottom", fontSize: 10 }} />
                  <ReferenceLine x="Oct-13" stroke="#C3002F" strokeDasharray="3 3" label={{ value: "Current Month ←", position: "insideTopRight", fontSize: 10, fill: "#C3002F" }} />
                  <Bar yAxisId="right" dataKey="wholesale" fill="#d1d5db" name="Monthly Wholesale" />
                  <Line yAxisId="left" type="monotone" dataKey="stock" stroke="#C3002F" strokeWidth={2.5} dot={{ r: 3 }} name="Actual Stock" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
              <span>■ Monthly Wholesale</span>
              <span className="text-[#C3002F]">- Actual Stock</span>
              <span className="text-emerald-700">--- Target (50K)</span>
              <span>░ Target Band</span>
            </div>
            <p className="text-[12px] font-semibold text-slate-700">Stock trending within target band after summer recovery. Current coverage: 2.4 months (target: 2.5 months)</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">Monthly Wholesale Achievement by Model × Region</CardTitle>
            <p className="text-[12px] text-slate-500">April 2026 MTD - % of monthly target achieved based on production allocation and pipeline lead time</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] text-[12px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-1 text-left">Model</th>
                    {heatColumns.map((col) => (
                      <th key={col} className="px-2 py-1 text-center">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modelRbuHeat.map((row) => (
                    <tr key={row.model} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-2 py-1 font-medium">{row.model}</td>
                      {heatColumns.map((col) => {
                        const value = row[col];
                        const textTone = value >= 60 ? "text-white" : "text-slate-900";
                        return (
                          <td
                            key={`${row.model}-${col}`}
                            className={cn("px-2 py-1 text-center font-semibold", col === "Total" ? "border-l border-slate-300" : "")}
                            style={{ backgroundColor: heatColor(value) }}
                            title={`${row.model} - ${col}\nTarget (Oct): 1,240 units\nAchieved MTD: 1,017 units (${value}%)\nPipeline due this month: 380 units\nProjected month-end: 1,397 (113%)\nLead time impact: 35 days avg (Japan 40% / UK 35% / Spain 25%)\nStatus: On Track`}
                          >
                            <span className={textTone}>{value}%</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-slate-700 font-semibold text-white">
                    <td className="px-2 py-1">RBU Total</td>
                    {heatColumns.map((col) => (
                      <td key={`total-${col}`} className="px-2 py-1 text-center">{rbuTotals[col]}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-1">
              <div className="h-3 rounded bg-[linear-gradient(to_right,#C62828,#FF6D00,#FFB300,#C8E6C9,#4CAF50,#1B5E20)]" />
              <div className="flex justify-between text-[11px] text-slate-600"><span>&lt;20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%+</span></div>
            </div>
            <div className="rounded border-l-4 border-l-[#C3002F] bg-slate-50 p-3 text-[13px] text-slate-700">
              <p>🔴 <strong>Pathfinder</strong> behind plan in WEST and IBERIA. Check Japan allocation and 70-day lead time impact.</p>
              <p>🟢 <strong>Micra</strong> exceeds target in IBERIA at 102% with short Barcelona lead time.</p>
              <p>⚠️ <strong>Russia RBU</strong> overall at 65%. Compound constraints are limiting conversions across three models.</p>
            </div>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">Factory Capacity Utilization - April 2026</CardTitle>
            <p className="text-[12px] text-slate-500">Production output vs installed capacity by factory</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={factoryStack} margin={{ left: 4, right: 4, top: 20, bottom: 2 }}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="factory" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip />
                  <Bar stackId="prod" dataKey="Qashqai" fill="#7f0019" />
                  <Bar stackId="prod" dataKey="Note" fill="#a20026" />
                  <Bar stackId="prod" dataKey="Juke" fill="#C3002F" />
                  <Bar stackId="prod" dataKey="Micra" fill="#931f24" />
                  <Bar stackId="prod" dataKey="Navara" fill="#b33a3f" />
                  <Bar stackId="prod" dataKey="NV200" fill="#ce666b" />
                  <Bar stackId="prod" dataKey="X-Trail" fill="#8a001f" />
                  <Bar stackId="prod" dataKey="Pathfinder" fill="#aa1a35" />
                  <Bar stackId="prod" dataKey="Patrol" fill="#c3415b" />
                  <Bar stackId="prod" dataKey="Almera" fill="#FFB300" />
                  <Bar stackId="prod" dataKey="Murano" fill="#9ca3af" />
                  <Bar stackId="prod" dataKey="350Z" fill="#cbd5e1" />
                  <Line type="monotone" dataKey="capacity" stroke="#334155" strokeDasharray="5 3" dot={{ r: 2 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="font-semibold">Sunderland</p><p className="text-emerald-700">83.0% Utilization</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="font-semibold">Barcelona</p><p className="text-emerald-700">85.0% Utilization</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="font-semibold">Japan</p><p className="text-emerald-700">81.0% Utilization</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2"><p className="font-semibold">Chennai</p><p className="text-amber-700">65.0% Utilization</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Factory</th>
                    <th className="px-2 py-1 text-left">Line</th>
                    <th className="px-2 py-1 text-right">Linespeed/day</th>
                    <th className="px-2 py-1 text-right">Max Capacity</th>
                    <th className="px-2 py-1 text-right">Overtime %</th>
                    <th className="px-2 py-1 text-right">Stand-downs Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {capacityTable.map((row) => (
                    <tr key={`${row.factory}-${row.line}`} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-2 py-1">{row.factory}</td>
                      <td className="px-2 py-1">{row.line}</td>
                      <td className="px-2 py-1 text-right">{row.speed}</td>
                      <td className="px-2 py-1 text-right">{row.max}</td>
                      <td className={cn("px-2 py-1 text-right font-semibold", row.overtime < 10 ? "text-emerald-700" : row.overtime <= 15 ? "text-amber-700" : "text-[#C3002F]")}>{row.overtime.toFixed(1)}%</td>
                      <td className="px-2 py-1 text-right">{row.stand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-4">
        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px] font-bold">🚀 Product Launch - Active Launches</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 text-[12px]">
            <table className="w-full"><thead className="bg-slate-100"><tr><th className="px-1 py-1 text-left">Model</th><th className="px-1 py-1 text-left">Launch Phase</th><th className="px-1 py-1 text-right">Target Fill</th><th className="px-1 py-1 text-right">Achieved</th></tr></thead><tbody><tr className="border-b border-slate-100"><td className="px-1 py-1">New Note (E12)</td><td className="px-1 py-1">Dealer Stock Fill</td><td className="px-1 py-1 text-right">3,200</td><td className="px-1 py-1 text-right text-emerald-700">2,840 (89%)</td></tr><tr><td className="px-1 py-1">Qashqai+2 (J10E)</td><td className="px-1 py-1">Ramp Up</td><td className="px-1 py-1 text-right">800</td><td className="px-1 py-1 text-right text-amber-700">520 (65%)</td></tr></tbody></table>
            <p className="text-[12px] text-slate-600">Next milestone: Note - first retail deliveries W44</p>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px] font-bold">🔄 Phase Out - End of Life Models</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 text-[12px]">
            <table className="w-full"><thead className="bg-slate-100"><tr><th className="px-1 py-1 text-left">Model</th><th className="px-1 py-1 text-left">Phase</th><th className="px-1 py-1 text-right">Remaining</th><th className="px-1 py-1 text-right">Last Build</th></tr></thead><tbody><tr className="border-b border-slate-100"><td className="px-1 py-1">Almera (N16)</td><td className="px-1 py-1">Final Clearance</td><td className="px-1 py-1 text-right">180</td><td className="px-1 py-1 text-right">Sep-13</td></tr><tr><td className="px-1 py-1">Primera (P12)</td><td className="px-1 py-1">Stock Depletion</td><td className="px-1 py-1 text-right">45</td><td className="px-1 py-1 text-right">Jul-13</td></tr></tbody></table>
            <p className="rounded bg-amber-50 px-2 py-1 text-[12px] text-amber-800">⚠ 45 Primera units aging &gt;90 days - escalate to Sales for disposal plan</p>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px] font-bold">🏢 Fleet Operations</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 text-[12px]">
            <table className="w-full"><thead className="bg-slate-100"><tr><th className="px-1 py-1 text-left">RBU</th><th className="px-1 py-1 text-right">Orders</th><th className="px-1 py-1 text-right">Delivered</th><th className="px-1 py-1 text-right">On-Time</th></tr></thead><tbody><tr className="border-b border-slate-100"><td className="px-1 py-1">WEST</td><td className="px-1 py-1 text-right">340</td><td className="px-1 py-1 text-right">215</td><td className="px-1 py-1 text-right">88%</td></tr><tr className="border-b border-slate-100"><td className="px-1 py-1">UK</td><td className="px-1 py-1 text-right">520</td><td className="px-1 py-1 text-right">480</td><td className="px-1 py-1 text-right">95%</td></tr><tr className="border-b border-slate-100"><td className="px-1 py-1">NORDICS</td><td className="px-1 py-1 text-right">85</td><td className="px-1 py-1 text-right">62</td><td className="px-1 py-1 text-right">78%</td></tr><tr><td className="px-1 py-1">ITA</td><td className="px-1 py-1 text-right">120</td><td className="px-1 py-1 text-right">98</td><td className="px-1 py-1 text-right">82%</td></tr></tbody></table>
            <p className="text-[12px] text-slate-600">Total fleet: 1,065 orders / 855 delivered / 210 pending</p>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3"><CardTitle className="text-[14px] font-bold">📋 Order Bank Health</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4 text-[12px]">
            <table className="w-full"><thead className="bg-slate-100"><tr><th className="px-1 py-1 text-left">Metric</th><th className="px-1 py-1 text-right">Value</th><th className="px-1 py-1 text-right">Status</th></tr></thead><tbody><tr className="border-b border-slate-100"><td className="px-1 py-1">Total Open Orders</td><td className="px-1 py-1 text-right">12,847</td><td className="px-1 py-1 text-right">🟢</td></tr><tr className="border-b border-slate-100"><td className="px-1 py-1">Average Order Age</td><td className="px-1 py-1 text-right">23 days</td><td className="px-1 py-1 text-right">🟢</td></tr><tr className="border-b border-slate-100"><td className="px-1 py-1">Orders &gt; 45 days</td><td className="px-1 py-1 text-right">312 (2.4%)</td><td className="px-1 py-1 text-right">🟡</td></tr><tr className="border-b border-slate-100"><td className="px-1 py-1">Orders &gt; 90 days</td><td className="px-1 py-1 text-right">18 (0.1%)</td><td className="px-1 py-1 text-right">🔴</td></tr><tr><td className="px-1 py-1">Oldest Order</td><td className="px-1 py-1 text-right">127 days (Pathfinder, RU)</td><td className="px-1 py-1 text-right">🔴</td></tr></tbody></table>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%" minWidth={180}>
                <LineChart data={orderBankSparkline} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <Line type="monotone" dataKey="value" stroke="#C3002F" strokeWidth={1.8} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className={panelClass}>
          <CardHeader className="space-y-1 border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[16px]">Pipeline Flow - Monthly Throughput Analysis</CardTitle>
            <p className="text-[12px] text-slate-500">Vehicle flow from production to wholesale - April 2026</p>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-[12px]">
                  {[{ name: "Production Output", value: "20,250", dwell: "3d" }, { name: "In Transit", value: "19,300", dwell: "42d / 5d" }, { name: "Compound Arrivals", value: "18,400", dwell: "12d" }, { name: "Distribution to Dealers", value: "16,800", dwell: "3d" }, { name: "Wholesale Invoiced", value: "6,819 MTD", dwell: "18d" }].map((step, idx) => (
                    <div key={step.name} className="relative rounded border border-slate-200 bg-slate-50 p-2">
                      <p className="font-semibold text-slate-800">{step.name}</p>
                      <p className="text-[16px] font-bold text-slate-900">{step.value}</p>
                      <p className="text-[11px] text-slate-500">Avg dwell: {step.dwell}</p>
                      {idx < 4 ? <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[#C3002F]">→</span> : null}
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Stage</th>
                        <th className="px-2 py-1 text-right">Volume In</th>
                        <th className="px-2 py-1 text-right">Volume Out</th>
                        <th className="px-2 py-1 text-right">Dwell (avg days)</th>
                        <th className="px-2 py-1 text-left">Bottleneck?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {throughput.map((row) => (
                        <tr key={row.stage} className="border-b border-slate-100 even:bg-slate-50">
                          <td className="px-2 py-1">{row.stage}</td>
                          <td className="px-2 py-1 text-right">{format(row.in)}</td>
                          <td className="px-2 py-1 text-right">{format(row.out)}</td>
                          <td className="px-2 py-1 text-right">{row.dwell}</td>
                          <td className={cn("px-2 py-1", row.bottleneck === "No" ? "text-emerald-700" : "text-amber-700")}>{row.bottleneck === "No" ? "No" : `⚠ ${row.bottleneck}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[13px]">
                <p className="font-semibold text-slate-800">Operational Insights</p>
                <p className="mt-2 text-slate-700">Throughput efficiency: <span className="font-semibold">94.2%</span> (production-to-compound)</p>
                <p className="mt-2 text-amber-800">⚠ WEST compound approaching capacity - redistribute 400 units to Belgium overflow</p>
                <p className="mt-2 text-[#C3002F]">⚠ Russia wholesale conversion at 38% of arrivals - investigate dealer ordering patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StockReconciliationPage() {
  return <StockReconciliationPageNew />;
}

function StrategicInitiativesPage() {
  const fmt = (value: number) => value.toLocaleString("en-GB");
  const eur = (value: number) =>
    value.toLocaleString("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const paretoData = [
    { rank: 1, label: "EI-01", endItem: "J10DFD2WDLHDAC01", volume: 2840, cum: 18.2, category: "A" },
    { rank: 2, label: "EI-02", endItem: "J10DFD2WDLHDSV01", volume: 2450, cum: 33.9, category: "A" },
    { rank: 3, label: "EI-03", endItem: "J10PET2WDLHDAC01", volume: 1980, cum: 46.6, category: "A" },
    { rank: 4, label: "EI-04", endItem: "J10DFD2WDLHDTK01", volume: 1720, cum: 57.6, category: "A" },
    { rank: 5, label: "EI-05", endItem: "J10PET2WDLHDSV01", volume: 1340, cum: 66.2, category: "A" },
    { rank: 6, label: "EI-06", endItem: "J10DFD4WDRHDSV01", volume: 980, cum: 72.5, category: "B" },
    { rank: 7, label: "EI-07", endItem: "J10DFD2WDLHDAC02", volume: 850, cum: 77.9, category: "B" },
    { rank: 8, label: "EI-08", endItem: "J10PET4WDRHDSV01", volume: 720, cum: 82.5, category: "B" },
    { rank: 9, label: "EI-09", endItem: "J10DFD2WDLHDSV02", volume: 580, cum: 86.2, category: "B" },
    { rank: 10, label: "EI-10", endItem: "J10DFD4WDRHDSV02", volume: 480, cum: 89.3, category: "B" },
    { rank: 11, label: "EI-11", endItem: "J10PET2WDLHDTK02", volume: 380, cum: 91.7, category: "B" },
    { rank: 12, label: "EI-12", endItem: "J10DFD2WDLHDAC03", volume: 310, cum: 93.7, category: "C" },
    { rank: 13, label: "EI-13", endItem: "J10PET4WDRHDAC01", volume: 260, cum: 95.4, category: "C" },
    { rank: 14, label: "EI-14", endItem: "J10DFD4WDRHDTK01", volume: 190, cum: 96.6, category: "C" },
    { rank: 15, label: "EI-15", endItem: "J10PET2WDLHDSV03", volume: 145, cum: 97.5, category: "C" },
    { rank: 16, label: "EI-16", endItem: "J10DFD2WDLHDNV01", volume: 110, cum: 98.2, category: "C" },
    { rank: 17, label: "EI-17", endItem: "J10PET4WDRHDNV01", volume: 85, cum: 98.8, category: "C" },
    { rank: 18, label: "EI-18", endItem: "J10DFD4WDRHDAC02", volume: 72, cum: 99.2, category: "C" },
    { rank: 19, label: "EI-19", endItem: "J10PET2WDRHDSV03", volume: 58, cum: 99.6, category: "C" },
    { rank: 20, label: "EI-20", endItem: "J10DFD2WDLHDNV02", volume: 62, cum: 100, category: "C" },
  ];

  const reallocationLog = [
    { id: 1, date: "01-Oct", from: "J10DFD4WDRHDNV01", to: "J10DFD2WDLHDAC01", market: "NLD", reason: "4WD+Base+Purple: 8/mo demand", saved: 78 },
    { id: 2, date: "01-Oct", from: "J10PET4WDRHDNV01", to: "J10PET2WDLHDAC01", market: "GBR", reason: "Petrol 4WD+Base+Purple: 4/mo", saved: 85 },
    { id: 3, date: "03-Oct", from: "J10DFD2WDLHDNV02", to: "J10DFD2WDLHDSV01", market: "FRA", reason: "Diesel 2WD+Base+Nightshade: 6/mo", saved: 72 },
    { id: 4, date: "07-Oct", from: "J10PET2WDRHDSV03", to: "J10PET2WDLHDSV01", market: "ITA", reason: "Petrol RHD in LHD market: error", saved: 90 },
    { id: 5, date: "08-Oct", from: "J10DFD4WDRHDAC02", to: "J10DFD2WDLHDAC01", market: "CEE", reason: "4WD+Acenta+Blue: 3/mo demand", saved: 68 },
    { id: 6, date: "10-Oct", from: "J10DFD4WDRHDTK01", to: "J10DFD2WDLHDTK01", market: "GBR", reason: "4WD Tekna low demand: 5/mo", saved: 65 },
    { id: 7, date: "14-Oct", from: "J10PET4WDRHDAC01", to: "J10PET2WDLHDAC01", market: "NORDICS", reason: "Petrol 4WD in Norway: low volume", saved: 82 },
    { id: 8, date: "15-Oct", from: "J10DFD2WDLHDNV01", to: "J10DFD2WDLHDSV01", market: "IBERIA", reason: "Base trim rare in Spain: 2/mo", saved: 95 },
    { id: 9, date: "21-Oct", from: "J10DFD4WDRHDAC02", to: "J10DFD2WDLHDAC01", market: "FRA", reason: "4WD low demand in France", saved: 70 },
    { id: 10, date: "22-Oct", from: "J10PET2WDLHDSV03", to: "J10PET2WDLHDSV01", market: "GBR", reason: "SVE Colour 03 rare: 4/mo", saved: 60 },
    { id: 11, date: "24-Oct", from: "J10DFD2WDLHDNV02", to: "J10DFD2WDLHDAC01", market: "CEE", reason: "Nightshade colour: 3/mo in CEE", saved: 75 },
    { id: 12, date: "28-Oct", from: "J10PET4WDRHDNV01", to: "J10PET2WDLHDAC01", market: "NLD", reason: "Petrol 4WD+Purple: 2/mo NLD", saved: 88 },
  ];

  const agingWithout = [
    { band: "0-30d", A: 8200, B: 2800, C: 450 },
    { band: "31-60d", A: 1800, B: 680, C: 380 },
    { band: "61-90d", A: 420, B: 290, C: 310 },
    { band: ">90d", A: 80, B: 120, C: 420 },
  ];
  const agingWith = [
    { band: "0-30d", A: 8640, B: 2800, C: 180 },
    { band: "31-60d", A: 1900, B: 680, C: 140 },
    { band: "61-90d", A: 430, B: 280, C: 95 },
    { band: ">90d", A: 85, B: 110, C: 160 },
  ];

  const trend = [
    ["Apr-12", 520], ["May-12", 528], ["Jun-12", 534], ["Jul-12", 540], ["Aug-12", 548], ["Sep-12", 552],
    ["Oct-12", 548], ["Nov-12", 538], ["Dec-12", 510], ["Jan-13", 482], ["Feb-13", 456], ["Mar-13", 430],
    ["Apr-13", 388], ["May-13", 342], ["Jun-13", 306], ["Jul-13", 268], ["Aug-13", 232], ["Sep-13", 210], ["Oct-13", 195],
  ].map(([month, withABC], idx) => {
    const withoutABC = idx < 6 ? Number(withABC) : 560 - Math.floor((idx - 6) * -2.5);
    return { month, withABC: Number(withABC), withoutABC, gap: withoutABC - Number(withABC) };
  });

  const categoryColor = (cat: string) => {
    if (cat === "A") return "#1B5E20";
    if (cat === "B") return "#FF8F00";
    return "#C62828";
  };

  const totalSavedDays = reallocationLog.reduce((acc, row) => acc + row.saved, 0);

  return (
    <div className="space-y-5 bg-[#F0F0F0] p-4 lg:p-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900">Strategic Initiatives - ABC Category Project</h2>
        <p className="text-[13px] text-slate-600">End Item Demand Classification & Automatic Spec Reallocation to Reduce Long-Term Stock Risk</p>
      </div>

      <Card className="rounded-md border border-[#f2caca] bg-gradient-to-r from-white to-[#FFF5F5] shadow-sm">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
          <div className="space-y-2 border-l-4 border-[#C3002F] pl-3">
            <p className="text-[16px] font-semibold">The Problem</p>
            <p className="text-[13px] text-slate-700">Uncommon specifications produced without a confirmed order create long-term unsold stock risk at compounds.</p>
            <p className="text-[13px] text-slate-700">C-category End Items are less than 5% of volume but can drive 15-20% of stock aged over 90 days.</p>
            <p className="text-[13px] text-slate-700">Each unsold unit carries around EUR 45/day in holding and depreciation cost.</p>
            <p className="text-[22px] font-bold text-[#C3002F]">EUR 2.8M annual exposure</p>
          </div>
          <div className="space-y-2 border-l-4 border-emerald-600 pl-3">
            <p className="text-[16px] font-semibold">The Solution</p>
            <p className="text-[13px] text-slate-700">Apply Pareto ABC classification to all End Items and identify C-category units without customer/dealer attachment.</p>
            <p className="text-[13px] text-slate-700">Automatically reallocate those units to A-category specs at Day-3 BBSS cutoff before physical build lock.</p>
            <p className="text-[13px] text-slate-700">Units are built into fast-selling specs while preserving market destination and fixed constraints.</p>
            <p className="text-[22px] font-bold text-emerald-700">Day-3 intervention window</p>
          </div>
          <div className="space-y-2 border-l-4 border-sky-600 pl-3">
            <p className="text-[16px] font-semibold">The Impact</p>
            <p className="text-[13px] text-slate-700">C-category aged stock reduced by 62% after go-live.</p>
            <p className="text-[13px] text-slate-700">Average days-to-sell for reallocated units dropped from 78 days to 22 days.</p>
            <p className="text-[13px] text-slate-700">Holding cost savings reached approximately EUR 1.7M annually.</p>
            <p className="text-[22px] font-bold text-sky-700">Stock turn up to 9.6x</p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">End Item ABC Classification - Pareto Analysis</h3>
        <p className="text-[13px] text-slate-600">Qashqai (J10) - European End Item demand distribution (FY2026 YTD)</p>
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className={panelClass}>
            <CardContent className="h-[420px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 18, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Monthly Volume", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: "Cumulative %", angle: 90, position: "insideRight", fontSize: 11 }} />
                  <ReferenceArea yAxisId="right" y1={0} y2={70} fill="#E8F5E9" />
                  <ReferenceArea yAxisId="right" y1={70} y2={95} fill="#FFF3E0" />
                  <ReferenceArea yAxisId="right" y1={95} y2={100} fill="#FFEBEE" />
                  <ReferenceLine yAxisId="right" y={70} stroke="#64748b" strokeDasharray="4 3" />
                  <ReferenceLine yAxisId="right" y={95} stroke="#64748b" strokeDasharray="4 3" />
                  <ReferenceLine yAxisId="right" y={100} stroke="#64748b" strokeDasharray="4 3" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="volume" name="volume" radius={[2, 2, 0, 0]}>
                    {paretoData.map((row) => (
                      <Cell key={row.endItem} fill={categoryColor(row.category)} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" dataKey="cum" name="cum" stroke="#111827" strokeWidth={2} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-4 py-3">
              <CardTitle className="text-[14px]">Classification Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-2 py-1">Category</th>
                    <th className="px-2 py-1 text-right">EIs</th>
                    <th className="px-2 py-1 text-right">Vol %</th>
                    <th className="px-2 py-1 text-right">Avg Sell</th>
                    <th className="px-2 py-1 text-right">Aged</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: "A", eis: 5, vol: "66.2%", days: "14d", aged: "12", cls: "bg-emerald-50" },
                    { cat: "B", eis: 6, vol: "25.6%", days: "32d", aged: "85", cls: "bg-amber-50" },
                    { cat: "C", eis: 9, vol: "8.3%", days: "78d", aged: "340", cls: "bg-red-50" },
                  ].map((row) => (
                    <tr key={row.cat} className={cn("border-b border-slate-100", row.cls)}>
                      <td className="px-2 py-1 font-semibold">{row.cat}</td>
                      <td className="px-2 py-1 text-right">{row.eis}</td>
                      <td className="px-2 py-1 text-right">{row.vol}</td>
                      <td className="px-2 py-1 text-right">{row.days}</td>
                      <td className="px-2 py-1 text-right font-bold">{row.aged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="rounded-md border-l-4 border-[#C3002F] bg-red-50 p-3 text-[12px] text-slate-700">
                C-category End Items are only 8.3% of volume but 26.3% of aged stock over 90 days. They are the highest stock risk pool.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">Automatic Spec Reallocation - Pipeline Integration</h3>
        <p className="text-[13px] text-slate-600">How C-category forecast units are reallocated to A-category at the Day-3 BBSS cutoff</p>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 text-[12px] md:grid-cols-6">
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">Monthly Bucket</div>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">Weekly Bucket</div>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">Daily Bucket</div>
            <div className="rounded border border-slate-200 bg-amber-50 p-2 text-center">Day-6 EI+Color Fixed</div>
            <div className="animate-pulse rounded border border-[#C3002F] bg-red-50 p-2 text-center font-semibold text-[#8a001f]">Day-3 BBSS ABC Check</div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-center">Production</div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-[12px]">
              <p className="font-semibold">Decision 1</p>
              <p>Confirmed customer/dealer order attached?</p>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-[12px]">
              <p className="font-semibold">Decision 2</p>
              <p>If no order, is End Item category C?</p>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-[12px]">
              <p className="font-semibold">Outcome</p>
              <p>No order + C-category = reallocate to top A-category for same market.</p>
            </div>
          </div>
          <div className="mt-3 rounded bg-slate-100 p-2 text-[12px] text-slate-700">The reallocation window exists between Day-6 and Day-3. This is the last point where spec can be changed before build lock.</div>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[1fr_120px_1fr]">
          <Card className="rounded-md border border-red-300 bg-white shadow-sm">
            <CardHeader className="border-b border-red-100 px-4 py-3">
              <CardTitle className="text-[14px] text-red-700">Before Reallocation - C-category Unit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4 text-[12px]">
              <p><span className="font-semibold">End Item:</span> J10DFD4WDRHDNV01</p>
              <p><span className="font-semibold">Model:</span> X-Trail 2.2 dCi | 4WD | Manual 6-speed</p>
              <p><span className="font-semibold">Trim/Colour:</span> Visia / Nightshade Purple</p>
              <p><span className="font-semibold">Category:</span> C (slow mover)</p>
              <p><span className="font-semibold">Monthly demand:</span> 8 units | <span className="font-semibold">Avg sell:</span> 92 days</p>
              <p><span className="font-semibold">Order attached:</span> None</p>
              <p className="font-semibold text-red-700">Risk of 90+ day dwell: 73% | Estimated holding cost: EUR 4,050</p>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center text-[13px] font-bold text-[#C3002F]">REALLOCATED AT DAY-3</div>
          <Card className="rounded-md border border-emerald-300 bg-white shadow-sm">
            <CardHeader className="border-b border-emerald-100 px-4 py-3">
              <CardTitle className="text-[14px] text-emerald-700">After Reallocation - A-category Spec</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4 text-[12px]">
              <p><span className="font-semibold">End Item:</span> J10DFD2WDLHDAC01</p>
              <p><span className="font-semibold">Model:</span> X-Trail 2.2 dCi | 2WD | Manual 6-speed</p>
              <p><span className="font-semibold">Trim/Colour:</span> Acenta / Blade Silver</p>
              <p><span className="font-semibold">Category:</span> A (fast mover)</p>
              <p><span className="font-semibold">Monthly demand:</span> 2,840 units | <span className="font-semibold">Avg sell:</span> 14 days</p>
              <p><span className="font-semibold">Market:</span> NLD (unchanged)</p>
              <p className="font-semibold text-emerald-700">Expected dwell risk: 2% | Holding cost avoided: approx EUR 3,600</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">Integration with Production Pipeline & Monthly Cycle</h3>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Card className={panelClass}>
            <CardContent className="space-y-3 p-4 text-[12px]">
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded bg-slate-100 p-2 text-center">6 Months (Monthly)</div>
                <div className="rounded bg-slate-100 p-2 text-center">4 Weeks</div>
                <div className="rounded bg-slate-100 p-2 text-center">2 Weeks</div>
                <div className="rounded bg-slate-100 p-2 text-center">9 Days (Daily)</div>
              </div>
              <div className="relative h-16 rounded bg-slate-50">
                <div className="absolute left-[62%] top-0 h-full w-[14%] bg-red-100" />
                <div className="absolute left-[62%] top-1 text-[11px] font-semibold text-[#8a001f]">Day-6</div>
                <div className="absolute left-[73%] top-1 text-[11px] font-semibold text-[#8a001f]">Day-3 BBSS</div>
                <div className="absolute left-[62%] bottom-1 rounded bg-[#C3002F] px-2 py-0.5 text-[10px] text-white">ABC Reallocation Window (3 working days)</div>
              </div>
              <ul className="space-y-1 text-slate-700">
                <li>Day-6: End Item + Color fixed and sent to plant schedule.</li>
                <li>Day-6 to Day-3: System checks C-category plus order attachment status.</li>
                <li>Day-3 BBSS: last moment for trim/color/drivetrain change before build lock.</li>
                <li>After Day-3: no further spec changes possible.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className={panelClass}>
            <CardContent className="p-4">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Step</th>
                    <th className="px-2 py-1 text-left">Activity</th>
                    <th className="px-2 py-1 text-left">ABC Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Volume Request", "5-month request", "A/B/C signals for demand shape"],
                    ["SRVC Meeting", "Volume confirmation", "Plant confirms flexibility"],
                    ["Provisional Stage", "EI mix forecast", "Flag C-category forecasts"],
                    ["Confirmation Stage", "EI mix locked", "C-units tagged ABC-WATCH"],
                    ["Weekly Schedule", "Week to day split", "Day-6 identifies C-units"],
                    ["Daily Schedule", "Day-3 BBSS", "ABC REALLOCATION EXECUTED"],
                    ["Production", "Vehicle build", "Built as A-category spec"],
                  ].map((row, idx) => (
                    <tr key={row[0]} className={cn("border-b border-slate-100", idx >= 4 ? "bg-red-50" : "even:bg-slate-50")}>
                      <td className="px-2 py-1 font-medium">{row[0]}</td>
                      <td className="px-2 py-1">{row[1]}</td>
                      <td className={cn("px-2 py-1", idx === 5 ? "font-bold text-[#8a001f]" : "")}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">ABC Reallocation Impact - April 2026 Simulation</h3>
        <p className="text-[13px] text-slate-600">Qashqai (J10) production at Sunderland - monthly reallocation activity</p>
        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[14px]">April 2026 - Reallocation Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-4">
            <table className="w-full min-w-[1160px] text-[12px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Original EI (C)</th>
                  <th className="px-2 py-1 text-left">Replacement EI (A)</th>
                  <th className="px-2 py-1 text-left">Market</th>
                  <th className="px-2 py-1 text-left">Order Attached?</th>
                  <th className="px-2 py-1 text-left">Reason</th>
                  <th className="px-2 py-1 text-right">Days Saved</th>
                </tr>
              </thead>
              <tbody>
                {reallocationLog.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 even:bg-slate-50">
                    <td className="px-2 py-1">{row.id}</td>
                    <td className="px-2 py-1">{row.date}</td>
                    <td className="px-2 py-1 font-medium text-red-700">{row.from}</td>
                    <td className="px-2 py-1 font-medium text-emerald-700">{row.to}</td>
                    <td className="px-2 py-1">{row.market}</td>
                    <td className="px-2 py-1"><span className="rounded bg-red-100 px-2 py-0.5 text-red-700">No</span></td>
                    <td className="px-2 py-1">{row.reason}</td>
                    <td className="px-2 py-1 text-right font-bold text-emerald-700">~{row.saved}d</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-semibold">
                  <td colSpan={8} className="px-2 py-1">Total reallocations: 12 units | Estimated stock days saved: {fmt(totalSavedDays)} days | Estimated holding cost avoided: {eur(41760)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-4 py-3">
              <CardTitle className="text-[14px]">Stock Aging Profile - WITHOUT ABC Reallocation</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingWithout}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="band" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar stackId="a" dataKey="A" fill="#1B5E20" />
                  <Bar stackId="a" dataKey="B" fill="#FFB300" />
                  <Bar stackId="a" dataKey="C" fill="#C62828" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className={panelClass}>
            <CardHeader className="border-b border-slate-200 px-4 py-3">
              <CardTitle className="text-[14px]">Stock Aging Profile - WITH ABC Reallocation</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingWith}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="band" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar stackId="a" dataKey="A" fill="#1B5E20" />
                  <Bar stackId="a" dataKey="B" fill="#FFB300" />
                  <Bar stackId="a" dataKey="C" fill="#C62828" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-[13px] font-bold text-emerald-700">43% reduction in aged stock</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">Business Case - Annual Impact Assessment</h3>
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Annual Reallocations", "~145", "C->A spec changes per year (Qashqai)"],
            ["Stock Days Saved", "~11,300", "Equivalent to 31 years of single-unit dwell"],
            ["Holding Cost Avoided", "EUR 508K", "Using EUR 45/unit/day benchmark"],
            ["Aged Stock Reduction", "62%", "C-category units over 90 days"],
          ].map((card) => (
            <Card key={card[0]} className={panelClass}>
              <CardContent className="p-4">
                <p className="text-[12px] text-slate-600">{card[0]}</p>
                <p className="text-[28px] font-bold text-emerald-700">{card[1]}</p>
                <p className="text-[12px] text-slate-600">{card[2]}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[14px]">ABC Project Coverage - All European Models</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-4">
            <table className="w-full min-w-[980px] text-[12px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Model</th>
                  <th className="px-2 py-1 text-left">Factory</th>
                  <th className="px-2 py-1 text-right">Total EIs</th>
                  <th className="px-2 py-1 text-right">A</th>
                  <th className="px-2 py-1 text-right">B</th>
                  <th className="px-2 py-1 text-right">C</th>
                  <th className="px-2 py-1 text-right">Monthly C Reallocated</th>
                  <th className="px-2 py-1 text-right">Annual Saving</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Qashqai (J10)", "Sunderland", 20, "5 (25%)", "6 (30%)", "9 (45%)", 12, "EUR 508K"],
                  ["Note (E12)", "Sunderland", 16, "4 (25%)", "5 (31%)", "7 (44%)", 8, "EUR 295K"],
                  ["Micra (K13)", "Chennai/Barcelona", 14, "3 (21%)", "5 (36%)", "6 (43%)", 6, "EUR 198K"],
                  ["X-Trail (T31)", "Japan", 18, "4 (22%)", "6 (33%)", "8 (44%)", 10, "EUR 412K"],
                  ["Juke (F15)", "Sunderland", 12, "3 (25%)", "4 (33%)", "5 (42%)", 5, "EUR 178K"],
                  ["Pathfinder (R51)", "Japan", 10, "2 (20%)", "3 (30%)", "5 (50%)", 4, "EUR 142K"],
                  ["Navara (D40)", "Barcelona", 8, "2 (25%)", "3 (38%)", "3 (38%)", 2, "EUR 68K"],
                  ["Other models", "Various", 22, "5 (23%)", "7 (32%)", "10 (45%)", 5, "EUR 148K"],
                ].map((row) => (
                  <tr key={String(row[0])} className="border-b border-slate-100 even:bg-slate-50">
                    <td className="px-2 py-1">{row[0]}</td>
                    <td className="px-2 py-1">{row[1]}</td>
                    <td className="px-2 py-1 text-right">{fmt(Number(row[2]))}</td>
                    <td className="px-2 py-1 text-right">{row[3]}</td>
                    <td className="px-2 py-1 text-right">{row[4]}</td>
                    <td className="px-2 py-1 text-right">{row[5]}</td>
                    <td className="px-2 py-1 text-right">{row[6]}</td>
                    <td className="px-2 py-1 text-right">{row[7]}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold">
                  <td className="px-2 py-1">TOTAL</td>
                  <td className="px-2 py-1" />
                  <td className="px-2 py-1 text-right">120</td>
                  <td className="px-2 py-1 text-right">28 (23%)</td>
                  <td className="px-2 py-1 text-right">39 (33%)</td>
                  <td className="px-2 py-1 text-right">53 (44%)</td>
                  <td className="px-2 py-1 text-right">52/month</td>
                  <td className="px-2 py-1 text-right">EUR 1.95M</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader className="border-b border-slate-200 px-4 py-3">
            <CardTitle className="text-[14px]">ABC Project Impact Over Time - C-category Aged Stock</CardTitle>
          </CardHeader>
          <CardContent className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x="Sep-12" stroke="#64748b" strokeDasharray="4 4" label={{ value: "ABC Go-Live", position: "insideTopLeft", fontSize: 10 }} />
                <Line dataKey="withoutABC" stroke="#C62828" strokeDasharray="6 3" strokeWidth={2} name="Projected WITHOUT ABC" dot={false} />
                <Line dataKey="withABC" stroke="#1B5E20" strokeWidth={2} name="Actual WITH ABC" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[18px] font-bold">Reallocation Rules & Constraints</h3>
        <p className="text-[13px] text-slate-600">System logic governing the automatic spec change decision</p>
        <Card className={panelClass}>
          <CardHeader className="bg-[#333333] px-4 py-3 text-white">
            <CardTitle className="text-[14px]">ABC REALLOCATION ENGINE - CONFIGURATION v2.1</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-4">
            <table className="w-full min-w-[900px] text-[12px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Rule</th>
                  <th className="px-2 py-1 text-left">Setting</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, "Trigger C-category EIs only", "Threshold <5% cumulative", "Active"],
                  [2, "Order check", "No confirmed attachment", "Active"],
                  [3, "Timing", "Execute Day-3, window Day-6 to Day-3", "Active"],
                  [4, "Target mapping", "Highest-volume A-category for same market", "Active"],
                  [5, "Engine constraint", "Diesel->Diesel, Petrol->Petrol only", "Active"],
                  [6, "Transmission constraint", "Manual->Manual, CVT->CVT only", "Active"],
                  [7, "Body/Trim", "Trim changes allowed at BBSS", "Active"],
                  [8, "Colour", "Any colour to fast-selling colour", "Active"],
                  [9, "Drivetrain", "4WD->2WD allowed, reverse blocked", "Active"],
                  [10, "OCF validation", "Must stay within current OCF limits", "Active"],
                  [11, "Manager override", "Manual override with approval", "Conditional"],
                  [12, "Launch exclusion", "No reallocation first 3 launch months", "Active"],
                ].map((row) => (
                  <tr key={String(row[0])} className="border-b border-slate-100 even:bg-slate-50">
                    <td className="px-2 py-1">{row[0]}</td>
                    <td className="px-2 py-1">{row[1]}</td>
                    <td className="px-2 py-1">{row[2]}</td>
                    <td className={cn("px-2 py-1 font-semibold", row[3] === "Conditional" ? "text-amber-600" : "text-emerald-600")}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <p className="font-semibold text-red-700">FIXED at Day-3</p>
              <ul className="mt-2 space-y-1 text-[12px] text-slate-700">
                <li>Engine type and size</li>
                <li>Transmission type</li>
                <li>LHD/RHD architecture</li>
              </ul>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <p className="font-semibold text-emerald-700">FLEXIBLE at Day-3 BBSS</p>
              <ul className="mt-2 space-y-1 text-[12px] text-slate-700">
                <li>Body variant and trim level</li>
                <li>Exterior and interior colour</li>
                <li>Optional packages and 4WD-&gt;2WD adjustment</li>
                <li>Destination market by approval only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3 border-t border-slate-300 pt-4">
        <h3 className="text-[16px] font-bold">System Implementation - SCOPE Pipeline Flag</h3>
        <Card className="rounded-md border border-slate-700 bg-[#003B4F] text-slate-100 shadow-sm">
          <CardContent className="relative overflow-hidden p-0 font-mono text-[12px]">
            <div className="flex items-center justify-between bg-[#0b4d62] px-3 py-1 text-[11px]">
              <span>LINDA - myEXTRA! Enterprise</span>
              <span className="text-slate-300">_ [] X</span>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-cyan-300">CPM926 **** SUPPLY CHAIN MANAGEMENT SYSTEM **** 02/04/26</p>
              <p className="text-cyan-300">LIVE - ABC Category Analysis - 09:12:44</p>
              <p className="text-yellow-300">Model Grp: J10B QASHQAI   Market: ALL   Period: 2026/04</p>
              <p className="text-white">Category A (Fast Movers - &gt;30% sales)</p>
              <p className="text-green-300">J10DFD2WDLHDAC01 TTL: 2840 ORD: 2650 COVERAGE: 93% STATUS: OK</p>
              <p className="text-green-300">J10DFD2WDLHDSV01 TTL: 2450 ORD: 2180 COVERAGE: 89% STATUS: OK</p>
              <p className="text-green-300">J10PET2WDLHDAC01 TTL: 1980 ORD: 1820 COVERAGE: 92% STATUS: OK</p>
              <p className="animate-pulse font-semibold text-red-300">Category C (Slow Movers - &lt;5% sales): *** ABC WATCH ***</p>
              <p className="text-red-200">J10DFD4WDRHDNV01 TTL: 8 ORD: 2 UNMATCHED: 6 -&gt; REALLOCATE</p>
              <p className="text-red-200">J10PET4WDRHDNV01 TTL: 4 ORD: 1 UNMATCHED: 3 -&gt; REALLOCATE</p>
              <p className="text-red-200">J10DFD2WDLHDNV02 TTL: 6 ORD: 3 UNMATCHED: 3 -&gt; REALLOCATE</p>
              <p className="text-green-300">J10PET2WDRHDSV03 TTL: 4 ORD: 4 UNMATCHED: 0 -&gt; KEEP (ordered)</p>
              <p className="text-cyan-300">ABC Engine v2.1 | Last run: 15/10/13 08:00 | Next run: 16/10/13 08:00</p>
              <p className="text-yellow-300">Enter-PF1---PF2---PF3---PF4---PF5---PF6---PF7---PF8---PF9---PF10--PF11--PF12</p>
              <p className="text-white">Exit Main Detail Realloc History Config Report</p>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.04)_50%)] bg-[length:100%_4px]" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function CompetencyFrameworkPage() {
  const radar = [
    { skill: "SCM", value: 92 },
    { skill: "Financial", value: 86 },
    { skill: "Stakeholder", value: 89 },
    { skill: "Data Systems", value: 90 },
    { skill: "Project", value: 84 },
    { skill: "Leadership", value: 91 },
  ];
  const matrix = [
    { team: "SCM Planning", planning: "Advanced", analytics: "Advanced", governance: "Advanced" },
    { team: "Sales Ops", planning: "Advanced", analytics: "Proficient", governance: "Proficient" },
    { team: "Logistics", planning: "Proficient", analytics: "Proficient", governance: "Advanced" },
    { team: "Finance Control", planning: "Proficient", analytics: "Advanced", governance: "Advanced" },
  ];
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-2 lg:p-6">
      <Card className={panelClass}><CardHeader className="p-2"><CardTitle className="text-sm text-slate-800">Team Capability Radar</CardTitle></CardHeader><CardContent className="h-72 p-2"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Radar dataKey="value" stroke="#C3002F" fill="#C3002F" fillOpacity={0.35} /></RadarChart></ResponsiveContainer></CardContent></Card>
      <Card className={panelClass}><CardHeader className="p-2"><CardTitle className="text-sm text-slate-800">Competency Matrix</CardTitle></CardHeader><CardContent className="p-2"><table className="w-full text-[11px]"><thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Team</th><th className="px-2 py-1 text-left">Planning</th><th className="px-2 py-1 text-left">Analytics</th><th className="px-2 py-1 text-left">Governance</th></tr></thead><tbody>{matrix.map((row) => <tr key={row.team} className="border-b border-slate-100 even:bg-slate-50"><td className="px-2 py-1">{row.team}</td><td className="px-2 py-1">{row.planning}</td><td className="px-2 py-1">{row.analytics}</td><td className="px-2 py-1">{row.governance}</td></tr>)}</tbody></table></CardContent></Card>
    </div>
  );
}

function renderPage(page: PageId, region: string, setRegion: (v: string) => void) {
  if (page === "executive") return <ExecutiveOverviewEnterprisePage region={region} setRegion={setRegion} />;
  if (page === "inventory") return <InventoryManagementPage />;
  if (page === "pipeline") return <PipelineSystemPage />;
  if (page === "cycle") return <MonthlyProductionCyclePage />;
  if (page === "process") return <ProcessOptimizationPage />;
  if (page === "operations") return <OperationsDashboardPage />;
  if (page === "reconciliation") return <StockReconciliationPage />;
  if (page === "initiatives") return <StrategicInitiativesPage />;
  return <CompetencyFrameworkPage />;
}

export default function App() {
  const [page, setPage] = useState<PageId>("executive");
  const [region, setRegion] = useState("All Europe");
  const pageTitle = navItems.find((item) => item.id === page)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-900">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col border-r border-slate-800 bg-[#0D0D0D] lg:w-72">
        <div className="border-b border-slate-700 px-3 py-4 lg:px-5">
          <p className="text-sm font-bold tracking-wide text-white">NISSAN EUROPE</p>
          <p className="text-[11px] text-slate-400">SCM & Sales Operations</p>
          <div className="mt-2 h-0.5 w-16 bg-[#C3002F]" />
        </div>
        <nav className="space-y-1 px-2 py-3 lg:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border-l-2 px-2 py-2 text-left text-xs transition lg:px-3",
                  active ? "border-l-[#C3002F] bg-[#C3002F]/15 text-white" : "border-l-transparent text-slate-300 hover:bg-white/5"
                )}
              >
                <Icon size={15} className={active ? "text-[#ff5b7f]" : "text-slate-400"} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="ml-20 min-h-screen lg:ml-72">
        <TopBar pageTitle={pageTitle} region={region} setRegion={setRegion} showRegion={page !== "executive"} />
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            <PageErrorBoundary key={page}>{renderPage(page, region, setRegion)}</PageErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
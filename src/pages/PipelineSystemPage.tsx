import { useState, useEffect, useMemo } from "react";
import { Download, Printer, RefreshCcw } from "lucide-react";
import { cn } from "../utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { eiMasterRaw, type EndItemRow } from "./PipelineData.ts";

type Horizon = "6-Month" | "4-Week" | "5-Day";
type PipelineTab = "Forecast View" | "Order Bank" | "In Transit" | "Compound Stock";

const horizonColumns: Record<Horizon, string[]> = {
  "6-Month": ["May-26", "Jun-26", "Jul-26", "Aug-26", "Sep-26", "Oct-26"],
  "4-Week": ["W19", "W20", "W21", "W22"],
  "5-Day": ["04-May", "05-May", "06-May", "07-May", "08-May"],
};

export const rbuMarkets: Record<string, string[]> = {
  WEST: ["FRA", "NLD", "BEL", "LUX"],
  UK: ["GBR"],
  NORDICS: ["SWE", "NOR", "DEN", "FIN", "EST", "LAT", "LIT"],
  ITA: ["ITA"],
  CEE: ["POL", "CZE", "HUN", "SVK", "AUT"],
  CENTER: ["GER", "CHE", "AUT"],
  RUSSIA: ["RUS", "UKR"],
  IBERIA: ["ESP", "POR"],
  MEA: ["ISR", "MAR", "TUN", "CYP"],
};

export default function PipelineSystemPage() {
  const [rbu, setRbu] = useState("All");
  const [model, setModel] = useState("All");
  const [horizon, setHorizon] = useState<Horizon>("6-Month");
  const [orderType, setOrderType] = useState("All");
  const [status, setStatus] = useState("All");
  const [factory, setFactory] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<PipelineTab>("Forecast View");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const statusOptions = horizon === "6-Month"
    ? ["All", "Confirmed", "Scheduled", "Provisional", "Indicative"]
    : ["All", "Firm", "Scheduled", "In Production", "Locked", "Fixed", "Flexible"];

  useEffect(() => {
    setStatus("All");
  }, [horizon]);

  const eiMaster = useMemo(() => {
    return eiMasterRaw.map((row: EndItemRow) => {
      const seed = row.ei.charCodeAt(0) + row.ei.charCodeAt(row.ei.length - 1);
      const scale = horizon === "6-Month" ? 1 : horizon === "4-Week" ? 0.25 : 0.05;
      
      const values = horizonColumns[horizon].map((_, i) => Math.max(1, Math.floor((row.vol[0] + (seed % 5) * i) * scale)));
      
      let itemStatus = "Indicative";
      if (horizon === "6-Month") {
         itemStatus = ["Confirmed", "Scheduled", "Provisional", "Indicative"][seed % 4];
      } else {
         itemStatus = ["Firm", "Scheduled", "In Production", "Locked", "Fixed", "Flexible"][seed % 6];
      }
      
      return { ...row, values, status: itemStatus };
    });
  }, [horizon]);

  const filteredRows = useMemo(() => {
    return eiMaster.filter((row: EndItemRow & { values: number[], status: string }) => {
      if (rbu !== "All") {
        const validDestCodes = rbuMarkets[rbu] || [];
        if (!validDestCodes.includes(row.destCode)) return false;
      }
      if (model !== "All" && row.model !== model) return false;
      if (status !== "All" && row.status !== status) return false;
      if (factory !== "All" && row.fty !== factory) return false;
      if (search && !row.ei.toLowerCase().includes(search.toLowerCase())) return false;
      
      return true;
    });
  }, [rbu, model, horizon, status, factory, search, eiMaster]);

  const selectedRow = filteredRows.find((row) => row.ei === selectedCode) ?? filteredRows[0];

  useEffect(() => {
    if (filteredRows.length > 0 && !filteredRows.find((r: EndItemRow) => r.ei === selectedCode)) {
      setSelectedCode(filteredRows[0].ei);
    }
  }, [filteredRows, selectedCode]);

  return (
    <div className="space-y-3 bg-[#f2f4f7] p-4 lg:p-6">
      <Card className="rounded-md border border-slate-300 bg-white shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-2">
          <p className="text-xs font-semibold text-slate-700">Vehicle Pipeline Management System</p>
          <div className="flex flex-wrap items-center gap-2">
            <Select options={["All", "WEST", "NORDICS", "ITA", "CEE", "CENTER", "RUSSIA", "UK", "IBERIA", "MEA"]} value={rbu} onChange={(e: any) => setRbu(e.target.value)} className="h-8 border-slate-300 bg-white text-xs text-slate-700 w-auto" />
            <Select options={["All", "Micra", "Note", "Almera", "Primera", "Juke", "Qashqai", "Qashqai+2", "X-Trail", "Pathfinder", "Murano", "Navara", "350Z", "Tiida", "Patrol", "NV200", "Cabstar", "Interstar", "Primastar"]} value={model} onChange={(e: any) => setModel(e.target.value)} className="h-8 border-slate-300 bg-white text-xs text-slate-700 w-auto" />
            {(["6-Month", "4-Week", "5-Day"] as Horizon[]).map((item) => (
              <button key={item} onClick={() => setHorizon(item)} className={cn("rounded border px-2 py-1 text-[11px]", horizon === item ? "border-[#C3002F] bg-[#C3002F]/10 text-[#8a001f]" : "border-slate-300")}>{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span>Last Updated: 02-Apr-2026</span>
            <Download size={14} className="cursor-pointer hover:text-red-600" />
            <Printer size={14} className="cursor-pointer hover:text-red-600" />
            <RefreshCcw size={14} className="cursor-pointer hover:text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border border-slate-300 bg-white shadow-sm">
        <CardContent className="space-y-2 p-2">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            {(["Forecast View", "Order Bank", "In Transit", "Compound Stock"] as PipelineTab[]).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={cn("rounded border px-3 py-1 text-[11px]", tab === item ? "border-[#C3002F] bg-[#C3002F]/10 text-[#8a001f]" : "border-slate-300")}>{item}</button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <Select options={["All", "Stock", "Fleet", "Retail Order", "Demo"]} value={orderType} onChange={(e: any) => setOrderType(e.target.value)} className="h-8 border-slate-300 bg-white text-[11px] text-slate-700 w-auto" />
            <Select options={statusOptions} value={status} onChange={(e: any) => setStatus(e.target.value)} className="h-8 border-slate-300 bg-white text-[11px] text-slate-700 w-auto" />
            <Select options={["All", "NMUK", "NMISA", "NML", "NMIPL"]} value={factory} onChange={(e: any) => setFactory(e.target.value)} className="h-8 border-slate-300 bg-white text-[11px] text-slate-700 w-auto" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search End Item Code" className="h-8 min-w-56 rounded border border-slate-300 px-2 text-[11px] outline-none focus:border-red-500" />
          </div>

          {tab === "Forecast View" && (
            <div className="grid gap-3 xl:grid-cols-[1fr,300px]">
              <div className="overflow-x-auto rounded border border-slate-300">
                <table className="w-full min-w-[1000px] text-[12px]">
                  <thead className="bg-slate-700 text-white">
                    <tr>
                      <th className="px-2 py-1 text-left w-8"><input type="checkbox" /></th>
                      <th className="px-2 py-1 text-left w-12">Ln</th>
                      <th className="px-2 py-1 text-left">End Item Code</th>
                      <th className="px-2 py-1 text-left">Model</th>
                      <th className="px-2 py-1 text-left">Engine</th>
                      <th className="px-2 py-1 text-left">Dest</th>
                      {horizonColumns[horizon].map((col) => <th key={col} className="px-2 py-1 text-right">{col}</th>)}
                      <th className="px-2 py-1 text-right">Total</th>
                      <th className="px-2 py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                       <tr><td colSpan={10 + horizonColumns[horizon].length} className="text-center py-8 text-slate-500">No records found for the selected filters.</td></tr>
                    ) : filteredRows.map((row: EndItemRow & { values: number[], status: string }, idx: number) => {
                          const total = row.values.reduce((acc: number, n: number) => acc + n, 0);
                          const isSelected = selectedRow?.ei === row.ei;
                          return (
                            <tr key={row.ei} onClick={() => setSelectedCode(row.ei)} className={cn("cursor-pointer border-b border-slate-200 hover:bg-slate-50", isSelected && "bg-[#C3002F]/10") }>
                              <td className="px-2 py-1"><input type="checkbox" /></td>
                              <td className="px-2 py-1 text-slate-500">{idx + 1}</td>
                              <td className="px-2 py-1 font-mono text-[11px] font-semibold text-slate-700">{row.ei}</td>
                              <td className="px-2 py-1">{row.model}</td>
                              <td className="px-2 py-1 whitespace-nowrap text-[11px] text-slate-500">{row.eng}</td>
                              <td className="px-2 py-1">{row.destCode}</td>
                              {row.values.map((v: number, vIdx: number) => (
                                <td key={`${row.ei}-${vIdx}`} className="cursor-cell px-2 py-1 text-right hover:outline hover:outline-slate-300">{v}</td>
                              ))}
                              <td className="px-2 py-1 text-right font-bold text-slate-800">{total}</td>
                              <td className="px-2 py-1">
                                <span className={cn("inline-flex items-center gap-1 text-[11px]", 
                                    (row.status === "Confirmed" || row.status === "Firm" || row.status === "In Production") ? "text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded" : 
                                    (row.status === "Scheduled" || row.status === "Locked") ? "text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded" : 
                                    "text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded")}>
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              <Card className="rounded-md border border-slate-300 bg-white shadow-none h-fit">
                <CardHeader className="border-b border-slate-200 p-2"><CardTitle className="text-xs text-slate-800">Vehicle Detail</CardTitle></CardHeader>
                <CardContent className="space-y-3 p-2 text-[11px] text-slate-700">
                  <div className="rounded border border-slate-200 bg-slate-100 p-2 text-center text-[13px] font-mono font-bold tracking-widest text-slate-800 shadow-inner">
                    {selectedRow?.ei ?? "N/A"}
                  </div>
                  {selectedRow && (
                    <div className="grid grid-cols-[80px,1fr] gap-x-2 gap-y-1.5 border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-semibold">Model</span> <span className="font-semibold">{selectedRow.model}</span>
                        <span className="text-slate-500 font-semibold">Engine</span> <span>{selectedRow.eng}</span>
                        <span className="text-slate-500 font-semibold">Drivetrain</span> <span>{selectedRow.drv} ({selectedRow.side})</span>
                        <span className="text-slate-500 font-semibold">Trans.</span> <span>{selectedRow.trans}</span>
                        <span className="text-slate-500 font-semibold">Trim</span> <span>{selectedRow.trim}</span>
                        <span className="text-slate-500 font-semibold">Exterior</span> <span>{selectedRow.color}</span>
                        <span className="text-slate-500 font-semibold">Dest.</span> <span>{selectedRow.destName} ({selectedRow.destCode})</span>
                        <span className="text-slate-500 font-semibold">Factory</span> <span className="font-mono bg-slate-100 px-1 rounded">{selectedRow.fty}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">Pipeline Execution Path</p>
                    <div className="flex flex-col gap-1 text-[10px]">
                      {["Forecast Captured", "Scheduled for Prod", "In Production", "Vessel Transit", "At Compound", "Dealer Delivered"].map((step, idx) => {
                         const isPast = idx < 2;
                         const isCurrent = idx === 2;
                         return (
                          <div key={step} className={cn("flex items-center gap-2 rounded px-2 py-1", isPast ? "bg-slate-100 text-slate-500" : isCurrent ? "bg-[#C3002F]/10 text-[#8a001f] font-semibold border-l-2 border-[#C3002F]" : "text-slate-400")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", isPast ? "bg-slate-400" : isCurrent ? "bg-[#C3002F] animate-pulse" : "bg-slate-200")} />
                            {step}
                          </div>
                      )})}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab !== "Forecast View" && (
            <div className="overflow-x-auto rounded border border-slate-300">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-700 text-white">
                  {tab === "Order Bank" && (
                    <tr><th className="px-2 py-1 text-left w-8"><input type="checkbox" /></th><th className="px-2 py-1 text-left">Order #</th><th className="px-2 py-1 text-left">End Item</th><th className="px-2 py-1 text-left">Dealer</th><th className="px-2 py-1 text-left">Customer</th><th className="px-2 py-1 text-left">Order Date</th><th className="px-2 py-1 text-left">Req Delivery</th><th className="px-2 py-1 text-left">Status</th></tr>
                  )}
                  {tab === "In Transit" && (
                     <tr><th className="px-2 py-1 text-left w-8"><input type="checkbox" /></th><th className="px-2 py-1 text-left">Batch (VIN)</th><th className="px-2 py-1 text-left">End Item</th><th className="px-2 py-1 text-left">Vessel / Transport</th><th className="px-2 py-1 text-left">Departure</th><th className="px-2 py-1 text-left">ETA</th><th className="px-2 py-1 text-left">Current Location</th><th className="px-2 py-1 text-left">Phase</th></tr>
                  )}
                  {tab === "Compound Stock" && (
                    <tr><th className="px-2 py-1 text-left w-8"><input type="checkbox" /></th><th className="px-2 py-1 text-left">Compound</th><th className="px-2 py-1 text-left">End Item</th><th className="px-2 py-1 text-left">Age Bucket</th><th className="px-2 py-1 text-left">Available</th><th className="px-2 py-1 text-left">Allocated</th><th className="px-2 py-1 text-left">Free (Unblocked)</th><th className="px-2 py-1 text-left">Condition</th></tr>
                  )}
                </thead>
                <tbody>
                  {filteredRows.slice(0, 15).map((row: EndItemRow & { values: number[], status: string }, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200 even:bg-slate-50 hover:bg-red-50 cursor-pointer">
                      <td className="px-2 py-1"><input type="checkbox" /></td>
                      {tab === "Order Bank" && <><td className="px-2 py-1 font-mono text-[11px]">OB-{20261300 + idx}</td><td className="px-2 py-1 font-mono font-semibold text-[11px]">{row.ei}</td><td className="px-2 py-1">Dealer {idx % 5 + 1} ({row.destCode})</td><td className="px-2 py-1">{idx % 3 === 0 ? "Fleet" : "Retail"}</td><td className="px-2 py-1 text-slate-500">0{idx%9 + 1}-Apr-2026</td><td className="px-2 py-1 text-slate-500">{12 + idx%10}-Jun-2026</td><td className="px-2 py-1"><span className="text-emerald-700 bg-emerald-100 px-1 rounded text-[10px]">Confirmed</span></td></>}
                      {tab === "In Transit" && <><td className="px-2 py-1 font-mono text-[11px]">SJNC{row.ei.substring(0,3)}{800000+idx}</td><td className="px-2 py-1 font-mono font-semibold text-[11px]">{row.ei}</td><td className="px-2 py-1">{row.fty === "NMUK" ? "Truck Haulage" : "Pacific Star"}</td><td className="px-2 py-1 text-slate-500">2{idx%5 + 1}-Mar-2026</td><td className="px-2 py-1 text-slate-500">0{idx%9 + 1}-May-2026</td><td className="px-2 py-1">{row.fty === "NMUK" ? "Channel Tunnel" : "Suez Canal"}</td><td className="px-2 py-1"><span className="text-amber-700 bg-amber-100 px-1 rounded text-[10px]">Port Bound</span></td></>}
                      {tab === "Compound Stock" && <><td className="px-2 py-1">{row.destCode} Main Hub</td><td className="px-2 py-1 font-mono font-semibold text-[11px]">{row.ei}</td><td className="px-2 py-1 text-slate-500">0-15 Days</td><td className="px-2 py-1">{Math.floor(row.vol[0]/2) + 1}</td><td className="px-2 py-1">{Math.floor(row.vol[0]/3)}</td><td className="px-2 py-1 font-bold text-slate-800">{(Math.floor(row.vol[0]/2) + 1) - Math.floor(row.vol[0]/3)}</td><td className="px-2 py-1"><span className="text-slate-600 bg-slate-200 px-1 rounded text-[10px]">Clean</span></td></>}
                    </tr>
                  ))}
                  {filteredRows.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-500">No physical records match the current filter selection.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

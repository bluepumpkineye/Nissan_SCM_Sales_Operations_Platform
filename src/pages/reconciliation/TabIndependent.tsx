import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../utils/cn";
const P = "rounded-md border border-slate-200 bg-white shadow-sm";

const markets = [
  {mkt:"Croatia",type:"Independent Importer",factory:"NMISA (BCN), NML (JPN)",dur:"<24 hours",vol:45,risk:"🔴 High"},
  {mkt:"Malta",type:"Independent Importer",factory:"NMISA (BCN)",dur:"<24 hours",vol:8,risk:"🟡 Medium"},
  {mkt:"Turkey",type:"Independent Distributor",factory:"NML (JPN), NMUK (UK)",dur:"<48 hours",vol:120,risk:"🔴 High"},
  {mkt:"Cyprus",type:"Independent Importer",factory:"NML (JPN)",dur:"<24 hours",vol:15,risk:"🟡 Medium"},
  {mkt:"Iceland",type:"Independent Importer",factory:"NMUK (UK)",dur:"<48 hours",vol:12,risk:"🟡 Medium"},
  {mkt:"Israel",type:"Independent Distributor",factory:"NML (JPN), NMIPL (IND)",dur:"<24 hours",vol:85,risk:"🔴 High"},
  {mkt:"Morocco",type:"Independent Distributor",factory:"NMISA (BCN)",dur:"<24 hours",vol:35,risk:"🟡 Medium"},
  {mkt:"Tunisia",type:"Independent Importer",factory:"NMISA (BCN)",dur:"<24 hours",vol:20,risk:"🟡 Medium"},
];

const spikeData = Array.from({length:31},(_,i)=>{
  const day = i+1;
  const isShip = [3,10,17,24].includes(day);
  const nearShip = [4,5,11,12,18,19,25,26].includes(day);
  return {day:`${day}`,units: isShip ? 80+Math.round(Math.random()*40) : nearShip ? 40+Math.round(Math.random()*20) : 5+Math.round(Math.random()*15)};
});

export default function TabIndependent() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-slate-900">Independent Markets — Special Invoicing Rules</h2>
      <p className="text-[13px] text-slate-500 -mt-3">Markets where NISA ownership window is minimal — factory gate-out invoicing</p>

      {/* Context card */}
      <div className="rounded-md border-l-4 border-amber-500 bg-[#FFF8E1] px-5 py-4">
        <p className="text-[13px] text-slate-700">Independent markets are countries where Nissan does not have a National Sales Company (NSC) or Regional Business Unit (RBU). Instead, vehicles are sold to independent distributors/importers. The invoicing point is at <span className="font-bold">FACTORY GATE-OUT</span> — meaning NISA purchases from the factory AND immediately sells to the distributor at almost the same moment. The NISA ownership window can be as short as a few hours, creating significant reconciliation challenges.</p>
      </div>

      {/* Market list */}
      <Card className={P}><CardContent className="overflow-x-auto p-4">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-100 text-slate-700">
            <tr><th className="px-3 py-2 text-left">Market</th><th className="px-3 py-2 text-left">Distributor Type</th><th className="px-3 py-2 text-left">Source Factory</th><th className="px-3 py-2 text-left">NISA Ownership</th><th className="px-3 py-2 text-right">Monthly Vol</th><th className="px-3 py-2 text-center">Risk</th></tr>
          </thead>
          <tbody>
            {markets.map(m=>(
              <tr key={m.mkt} className="border-b border-slate-100 even:bg-slate-50">
                <td className="px-3 py-2 font-medium">{m.mkt}</td><td className="px-3 py-2">{m.type}</td>
                <td className="px-3 py-2">{m.factory}</td><td className="px-3 py-2">{m.dur}</td>
                <td className="px-3 py-2 text-right">{m.vol}</td><td className="px-3 py-2 text-center">{m.risk}</td>
              </tr>
            ))}
            <tr className="bg-slate-200 font-bold"><td className="px-3 py-2" colSpan={4}>Total monthly volume</td><td className="px-3 py-2 text-right">~340</td><td></td></tr>
          </tbody>
        </table>
      </CardContent></Card>

      {/* Flow comparison */}
      <h3 className="text-[16px] font-bold text-slate-800">Invoice Flow Comparison</h3>
      <Card className={P}><CardContent className="p-5 space-y-4">
        <div>
          <p className="text-[12px] font-semibold text-slate-700 mb-2">STANDARD RBU FLOW (e.g., France)</p>
          <div className="flex items-center gap-1 flex-wrap">
            {[{l:"Factory (18)",c:"#757575"},{l:"Port (20)",c:"#757575"},{l:"NISA Purchase (25)",c:"#2E7D32"}].map((s,i)=>(
              <span key={i} className="flex items-center gap-1">
                <span className="rounded px-2 py-1 text-[10px] font-medium text-white" style={{background:s.c}}>{s.l}</span>
                {i<2&&<span className="text-slate-400">→</span>}
              </span>
            ))}
            <span className="rounded border-2 border-[#4CAF50] bg-[#E8F5E9] px-3 py-1 text-[10px] font-bold text-[#2E7D32] mx-1">═══ NISA OWNS (30→80) ~45-70 days ═══</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium text-white" style={{background:"#E65100"}}>NISA Sale (85)</span>
            <span className="text-slate-400">→</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium bg-white border border-slate-300 text-slate-700">Dealer (90)</span>
          </div>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-slate-700 mb-2">INDEPENDENT MARKET FLOW (e.g., Croatia)</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="rounded px-2 py-1 text-[10px] font-medium text-white bg-[#757575]">Factory (18)</span>
            <span className="text-slate-400">→</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium text-white bg-[#757575]">Port (20)</span>
            <span className="text-slate-400">→</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium text-white bg-[#2E7D32]">NISA Purchase (25)</span>
            <span className="rounded border-2 border-amber-400 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 mx-1">⚠️ &lt;24h ownership</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium text-white" style={{background:"#E65100"}}>NISA Sale (immediate)</span>
            <span className="text-slate-400">→</span>
            <span className="rounded px-2 py-1 text-[10px] font-medium bg-white border border-slate-300 text-slate-700">Distributor</span>
          </div>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <span className="font-semibold">Reconciliation challenge:</span> When NISA purchase invoice (from factory) and NISA sale invoice (to distributor) are processed within hours of each other, timing differences between SCOPE and the financial ledger create phantom discrepancies.
        </div>
      </CardContent></Card>

      {/* Spike chart */}
      <h3 className="text-[16px] font-bold text-slate-800">Independent Market Discrepancy by Day of Month</h3>
      <Card className={P}>
        <CardContent className="h-64 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spikeData}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3"/><XAxis dataKey="day" tick={{fontSize:9}} interval={1}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="units" fill="#FF8F00"/></BarChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="px-5 pb-4 text-[11px] text-slate-600">
          Batch shipping days (every ~7 days) create temporary spikes of 80-120 units that resolve within 3-5 business days.
        </div>
      </Card>

      <div className="rounded-md border-l-4 border-emerald-500 bg-emerald-50 px-5 py-3">
        <p className="text-[12px] text-emerald-800"><span className="font-semibold">Resolution Note:</span> Current tolerance accepted: Up to 100 units of permanent independent market discrepancy considered within acceptable range due to same-day invoicing timing. Discrepancies exceeding this threshold trigger investigation.</p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../utils/cn";
const P = "rounded-md border border-slate-200 bg-white shadow-sm";

type RBU = "WES"|"ITA"|"RUS"|"EGB"|"NNE"|"CEE"|"IBE"|"CEN"|"UKR";
const rbuList: {id:RBU;label:string}[] = [
  {id:"CEE",label:"CEE"},{id:"CEN",label:"CEN"},{id:"EGB",label:"EGB"},{id:"IBE",label:"IBE"},
  {id:"ITA",label:"ITA"},{id:"NNE",label:"NNE"},{id:"RUS",label:"RUS"},{id:"WES",label:"WES"},{id:"UKR",label:"UKR"},
];

const notes: Record<RBU,string[]> = {
  WES:["LEH (Le Havre): TI-Job with fin check — key reconciliation point for French dealers","AMS (Amsterdam): TI-Job with fin check — serves HOL, BEL, LUX","Belgium has secondary storage (GNK, DAV) at status 80-85","⚠️ Some BCN routes show 'No Fin check' — known discrepancy source"],
  ITA:["⚠️ Italy operates NITA local system with separate finance checks","Change of Ownership actioned in NITA PRIOR to TI/65","Multiple compounds: LIV, CIV, VERC, ROMA","#2 source of reconciliation discrepancy (380 units)"],
  RUS:["THREE compounds: NMR (Moscow), STP (St Petersburg), VLD (Vladivostok)","SMR = Automatic NISA Sale (system-triggered at status 30)","FPA = Manual NISA Sale (requires manual processing)","⚠️ SMR/FPA timing is #1 source of Russia discrepancy (420 units)"],
  EGB:["NISA sells to NMGB at status 25, NMGB sells to dealer at 70","Unique structure: NISA purchase = NISA sale at same status","POT (Portbury) is main compound — no standard fin check","Transfer timing creates 150-unit discrepancy"],
  NNE:["Multi-compound: GOT (Gothenburg), TOR, DRA, HAN","Nordic distribution adds routing complexity","GOT serves SWE, NOR, DEN dealers","Physical dispatch updates lag SCOPE by 2-3 days"],
  CEE:["AMS serves as main hub for CEE distribution","Secondary compounds: SCH (Austria), GDA (Poland)","Transit from AMS to regional compounds creates gaps","Factory invoice batch delays from NML add to discrepancy"],
  IBE:["Multi-compound: SNT, BCN, AVL","BCN has no financial check — known gap source","Zone-based dealer allocation across Spain/Portugal","68-unit discrepancy from compound tracking issues"],
  CEN:["CAT BAT (France) → SCH (Austria) and ALT (Switzerland)","Small volume but separate tracking needed","Transit timing creates 62-unit gap","SCH compound serves both CEN and some CEE markets"],
  UKR:["Routed through Russia network","Limited volume — special invoicing rules","Political/economic factors affect processing times","Shares NCL transit hub with Russia routes"],
};

const compounds = [
  {c:"POT",loc:"Portbury, UK",rbu:"EGB, WES, NNE",fin:"TI-Job (No Fin) ⚠️",stk:4250,dwell:8},
  {c:"LEH",loc:"Le Havre, France",rbu:"WES (FRA)",fin:"TI-Job (Fin) ✅",stk:2800,dwell:12},
  {c:"AMS",loc:"Amsterdam, Holland",rbu:"WES, CEE, NNE",fin:"TI-Job (Fin) ✅",stk:3100,dwell:10},
  {c:"BCN",loc:"Barcelona, Spain",rbu:"IBE, WES, ITA",fin:"No Fin check ⚠️",stk:1950,dwell:7},
  {c:"SNT",loc:"Santander, Spain",rbu:"IBE, WES, NNE",fin:"TI-Job (Fin) ✅",stk:1200,dwell:9},
  {c:"LIV",loc:"Livorno, Italy",rbu:"ITA (Z010-080)",fin:"NITA local ⚠️",stk:1800,dwell:15},
  {c:"CIV",loc:"Civitavecchia, Italy",rbu:"ITA (Z100-200)",fin:"NITA local ⚠️",stk:1400,dwell:14},
  {c:"SCH",loc:"Schwertberg, Austria",rbu:"CEE, CEN",fin:"TI-Job (Fin) ✅",stk:650,dwell:6},
  {c:"GOT",loc:"Gothenburg, Sweden",rbu:"NNE (SWE/NOR/DEN)",fin:"TI-Job (Fin) ✅",stk:1200,dwell:11},
  {c:"GDA",loc:"Gdansk, Poland",rbu:"CEE, NNE",fin:"TI-Job (Fin) ✅",stk:580,dwell:8},
  {c:"NCL",loc:"Newcastle, UK",rbu:"RUS (transit)",fin:"SMR trigger ⚠️",stk:1850,dwell:5},
  {c:"STP",loc:"St Petersburg, Russia",rbu:"RUS",fin:"Dealer credit ✅",stk:2400,dwell:22},
  {c:"NMR",loc:"Moscow, Russia",rbu:"RUS",fin:"Dealer credit ✅",stk:1800,dwell:18},
];

function RouteFlow({rbu}:{rbu:RBU}) {
  const configs: Record<string,{nodes:{x:number;y:number;label:string;type:string}[];arrows:{x1:number;y1:number;x2:number;y2:number;label:string}[]}> = {
    WES:{nodes:[{x:60,y:80,label:"NMUK",type:"factory"},{x:200,y:80,label:"POT",type:"port"},{x:380,y:50,label:"LEH (FRA)",type:"compound"},{x:380,y:120,label:"AMS (HOL)",type:"compound"},{x:560,y:50,label:"TI-Job",type:"finance"},{x:560,y:120,label:"TI-Job",type:"finance"},{x:720,y:30,label:"DLR FRA",type:"dealer"},{x:720,y:70,label:"DLR HOL",type:"dealer"},{x:720,y:110,label:"DLR BEL",type:"dealer"},{x:720,y:150,label:"DLR LUX",type:"dealer"}],arrows:[{x1:110,y1:80,x2:160,y2:80,label:"18→20"},{x1:250,y1:80,x2:330,y2:55,label:"25→40"},{x1:250,y1:80,x2:330,y2:125,label:"25→40"},{x1:430,y1:50,x2:510,y2:50,label:"65"},{x1:430,y1:120,x2:510,y2:120,label:"65"},{x1:610,y1:50,x2:680,y2:32,label:"85"},{x1:610,y1:120,x2:680,y2:72,label:"85"},{x1:610,y1:120,x2:680,y2:112,label:"80→85"},{x1:610,y1:120,x2:680,y2:152,label:"80→85"}]},
  };
  const cfg = configs[rbu];
  if (!cfg) return (
    <div className="rounded border border-slate-200 bg-slate-50 p-6 text-center">
      <svg viewBox="0 0 800 160" className="w-full">
        <rect x="20" y="40" width="100" height="50" rx="4" fill="#424242"/><text x="70" y="70" textAnchor="middle" fontSize="11" fill="white">Factory</text>
        <line x1="120" y1="65" x2="200" y2="65" stroke="#999" strokeWidth="1.5" markerEnd="url(#ra)"/>
        <rect x="200" y="40" width="100" height="50" rx="4" fill="#BBDEFB" stroke="#64B5F6"/><text x="250" y="70" textAnchor="middle" fontSize="11" fill="#1565C0">Port (20)</text>
        <line x1="300" y1="65" x2="360" y2="65" stroke="#999" strokeWidth="1.5" markerEnd="url(#ra)"/><text x="330" y="58" textAnchor="middle" fontSize="9" fill="#2E7D32" fontWeight="bold">25</text>
        <rect x="360" y="20" width="220" height="90" rx="6" fill="#E8F5E9" stroke="#4CAF50" strokeDasharray="6 3"/>
        <text x="470" y="45" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2E7D32">NISA Zone (25→85)</text>
        <rect x="380" y="55" width="80" height="30" rx="3" fill="white" stroke="#A5D6A7"/><text x="420" y="74" textAnchor="middle" fontSize="9" fill="#333">Compound</text>
        <rect x="480" y="55" width="80" height="30" rx="3" fill="#E1BEE7" stroke="#9C27B0"/><text x="520" y="74" textAnchor="middle" fontSize="9" fill="#6A1B9A">TI-Job</text>
        <line x1="580" y1="65" x2="640" y2="65" stroke="#999" strokeWidth="1.5" markerEnd="url(#ra)"/><text x="610" y="58" textAnchor="middle" fontSize="9" fill="#E65100" fontWeight="bold">85</text>
        <rect x="640" y="40" width="100" height="50" rx="4" fill="white" stroke="#BDBDBD"/><text x="690" y="70" textAnchor="middle" fontSize="11" fill="#424242">Dealer (90)</text>
        <defs><marker id="ra" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#999"/></marker></defs>
      </svg>
      <p className="text-[12px] text-slate-500 mt-2">Detailed route schematic for {rbu} — standard flow applies</p>
    </div>
  );
  return (
    <svg viewBox="0 0 800 180" className="w-full">
      <rect x="280" y="5" width="320" height="170" rx="6" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="6 3" fillOpacity="0.5"/>
      <text x="440" y="20" textAnchor="middle" fontSize="9" fill="#2E7D32" fontWeight="bold">NISA OWNERSHIP ZONE</text>
      {cfg.nodes.map((n,i)=>{
        const fills: Record<string,string> = {factory:"#424242",port:"#BBDEFB",compound:"#FFF9C4",finance:"#E1BEE7",dealer:"#FFFFFF"};
        const strokes: Record<string,string> = {factory:"#333",port:"#64B5F6",compound:"#FBC02D",finance:"#9C27B0",dealer:"#BDBDBD"};
        const txc: Record<string,string> = {factory:"white",port:"#1565C0",compound:"#333",finance:"#6A1B9A",dealer:"#424242"};
        return <g key={i}><rect x={n.x-45} y={n.y-16} width="90" height="32" rx="4" fill={fills[n.type]} stroke={strokes[n.type]} strokeWidth="1.2"/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="10" fill={txc[n.type]} fontWeight="600">{n.label}</text></g>;
      })}
      {cfg.arrows.map((a,i)=><g key={i}><line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#999" strokeWidth="1.2" markerEnd="url(#ra2)"/><text x={(a.x1+a.x2)/2} y={(a.y1+a.y2)/2-6} textAnchor="middle" fontSize="8" fill="#666">{a.label}</text></g>)}
      <defs><marker id="ra2" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#999"/></marker></defs>
    </svg>
  );
}

export default function TabRoutes() {
  const [sel,setSel] = useState<RBU>("WES");
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-slate-900">Logistics Route Schematics by RBU</h2>
      <p className="text-[13px] text-slate-500 -mt-3">Select an RBU to view the complete logistics route with status codes and financial ownership points</p>

      <div className="flex flex-wrap gap-1">
        {rbuList.map(r=>(
          <button key={r.id} onClick={()=>setSel(r.id)} className={cn("rounded-md border px-4 py-2 text-[13px] font-medium",sel===r.id?"border-[#C3002F] bg-[#C3002F] text-white":"border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}>{r.label}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className={P}>
          <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[14px] text-slate-800">Route Flow — {sel}</CardTitle></CardHeader>
          <CardContent className="p-5"><RouteFlow rbu={sel}/></CardContent>
        </Card>
        <Card className={P}>
          <CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[14px] text-slate-800">Reconciliation Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-4">
            {(notes[sel]||[]).map((n,i)=>(
              <div key={i} className={cn("rounded border px-3 py-2 text-[11px]",n.startsWith("⚠️")?"border-amber-200 bg-amber-50 text-amber-800":"border-slate-200 bg-slate-50 text-slate-700")}>{n}</div>
            ))}
          </CardContent>
        </Card>
      </div>

      <h3 className="text-[16px] font-bold text-slate-800">European Compound Network — Storage Locations & Financial Checkpoints</h3>
      <Card className={P}>
        <CardContent className="overflow-x-auto p-4">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="px-2 py-2 text-left">Compound</th><th className="px-2 py-2 text-left">Location</th><th className="px-2 py-2 text-left">Serves RBU</th><th className="px-2 py-2 text-left">Finance Check</th><th className="px-2 py-2 text-right">Stock</th><th className="px-2 py-2 text-right">Avg Dwell</th></tr>
            </thead>
            <tbody>
              {compounds.map(c=>(
                <tr key={c.c} className={cn("border-b border-slate-100 even:bg-slate-50",c.fin.includes("⚠️")?"bg-amber-50":"")}>
                  <td className="px-2 py-1.5 font-semibold">{c.c}</td><td className="px-2 py-1.5">{c.loc}</td>
                  <td className="px-2 py-1.5">{c.rbu}</td><td className="px-2 py-1.5">{c.fin}</td>
                  <td className="px-2 py-1.5 text-right">{c.stk.toLocaleString()}</td><td className="px-2 py-1.5 text-right">{c.dwell}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

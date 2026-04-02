import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../utils/cn";
const P = "rounded-md border border-slate-200 bg-white shadow-sm";

const statusCodes = [
  {code:18,name:"Factory Build Complete",desc:"Vehicle completed at factory",loc:"Factory yard",owner:"Factory",impact:"Not NISA stock",zone:false},
  {code:19,name:"Factory Invoice",desc:"Factory invoices NISA",loc:"Factory/port",owner:"Transitioning",impact:"⚠️ Timing gap",zone:false},
  {code:20,name:"Scope Status Only",desc:"Vehicle in system, not purchased",loc:"Transit point",owner:"Not NISA",impact:"Tracking only",zone:false},
  {code:25,name:"NISA Purchase Point",desc:"NISA takes financial ownership",loc:"Export port",owner:"NISA",impact:"✅ On NISA books",zone:true,critical:true},
  {code:30,name:"Transit Hub Arrival",desc:"Vehicle at transit hub",loc:"Transit hub",owner:"NISA",impact:"May trigger SMR",zone:true},
  {code:40,name:"Compound Gate-In",desc:"Arrives at regional compound",loc:"Compound",owner:"NISA",impact:"Physical scan match",zone:true},
  {code:65,name:"Compound Processing",desc:"PDI, accessory fitment, QC",loc:"Compound",owner:"NISA",impact:"Processing zone",zone:true},
  {code:70,name:"TI-Job (Finance Check)",desc:"Financial validation point",loc:"Compound",owner:"NISA",impact:"🔍 Key recon trigger",zone:true},
  {code:80,name:"Local Storage",desc:"Market-specific storage",loc:"Local compound",owner:"NISA",impact:"Some ownership transfer",zone:true},
  {code:85,name:"NISA Sales Point",desc:"NISA sells to dealer/RBU",loc:"Local compound",owner:"→ Dealer",impact:"✅ Leaves NISA books",zone:true,critical:true},
  {code:90,name:"Dealer Stock",desc:"Vehicle at dealer",loc:"Dealer premises",owner:"Dealer",impact:"Not NISA stock",zone:false},
];

export default function TabOwnership() {
  return (
    <div className="space-y-5">
      {/* Section A: NISA Ownership Flow */}
      <h2 className="text-[18px] font-bold text-slate-900">Vehicle Financial Ownership Flow — NISA Trading Model</h2>
      <p className="text-[13px] text-slate-500 -mt-3">NISA (Nissan International SA) is the European trading entity that purchases from factories and sells to dealers through RBUs</p>

      <Card className={P}>
        <CardContent className="p-5">
          <svg viewBox="0 0 900 340" className="w-full" style={{minHeight:280}}>
            {/* Factory nodes */}
            <rect x="20" y="40" width="160" height="200" rx="6" fill="#424242" stroke="#333" strokeWidth="1.5"/>
            <text x="100" y="65" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">FACTORIES</text>
            {["NML (Japan)","NMUK (UK)","NMISA (Spain)","NMIPL (India)","NSA (S.Africa)","NMEX (Mexico)","BAT (France)"].map((f,i)=>(
              <text key={f} x="100" y={88+i*22} textAnchor="middle" fontSize="10" fill="#e0e0e0">{f}</text>
            ))}

            {/* Arrow Factory→Port */}
            <line x1="180" y1="140" x2="260" y2="140" stroke="#666" strokeWidth="2" markerEnd="url(#arw)"/>
            <text x="220" y="130" textAnchor="middle" fontSize="9" fill="#666">SCOPE 18-19</text>
            <text x="220" y="158" textAnchor="middle" fontSize="8" fill="#999">Factory Invoice to NISA</text>

            {/* Port/Export */}
            <rect x="260" y="90" width="130" height="100" rx="6" fill="#BBDEFB" stroke="#64B5F6" strokeWidth="1.5"/>
            <text x="325" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1565C0">PORT / EXPORT</text>
            {["JPO, POT, BCN","SNT, DUR, CHEN","VER, MUND"].map((p,i)=>(
              <text key={p} x="325" y={135+i*16} textAnchor="middle" fontSize="9" fill="#1565C0">{p}</text>
            ))}

            {/* Arrow Port→NISA zone */}
            <line x1="390" y1="140" x2="440" y2="140" stroke="#666" strokeWidth="2" markerEnd="url(#arw)"/>
            <text x="415" y="130" textAnchor="middle" fontSize="9" fill="#1565C0" fontWeight="bold">25</text>
            <text x="415" y="158" textAnchor="middle" fontSize="8" fill="#999">Purchase Point</text>

            {/* NISA OWNERSHIP ZONE */}
            <rect x="440" y="20" width="260" height="260" rx="8" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" strokeDasharray="8 4"/>
            <text x="570" y="45" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2E7D32">NISA OWNERSHIP ZONE</text>
            <text x="570" y="60" textAnchor="middle" fontSize="8" fill="#388E3C">NISA Balance Sheet — All vehicles here are NISA-owned</text>

            {["In Transit (40)","At Compound (65)","TI-Job/Fin (70)","Local Storage (80)"].map((s,i)=>(
              <g key={s}>
                <rect x="470" y={75+i*48} width="200" height="36" rx="4" fill="white" stroke="#A5D6A7" strokeWidth="1"/>
                <text x="570" y={98+i*48} textAnchor="middle" fontSize="11" fill="#1B5E20">{s}</text>
              </g>
            ))}

            {/* Arrow NISA→Dealer */}
            <line x1="700" y1="140" x2="760" y2="140" stroke="#666" strokeWidth="2" markerEnd="url(#arw)"/>
            <text x="730" y="130" textAnchor="middle" fontSize="9" fill="#E65100" fontWeight="bold">85</text>
            <text x="730" y="158" textAnchor="middle" fontSize="8" fill="#999">NISA Sales Point</text>

            {/* Dealer */}
            <rect x="760" y="90" width="120" height="100" rx="6" fill="white" stroke="#BDBDBD" strokeWidth="1.5"/>
            <text x="820" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#424242">DEALER OWNS</text>
            <text x="820" y="135" textAnchor="middle" fontSize="10" fill="#757575">(Status 90)</text>
            <text x="820" y="160" textAnchor="middle" fontSize="9" fill="#999">DLR FRA, DLR GBR</text>
            <text x="820" y="175" textAnchor="middle" fontSize="9" fill="#999">DLR ITA, DLR GER…</text>

            {/* Arrow marker */}
            <defs><marker id="arw" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#666"/></marker></defs>
          </svg>
        </CardContent>
      </Card>

      {/* Insight card */}
      <div className="rounded-md border-l-4 border-[#C62828] bg-red-50 px-5 py-4">
        <p className="text-[13px] font-semibold text-red-800">RECONCILIATION CHALLENGE</p>
        <p className="text-[12px] text-red-700 mt-1">The 'NISA Ownership Zone' spans from Status 25 (purchase from factory) to Status 85 (sale to dealer). Any vehicle between these two status codes should appear on BOTH the physical pipeline AND the financial ledger. Discrepancies occur when physical and financial systems disagree about which vehicles are in this zone.</p>
      </div>

      {/* Section B: Status Code Pipeline */}
      <h3 className="text-[16px] font-bold text-slate-800">SCOPE Pipeline Status Codes — Complete Lifecycle</h3>

      {/* Pipeline visual */}
      <div className="flex flex-wrap items-center gap-1 px-2">
        {statusCodes.map((s,i)=>(
          <div key={s.code} className="flex items-center gap-1">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold border-2",
              s.critical?"border-[#C62828] bg-[#C62828] text-white":s.zone?"border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]":"border-slate-300 bg-slate-100 text-slate-600"
            )}>{s.code}</div>
            {i<statusCodes.length-1 && <span className="text-slate-400">→</span>}
          </div>
        ))}
      </div>

      <Card className={P}>
        <CardContent className="overflow-x-auto p-4">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="px-2 py-2 text-left">Code</th><th className="px-2 py-2 text-left">Name</th><th className="px-2 py-2 text-left">Description</th><th className="px-2 py-2 text-left">Location</th><th className="px-2 py-2 text-left">Owner</th><th className="px-2 py-2 text-left">Recon Impact</th></tr>
            </thead>
            <tbody>
              {statusCodes.map(s=>(
                <tr key={s.code} className={cn("border-b border-slate-100",s.zone?"bg-green-50":"",s.critical?"font-semibold":"")}>
                  <td className={cn("px-2 py-1.5",s.critical?"text-[#C62828] font-bold":"")}>{s.code}</td>
                  <td className="px-2 py-1.5">{s.name}</td><td className="px-2 py-1.5">{s.desc}</td>
                  <td className="px-2 py-1.5">{s.loc}</td><td className="px-2 py-1.5">{s.owner}</td>
                  <td className="px-2 py-1.5">{s.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-5 py-3">
        <p className="text-[12px] text-amber-800"><span className="font-semibold">⚠️ RECONCILIATION RULE:</span> Any vehicle with SCOPE status between 25 and 84 (inclusive) should appear as NISA-owned inventory on both the physical pipeline system AND the financial ledger. If it appears on one but not the other, it is a discrepancy requiring investigation.</p>
      </div>

      {/* Section C: Timeline */}
      <h3 className="text-[16px] font-bold text-slate-800">Invoice Timing — Factory Purchase vs Dealer Sale</h3>
      <Card className={P}>
        <CardContent className="p-5 overflow-x-auto">
          <svg viewBox="0 0 840 200" className="w-full" style={{minHeight:180}}>
            {/* Timeline line */}
            <line x1="40" y1="100" x2="800" y2="100" stroke="#BDBDBD" strokeWidth="2"/>

            {/* Events */}
            {[
              {x:60,d:0,label:"Factory Build",status:"18",c:"#757575"},
              {x:150,d:3,label:"Factory Invoice",status:"19",c:"#757575"},
              {x:240,d:5,label:"NISA Purchase",status:"25",c:"#2E7D32"},
              {x:400,d:40,label:"Compound Gate-In",status:"40",c:"#2E7D32"},
              {x:490,d:42,label:"TI-Job (Fin)",status:"70",c:"#7B1FA2"},
              {x:570,d:45,label:"Local Storage",status:"80",c:"#2E7D32"},
              {x:670,d:48,label:"NISA Sale",status:"85",c:"#E65100"},
              {x:760,d:52,label:"Dealer Receives",status:"90",c:"#757575"},
            ].map(e=>(
              <g key={e.status}>
                <circle cx={e.x} cy="100" r="6" fill={e.c}/>
                <text x={e.x} y="80" textAnchor="middle" fontSize="9" fontWeight="bold" fill={e.c}>{e.label}</text>
                <text x={e.x} y="70" textAnchor="middle" fontSize="8" fill="#999">Day {e.d}</text>
                <text x={e.x} y="120" textAnchor="middle" fontSize="10" fontWeight="bold" fill={e.c}>{e.status}</text>
              </g>
            ))}

            {/* NISA ownership band */}
            <rect x="240" y="130" width="430" height="20" rx="3" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1"/>
            <text x="455" y="144" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2E7D32">NISA OWNERSHIP WINDOW</text>

            {/* GAP indicators */}
            <rect x="150" y="160" width="90" height="25" rx="3" fill="#FFF3E0" stroke="#FF8F00" strokeWidth="1"/>
            <text x="195" y="176" textAnchor="middle" fontSize="8" fill="#E65100">⚠️ GAP 1 (19→25)</text>

            <rect x="570" y="160" width="100" height="25" rx="3" fill="#FFF3E0" stroke="#FF8F00" strokeWidth="1"/>
            <text x="620" y="176" textAnchor="middle" fontSize="8" fill="#E65100">⚠️ GAP 2 (80→85)</text>
          </svg>
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-[12px] font-semibold text-amber-800">GAP 1 (Status 19→25)</p>
              <p className="text-[11px] text-amber-700 mt-1">Factory has invoiced, but NISA purchase not yet processed on books. Vehicle appears in physical pipeline but not on financial ledger.</p>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-[12px] font-semibold text-amber-800">GAP 2 (Status 80→85)</p>
              <p className="text-[11px] text-amber-700 mt-1">Vehicle physically at local compound, but dealer sale invoice not yet generated. Vehicle should still be on NISA books, but may be missing if prematurely removed.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

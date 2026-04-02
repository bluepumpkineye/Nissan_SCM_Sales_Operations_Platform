import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, ReferenceArea } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../utils/cn";
const P = "rounded-md border border-slate-200 bg-white shadow-sm";

const trendData = [
  {m:"May-24",v:14800},{m:"Jun-24",v:14200},{m:"Jul-24",v:13900},{m:"Aug-24",v:13500},{m:"Sep-24",v:13100},
  {m:"Oct-24",v:12600},{m:"Nov-24",v:11800},{m:"Dec-24",v:11200},{m:"Jan-25",v:10500},{m:"Feb-25",v:10100},
  {m:"Mar-25",v:9600},{m:"Apr-25",v:8800},{m:"May-25",v:8200},{m:"Jun-25",v:7800},{m:"Jul-25",v:7400},
  {m:"Aug-25",v:6800},{m:"Sep-25",v:6200},{m:"Oct-25",v:5600},{m:"Nov-25",v:5100},{m:"Dec-25",v:4500},
  {m:"Jan-26",v:3900},{m:"Feb-26",v:3400},{m:"Mar-26",v:3000},{m:"Apr-26",v:2600},{m:"May-26",v:2147},
];

const waterfallData = [
  {name:"Status Code Timing",val:680,color:"#C62828"},
  {name:"In-Transit Lag",val:425,color:"#C62828"},
  {name:"Independent Mkt",val:340,color:"#FF8F00"},
  {name:"Italy NITA Offset",val:285,color:"#FF8F00"},
  {name:"Russia SMR/FPA",val:220,color:"#FF8F00"},
  {name:"Compound Intake",val:145,color:"#C62828"},
  {name:"Fin > Physical",val:-82,color:"#1565C0"},
  {name:"EGB/NMGB Transfer",val:78,color:"#FF8F00"},
  {name:"Misc/Investigation",val:56,color:"#9E9E9E"},
];

const rbuRows = [
  {rbu:"WEST",phys:11500,fin:11180,disc:320,pct:2.8,val:5.8,cause:"Transit lag LEH/AMS",s:"🟡"},
  {rbu:"UK (EGB)",phys:9500,fin:9350,disc:150,pct:1.6,val:2.7,cause:"NMGB transfer timing",s:"🟢"},
  {rbu:"NORDICS (NNE)",phys:5200,fin:5020,disc:180,pct:3.5,val:3.2,cause:"Multi-compound GOT/HAN",s:"🟡"},
  {rbu:"ITA",phys:6800,fin:6420,disc:380,pct:5.6,val:6.8,cause:"NITA local system offset",s:"🔴"},
  {rbu:"CEE",phys:3500,fin:3340,disc:160,pct:4.6,val:2.9,cause:"AMS→regional delay",s:"🟡"},
  {rbu:"RUSSIA",phys:7200,fin:6780,disc:420,pct:5.8,val:7.6,cause:"SMR/FPA manual processing",s:"🔴"},
  {rbu:"IBERIA (IBE)",phys:3100,fin:2960,disc:140,pct:4.5,val:2.5,cause:"Multi-compound routing",s:"🟡"},
  {rbu:"CENTER",phys:1400,fin:1280,disc:120,pct:8.6,val:2.2,cause:"CAT BAT→SCH/ALT transit",s:"🔴"},
  {rbu:"Independent",phys:1047,fin:770,disc:277,pct:26.5,val:5.0,cause:"Factory gate-out invoicing",s:"🔴"},
];

const processSteps = [
  {step:"Extract Physical Stock",desc:"Pull SCOPE pipeline data by status code and location",badge:"SCM",bc:"#2563EB"},
  {step:"Extract Financial Stock",desc:"Pull NISA ledger data: purchase invoices received, sales invoices issued",badge:"SCM",bc:"#2563EB"},
  {step:"VIN-Level Matching",desc:"Match individual VINs across physical and financial datasets",badge:"Joint SCM+Finance",bc:"#7C3AED"},
  {step:"Gap Identification",desc:"Unmatched VINs categorized by route, status code, and market",badge:"SCM Analysis",bc:"#D97706"},
  {step:"Root Cause Analysis",desc:"Cross-reference with route schematics, status code definitions",badge:"SCM Analysis",bc:"#D97706"},
  {step:"Resolution & Adjustment",desc:"Process corrections: status updates, invoice timing, reclassifications",badge:"Finance Action",bc:"#16A34A"},
];

export default function TabOverview() {
  const [animVal, setAnimVal] = useState(15000);
  useEffect(() => {
    let c = 15000;
    const t = setInterval(() => { c -= 280; if (c <= 2147) { setAnimVal(2147); clearInterval(t); } else setAnimVal(c); }, 25);
    return () => clearInterval(t);
  }, []);

  // Build waterfall chart data
  let running = 0;
  const wfBars = waterfallData.map(d => {
    const start = running;
    running += d.val;
    return { ...d, start, end: running };
  });

  return (
    <div className="space-y-5">
      {/* Section A: Before/After KPIs */}
      <h2 className="text-[18px] font-bold text-slate-900">Stock Reconciliation — Progress Dashboard</h2>
      <Card className={P}>
        <CardContent className="grid items-center gap-6 p-6 lg:grid-cols-[1fr,auto,1fr]">
          <div className="text-center">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Historical Gap (Pre-Project)</p>
            <p className="text-[40px] font-bold text-[#C62828]">{animVal.toLocaleString()}</p>
            <p className="text-[13px] text-slate-600">Unit discrepancy between physical and financial stock</p>
            <p className="text-[11px] text-slate-500 mt-1">As of January 2024 — start of reconciliation project</p>
            <p className="text-[16px] font-semibold text-[#C62828] mt-2">~€285M in unreconciled stock</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[28px] font-bold text-emerald-600">87%</div>
            <div className="text-[13px] font-semibold text-emerald-600">Reduction</div>
            <svg width="80" height="24"><polygon points="0,0 80,12 0,24" fill="#16A34A" opacity="0.7"/></svg>
            <p className="text-[10px] text-slate-500 text-center max-w-[180px]">Through systematic route analysis and cross-functional SCM-Finance coordination</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Current Gap</p>
            <p className="text-[40px] font-bold text-[#FF8F00]">2,147</p>
            <p className="text-[13px] text-slate-600">Unit discrepancy — current period</p>
            <p className="text-[11px] text-slate-500 mt-1">As of 02-Apr-2026</p>
            <p className="text-[16px] font-semibold text-[#FF8F00] mt-2">~€38.6M under investigation</p>
            <p className="text-[12px] text-emerald-600 mt-1">Target: &lt;1,500 units by FY-end (Mar 2027)</p>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card className={P}>
        <CardHeader className="border-b border-slate-200 px-5 py-3">
          <CardTitle className="text-[16px] text-slate-800">Reconciliation Gap Trend (24 Months)</CardTitle>
        </CardHeader>
        <CardContent className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{left:10,right:20,top:10,bottom:5}}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3"/>
              <XAxis dataKey="m" tick={{fontSize:10}} interval={2}/>
              <YAxis tick={{fontSize:11}} domain={[0,16000]}/>
              <Tooltip/>
              <ReferenceArea y1={0} y2={1500} fill="#E8F5E9" fillOpacity={0.6}/>
              <ReferenceLine y={1500} stroke="#4CAF50" strokeDasharray="4 4" label={{value:"Target <1,500",position:"right",fontSize:10,fill:"#2E7D32"}}/>
              <Line dataKey="v" stroke="#C3002F" strokeWidth={2.5} dot={{r:3,fill:"#C3002F"}} name="Discrepancy Units"/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section B: Waterfall */}
      <h3 className="text-[16px] font-bold text-slate-800">Current Discrepancy Breakdown by Root Cause</h3>
      <Card className={P}>
        <CardContent className="h-80 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wfBars} margin={{left:20,right:20,top:10,bottom:40}}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3"/>
              <XAxis dataKey="name" tick={{fontSize:9}} angle={-25} textAnchor="end" interval={0} height={60}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip formatter={(v:number)=>`${v} units`}/>
              <Bar dataKey="start" stackId="a" fill="transparent"/>
              <Bar dataKey="val" stackId="a">{wfBars.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section C: RBU Table */}
      <h3 className="text-[16px] font-bold text-slate-800">Reconciliation Status by RBU/Market</h3>
      <Card className={P}>
        <CardContent className="overflow-x-auto p-4">
          <table className="w-full text-[12px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">RBU</th><th className="px-3 py-2 text-right">Physical</th>
                <th className="px-3 py-2 text-right">Financial</th><th className="px-3 py-2 text-right">Discrepancy</th>
                <th className="px-3 py-2 text-right">% Gap</th><th className="px-3 py-2 text-right">Val (€M)</th>
                <th className="px-3 py-2 text-left">Primary Cause</th><th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rbuRows.map((r) => {
                const isIndep = r.rbu==="Independent";
                return (
                  <tr key={r.rbu} className={cn("border-b border-slate-100",isIndep?"bg-red-50":"even:bg-slate-50")}>
                    <td className={cn("px-3 py-2 font-medium",isIndep&&"text-red-700")}>{r.rbu}</td>
                    <td className="px-3 py-2 text-right">{r.phys.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{r.fin.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold">{r.disc.toLocaleString()}</td>
                    <td className={cn("px-3 py-2 text-right font-semibold",r.pct>5?"text-red-600":r.pct>3?"text-amber-600":"text-emerald-600")}>{r.pct.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right">{r.val.toFixed(1)}</td>
                    <td className="px-3 py-2">{r.cause}</td>
                    <td className="px-3 py-2 text-center">{r.s}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-200 font-bold">
                <td className="px-3 py-2">TOTAL</td><td className="px-3 py-2 text-right">48,247</td>
                <td className="px-3 py-2 text-right">46,100</td><td className="px-3 py-2 text-right">2,147</td>
                <td className="px-3 py-2 text-right">4.4%</td><td className="px-3 py-2 text-right">38.6</td>
                <td className="px-3 py-2" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-500">Color coding: 🟢 &lt;3% | 🟡 3-5% | 🔴 &gt;5% gap</p>
        </CardContent>
      </Card>

      {/* Section D: Process Flow */}
      <h3 className="text-[16px] font-bold text-slate-800">Monthly Reconciliation Process</h3>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {processSteps.map((s,i)=>(
          <Card key={i} className={cn(P,"relative overflow-hidden")}>
            <div className="absolute left-0 top-0 h-full w-1" style={{background:s.bc}}/>
            <CardContent className="p-4 pl-5">
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white mb-2" style={{background:s.bc}}>{s.badge}</span>
              <p className="text-[13px] font-semibold text-slate-800">Step {i+1}</p>
              <p className="text-[12px] font-medium text-slate-700 mt-1">{s.step}</p>
              <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

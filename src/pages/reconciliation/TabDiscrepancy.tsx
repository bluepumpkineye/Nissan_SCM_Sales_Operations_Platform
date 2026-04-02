import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../utils/cn";
const P = "rounded-md border border-slate-200 bg-white shadow-sm";

const discItems = [
  {id:1,rbu:"RUS",cat:"SMR/FPA Timing",desc:"185 VINs at NCL — SMR auto-sale triggered but not reflected in NMR",units:185,val:"3,330K",age:12,root:"SMR batch job failure",owner:"IT/Finance Moscow",sev:"🔴"},
  {id:2,rbu:"ITA",cat:"NITA Local System",desc:"142 VINs at LIV — NITA ownership change not synced to NISA",units:142,val:"2,556K",age:8,root:"NITA→NISA weekly interface",owner:"Finance Milan",sev:"🔴"},
  {id:3,rbu:"ITA",cat:"NITA Local System",desc:"95 VINs at CIV — same NITA sync issue",units:95,val:"1,710K",age:8,root:"Same as #2",owner:"Finance Milan",sev:"🟡"},
  {id:4,rbu:"WEST",cat:"Transit Lag",desc:"180 VINs POT→LEH — status 30 but not received at LEH",units:180,val:"3,240K",age:5,root:"Vessel delayed — weather",owner:"SCM Paris",sev:"🟡"},
  {id:5,rbu:"RUS",cat:"FPA Manual",desc:"95 VINs at AMS — Japan-sourced requiring manual FPA",units:95,val:"1,710K",age:18,root:"FPA backlog",owner:"SCM/Finance",sev:"🔴"},
  {id:6,rbu:"NNE",cat:"Multi-Compound",desc:"82 VINs at GOT but NNE shows individual compounds",units:82,val:"1,476K",age:4,root:"Dispatch not updated",owner:"SCM Nordic",sev:"🟡"},
  {id:7,rbu:"CEE",cat:"Compound Intake",desc:"72 VINs at AMS — gate-in but no purchase invoice",units:72,val:"1,296K",age:6,root:"NML invoice batch delayed",owner:"Finance",sev:"🟡"},
  {id:8,rbu:"IBE",cat:"Multi-Route",desc:"68 VINs — wrong compound in SCOPE",units:68,val:"1,224K",age:9,root:"Multi-compound complexity",owner:"SCM Iberia",sev:"🟡"},
  {id:9,rbu:"Indep.",cat:"Gate-Out Invoice",desc:"340 VINs — short NISA ownership window",units:340,val:"6,120K",age:0,root:"Same-day purchase/sale timing",owner:"Finance",sev:"🔴"},
  {id:10,rbu:"CEN",cat:"Transit Timing",desc:"62 VINs CAT BAT→SCH/ALT",units:62,val:"1,116K",age:3,root:"Standard transit delay",owner:"SCM CEN",sev:"🟢"},
  {id:11,rbu:"WEST",cat:"BCN No-Fin-Check",desc:"58 VINs — BCN bypass financial validation",units:58,val:"1,044K",age:11,root:"No Fin check at BCN",owner:"SCM/Finance",sev:"🟡"},
  {id:12,rbu:"EGB",cat:"NMGB Transfer",desc:"78 VINs — NISA→NMGB transfer timing",units:78,val:"1,404K",age:4,root:"EGB unique structure",owner:"Finance UK",sev:"🟢"},
];

const donutData = [
  {name:"Status Code Timing",value:680,color:"#B71C1C"},{name:"In-Transit Lag",value:425,color:"#C62828"},
  {name:"Independent Markets",value:340,color:"#FF8F00"},{name:"NITA Offset",value:285,color:"#EF6C00"},
  {name:"Russia SMR/FPA",value:220,color:"#F9A825"},{name:"Compound Intake",value:145,color:"#FFD54F"},
  {name:"Other",value:52,color:"#9E9E9E"},
];

const rbuBars = [
  {rbu:"Russia",val:420,c:"#C62828"},{rbu:"Italy",val:380,c:"#C62828"},{rbu:"Independent",val:340,c:"#FF8F00"},
  {rbu:"WEST",val:320,c:"#FF8F00"},{rbu:"NNE",val:180,c:"#FF8F00"},{rbu:"CEE",val:160,c:"#FF8F00"},
  {rbu:"EGB",val:150,c:"#4CAF50"},{rbu:"IBE",val:140,c:"#FF8F00"},{rbu:"CEN",val:57,c:"#4CAF50"},
];

const actions = [
  {title:"NITA Interface Upgrade",target:"ITA — 380 units",current:"Weekly batch sync",goal:"Daily automated sync",owner:"IT Milan + NE Finance",timeline:"May-2026",impact:"~285 of 380 units",pct:70},
  {title:"Russia SMR Automation",target:"RUS — 420 units",current:"Mix of SMR/FPA",goal:"Full SMR automation",owner:"IT Moscow + NE SCM",timeline:"Jul-2026",impact:"~350 of 420 units",pct:45},
  {title:"Barcelona Fin-Check",target:"WES/IBE — 126 units",current:"BCN bypasses financial validation",goal:"Add fin checkpoint at BCN",owner:"SCM Spain + NE Finance",timeline:"Jun-2026",impact:"All 126 units",pct:55},
  {title:"Independent Market Rules",target:"340 units",current:"Simultaneous purchase+sale",goal:"Same-day invoicing rules",owner:"NE Finance + Legal",timeline:"Ongoing",impact:"Reduce to ~100 units",pct:30},
];

export default function TabDiscrepancy() {
  const [rbuFilter,setRbuFilter] = useState("All");
  const [causeFilter,setCauseFilter] = useState("All");

  const filtered = discItems.filter(d=>(rbuFilter==="All"||d.rbu===rbuFilter)&&(causeFilter==="All"||d.cat===causeFilter));

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-slate-900">Open Discrepancy Items — April 2026</h2>
      <p className="text-[13px] text-slate-500 -mt-3">2,147 unmatched units under investigation</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={rbuFilter} onChange={e=>setRbuFilter(e.target.value)} className="h-9 rounded border border-slate-300 bg-white px-3 text-[12px]">
          <option value="All">All RBUs</option>
          {[...new Set(discItems.map(d=>d.rbu))].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <select value={causeFilter} onChange={e=>setCauseFilter(e.target.value)} className="h-9 rounded border border-slate-300 bg-white px-3 text-[12px]">
          <option value="All">All Causes</option>
          {[...new Set(discItems.map(d=>d.cat))].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className={P}><CardContent className="overflow-x-auto p-4">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-100 text-slate-700">
            <tr><th className="px-2 py-2 text-left">#</th><th className="px-2 py-2 text-left">RBU</th><th className="px-2 py-2 text-left">Category</th><th className="px-2 py-2 text-left">Description</th><th className="px-2 py-2 text-right">Units</th><th className="px-2 py-2 text-right">Value (€)</th><th className="px-2 py-2 text-right">Age</th><th className="px-2 py-2 text-left">Assigned</th><th className="px-2 py-2 text-center">Sev</th></tr>
          </thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} className="border-b border-slate-100 even:bg-slate-50">
                <td className="px-2 py-1.5">{d.id}</td><td className="px-2 py-1.5 font-medium">{d.rbu}</td>
                <td className="px-2 py-1.5">{d.cat}</td><td className="px-2 py-1.5 max-w-[250px]">{d.desc}</td>
                <td className="px-2 py-1.5 text-right font-semibold">{d.units}</td><td className="px-2 py-1.5 text-right">{d.val}</td>
                <td className="px-2 py-1.5 text-right">{d.age}d</td><td className="px-2 py-1.5">{d.owner}</td>
                <td className="px-2 py-1.5 text-center">{d.sev}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-slate-500">Showing {filtered.length} categories | 2,147 total units | €38.6M estimated value</p>
      </CardContent></Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={P}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[14px] text-slate-800">Discrepancy by Root Cause</CardTitle></CardHeader>
          <CardContent className="h-72 p-5"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donutData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={100} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={{strokeWidth:1}}>{donutData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></CardContent>
        </Card>
        <Card className={P}><CardHeader className="border-b border-slate-200 px-5 py-3"><CardTitle className="text-[14px] text-slate-800">Discrepancy by RBU — Units</CardTitle></CardHeader>
          <CardContent className="h-72 p-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={rbuBars} layout="vertical" margin={{left:20}}><CartesianGrid stroke="#e5e7eb"/><XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="rbu" type="category" tick={{fontSize:11}} width={80}/><Tooltip/><Bar dataKey="val">{rbuBars.map((d,i)=><Cell key={i} fill={d.c}/>)}</Bar></BarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>

      {/* Resolution Actions */}
      <h3 className="text-[16px] font-bold text-slate-800">Active Resolution Workstreams</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map(a=>(
          <Card key={a.title} className={P}><CardContent className="p-5 space-y-2">
            <p className="text-[14px] font-bold text-slate-800">{a.title}</p>
            <p className="text-[11px] text-[#C3002F] font-semibold">{a.target}</p>
            <div className="text-[11px] text-slate-600 space-y-1">
              <p><span className="font-medium">Current:</span> {a.current}</p>
              <p><span className="font-medium">Target:</span> {a.goal}</p>
              <p><span className="font-medium">Owner:</span> {a.owner}</p>
              <p><span className="font-medium">Timeline:</span> {a.timeline}</p>
              <p><span className="font-medium">Impact:</span> {a.impact}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 flex-1 rounded-full bg-slate-200"><div className="h-2.5 rounded-full bg-[#C3002F]" style={{width:`${a.pct}%`}}/></div>
              <span className="text-[11px] font-semibold text-slate-700">{a.pct}%</span>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

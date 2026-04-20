"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight, ShieldCheck, AlertTriangle } from "lucide-react";

interface ComplianceData {
  month: string;
  state_code: string;
  correct_count: number;
  incorrect_count: number;
  compliance_index: number;
}

export function ComplianceTable({ data }: { data: ComplianceData[] }) {
  if (!data || data.length === 0) return null;

  // Aggregate for the chart (last 6 months trend)
  const chartData = data.reduce((acc: any[], curr) => {
    const month = new Date(curr.month).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(a => a.name === month);
    if (existing) {
      existing.compliance += curr.compliance_index;
      existing.count += 1;
    } else {
      acc.push({ name: month, compliance: curr.compliance_index, count: 1 });
    }
    return acc;
  }, []).map(a => ({ name: a.name, rate: Math.round((a.compliance / a.count) * 100) }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-none rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Legal Compliance</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {chartData[chartData.length - 1]?.rate || 0}%
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> National weighted average
          </p>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border-none shadow-xl rounded-3xl h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRate)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">State</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Correct</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Erroneous</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Index</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-t border-slate-50 dark:border-slate-800">
                  <td className="p-6">
                    <span className="font-black text-slate-900 dark:text-white">{row.state_code}</span>
                  </td>
                  <td className="p-6 text-sm font-bold text-emerald-500">{row.correct_count}</td>
                  <td className="p-6 text-sm font-bold text-rose-500">{row.incorrect_count}</td>
                  <td className="p-6 text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div 
                        className={`h-2 w-2 rounded-full ${row.compliance_index > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {Math.round(row.compliance_index * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

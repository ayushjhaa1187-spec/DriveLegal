"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface ViolationData {
  violation_id: string;
  scans_count: number;
  total_overcharge_inr: number;
}

export function PortalCharts({ data }: { data: ViolationData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 border-dashed border-2 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        Insufficient data for visualization
      </Card>
    );
  }

  const chartData = data.slice(0, 5).map(v => ({
    name: v.violation_id.split('::').pop()?.replace(/-/g, ' ') || v.violation_id,
    count: v.scans_count,
    amount: v.total_overcharge_inr
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">
          Top Overcharged Violations (Frequency)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-6">
          Impact by Amount (Total Overcharge INR)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#fb7185" radius={[0, 8, 8, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

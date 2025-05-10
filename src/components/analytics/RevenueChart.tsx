
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { formatCurrency } from "@/lib/data";

interface RevenueData {
  name: string;
  value: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          barSize={45}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            dy={10}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            padding={{ top: 10 }}
          />
          <Tooltip 
            formatter={(value) => [`${formatCurrency(value as number)}`, 'الإيراد']}
            labelStyle={{ fontFamily: 'Cairo, sans-serif', textAlign: 'center', fontWeight: 'bold', padding: '4px 0' }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)', 
              borderRadius: '12px', 
              border: '1px solid #eee',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              padding: '12px'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="url(#barGradient)" 
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

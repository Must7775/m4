
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/data";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { Customer } from "@/types";

interface PaymentData {
  name: string;
  value: number;
}

interface PaymentStatusChartProps {
  data?: PaymentData[];
  customers?: Customer[];
}

export function PaymentStatusChart({ data, customers }: PaymentStatusChartProps) {
  // Generate payment status data from customers if provided
  const chartData = useMemo(() => {
    if (data) return data;
    
    if (customers && customers.length > 0) {
      let totalPaid = 0;
      let totalRemaining = 0;
      
      customers.forEach(customer => {
        totalPaid += customer.totalPaid || 0;
        totalRemaining += customer.balance || 0;
      });
      
      return [
        { name: "المدفوع", value: totalPaid },
        { name: "المتبقي", value: totalRemaining }
      ];
    }
    
    return [{ name: "لا توجد بيانات", value: 0 }];
  }, [data, customers]);
  
  // ألوان متناسقة للرسم البياني
  const COLORS = ['#10B981', '#F97066'];
  
  const totalValue = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  
  // حساب النسب المئوية
  const dataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: totalValue > 0 ? Math.round(((item.value || 0) / totalValue) * 100) : 0
  }));
  
  // تخصيص معروض القيم في الرسم البياني
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <defs>
            <filter id="shadow" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={85}
            innerRadius={45}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1500}
            animationBegin={200}
            filter="url(#shadow)"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(value as number)} 
            contentStyle={{
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: '1px solid #eee',
              padding: '10px 16px'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center gap-10 mt-5">
        {dataWithPercentage.map((entry, index) => (
          <div key={index} className="flex flex-col items-center bg-white px-5 py-2.5 rounded-lg shadow-sm">
            <div className="flex items-center mb-1.5">
              <div 
                className="w-5 h-5 rounded-md mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-700 font-medium">{entry.name}</span>
            </div>
            <div className="text-base font-medium">
              {formatCurrency(entry.value || 0)} <span className="text-gray-500">({entry.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

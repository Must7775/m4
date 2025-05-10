
import { CreditCard, ArrowUpCircle, ArrowDownCircle, DollarSign, PercentSquare, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { Customer } from "@/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FinancialSummaryProps {
  totalDue?: number;
  totalPaid?: number;
  totalBalance?: number;
  customers?: Customer[];
}

export function FinancialSummary({ totalDue, totalPaid, totalBalance, customers }: FinancialSummaryProps) {
  // Calculate summary values from customers if direct values aren't provided
  const financialData = useMemo(() => {
    if (totalDue !== undefined && totalPaid !== undefined && totalBalance !== undefined) {
      return { totalDue, totalPaid, totalBalance };
    }
    
    if (customers && customers.length > 0) {
      const due = customers.reduce((sum, customer) => sum + (customer.totalDue || 0), 0);
      const paid = customers.reduce((sum, customer) => sum + (customer.totalPaid || 0), 0);
      const balance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);
      
      return { totalDue: due, totalPaid: paid, totalBalance: balance };
    }
    
    return { totalDue: 0, totalPaid: 0, totalBalance: 0 };
  }, [totalDue, totalPaid, totalBalance, customers]);
  
  // حساب نسبة التسديد
  const paymentPercentage = financialData.totalDue > 0 
    ? Math.round((financialData.totalPaid / financialData.totalDue) * 100) 
    : 0;
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white space-y-3">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">التحليل المالي</h2>
        </div>
        <p className="text-blue-100 text-sm">ملخص الحالة المالية والمدفوعات</p>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* إجمالي المبلغ المستحق */}
          <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-base font-medium text-gray-600">إجمالي المبلغ المستحق</p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2" dir="ltr">
                  {formatCurrency(financialData.totalDue)}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">إجمالي قيمة المبيعات المستحقة</p>
          </div>
          
          {/* إجمالي المبلغ المدفوع */}
          <div className="bg-white p-6 rounded-xl border-2 border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-base font-medium text-gray-600">إجمالي المبلغ المدفوع</p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2" dir="ltr">
                  {formatCurrency(financialData.totalPaid)}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <ArrowUpCircle className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">إجمالي المبالغ المستلمة من العملاء</p>
          </div>
          
          {/* إجمالي المبلغ المتبقي */}
          <div className="bg-white p-6 rounded-xl border-2 border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-base font-medium text-gray-600">إجمالي المبلغ المتبقي</p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-2" dir="ltr">
                  {formatCurrency(financialData.totalBalance)}
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <ArrowDownCircle className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">المبالغ المتبقية للتحصيل</p>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* قسم نسبة التسديد */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                <PercentSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">نسبة التسديد الإجمالية</h3>
            </div>
            <span className="text-2xl font-bold text-blue-700">{paymentPercentage}%</span>
          </div>
          
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${paymentPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm font-medium">
            <span className="text-gray-500">0%</span>
            <div className="bg-white px-4 py-1.5 rounded-full border border-blue-200 text-blue-700 shadow-sm">
              {paymentPercentage}% مكتملة
            </div>
            <span className="text-gray-500">100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

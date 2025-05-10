
import { Activity, AlertCircle, Percent, Users, Clock, UserX } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { Customer } from "@/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { calculateDaysUntilNextPayment } from "@/lib/utils";

interface PaymentsStatusAnalyticsProps {
  customers: Customer[];
}

export function PaymentsStatusAnalytics({ customers }: PaymentsStatusAnalyticsProps) {
  // تحليل البيانات وحساب نسبة التسديد وعدد العملاء المتأخرين
  const analysisData = useMemo(() => {
    // إجمالي المبالغ
    let totalDue = 0;
    let totalPaid = 0;
    
    // عدد العملاء المتأخرين
    let customersWithOverdue = 0;
    
    // مسح بيانات العملاء
    customers.forEach(customer => {
      let hasOverdue = false;
      
      totalDue += customer.totalDue;
      totalPaid += customer.totalPaid;
      
      // التحقق من وجود أجهزة متأخرة في السداد
      customer.devices.forEach(device => {
        // تخطي الأجهزة التي تم سدادها بالكامل
        if (device.balance <= 0) {
          return;
        }
        
        // التحقق من وجود دفعات سابقة
        if (device.payments && device.payments.length > 0) {
          // حساب عدد الأيام المتبقية للدفعة القادمة
          const daysUntilNextPayment = calculateDaysUntilNextPayment(device);
          
          // إذا كانت الأيام المتبقية سالبة، فهذا يعني أن الدفعة متأخرة
          if (daysUntilNextPayment !== null && daysUntilNextPayment < 0) {
            hasOverdue = true;
          }
        }
      });
      
      // إضافة العميل إلى عدد المتأخرين إذا كان لديه أي جهاز متأخر
      if (hasOverdue) {
        customersWithOverdue++;
      }
    });
    
    // حساب نسبة التسديد
    const paymentPercentage = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    
    return {
      paymentPercentage,
      customersWithOverdue,
      totalCustomers: customers.length
    };
  }, [customers]);
  
  return (
    <Card className="h-full">
      <CardHeader className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white space-y-3">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">حالة المدفوعات</h2>
        </div>
        <p className="text-amber-100 text-sm">تحليل موقف العملاء من الدفعات والمتأخرات</p>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* نسبة التسديد */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <Percent className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-800">نسبة التسديد</h4>
                <p className="text-sm text-blue-600 mt-1">الدفعات المسددة من إجمالي المستحق</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-medium text-lg">النسبة الإجمالية:</span>
                <span className="text-3xl font-bold text-blue-800">{analysisData.paymentPercentage}%</span>
              </div>
            </div>
            
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base text-blue-700 font-medium">نسبة اكتمال الدفعات</span>
                <span className="font-bold text-blue-900 text-lg">{analysisData.paymentPercentage}%</span>
              </div>
              
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-blue-100">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${analysisData.paymentPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* عدد العملاء المتأخرين */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                <UserX className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-800">العملاء المتأخرين</h4>
                <p className="text-sm text-red-600 mt-1">عدد العملاء المتأخرين عن السداد</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-red-100 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-red-700 font-medium text-lg">العدد الإجمالي:</span>
                <span className="text-3xl font-bold text-red-800">
                  {analysisData.customersWithOverdue}
                </span>
              </div>
            </div>
            
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  <span className="text-base text-red-700">نسبة العملاء المتأخرين</span>
                </div>
                <span className="font-bold text-red-800 text-lg">
                  {analysisData.totalCustomers > 0 ? 
                    Math.round((analysisData.customersWithOverdue / analysisData.totalCustomers) * 100) : 0}%
                </span>
              </div>
              
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-red-100">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                  style={{ 
                    width: analysisData.totalCustomers > 0 ? 
                      `${Math.round((analysisData.customersWithOverdue / analysisData.totalCustomers) * 100)}%` : '0%'
                  }}
                ></div>
              </div>
              
              <p className="text-center text-sm text-red-600 mt-4 font-medium">
                {analysisData.customersWithOverdue > 0 ? 
                  `${analysisData.customersWithOverdue} من أصل ${analysisData.totalCustomers} عميل متأخرين عن السداد` : 
                  'لا يوجد عملاء متأخرين حالياً'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

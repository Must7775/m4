
import { Banknote, PercentIcon, TrendingUp, CreditCard, AlertTriangle, DollarSign, LineChart, Receipt } from "lucide-react";
import { Customer, Device } from "@/types";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/data";
import { calculateDeviceProfit, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfitAnalyticsProps {
  customers: Customer[];
}

export function ProfitAnalytics({ customers }: ProfitAnalyticsProps) {
  // Calculate profit metrics across all devices
  const profitData = useMemo(() => {
    let totalSalesPrice = 0;
    let totalPurchasePrice = 0;
    let totalAmountPaid = 0;
    let currentProfit = 0;
    let potentialProfit = 0;
    let devicesWithPurchasePrice = 0;

    // Go through all customers and devices
    if (customers && customers.length > 0) {
      customers.forEach(customer => {
        if (customer && customer.devices) {
          customer.devices.forEach(device => {
            if (device && device.purchasePrice > 0) {
              devicesWithPurchasePrice++;
              totalSalesPrice += device.totalPrice;
              totalPurchasePrice += device.purchasePrice;
              totalAmountPaid += device.amountPaid;
              
              const { currentProfit: deviceCurrentProfit, expectedTotalProfit } = calculateDeviceProfit(device);
              currentProfit += deviceCurrentProfit;
              potentialProfit += expectedTotalProfit;
            }
          });
        }
      });
    }

    // Calculate percentages
    const currentMargin = totalPurchasePrice > 0 
      ? (currentProfit / totalPurchasePrice) * 100 
      : 0;
      
    const potentialMargin = totalPurchasePrice > 0 
      ? (potentialProfit / totalPurchasePrice) * 100 
      : 0;
      
    const completionRate = totalSalesPrice > 0 
      ? (totalAmountPaid / totalSalesPrice) * 100 
      : 0;
      
    return {
      totalSalesPrice,
      totalPurchasePrice,
      totalAmountPaid,
      currentProfit,
      potentialProfit,
      currentMargin,
      potentialMargin,
      completionRate,
      devicesWithPurchasePrice
    };
  }, [customers]);

  // If no devices have purchase price data, show a message
  if (!profitData || profitData.devicesWithPurchasePrice === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              تحليل الأرباح
            </h3>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-80" />
            <h4 className="text-lg font-medium text-amber-800 mb-3">
              لا توجد بيانات كافية
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              لم يتم إضافة بيانات سعر الشراء للأجهزة بعد.
              قم بإضافة سعر الشراء للأجهزة لعرض تحليل الأرباح.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white space-y-3">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <LineChart className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">تحليل الأرباح</h2>
        </div>
        <p className="text-indigo-100 text-sm">تحليل أداء المبيعات والأرباح المحققة والمتوقعة</p>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* الأرباح الحالية */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800">الأرباح الحالية</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                <span className="text-green-700 font-medium text-lg">الربح الحالي:</span>
                <span className="font-bold text-green-800 text-2xl" dir="ltr">{formatCurrency(profitData.currentProfit)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                <span className="text-green-700 font-medium text-lg">نسبة الربح:</span>
                <span className="font-bold text-green-800 text-2xl">{formatPercentage(profitData.currentMargin)}%</span>
              </div>
              
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-base text-green-700 font-medium">نسبة اكتمال المبيعات</span>
                </div>
                
                <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-green-100">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(profitData.completionRate, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-center text-sm font-medium text-green-700 mt-3">
                  {profitData.completionRate.toFixed(1)}% من المبيعات مكتملة
                </div>
              </div>
            </div>
          </div>
          
          {/* الأرباح المتوقعة */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-800">الأرباح المتوقعة</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                <span className="text-purple-700 font-medium text-lg">إجمالي الربح المتوقع:</span>
                <span className="font-bold text-purple-800 text-2xl" dir="ltr">{formatCurrency(profitData.potentialProfit)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                <span className="text-purple-700 font-medium text-lg">نسبة الربح المتوقعة:</span>
                <span className="font-bold text-purple-800 text-2xl">{formatPercentage(profitData.potentialMargin)}%</span>
              </div>
              
              <Separator className="my-4 bg-purple-100" />
              
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                  <span className="text-sm text-purple-700 block mb-2">سعر البيع:</span>
                  <span className="font-bold text-purple-800 text-lg" dir="ltr">{formatCurrency(profitData.totalSalesPrice)}</span>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                  <span className="text-sm text-purple-700 block mb-2">سعر الشراء:</span>
                  <span className="font-bold text-purple-800 text-lg" dir="ltr">{formatCurrency(profitData.totalPurchasePrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

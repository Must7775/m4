
import { formatCurrency } from "@/lib/data";
import { Clock, Calendar, AlertTriangle, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { Link } from "react-router-dom";
import { calculateDaysUntilNextPayment } from "@/lib/utils";

interface UpcomingPayment {
  customerId: string;
  name: string;
  deviceName: string;
  amount: number;
  daysLeft: number;
}

interface UpcomingPaymentsChartProps {
  customers: Customer[];
}

export function UpcomingPaymentsChart({ customers }: UpcomingPaymentsChartProps) {
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  
  useEffect(() => {
    const payments: UpcomingPayment[] = [];
    
    customers.forEach(customer => {
      customer.devices.forEach(device => {
        // Only include devices with payments (has a payment history) and balance > 0
        if (device.balance > 0 && device.payments && device.payments.length > 0) {
          let daysLeft = calculateDaysUntilNextPayment(device) || 30;
          
          // Only add to upcoming payments if we can calculate a valid due date
          if (daysLeft !== null) {
            payments.push({
              customerId: customer.id,
              name: customer.name,
              deviceName: device.name,
              amount: device.monthlyInstallment,
              daysLeft: daysLeft
            });
          }
        }
      });
    });
    
    const sortedPayments = payments.sort((a, b) => a.daysLeft - b.daysLeft);
    
    setUpcomingPayments(sortedPayments.slice(0, 7)); // Show more payments (7 instead of 5)
  }, [customers]);
  
  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft <= 0) return (
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
        <BellRing className="w-3 h-3 ml-1" />
        مستحق الآن
      </span>
    );
    if (daysLeft <= 3) return (
      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 ml-1" />
        خلال {daysLeft} أيام
      </span>
    );
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <Calendar className="w-3 h-3 ml-1" />
        خلال {daysLeft} يوم
      </span>
    );
  };
  
  return (
    <div className="h-auto" dir="rtl">
      {upcomingPayments.length > 0 ? (
        <div className="space-y-3">
          {upcomingPayments.map((payment, index) => (
            <Link to={`/customers/${payment.customerId}`} key={index}>
              <div className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-all flex justify-between items-center
                ${payment.daysLeft <= 0 ? 'border-red-200 bg-red-50/30' : 
                payment.daysLeft <= 3 ? 'border-amber-200 bg-amber-50/30' : 'border-blue-100'}`}>
                <div className="flex flex-col">
                  <div className="text-lg font-bold text-gray-800 mb-1">{payment.name}</div>
                  <div className="text-sm text-gray-600">{payment.deviceName}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(payment.daysLeft)}
                  <div className="text-xl font-bold text-blue-700" dir="ltr">{formatCurrency(payment.amount)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center py-16">
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-5 w-24 h-24 mx-auto mb-5 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">لا توجد دفعات قادمة متاحة</p>
            <p className="text-sm text-gray-400 mt-2">ستظهر هنا عندما يكون هناك دفعات مستحقة</p>
          </div>
        </div>
      )}
    </div>
  );
}


import { Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { calculateNextPaymentDueDate, calculateDaysUntilNextPayment, formatRemainingDays } from "@/lib/utils";
import { Link } from "react-router-dom";
import { User, Phone, CreditCard, CheckCircle, AlertCircle, Edit, CalendarClock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  // العثور على الجهاز الذي يحتوي على أقرب تاريخ استحقاق للدفع
  const findNextPaymentInfo = () => {
    if (!customer.devices.length) return null;
    
    let closestDevice = null;
    let minDays = Infinity;
    
    customer.devices.forEach(device => {
      // تخطي الأجهزة التي تم سدادها بالكامل
      if (device.balance <= 0) return;
      
      // تخطي الأجهزة التي لا تحتوي على دفعات سابقة
      if (!device.payments || device.payments.length === 0) return;
      
      // حساب الأيام المتبقية للدفعة القادمة
      const daysUntil = calculateDaysUntilNextPayment(device);
      if (daysUntil !== null && daysUntil < minDays) {
        minDays = daysUntil;
        closestDevice = device;
      }
    });
    
    if (!closestDevice) return null;
    
    return {
      deviceName: closestDevice.name,
      daysRemaining: minDays
    };
  };
  
  const nextPaymentInfo = findNextPaymentInfo();
  
  // تحديد حالة الدفع
  const isPaymentApproaching = nextPaymentInfo && nextPaymentInfo.daysRemaining <= 3 && nextPaymentInfo.daysRemaining >= 0;
  const isPaymentOverdue = nextPaymentInfo && nextPaymentInfo.daysRemaining < 0;
  
  return (
    <Card className={`glass-card p-5 card-hover h-full border shadow-md bg-white relative overflow-hidden
      ${isPaymentOverdue ? 'border-red-200' : isPaymentApproaching ? 'border-amber-200' : 'border-blue-100'}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      {/* عرض الإشعار للدفعات المتأخرة أو القريبة */}
      {(isPaymentApproaching || isPaymentOverdue) && (
        <div className={`absolute top-0 right-0 py-1 px-3 rounded-bl-md shadow-sm flex items-center ${isPaymentOverdue ? 'bg-red-100' : 'bg-amber-100'}`}>
          <Bell className={`w-3.5 h-3.5 ml-2 ${isPaymentOverdue ? 'text-red-500' : 'text-amber-500'}`} />
          <span className={`text-xs font-medium ${isPaymentOverdue ? 'text-red-700' : 'text-amber-700'}`}>
            {isPaymentOverdue ? 'متأخر' : 'قريباً'}
          </span>
        </div>
      )}
      
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ml-3
              ${isPaymentOverdue ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                isPaymentApproaching ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              <User className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{customer.name}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <Phone className="w-3.5 h-3.5 ml-2 text-blue-500" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>
          
          <Link to={`/customers/edit/${customer.id}`} onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
            >
              <Edit size={16} className="text-blue-600" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-md border border-green-100">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <CreditCard className="w-3.5 h-3.5 ml-2 text-green-500" />
              المدفوع
            </div>
            <div className="font-semibold text-green-700 text-right">
              {formatCurrency(customer.totalPaid)}
            </div>
          </div>
          
          <div className={`p-3 rounded-md border ${customer.balance > 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100' : 'bg-gradient-to-r from-green-50 to-teal-50 border-green-100'}`}>
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              {customer.balance > 0 ? (
                <AlertCircle className="w-3.5 h-3.5 ml-2 text-amber-500" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 ml-2 text-green-500" />
              )}
              المتبقي
            </div>
            <div 
              className={`font-semibold ${customer.balance > 0 ? 'text-amber-600' : 'text-green-600'} text-right`}
            >
              {formatCurrency(customer.balance)}
            </div>
          </div>
        </div>
        
        {nextPaymentInfo && (
          <div className={`p-3 rounded-md border 
            ${isPaymentOverdue 
              ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
              : isPaymentApproaching 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 animate-pulse' 
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'}`}
          >
            <div className="flex items-center">
              {(isPaymentOverdue || isPaymentApproaching) && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-red-500 rounded-full flex items-center justify-center ml-3 shadow-sm">
                  <Bell className="text-white w-4 h-4" />
                </div>
              )}
              <div className="flex-grow">
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
                  <CalendarClock className={`w-3.5 h-3.5 ml-2 
                    ${isPaymentOverdue ? 'text-red-500' : isPaymentApproaching ? 'text-amber-500' : 'text-purple-500'}`} 
                  />
                  {isPaymentOverdue 
                    ? 'تنبيه: تأخر موعد الدفع!' 
                    : isPaymentApproaching 
                      ? 'تنبيه: اقترب موعد الدفع!' 
                      : 'المدة المتبقية للقسط القادم'}
                </div>
                <div className={`font-semibold 
                  ${isPaymentOverdue ? 'text-red-700' : isPaymentApproaching ? 'text-amber-700' : 'text-purple-700'}`}
                >
                  {formatRemainingDays(nextPaymentInfo.daysRemaining)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {nextPaymentInfo.deviceName}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>عدد الأجهزة: {customer.devices.length}</span>
          <span>الإجمالي: {formatCurrency(customer.totalDue)}</span>
        </div>
        
        <Link to={`/customers/${customer.id}`} className="absolute inset-0 z-10">
          <span className="sr-only">عرض تفاصيل العميل</span>
        </Link>
      </div>
    </Card>
  );
}

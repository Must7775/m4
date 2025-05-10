
import { Device } from "@/types";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  calculateNextPaymentDueDate, formatNextPaymentDueDate, 
  calculateDaysUntilNextPayment, formatRemainingDays,
  calculateDeviceProfit, formatPercentage,
  formatRemainingInstallments
} from "@/lib/utils";
import { 
  Smartphone, Calendar, CreditCard, CheckCircle, AlertCircle, 
  Edit, Trash2, CalendarClock, Bell, TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { deleteDevice } from "@/lib/data";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface DeviceCardProps {
  device: Device;
  onPaymentAdded?: () => void;
  onDeviceDeleted?: () => void;
  onDeviceEdited?: (device: Device) => void;
}

export function DeviceCard({
  device,
  onPaymentAdded,
  onDeviceDeleted,
  onDeviceEdited
}: DeviceCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [nextPaymentDue, setNextPaymentDue] = useState<string | null>(null);
  const [daysUntilNextPayment, setDaysUntilNextPayment] = useState<number | null>(null);
  const [profitMetrics, setProfitMetrics] = useState({
    currentProfit: 0,
    expectedTotalProfit: 0,
    profitPercentage: 0,
    expectedProfitPercentage: 0
  });
  
  const hasFirstPayment = device.payments && device.payments.length > 0;
  const hasOverduePayment = daysUntilNextPayment !== null && daysUntilNextPayment < 0;
  
  useEffect(() => {
    // Only calculate next payment due date if there's already a first payment
    if (hasFirstPayment) {
      // Calculate next payment due date
      const dueDate = calculateNextPaymentDueDate(device);
      setNextPaymentDue(dueDate);

      // Calculate days until next payment
      const days = calculateDaysUntilNextPayment(device);
      setDaysUntilNextPayment(days);
    } else {
      setNextPaymentDue(null);
      setDaysUntilNextPayment(null);
    }
    
    // Calculate profit metrics
    setProfitMetrics(calculateDeviceProfit(device));
  }, [device, hasFirstPayment]);
  
  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    if (onPaymentAdded) {
      onPaymentAdded();
    }
  };
  
  const handleDeviceDelete = () => {
    try {
      const success = deleteDevice(device.id);
      if (success) {
        toast.success("تم حذف الجهاز بنجاح");
        if (onDeviceDeleted) {
          onDeviceDeleted();
        }
      } else {
        toast.error("حدث خطأ أثناء حذف الجهاز");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الجهاز");
      console.error(error);
    }
  };
  
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return "شهري";
      case "weekly":
        return "أسبوعي";
      case "daily":
        return "يومي";
      default:
        return "شهري";
    }
  };
  
  const getInstallmentLabel = () => {
    switch (device.frequency) {
      case "monthly":
        return "القسط الشهري";
      case "weekly":
        return "القسط الأسبوعي";
      case "daily":
        return "القسط اليومي";
      default:
        return "القسط الشهري";
    }
  };

  // Determine if a payment is approaching soon (within 3 days)
  const isPaymentApproaching = daysUntilNextPayment !== null && daysUntilNextPayment <= 3 && daysUntilNextPayment >= 0;
  
  // Check if we have purchase price data
  const hasProfitData = device.purchasePrice > 0;
  
  return (
    <Card className="glass-card p-5 h-full border border-blue-100 shadow-md bg-white relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ml-3">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 text-right">{device.name}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1 justify-end">
                <span className="font-normal">
                  {formatRemainingInstallments(device)}
                </span>
                <Calendar className="w-3.5 h-3.5 mr-2 ml-2 text-blue-500" />
                <span>{getFrequencyLabel(device.frequency || "monthly")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200">
                  <Trash2 size={16} className="text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من حذف الجهاز؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف الجهاز وجميع المدفوعات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex gap-2 justify-start">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeviceDelete} className="bg-destructive text-destructive-foreground">
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
              onClick={() => onDeviceEdited && onDeviceEdited(device)}
            >
              <Edit size={16} className="text-blue-600" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
            <div className="text-xs text-gray-500 mb-1 text-right">سعر البيع</div>
            <div className="font-semibold text-gray-800 text-right" dir="ltr">
              {formatCurrency(device.totalPrice)}
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
            <div className="text-xs text-gray-500 mb-1 text-right">{getInstallmentLabel()}</div>
            <div className="font-semibold text-gray-800 text-right" dir="ltr">
              {formatCurrency(device.monthlyInstallment)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-md border border-green-100">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
              المدفوع
              <CreditCard className="w-3.5 h-3.5 mr-2 text-green-500" />
            </div>
            <div className="font-semibold text-green-700 text-right" dir="ltr">
              {formatCurrency(device.amountPaid)}
            </div>
          </div>
          
          <div className={`p-3 rounded-md border ${device.balance > 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100' : 'bg-gradient-to-r from-green-50 to-teal-50 border-green-100'}`}>
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
              المتبقي
              {device.balance > 0 ? 
                <AlertCircle className="w-3.5 h-3.5 mr-2 text-amber-500" /> : 
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-green-500" />
              }
            </div>
            <div className={`font-semibold ${device.balance > 0 ? 'text-amber-600' : 'text-green-600'} text-right`} dir="ltr">
              {formatCurrency(device.balance)}
            </div>
          </div>
        </div>
        
        {/* الربح متوقع */}
        {hasProfitData && (
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-100">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
              تحليل الربح
              <TrendingUp className="w-3.5 h-3.5 mr-2 text-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <div className="text-xs text-gray-500 text-right">الربح الحالي</div>
                <div className="font-semibold text-purple-700 text-right" dir="ltr">
                  {formatCurrency(profitMetrics.currentProfit)} ({formatPercentage(profitMetrics.profitPercentage)})
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 text-right">الربح المتوقع</div>
                <div className="font-semibold text-purple-700 text-right" dir="ltr">
                  {formatCurrency(profitMetrics.expectedTotalProfit)} ({formatPercentage(profitMetrics.expectedProfitPercentage)})
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400" 
                style={{ width: `${(device.amountPaid / device.totalPrice) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {Math.round((device.amountPaid / device.totalPrice) * 100)}% مكتمل
            </div>
          </div>
        )}
        
        {/* Show message if no payments have been made yet */}
        {!hasFirstPayment && device.balance > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex items-center text-blue-700 mb-2 justify-end">
              <span className="font-medium">تواريخ الدفع</span>
              <Calendar className="w-4 h-4 mr-2" />
            </div>
            <p className="text-sm text-blue-600 text-right">
              سيتم احتساب تواريخ الدفعات المستقبلية بعد تسجيل أول دفعة للجهاز.
            </p>
          </div>
        )}
        
        {/* Next payment due with remaining days - only if first payment was made */}
        {device.balance > 0 && nextPaymentDue && hasFirstPayment && (
          <div className={`p-3 rounded-md border 
            ${isPaymentApproaching 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                : hasOverduePayment
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
            }`}
          >
            <div className="flex items-start">
              {(hasOverduePayment) && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center ml-3 shadow-sm">
                  <Bell className="text-white w-4 h-4" />
                </div>
              )}
              {(isPaymentApproaching && !hasOverduePayment) && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center ml-3 shadow-sm">
                  <Bell className="text-white w-4 h-4" />
                </div>
              )}
              <div className="flex-grow">
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-end">
                  {hasOverduePayment
                    ? 'تنبيه: تأخر موعد الدفع!' 
                    : isPaymentApproaching
                      ? 'تنبيه: اقترب موعد الدفع!' 
                      : 'المدة المتبقية للقسط القادم'
                  }
                  <CalendarClock className={`w-3.5 h-3.5 mr-2
                    ${hasOverduePayment ? 'text-red-500' : isPaymentApproaching ? 'text-amber-500' : 'text-purple-500'}`} 
                  />
                </div>
                <div className={`font-semibold text-right
                  ${hasOverduePayment ? 'text-red-700' : isPaymentApproaching ? 'text-amber-700' : 'text-purple-700'}`}
                >
                  {formatRemainingDays(daysUntilNextPayment)}
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formatNextPaymentDueDate(nextPaymentDue)}
                </div>
                
                {(hasOverduePayment) && (
                  <div className="mt-2">
                    <div className="text-sm text-red-600 font-medium text-right mb-2">
                      يجب دفع القسط المتأخر قبل الاستمرار بالدفعات القادمة
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full shadow-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      onClick={() => setIsPaymentDialogOpen(true)}
                    >
                      تسجيل الدفعة المتأخرة الآن
                    </Button>
                  </div>
                )}
                
                {(isPaymentApproaching && !hasOverduePayment) && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="mt-2 w-full shadow-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    تسجيل دفعة الآن
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              className={`w-full shadow-md ${device.balance === 0 ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`} 
              disabled={device.balance === 0}
            >
              {hasFirstPayment ? (hasOverduePayment ? "تسجيل الدفعة المتأخرة" : "تسجيل دفعة") : "تسجيل أول دفعة"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <PaymentForm 
              customerId={device.customerId} 
              deviceId={device.id} 
              onSuccess={handlePaymentSuccess}
              suggestedAmount={device.monthlyInstallment} 
              isFirstPayment={!hasFirstPayment}
              device={device}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

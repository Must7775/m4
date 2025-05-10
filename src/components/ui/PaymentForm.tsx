
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPayment } from "@/lib/data";
import { format } from "date-fns";
import { Calendar, CheckCircle, CreditCard, Clock, AlertTriangle, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { calculateNextPaymentDueDate, calculateDaysUntilNextPayment, formatNextPaymentDueDate } from "@/lib/utils";
import { getPaymentsByDeviceId } from "@/lib/data";
import { Device, Payment } from "@/types";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

interface PaymentFormProps {
  customerId: string;
  deviceId: string;
  onSuccess: () => void;
  suggestedAmount?: number;
  isFirstPayment?: boolean;
  device?: any; // Add device prop
}

export function PaymentForm({ 
  customerId, 
  deviceId, 
  onSuccess, 
  suggestedAmount = 0,
  isFirstPayment = false,
  device
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(suggestedAmount.toString());
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hasOverduePayment, setHasOverduePayment] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
  const [daysUntilNextPayment, setDaysUntilNextPayment] = useState<number | null>(null);
  const [paymentNumber, setPaymentNumber] = useState<number | null>(null);
  const [isRecordingOverduePayment, setIsRecordingOverduePayment] = useState(false);
  
  // تحقق من وجود دفعات متأخرة
  useEffect(() => {
    if (!device || isFirstPayment) return; // لا تحتاج للتحقق في حالة أول دفعة
    
    // فقط في حالة وجود دفعات سابقة نقوم بالتحقق من وجود دفعات متأخرة
    if (device.payments && device.payments.length > 0) {
      const dueDate = calculateNextPaymentDueDate(device);
      setNextDueDate(dueDate);
      
      const days = calculateDaysUntilNextPayment(device);
      setDaysUntilNextPayment(days);
      
      // إذا كان عدد الأيام سالب، فهذا يعني أن الدفعة متأخرة
      if (days !== null && days < 0) {
        setHasOverduePayment(true);
        
        // حساب رقم الدفعة المتأخرة
        if (device.payments) {
          setPaymentNumber(device.payments.length + 1);
        }
      } else {
        setHasOverduePayment(false);
      }
    }
  }, [device, isFirstPayment]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addPayment(deviceId, customerId, Number(amount), date);
      
      toast.success(isFirstPayment 
        ? "تم تسجيل الدفعة الأولى وتحديد تاريخ البداية للدفعات القادمة" 
        : isRecordingOverduePayment 
          ? "تم تسجيل الدفعة المتأخرة بنجاح" 
          : "تم تسجيل الدفعة بنجاح"
      );
      
      // إعادة تعيين حالة تسجيل الدفعة المتأخرة
      setIsRecordingOverduePayment(false);
      
      onSuccess();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("حدث خطأ أثناء تسجيل الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // إذا كان هناك دفعة متأخرة وتم النقر على زر تسجيل الدفعة المتأخرة
  const handleRecordOverduePayment = () => {
    setIsRecordingOverduePayment(true);
  };

  // If no device is provided, render simplified form
  if (!device) {
    return (
      <div className="py-2">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1 text-right">
            {isFirstPayment ? "تسجيل الدفعة الأولى" : "تسجيل دفعة جديدة"}
          </h3>
          <p className="text-sm text-gray-500 text-right">
            {isFirstPayment 
              ? "ستعتبر هذه الدفعة نقطة البداية لحساب تواريخ الأقساط القادمة" 
              : "أدخل بيانات الدفعة الجديدة"
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="payment-amount" className="block text-right">المبلغ</Label>
            <div className="relative">
              <Input
                id="payment-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل مبلغ الدفعة"
                className="form-input text-right"
                min="0"
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                د.ع
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="payment-date" className="block text-right">تاريخ الدفعة</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input text-right"
              dir="ltr"
            />
          </div>
          
          {isFirstPayment && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 ml-2 flex-shrink-0" />
                <p className="text-sm text-amber-600 text-right">
                  <strong>هام:</strong> سيتم استخدام تاريخ هذه الدفعة كنقطة بداية لحساب تواريخ الأقساط اللاحقة.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري التسجيل..." : "تسجيل الدفعة"}
            </Button>
          </div>
        </form>
      </div>
    );
  }
  
  // Device details version of the form
  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 text-right">
          {isFirstPayment 
            ? "تسجيل الدفعة الأولى" 
            : isRecordingOverduePayment 
              ? "تسجيل الدفعة المتأخرة" 
              : "تسجيل دفعة جديدة"
          }
        </h2>
      </div>
      
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">الجهاز:</span>
            <span className="font-semibold text-gray-800">{device.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">السعر الكلي:</span>
            <span className="font-semibold text-gray-800" dir="ltr">{formatCurrency(device.totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">المبلغ المدفوع:</span>
            <span className="font-semibold text-green-600" dir="ltr">{formatCurrency(device.amountPaid)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">الرصيد المتبقي:</span>
            <span className="font-semibold text-amber-600" dir="ltr">{formatCurrency(device.balance)}</span>
          </div>
          {!isFirstPayment && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">موعد القسط القادم:</span>
              <span className="font-semibold text-blue-600">{nextDueDate ? formatNextPaymentDueDate(nextDueDate) : "غير محدد"}</span>
            </div>
          )}
        </div>
      </div>
      
      {isFirstPayment && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 text-right mb-1">تنبيه: تاريخ بداية الأقساط</h3>
              <p className="text-sm text-amber-600 text-right">
                سيتم استخدام تاريخ هذه الدفعة الأولى كنقطة بداية لحساب جميع مواعيد الأقساط المستقبلية بناءً على نوع القسط ({device.frequency === "monthly" ? "شهري" : device.frequency === "weekly" ? "أسبوعي" : "يومي"}).
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* تنبيه الدفعات المتأخرة مع خيار التسجيل */}
      {hasOverduePayment && !isFirstPayment && !isRecordingOverduePayment && (
        <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-right mb-1 text-red-800 font-bold">تنبيه: دفعة متأخرة!</AlertTitle>
          <AlertDescription className="text-right">
            <div className="space-y-2">
              <p className="font-medium text-red-700">
                يوجد دفعة متأخرة لهذا الجهاز.
              </p>
              <ul className="list-disc list-inside pr-4 text-red-700 space-y-1">
                <li><span className="font-semibold">رقم الدفعة المتأخرة:</span> القسط رقم {paymentNumber}</li>
                <li><span className="font-semibold">تاريخ استحقاق الدفعة:</span> {nextDueDate ? formatNextPaymentDueDate(nextDueDate) : "غير محدد"}</li>
                <li><span className="font-semibold">عدد أيام التأخير:</span> {daysUntilNextPayment ? Math.abs(daysUntilNextPayment) : 0} يوم</li>
              </ul>
              <div className="mt-3">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handleRecordOverduePayment}
                  className="bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
                >
                  تسجيل الدفعة المتأخرة
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* إذا كان وضع تسجيل الدفعة المتأخرة مفعل، نظهر نموذج مخصص */}
      {isRecordingOverduePayment && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 text-right mb-1">تسجيل دفعة متأخرة</h3>
              <p className="text-sm text-amber-700 text-right">
                أنت بصدد تسجيل الدفعة المتأخرة رقم {paymentNumber}. تاريخ استحقاق هذه الدفعة كان {nextDueDate ? formatNextPaymentDueDate(nextDueDate) : "غير محدد"}.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <CreditCard className="w-4 h-4 ml-2 text-blue-500" />
            مبلغ الدفعة (د.ع)
          </label>
          <input
            id="payment-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
            placeholder="أدخل مبلغ الدفعة"
            min="0"
            max={device.balance}
            dir="ltr"
          />
        </div>
        
        <div>
          <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Calendar className="w-4 h-4 ml-2 text-blue-500" />
            تاريخ الدفع
          </label>
          <input
            id="payment-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
            dir="ltr"
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button 
          type="submit" 
          className={`w-full shadow-md ${isSubmitting || device.balance === 0 ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : isRecordingOverduePayment ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
          disabled={isSubmitting || device.balance === 0}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin ml-3 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جارٍ التسجيل...
            </span>
          ) : isRecordingOverduePayment ? (
            <span className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 ml-2" />
              تسجيل الدفعة المتأخرة
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 ml-2" />
              تسجيل الدفعة
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

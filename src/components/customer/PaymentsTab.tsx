
import { Device, Payment } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Trash2, CreditCard, AlertCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { 
  calculateNextPaymentDueDate, 
  calculateDaysUntilNextPayment, 
  formatNextPaymentDueDate 
} from "@/lib/utils";

interface PaymentsTabProps {
  payments: Payment[];
  devices: Device[];
  onDeletePayment: (paymentId: string) => void;
}

export function PaymentsTab({ payments, devices, onDeletePayment }: PaymentsTabProps) {
  const [overduePayments, setOverduePayments] = useState<{
    payment: Payment;
    device: Device;
    daysOverdue: number;
    dueDate: string | null;
  }[]>([]);
  
  // حساب الدفعات المتأخرة لكل جهاز
  useEffect(() => {
    const overdueList: {
      payment: Payment;
      device: Device;
      daysOverdue: number;
      dueDate: string | null;
    }[] = [];
    
    devices.forEach(device => {
      if (device.balance <= 0) return;
      if (!device.payments || device.payments.length === 0) return;
      
      const daysRemaining = calculateDaysUntilNextPayment(device);
      const nextDueDate = calculateNextPaymentDueDate(device);
      
      // إذا كان عدد الأيام سالب، فهذا يعني أن الدفعة متأخرة
      if (daysRemaining !== null && daysRemaining < 0) {
        // نجد آخر دفعة لهذا الجهاز
        const lastPayment = device.payments[device.payments.length - 1];
        
        if (lastPayment) {
          overdueList.push({
            payment: lastPayment,
            device: device,
            daysOverdue: Math.abs(daysRemaining),
            dueDate: nextDueDate
          });
        }
      }
    });
    
    setOverduePayments(overdueList);
  }, [devices]);
  
  // تنسيق التاريخ من ISO string إلى DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  // التحقق من تأخر الدفعة بناءً على تاريخ الدفعة التالي
  const isPaymentOverdue = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return false;
    
    const daysRemaining = calculateDaysUntilNextPayment(device);
    return daysRemaining !== null && daysRemaining < 0;
  };

  // الحصول على حالة الجهاز
  const getDeviceStatus = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return "unknown";
    
    // التحقق من وجود دفعة متأخرة
    const hasOverdue = isPaymentOverdue(deviceId);
    
    if (device.balance <= 0) return "paid";
    if (hasOverdue) return "overdue";
    return "active";
  };

  if (payments.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 text-right">قائمة المدفوعات</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" /> متأخر
              </Badge>
            </div>
          </div>
        </div>
        
        {/* عرض قائمة بالدفعات المتأخرة إذا وجدت */}
        {overduePayments.length > 0 && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md animate-pulse">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 ml-3 flex-shrink-0" />
              <div className="flex-grow">
                <h4 className="text-md font-semibold text-red-700 text-right mb-2">
                  تنبيه: يوجد {overduePayments.length} دفعة متأخرة
                </h4>
                <ul className="space-y-3">
                  {overduePayments.map((item, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-red-100 pb-2">
                      <div className="text-right">
                        <div className="font-medium text-red-700">{item.device.name}</div>
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <Clock className="w-3 h-3 ml-1" />
                          <span>متأخر بـ {item.daysOverdue} يوم</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">تاريخ الاستحقاق</div>
                        <div className="text-sm text-red-700 font-medium">
                          {item.dueDate ? formatNextPaymentDueDate(item.dueDate) : "غير محدد"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto rounded-md border border-blue-100 shadow-sm">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <TableRow>
                <TableHead className="text-right font-medium text-gray-700">تاريخ الدفع</TableHead>
                <TableHead className="text-right font-medium text-gray-700">اسم الجهاز</TableHead>
                <TableHead className="text-right font-medium text-gray-700">الحالة</TableHead>
                <TableHead className="text-right font-medium text-gray-700">المبلغ</TableHead>
                <TableHead className="text-center font-medium text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const device = devices.find(d => d.id === payment.deviceId);
                const deviceStatus = device ? getDeviceStatus(device.id) : "unknown";
                const isOverdue = deviceStatus === 'overdue';
                
                return (
                  <TableRow key={payment.id} className={`border-b border-blue-50 hover:bg-blue-50/50 transition-colors ${isOverdue ? 'bg-amber-50/30' : ''}`}>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <span>{formatDate(payment.date)}</span>
                        <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{device ? device.name : "—"}</TableCell>
                    <TableCell className="text-right">
                      {deviceStatus === 'overdue' ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> متأخر
                        </Badge>
                      ) : deviceStatus === 'paid' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          مدفوع بالكامل
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                          نشط
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-700">
                      <span>{formatCurrency(payment.amount)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف الدفعة؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف الدفعة وتحديث رصيد الجهاز. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeletePayment(payment.id)} 
                              className="bg-destructive text-destructive-foreground"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* ملخص حالة المدفوعات */}
        <div className="p-4 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <h4 className="text-md font-semibold text-gray-800 text-right mb-2">ملخص المدفوعات</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-md shadow-sm">
              <div className="text-sm text-gray-500 mb-1 text-right">إجمالي المدفوعات</div>
              <div className="font-semibold text-gray-800 text-right" dir="ltr">
                {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
              </div>
            </div>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <div className="text-sm text-gray-500 mb-1 text-right">عدد المدفوعات</div>
              <div className="font-semibold text-gray-800 text-right">
                {payments.length} دفعة
              </div>
            </div>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <div className="text-sm text-gray-500 mb-1 text-right">آخر دفعة</div>
              <div className="font-semibold text-gray-800 text-right">
                {payments.length > 0 ? formatDate(
                  payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
                ) : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      <div className="flex justify-center mb-4">
        <CreditCard className="w-16 h-16 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">لا توجد مدفوعات</h3>
      <p className="text-gray-600">
        لم يتم تسجيل أي مدفوعات لهذا العميل بعد.
      </p>
    </div>
  );
}

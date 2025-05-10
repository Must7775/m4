import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Device } from "@/types"
import { addDays, addMonths, addWeeks, formatISO, differenceInDays, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateNextPaymentDueDate(device: Device): string | null {
  // إذا كان الرصيد 0، فلا يوجد دفعة مستحقة
  if (device.balance <= 0) {
    return null;
  }

  // إذا لم تكن هناك أي دفعات بعد، فلا يمكننا حساب التاريخ
  if (!device.payments || device.payments.length === 0) {
    return null;
  }
  
  // ترتيب الدفعات حسب التاريخ
  const sortedPayments = [...device.payments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // أول دفعة هي نقطة البداية
  const firstPayment = sortedPayments[0];
  // آخر دفعة تم تسديدها
  const lastPayment = sortedPayments[sortedPayments.length - 1];
  
  const firstPaymentDate = new Date(firstPayment.date);
  
  // نحسب عدد الدفعات المسددة (حتى لو كان المبلغ صفر، نعتبرها مسددة لحساب التواريخ)
  const paidInstallmentsCount = sortedPayments.length;
  
  // تاريخ الدفعة القادمة يعتمد على عدد الدفعات المسددة والتردد
  let nextDueDate;
  
  switch (device.frequency) {
    case "daily":
      nextDueDate = addDays(firstPaymentDate, paidInstallmentsCount);
      break;
    case "weekly":
      nextDueDate = addWeeks(firstPaymentDate, paidInstallmentsCount);
      break;
    case "monthly":
    default:
      // نستخدم نفس يوم الشهر من أول دفعة
      nextDueDate = addMonths(firstPaymentDate, paidInstallmentsCount);
      break;
  }
  
  return formatISO(nextDueDate, { representation: 'date' });
}

export function formatNextPaymentDueDate(dateString: string | null | undefined): string {
  if (!dateString) return "غير محدد";
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

export function calculateDaysUntilNextPayment(device: Device): number | null {
  const nextPaymentDueDate = calculateNextPaymentDueDate(device);
  
  if (!nextPaymentDueDate) {
    return null;
  }
  
  const dueDate = parseISO(nextPaymentDueDate);
  const today = new Date();
  
  // حساب الفرق بالأيام
  return differenceInDays(dueDate, today);
}

export function formatRemainingDays(days: number | null): string {
  if (days === null) return "غير محدد";
  
  if (days < 0) {
    // إذا كان عدد الأيام سالب، فهذا يعني أن الدفعة متأخرة
    return `متأخر بـ ${Math.abs(days)} يوم`;
  } else if (days === 0) {
    return "مستحق اليوم";
  } else {
    // إذا كان عدد الأيام موجب، فهذا يعني أن الدفعة قادمة
    const date = new Date();
    date.setDate(date.getDate() + days);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${days} يوم متبقي (${day}-${month}-${year})`;
  }
}

export function formatCurrencyValue(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export function formatCurrency(value: number): string {
  // Format the number with comma separators
  const formattedValue = formatCurrencyValue(value);
  // Add IQD currency code
  return `${formattedValue} د.ع`;
}

export function categorizeValue(value: number, thresholds: number[]): string {
  if (value <= thresholds[0]) return 'منخفض';
  if (value <= thresholds[1]) return 'متوسط';
  return 'مرتفع';
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateDeviceProfit(device: Device): {
  currentProfit: number;
  expectedTotalProfit: number;
  profitPercentage: number;
  expectedProfitPercentage: number;
} {
  // Current profit (from payments already made)
  const currentProfit = device.purchasePrice > 0 ? 
    device.amountPaid - (device.purchasePrice * (device.amountPaid / device.totalPrice)) : 
    0;
  
  // Expected total profit (once all installments are paid)
  const expectedTotalProfit = device.purchasePrice > 0 ? 
    device.totalPrice - device.purchasePrice : 
    0;
  
  // Current profit percentage
  const profitPercentage = device.purchasePrice > 0 ? 
    (currentProfit / device.purchasePrice) * 100 : 
    0;
  
  // Expected profit percentage (once all installments are paid)
  const expectedProfitPercentage = device.purchasePrice > 0 ? 
    (expectedTotalProfit / device.purchasePrice) * 100 : 
    0;
  
  return {
    currentProfit,
    expectedTotalProfit,
    profitPercentage,
    expectedProfitPercentage
  };
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function calculateRemainingInstallments(device: Device): number {
  if (device.monthlyInstallment <= 0) return 0;
  return Math.max(Math.ceil(device.balance / device.monthlyInstallment), 0);
}

export function formatRemainingInstallments(device: Device): string {
  const remaining = calculateRemainingInstallments(device);
  return `${remaining} قسط من أصل ${device.installmentsCount} (${Math.round((remaining/device.installmentsCount)*100)}%)`;
}

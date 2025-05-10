
import { Customer } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Package, CreditCard, AlertCircle } from "lucide-react";

interface CustomerSummaryProps {
  customer: Customer;
}

export function CustomerSummary({ customer }: CustomerSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" dir="rtl">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md flex items-center border border-blue-100 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ml-4 shadow-sm">
          <Package className="text-white w-5 h-5" />
        </div>
        <div>
          <div className="text-sm text-gray-500">إجمالي المبيعات</div>
          <div className="font-semibold text-lg text-gray-800" dir="ltr">{formatCurrency(customer.totalDue)}</div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-md flex items-center border border-green-100 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center ml-4 shadow-sm">
          <CreditCard className="text-white w-5 h-5" />
        </div>
        <div>
          <div className="text-sm text-gray-500">إجمالي المدفوع</div>
          <div className="font-semibold text-lg text-gray-800" dir="ltr">{formatCurrency(customer.totalPaid)}</div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-md flex items-center border border-amber-100 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center ml-4 shadow-sm">
          <AlertCircle className={`w-5 h-5 text-white`} />
        </div>
        <div>
          <div className="text-sm text-gray-500">الرصيد المتبقي</div>
          <div className={`font-semibold text-lg ${customer.balance > 0 ? 'text-amber-600' : 'text-green-600'}`} dir="ltr">
            {formatCurrency(customer.balance)}
          </div>
        </div>
      </div>
    </div>
  );
}


import * as XLSX from 'xlsx';
import { Customer, Device, Payment } from "@/types";

// Format date strings to be more readable
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

export const exportCustomersToExcel = (customers: Customer[]): void => {
  // Create an array for Excel data
  const exportData: any[] = [];
  
  // Add headers
  exportData.push([
    "اسم العميل", 
    "رقم الهاتف", 
    "اسم الجهاز", 
    "السعر الكلي", 
    "المبلغ المدفوع", 
    "المبلغ المتبقي",
    "عدد الأقساط", 
    "القسط الشهري", 
    "تاريخ الدفعة",
    "مبلغ الدفعة"
  ]);
  
  // Process each customer
  customers.forEach(customer => {
    // If customer has no devices, add one row with customer info
    if (customer.devices.length === 0) {
      exportData.push([
        customer.name,
        customer.phone,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ]);
    } else {
      // Process each device
      customer.devices.forEach(device => {
        // If device has no payments, add one row with device info
        if (device.payments.length === 0) {
          exportData.push([
            customer.name,
            customer.phone,
            device.name,
            device.totalPrice,
            device.amountPaid,
            device.balance,
            device.installmentsCount,
            device.monthlyInstallment,
            "",
            ""
          ]);
        } else {
          // Process each payment
          device.payments.forEach(payment => {
            exportData.push([
              customer.name,
              customer.phone,
              device.name,
              device.totalPrice,
              device.amountPaid,
              device.balance,
              device.installmentsCount,
              device.monthlyInstallment,
              formatDate(payment.date),
              payment.amount
            ]);
          });
        }
      });
    }
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(exportData);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // اسم العميل
    { wch: 15 }, // رقم الهاتف
    { wch: 25 }, // اسم الجهاز
    { wch: 12 }, // السعر الكلي
    { wch: 12 }, // المبلغ المدفوع
    { wch: 12 }, // المبلغ المتبقي
    { wch: 10 }, // عدد الأقساط
    { wch: 12 }, // القسط الشهري
    { wch: 12 }, // تاريخ الدفعة
    { wch: 12 }  // مبلغ الدفعة
  ];
  ws['!cols'] = colWidths;
  
  // Apply right-to-left direction for Arabic text
  // Removing the style property as it's not supported in the ColInfo type
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "بيانات العملاء");
  
  // Generate a unique filename with date
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `بيانات_العملاء_${dateStr}.xlsx`;
  
  // Save to file
  XLSX.writeFile(wb, filename);
};

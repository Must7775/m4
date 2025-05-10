
import React from 'react';
import { Customer, Payment, Device } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface CustomerStatementTableProps {
  customer: Customer;
  sortOrder: "asc" | "desc";
  onChangeSortOrder: (order: "asc" | "desc") => void;
}

type TransactionType = "purchase" | "payment";

interface Transaction {
  id: string;
  date: string;
  deviceName: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
}

export function CustomerStatementTable({ 
  customer, 
  sortOrder, 
  onChangeSortOrder 
}: CustomerStatementTableProps) {
  // Prepare transaction history by combining device purchases and payments
  const transactions: Transaction[] = [];
  
  // Process each device separately to maintain proper device-specific balances
  customer.devices.forEach((device) => {
    let deviceTransactions: Transaction[] = [];
    
    // Add device purchase as first transaction
    deviceTransactions.push({
      id: `purchase-${device.id}`,
      date: device.payments[0]?.date || new Date().toISOString().split('T')[0], // Use first payment date or today
      deviceName: device.name,
      type: "purchase",
      amount: device.totalPrice,
      balance: device.totalPrice, // Initial balance is the full device price
      description: `شراء جهاز ${device.name}`
    });
    
    // Add device payments
    device.payments.forEach((payment) => {
      deviceTransactions.push({
        id: payment.id,
        date: payment.date,
        deviceName: device.name,
        type: "payment",
        amount: payment.amount,
        balance: 0, // Placeholder, will calculate actual balance later
        description: `دفعة لجهاز ${device.name}`
      });
    });
    
    // Sort device transactions by date (oldest to newest)
    deviceTransactions.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Calculate running balance for this device
    let runningBalance = 0;
    for (const transaction of deviceTransactions) {
      if (transaction.type === "purchase") {
        runningBalance = transaction.amount; // Set initial balance to device price
      } else {
        runningBalance -= transaction.amount; // Reduce balance by payment amount
      }
      transaction.balance = runningBalance; // Set the current balance after this transaction
    }
    
    // Add processed device transactions to the main transactions list
    transactions.push(...deviceTransactions);
  });
  
  // Sort all transactions by date according to user preference
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
  
  return (
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button
          variant="outline" 
          size="sm"
          onClick={() => onChangeSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-1"
        >
          ترتيب حسب التاريخ {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden print:border-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الجهاز</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الرصيد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.date}</TableCell>
                  <TableCell>{transaction.deviceName}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.type === "payment" ? "text-green-600" : "text-red-600"}>
                    {transaction.type === "payment" ? "-" : "+"}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className={transaction.balance > 0 ? "text-red-600" : transaction.balance < 0 ? "text-green-600" : ""}>
                    {formatCurrency(Math.abs(transaction.balance))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">لا توجد معاملات لهذا العميل</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

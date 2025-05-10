
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCustomerById, formatCurrency } from "@/lib/data";
import { Customer, Payment, Device } from "@/types";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CustomerStatementTable } from "@/components/customer/CustomerStatementTable";
import { toast } from "sonner";

const CustomerStatement = () => {
  const { id } = useParams<{ id: string }>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Query for customer data with automatic refetching
  const { 
    data: customer,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      return await getCustomerById(id);
    },
    enabled: !!id,
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  // Handle printing the statement
  const handlePrint = () => {
    window.print();
    toast.success("جاري طباعة كشف الحساب");
  };

  // Loading state
  if (isLoading || !customer) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-gray-500">جاري تحميل البيانات...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">حدث خطأ أثناء تحميل البيانات</div>
            <Button onClick={() => refetch()}>إعادة المحاولة</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in print:bg-white print:from-white print:to-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link to={`/customers/${customer.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              العودة إلى صفحة العميل
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} />
              طباعة كشف الحساب
            </Button>
          </div>
        </div>

        {/* Statement Header - will be visible in print */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200 print:shadow-none print:border-none">
          <div className="flex flex-col items-center mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">كشف حساب العميل</h1>
            <div className="w-32 h-1 bg-blue-500 rounded mb-4"></div>
            <p className="text-gray-600">تاريخ إصدار الكشف: {new Date().toLocaleDateString('ar-IQ')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">بيانات العميل</h2>
              <p><span className="font-semibold">اسم العميل:</span> {customer.name}</p>
              <p><span className="font-semibold">رقم الهاتف:</span> {customer.phone}</p>
              <p><span className="font-semibold">عدد الأجهزة:</span> {customer.devices.length}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">ملخص الحساب</h2>
              <p><span className="font-semibold">إجمالي المستحق:</span> {formatCurrency(customer.totalDue)}</p>
              <p><span className="font-semibold">إجمالي المدفوع:</span> {formatCurrency(customer.totalPaid)}</p>
              <p><span className="font-semibold">الرصيد المتبقي:</span> {formatCurrency(customer.balance)}</p>
            </div>
          </div>
        </div>

        {/* Statement Details */}
        <Card className="mb-8 print:shadow-none print:border-none">
          <CardHeader className="flex flex-row justify-between items-center p-6 border-b print:pb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg print:hidden">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">سجل المعاملات</h3>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <CustomerStatementTable 
              customer={customer} 
              sortOrder={sortOrder}
              onChangeSortOrder={(order) => setSortOrder(order)}
            />
          </CardContent>
        </Card>
        
        <div className="print:mt-8 print:text-center print:text-gray-500 print:text-sm hidden print:block">
          <p>تم إصدار هذا الكشف بواسطة نظام إدارة المدفوعات</p>
          <p>{new Date().toLocaleDateString('ar-IQ')} - {new Date().toLocaleTimeString('ar-IQ')}</p>
        </div>
      </main>
      
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default CustomerStatement;

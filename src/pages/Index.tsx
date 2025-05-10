
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCustomers } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/types";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Loader2, 
  ChevronUp, 
  BarChart3, 
  Users, 
  PieChart, 
  UserX, 
  Calendar, 
  BellRing,
  FileText 
} from "lucide-react";
import { FinancialSummary } from "@/components/analytics/FinancialSummary";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { PaymentStatusChart } from "@/components/analytics/PaymentStatusChart";
import { PaymentsStatusAnalytics } from "@/components/analytics/PaymentsStatusAnalytics";
import { ProfitAnalytics } from "@/components/analytics/ProfitAnalytics";
import { UpcomingPaymentsChart } from "@/components/analytics/UpcomingPaymentsChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { calculateDaysUntilNextPayment } from "@/lib/utils";
import { exportCustomersToExcel } from "@/lib/excelExport";
import { toast } from "sonner";

function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLateCustomersDialogOpen, setIsLateCustomersDialogOpen] = useState(false);
  
  const {
    data: customers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    refetchInterval: 5000, // Auto-refetch every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const revenueData = generateRevenueData(customers || []);
  
  // تحسين وظيفة الحصول على العملاء المتأخرين
  function getLateCustomers(customers: Customer[]) {
    // تصفية العملاء الذين لديهم دفعة واحدة متأخرة على الأقل
    return customers.filter(customer => {
      return customer.devices.some(device => {
        // تخطي الأجهزة التي تم سدادها بالكامل
        if (device.balance <= 0) return false;
        
        // تخطي الأجهزة التي لا تحتوي على دفعات سابقة
        if (!device.payments || device.payments.length === 0) return false;
        
        // حساب الأيام المتبقية للدفعة القادمة
        const daysLeft = calculateDaysUntilNextPayment(device);
        
        // إذا كانت الأيام المتبقية سالبة، فهذا يعني أن الدفعة متأخرة
        return daysLeft !== null && daysLeft < 0;
      });
    });
  }
  
  // الحصول على قائمة العملاء المتأخرين
  const lateCustomers = getLateCustomers(customers || []);
  
  function generateRevenueData(customers: Customer[]) {
    const monthNames = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    
    const monthlyRevenue: { [key: string]: number } = {};
    
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyRevenue[monthKey] = 0;
    }
    
    if (customers && customers.length > 0) {
      customers.forEach(customer => {
        if (customer && customer.devices) {
          customer.devices.forEach(device => {
            if (device && device.payments) {
              device.payments.forEach(payment => {
                if (payment && payment.date) {
                  const paymentDate = new Date(payment.date);
                  const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
                  
                  if (monthlyRevenue[monthKey] !== undefined) {
                    monthlyRevenue[monthKey] += payment.amount;
                  }
                }
              });
            }
          });
        }
      });
    }
    
    return Object.keys(monthlyRevenue)
      .sort()
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        return {
          name: `${monthNames[month - 1]} ${year}`,
          value: monthlyRevenue[key]
        };
      })
      .reverse();
  }
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportToExcel = () => {
    try {
      if (customers.length === 0) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }
      
      exportCustomersToExcel(customers);
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-10 shadow-lg mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">نظام إدارة المبيعات بالتقسيط</h1>
              <p className="text-blue-100 max-w-2xl text-lg">مرحبًا بك في لوحة التحكم | إدارة العملاء والأقساط والأرباح بطريقة سهلة ومتكاملة</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/customers/new">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition shadow-md font-medium px-6 py-6 text-lg w-full sm:w-auto">
                  <Plus className="ml-2 h-5 w-5" /> عميل جديد
                </Button>
              </Link>
              
              <Button 
                onClick={handleExportToExcel}
                className="bg-green-600 text-white hover:bg-green-700 transition shadow-md font-medium px-6 py-6 text-lg w-full sm:w-auto"
              >
                <FileText className="ml-2 h-5 w-5" /> تصدير إلى إكسل
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">لوحة البيانات</h2>
            <p className="text-gray-600">نظرة عامة على الحالة المالية والمبيعات</p>
            <Separator className="mt-4" />
          </div>
          
          <div className="flex flex-col gap-8">
            {/* بطاقة التحليل المالي - الأولى */}
            <FinancialSummary customers={customers || []} />
            
            {/* بطاقة تحليل الأرباح - الثانية */}
            <ProfitAnalytics customers={customers || []} />
            
            {/* بطاقة حالة المدفوعات - الثالثة */}
            <Dialog open={isLateCustomersDialogOpen} onOpenChange={setIsLateCustomersDialogOpen}>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <PaymentsStatusAnalytics customers={customers || []} />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <UserX className="text-red-500 h-7 w-7" />
                    <span>العملاء المتأخرين عن السداد</span>
                  </DialogTitle>
                  <DialogDescription>
                    قائمة بالعملاء المتأخرين عن سداد الأقساط المستحقة عليهم
                  </DialogDescription>
                </DialogHeader>
                
                {lateCustomers.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {lateCustomers.map(customer => (
                      <Link to={`/customers/${customer.id}`} key={customer.id}>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-100 p-2 rounded-full">
                                <UserX className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{customer.name}</h4>
                                <p className="text-sm text-gray-500" dir="ltr">{customer.phone}</p>
                              </div>
                            </div>
                            <div className="text-xl font-bold text-red-600" dir="ltr">
                              {customer.balance.toLocaleString()} د.ع
                            </div>
                          </div>
                          <div className="mt-3 flex items-center">
                            <BellRing className="h-4 w-4 text-red-500 ml-2" />
                            <span className="text-sm text-red-700">
                              متأخر عن السداد
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-500">لا يوجد عملاء متأخرين عن السداد حالياً</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>
        
        <section className="mb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">التحليلات والرسوم البيانية</h2>
            <p className="text-gray-600">تحليل أداء المبيعات والإيرادات</p>
            <Separator className="mt-4" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="md:col-span-2 h-full">
              <CardHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">الإيرادات الشهرية</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2.5 rounded-lg text-purple-700">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">حالة المدفوعات</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <PaymentStatusChart customers={customers || []} />
              </CardContent>
            </Card>
          </div>
          
          <Card className="h-full">
            <CardHeader className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">المدفوعات القادمة</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <UpcomingPaymentsChart customers={customers || []} />
            </CardContent>
          </Card>
        </section>
        
        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:transform hover:scale-110"
            aria-label="العودة إلى الأعلى"
          >
            <ChevronUp className="w-7 h-7" />
          </button>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;

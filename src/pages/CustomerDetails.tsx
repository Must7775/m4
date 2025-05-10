
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerById, getDevicesByCustomerId, getPaymentsByCustomerId, deleteCustomer, deletePayment } from "@/lib/data";
import { Customer, Device, Payment } from "@/types";
import { Package, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerActions } from "@/components/customer/CustomerActions";
import { CustomerSummary } from "@/components/customer/CustomerSummary";
import { DevicesTab } from "@/components/customer/DevicesTab";
import { PaymentsTab } from "@/components/customer/PaymentsTab";
import { calculateDaysUntilNextPayment } from "@/lib/utils";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Use React Query for data fetching with automatic refetching
  const { 
    data: customer,
    isLoading: isLoadingCustomer,
    refetch: refetchCustomer
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      return await getCustomerById(id);
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true
  });
  
  const {
    data: devices = [],
    isLoading: isLoadingDevices,
    refetch: refetchDevices
  } = useQuery({
    queryKey: ['devices', id],
    queryFn: async () => {
      if (!id) return [];
      return await getDevicesByCustomerId(id);
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true
  });
  
  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    refetch: refetchPayments
  } = useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      if (!id) return [];
      return await getPaymentsByCustomerId(id);
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true
  });
  
  const isLoading = isLoadingCustomer || isLoadingDevices || isLoadingPayments;
  
  // Calculate overdue devices
  const overdueDevices = devices.filter(device => {
    const hasPayments = device.payments && device.payments.length > 0;
    if (!hasPayments || device.balance <= 0) return false;
    
    // Calculate days remaining for next payment
    const daysRemaining = calculateDaysUntilNextPayment(device);
    // If days are negative, payment is overdue
    return daysRemaining !== null && daysRemaining < 0;
  });
  
  // Display alert for overdue payments
  useEffect(() => {
    if (overdueDevices.length > 0) {
      overdueDevices.forEach(device => {
        toast.error(`تنبيه: العميل لديه دفعة متأخرة للجهاز ${device.name}`, {
          duration: 5000,
          id: `overdue-${device.id}`, // Avoid duplicate notifications
        });
      });
    }
  }, [overdueDevices]);
  
  // Refresh functions for data updates
  const refreshAllData = useCallback(() => {
    if (id) {
      refetchCustomer();
      refetchDevices();
      refetchPayments();
      // Also refresh the global customers list
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  }, [id, refetchCustomer, refetchDevices, refetchPayments, queryClient]);
  
  const handleDeviceAdded = () => {
    refreshAllData();
    toast.success("تم إضافة الجهاز بنجاح");
  };
  
  const handleDeviceEdited = (device: Device) => {
    setSelectedDevice(device);
    setIsEditMode(true);
    refreshAllData();
  };
  
  const handleDeviceDeleted = () => {
    refreshAllData();
    toast.success("تم حذف الجهاز بنجاح");
  };
  
  const handlePaymentAdded = () => {
    refreshAllData();
    toast.success("تم تسجيل الدفعة بنجاح");
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    try {
      const success = await deletePayment(paymentId);
      if (success) {
        toast.success("تم حذف الدفعة بنجاح");
        refreshAllData();
      } else {
        toast.error("حدث خطأ أثناء حذف الدفعة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الدفعة");
      console.error(error);
    }
  };
  
  const handleDeleteCustomer = async () => {
    if (!customer) return;
    
    try {
      console.log("Deleting customer with ID:", customer.id);
      const success = await deleteCustomer(customer.id);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast.success("تم حذف العميل بنجاح");
        navigate("/customers");
      } else {
        toast.error("حدث خطأ أثناء حذف العميل");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("حدث خطأ أثناء حذف العميل");
    }
  };
  
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
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="glass-card p-6 mb-8 border border-blue-100 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CustomerHeader customer={customer} />
            
            <CustomerActions 
              customerId={customer.id}
              onDeviceAdded={handleDeviceAdded}
              onDeleteCustomer={handleDeleteCustomer}
              selectedDevice={selectedDevice}
              isEditMode={isEditMode}
              setSelectedDevice={setSelectedDevice}
              setIsEditMode={setIsEditMode}
            />
          </div>
          
          <CustomerSummary customer={customer} />
        </div>
        
        {/* Display alert for overdue payments */}
        {overdueDevices.length > 0 && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md animate-pulse">
            <h3 className="text-lg font-semibold text-red-700 text-right mb-2">تنبيه: يوجد دفعات متأخرة!</h3>
            <ul className="list-disc list-inside pr-4 text-red-600 text-right">
              {overdueDevices.map(device => (
                <li key={device.id} className="mb-1">
                  الجهاز <span className="font-semibold">{device.name}</span> - يجب دفع القسط المتأخر قبل الاستمرار بالدفعات القادمة
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Tabs defaultValue="devices" className="glass-card p-6 border border-blue-100 shadow-md">
          <TabsList className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 p-1 rounded-md border border-blue-200">
            <TabsTrigger value="devices" className="flex items-center text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
              <Package className="w-4 h-4 ml-2" />
              الأجهزة
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
              <CreditCard className="w-4 h-4 ml-2" />
              المدفوعات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices" className="animate-fade-in focus:outline-none">
            <DevicesTab 
              devices={devices} 
              customerId={customer.id}
              onPaymentAdded={handlePaymentAdded}
              onDeviceDeleted={handleDeviceDeleted}
              onDeviceEdited={handleDeviceEdited}
            />
          </TabsContent>
          
          <TabsContent value="payments" className="animate-fade-in focus:outline-none">
            <PaymentsTab 
              payments={payments} 
              devices={devices}
              onDeletePayment={handleDeletePayment}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerDetails;

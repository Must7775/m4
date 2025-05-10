
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomerCard } from "@/components/ui/CustomerCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/button";
import { getCustomers, searchCustomers } from "@/lib/data";
import { Customer } from "@/types";
import { Plus, UserX, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Query for all customers or search results with automatic refetching
  const { data: customers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        return searchCustomers(searchQuery);
      }
      return getCustomers();
    },
    refetchInterval: 5000, // Auto-refetch every 5 seconds
    refetchOnMount: true, // This ensures data is refreshed when returning to this page
    refetchOnWindowFocus: true, // Also refetch when window regains focus
  });
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">العملاء</h1>
            <p className="text-gray-600">إدارة العملاء وبياناتهم</p>
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <Link to="/customers/new">
              <Button className="btn-primary flex items-center space-x-2 space-x-reverse">
                <Plus size={18} />
                <span>إضافة عميل</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="p-6 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-lg">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">قائمة العملاء</h3>
              </div>
              <div className="w-full md:w-96">
                <SearchBar 
                  placeholder="ابحث عن عميل (الاسم أو رقم الهاتف)..." 
                  onSearch={handleSearch}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-gray-500">جاري تحميل البيانات...</div>
              </div>
            ) : isError ? (
              <div className="glass-card p-12 text-center">
                <div className="text-red-500 mb-4">حدث خطأ أثناء تحميل البيانات</div>
                <Button onClick={() => refetch()}>إعادة المحاولة</Button>
              </div>
            ) : customers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="flex justify-center mb-4">
                  <UserX className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">لا يوجد عملاء</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? "لم يتم العثور على أي عملاء مطابقين للبحث." : "لم يتم إضافة أي عملاء بعد. يمكنك إضافة عملاء جدد لبدء استخدام النظام."}
                </p>
                <Link to="/customers/new">
                  <Button className="btn-primary">
                    إضافة عميل جديد
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customers;

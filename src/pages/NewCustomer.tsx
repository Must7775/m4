
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomerForm } from "@/components/ui/CustomerForm";
import { Link } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";

const NewCustomer = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/customers" className="hover:text-primary transition-colors">
            العملاء
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span>إضافة عميل جديد</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إضافة عميل جديد</h1>
              <p className="text-gray-600">أدخل بيانات العميل الجديد</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <CustomerForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewCustomer;

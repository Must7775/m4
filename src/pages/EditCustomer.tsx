
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EditCustomerForm } from "@/components/ui/EditCustomerForm";
import { Link } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import { getCustomerById } from "@/lib/data";
import { Customer } from "@/types";
import { toast } from "sonner";

const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load customer data on component mount
  useEffect(() => {
    const loadCustomer = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const customerData = await getCustomerById(id);
          
          if (!customerData) {
            navigate("/customers");
            toast.error("العميل غير موجود");
            return;
          }
          
          setCustomer(customerData);
        } catch (error) {
          console.error("Error loading customer:", error);
          toast.error("حدث خطأ أثناء تحميل بيانات العميل");
          navigate("/customers");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadCustomer();
  }, [id, navigate]);

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
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/customers" className="hover:text-primary transition-colors">
            العملاء
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to={`/customers/${customer.id}`} className="hover:text-primary transition-colors">
            {customer.name}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span>تعديل العميل</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">تعديل العميل</h1>
              <p className="text-gray-600">قم بتعديل بيانات العميل</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <EditCustomerForm customer={customer} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditCustomer;

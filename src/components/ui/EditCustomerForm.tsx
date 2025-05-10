
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateCustomer } from "@/lib/data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Customer } from "@/types";

interface EditCustomerFormProps {
  customer: Customer;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم العميل");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      updateCustomer(customer.id, { name: name.trim(), phone: phone.trim() });
      toast.success("تم تحديث بيانات العميل بنجاح");
      // Navigate to customer details
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث بيانات العميل");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-6">تعديل بيانات العميل</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input w-full"
            placeholder="أدخل الاسم الكامل"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input w-full"
            placeholder="أدخل رقم الهاتف"
            dir="ltr"
          />
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3 space-x-reverse">
        <Button 
          type="submit" 
          className="w-full btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "جارٍ التحديث..." : "تحديث البيانات"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/customers/${customer.id}`)}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}

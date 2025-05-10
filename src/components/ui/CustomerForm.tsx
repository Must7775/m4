
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addCustomer } from "@/lib/data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function CustomerForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const customer = await addCustomer(name.trim(), phone.trim());
      toast.success("تمت إضافة العميل بنجاح");
      
      // Invalidate customers query to refresh data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // Clear form
      setName("");
      setPhone("");
      
      // Navigate to customer details
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة العميل");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-6">إضافة عميل جديد</h2>
      
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
      
      <div className="mt-6">
        <Button 
          type="submit" 
          className="w-full btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة العميل"}
        </Button>
      </div>
    </form>
  );
}

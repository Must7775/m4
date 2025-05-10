
import { Customer } from "@/types";
import { Link } from "react-router-dom";
import { User, Phone, ChevronLeft } from "lucide-react";

interface CustomerHeaderProps {
  customer: Customer;
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  return (
    <>
      <div className="flex items-center text-sm text-gray-500 mb-8" dir="rtl">
        <Link to="/customers" className="hover:text-primary transition-colors">
          العملاء
        </Link>
        <ChevronLeft className="w-4 h-4 mx-2 rotate-180" />
        <span>{customer.name}</span>
      </div>
      
      <div className="flex items-center" dir="rtl">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ml-4">
          <User className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <Phone className="w-4 h-4 ml-2 text-blue-500" />
            <span className="text-lg">{customer.phone}</span>
          </div>
        </div>
      </div>
    </>
  );
}

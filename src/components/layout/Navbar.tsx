
import { Link, useLocation } from "react-router-dom";
import { Menu, User, Package, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="container px-4 mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link to="/" className="text-primary font-bold text-xl">
            نظام إدارة العملاء
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
          <Link 
            to="/" 
            className={`flex items-center space-x-2 space-x-reverse ${isActive('/') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary transition-colors'}`}
          >
            <Home size={18} />
            <span>الرئيسية</span>
          </Link>
          <Link 
            to="/customers" 
            className={`flex items-center space-x-2 space-x-reverse ${isActive('/customers') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary transition-colors'}`}
          >
            <User size={18} />
            <span>العملاء</span>
          </Link>
          <Link 
            to="/device-definitions" 
            className={`flex items-center space-x-2 space-x-reverse ${isActive('/device-definitions') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary transition-colors'}`}
          >
            <Package size={18} />
            <span>تعريفات الأجهزة</span>
          </Link>
        </div>
        
        {/* Mobile Navigation Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4 animate-fade-in">
          <div className="container px-4 mx-auto flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`flex items-center space-x-3 space-x-reverse p-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              <span>الرئيسية</span>
            </Link>
            <Link 
              to="/customers" 
              className={`flex items-center space-x-3 space-x-reverse p-2 rounded-md ${isActive('/customers') ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              <span>العملاء</span>
            </Link>
            <Link 
              to="/device-definitions" 
              className={`flex items-center space-x-3 space-x-reverse p-2 rounded-md ${isActive('/device-definitions') ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
              onClick={() => setIsOpen(false)}
            >
              <Package size={18} />
              <span>تعريفات الأجهزة</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

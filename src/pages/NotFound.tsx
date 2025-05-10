
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-8">الصفحة غير موجودة</p>
          <p className="text-gray-500 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link to="/">
            <Button className="btn-primary">
              العودة إلى الصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;

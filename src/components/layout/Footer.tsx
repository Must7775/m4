
export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-6 bg-white/80 backdrop-blur-sm border-t">
      <div className="container">
        <div className="text-center text-gray-500 text-sm">
          <p>نظام إدارة العملاء © {currentYear} - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}

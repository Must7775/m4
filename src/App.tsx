
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import CustomerStatement from "./pages/CustomerStatement";
import NewCustomer from "./pages/NewCustomer";
import EditCustomer from "./pages/EditCustomer";
import DeviceDefinitions from "./pages/DeviceDefinitions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<NewCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/statement/:id" element={<CustomerStatement />} />
          <Route path="/customers/edit/:id" element={<EditCustomer />} />
          <Route path="/device-definitions" element={<DeviceDefinitions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

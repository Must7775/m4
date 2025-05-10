
import { Device } from "@/types";
import { DeviceCard } from "@/components/ui/DeviceCard";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DeviceForm } from "@/components/ui/DeviceForm";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface DevicesTabProps {
  devices: Device[];
  customerId: string;
  onPaymentAdded: () => void;
  onDeviceDeleted: () => void;
  onDeviceEdited: (device: Device) => void;
}

export function DevicesTab({ 
  devices, 
  customerId, 
  onPaymentAdded, 
  onDeviceDeleted, 
  onDeviceEdited 
}: DevicesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDeviceAdded = () => {
    setIsDialogOpen(false);
    // Invalidate customers query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    // Also call the provided callback for backward compatibility
    onPaymentAdded();
  };

  // Add effect to refresh data periodically
  useEffect(() => {
    // Set up periodic refresh every 5 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    }, 5000);

    return () => clearInterval(interval);
  }, [customerId, queryClient]);

  if (devices.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => (
          <DeviceCard 
            key={device.id} 
            device={device} 
            onPaymentAdded={onPaymentAdded}
            onDeviceDeleted={onDeviceDeleted}
            onDeviceEdited={onDeviceEdited}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      <div className="flex justify-center mb-4">
        <Package className="w-16 h-16 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">لا توجد أجهزة</h3>
      <p className="text-gray-600 mb-6">
        لم يتم إضافة أي أجهزة لهذا العميل بعد.
      </p>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
            إضافة جهاز جديد
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DeviceForm customerId={customerId} onSuccess={handleDeviceAdded} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

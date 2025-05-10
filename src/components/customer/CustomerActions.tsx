
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Device } from "@/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DeviceForm } from "@/components/ui/DeviceForm";
import { Pencil, Trash2, Plus, AlertTriangle, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CustomerActionsProps {
  customerId: string;
  onDeviceAdded: () => void;
  onDeleteCustomer: () => void;
  selectedDevice: Device | null;
  isEditMode: boolean;
  setSelectedDevice: (device: Device | null) => void;
  setIsEditMode: (isEditMode: boolean) => void;
}

export function CustomerActions({
  customerId,
  onDeviceAdded,
  onDeleteCustomer,
  selectedDevice,
  isEditMode,
  setSelectedDevice,
  setIsEditMode,
}: CustomerActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  
  const handleDeviceAdded = () => {
    setIsDialogOpen(false);
    onDeviceAdded();
  };
  
  const handleDeviceEditSuccess = () => {
    setIsDeviceDialogOpen(false);
    setIsEditMode(false);
    setSelectedDevice(null);
    onDeviceAdded(); // Refresh data
  };
  
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-end">
      {/* Statement Button */}
      <Link to={`/customers/statement/${customerId}`}>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText size={18} />
          <span>كشف حساب</span>
        </Button>
      </Link>
      
      {/* Add Device Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />
            <span>إضافة جهاز</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DeviceForm customerId={customerId} onSuccess={handleDeviceAdded} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Customer Button */}
      <Link to={`/customers/edit/${customerId}`}>
        <Button variant="outline" className="flex items-center gap-2">
          <Pencil size={18} />
          <span>تعديل</span>
        </Button>
      </Link>
      
      {/* Delete Customer Button */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 size={18} />
            <span>حذف</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف العميل</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع بياناته وأجهزته والدفعات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
            <AlertDialogAction
              onClick={onDeleteCustomer}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              <span>نعم، حذف العميل</span>
            </AlertDialogAction>
            <AlertDialogCancel className="mr-auto">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Device Dialog (only shown when a device is selected for editing) */}
      {selectedDevice && (
        <Dialog open={isDeviceDialogOpen || isEditMode} onOpenChange={(open) => {
          setIsDeviceDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setSelectedDevice(null);
          }
        }}>
          <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
            <DeviceForm 
              customerId={customerId} 
              device={selectedDevice}
              onSuccess={handleDeviceEditSuccess}
              isEditMode={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

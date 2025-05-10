
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DeviceDefinition } from "@/types";
import { addDeviceDefinition, getDeviceDefinitions, updateDeviceDefinition, deleteDeviceDefinition } from "@/lib/deviceDefinitions";
import { toast } from "sonner";
import { Package, Plus, Edit, Trash2, SaveIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/data";

const DeviceDefinitions = () => {
  const [deviceDefinitions, setDeviceDefinitions] = useState<DeviceDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadDeviceDefinitions();
  }, []);

  const loadDeviceDefinitions = async () => {
    setIsLoading(true);
    try {
      const data = await getDeviceDefinitions();
      setDeviceDefinitions(data);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل تعريفات الأجهزة");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeviceDefinition = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الجهاز");
      return;
    }

    try {
      await addDeviceDefinition(
        name, 
        description, 
        purchasePrice ? Number(purchasePrice) : 0
      );
      toast.success("تمت إضافة تعريف الجهاز بنجاح");
      setName("");
      setDescription("");
      setPurchasePrice("");
      setIsDialogOpen(false);
      loadDeviceDefinitions();
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة تعريف الجهاز");
      console.error(error);
    }
  };

  const handleUpdateDeviceDefinition = async () => {
    if (!editId || !name.trim()) {
      toast.error("يرجى إدخال اسم الجهاز");
      return;
    }

    try {
      await updateDeviceDefinition(
        editId, 
        name, 
        description, 
        purchasePrice ? Number(purchasePrice) : 0
      );
      toast.success("تم تحديث تعريف الجهاز بنجاح");
      setEditId(null);
      setName("");
      setDescription("");
      setPurchasePrice("");
      setIsDialogOpen(false);
      loadDeviceDefinitions();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث تعريف الجهاز");
      console.error(error);
    }
  };

  const handleDeleteDeviceDefinition = async (id: string) => {
    try {
      await deleteDeviceDefinition(id);
      toast.success("تم حذف تعريف الجهاز بنجاح");
      loadDeviceDefinitions();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف تعريف الجهاز");
      console.error(error);
    }
  };

  const openEditDialog = (deviceDefinition: DeviceDefinition) => {
    setEditId(deviceDefinition.id);
    setName(deviceDefinition.name);
    setDescription(deviceDefinition.description || "");
    setPurchasePrice(deviceDefinition.purchasePrice.toString());
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setPurchasePrice("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">تعريفات الأجهزة</h1>
            <p className="text-gray-600">إدارة قائمة الأجهزة المتاحة للبيع</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center space-x-2 space-x-reverse">
                <Plus size={18} />
                <span>إضافة جهاز جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editId ? "تعديل تعريف الجهاز" : "إضافة تعريف جهاز جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم الجهاز</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسم الجهاز"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchasePrice">سعر الشراء</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="أدخل سعر شراء الجهاز"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أدخل وصفًا للجهاز (اختياري)"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={editId ? handleUpdateDeviceDefinition : handleAddDeviceDefinition}
                >
                  {editId ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-gray-500">جاري تحميل البيانات...</div>
          </div>
        ) : deviceDefinitions.length > 0 ? (
          <div className="glass-card p-6 border border-blue-100 shadow-md rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <TableRow>
                  <TableHead className="text-right font-medium text-gray-700">اسم الجهاز</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">سعر الشراء</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">الوصف</TableHead>
                  <TableHead className="text-center font-medium text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceDefinitions.map((definition) => (
                  <TableRow key={definition.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                    <TableCell className="font-medium">{definition.name}</TableCell>
                    <TableCell className="text-gray-600" dir="ltr">
                      {formatCurrency(definition.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {definition.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(definition)}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف تعريف الجهاز؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف تعريف الجهاز "{definition.name}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex space-x-2 space-x-reverse">
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDeviceDefinition(definition.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="glass-card p-12 text-center border border-blue-100 shadow-md rounded-xl">
            <div className="flex justify-center mb-4">
              <Package className="w-16 h-16 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">لا توجد تعريفات أجهزة</h3>
            <p className="text-gray-600 mb-6">
              لم يتم إضافة أي تعريفات أجهزة بعد. يمكنك إضافة تعريفات الأجهزة لتسهيل عملية إضافة الأجهزة للعملاء.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DeviceDefinitions;

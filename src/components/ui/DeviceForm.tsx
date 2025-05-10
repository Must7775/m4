
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDevice, updateDevice } from "@/lib/data";
import { Device, DeviceDefinition } from "@/types";
import { getDeviceDefinitions } from "@/lib/deviceDefinitions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceFormProps {
  customerId: string;
  onSuccess: () => void;
  device?: Device | null;
  isEditMode?: boolean;
}

export function DeviceForm({ customerId, onSuccess, device, isEditMode = false }: DeviceFormProps) {
  const [deviceName, setDeviceName] = useState(device?.name || "");
  const [totalPrice, setTotalPrice] = useState(device?.totalPrice.toString() || "");
  const [purchasePrice, setPurchasePrice] = useState(device?.purchasePrice?.toString() || "0");
  const [installmentsCount, setInstallmentsCount] = useState(device?.installmentsCount.toString() || "");
  const [frequency, setFrequency] = useState<"monthly" | "weekly" | "daily">(device?.frequency || "monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceDefinitions, setDeviceDefinitions] = useState<Array<DeviceDefinition>>([]);
  const [monthlyInstallment, setMonthlyInstallment] = useState(device?.monthlyInstallment?.toString() || "");
  const [selectedDefinition, setSelectedDefinition] = useState<DeviceDefinition | null>(null);
  
  useEffect(() => {
    loadDeviceDefinitions();
  }, []);
  
  useEffect(() => {
    // تحديث القسط الشهري عند تغيير السعر الكلي أو عدد الأقساط
    if (totalPrice && installmentsCount && !isNaN(Number(totalPrice)) && !isNaN(Number(installmentsCount)) && Number(installmentsCount) > 0) {
      const calculatedInstallment = Math.ceil(Number(totalPrice) / Number(installmentsCount));
      setMonthlyInstallment(calculatedInstallment.toString());
    }
  }, [totalPrice, installmentsCount]);
  
  // عند اختيار تعريف جهاز، استخدم سعر الشراء الخاص به
  useEffect(() => {
    if (selectedDefinition) {
      setPurchasePrice(selectedDefinition.purchasePrice.toString());
    }
  }, [selectedDefinition]);
  
  const loadDeviceDefinitions = async () => {
    try {
      const definitions = await getDeviceDefinitions();
      setDeviceDefinitions(definitions);
      
      // If we have a device and its name matches a definition, select it
      if (device?.name) {
        const matchingDefinition = definitions.find(def => def.name === device.name);
        if (matchingDefinition) {
          setDeviceName(matchingDefinition.name);
          setSelectedDefinition(matchingDefinition);
        }
      }
    } catch (error) {
      console.error("Error loading device definitions:", error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceName) {
      toast.error("يرجى اختيار اسم الجهاز");
      return;
    }
    
    if (!totalPrice || isNaN(Number(totalPrice)) || Number(totalPrice) <= 0) {
      toast.error("يرجى إدخال سعر صالح للجهاز");
      return;
    }
    
    if (!installmentsCount || isNaN(Number(installmentsCount)) || Number(installmentsCount) <= 0) {
      toast.error("يرجى إدخال عدد صالح للأقساط");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const calculatedInstallment = Math.ceil(Number(totalPrice) / Number(installmentsCount));
      const finalPurchasePrice = Number(purchasePrice) || 0;
      
      if (isEditMode && device) {
        await updateDevice(device.id, {
          name: deviceName,
          totalPrice: Number(totalPrice),
          purchasePrice: finalPurchasePrice,
          installmentsCount: Number(installmentsCount),
          frequency,
          monthlyInstallment: calculatedInstallment,
        });
        toast.success("تم تحديث الجهاز بنجاح");
      } else {
        await addDevice(
          customerId,
          deviceName,
          Number(totalPrice),
          Number(installmentsCount),
          frequency,
          finalPurchasePrice
        );
        toast.success("تمت إضافة الجهاز بنجاح");
        
        // إضافة نصّ توضيحي حول تاريخ الدفعة الأولى
        toast.info("سيتم احتساب تواريخ الدفعات بعد تسجيل الدفعة الأولى");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting device:", error);
      toast.error(isEditMode ? "حدث خطأ أثناء تحديث الجهاز" : "حدث خطأ أثناء إضافة الجهاز");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeviceDefinitionChange = (value: string) => {
    setDeviceName(value);
    const definition = deviceDefinitions.find(def => def.name === value);
    if (definition) {
      setSelectedDefinition(definition);
      setPurchasePrice(definition.purchasePrice.toString());
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">
          {isEditMode ? "تعديل بيانات الجهاز" : "إضافة جهاز جديد"}
        </h3>
        <p className="text-sm text-gray-500">
          {isEditMode ? "قم بتعديل بيانات الجهاز" : "أدخل بيانات الجهاز الجديد"}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="deviceName">اسم الجهاز</Label>
        <Select
          value={deviceName}
          onValueChange={handleDeviceDefinitionChange}
        >
          <SelectTrigger className="form-input">
            <SelectValue placeholder="اختر اسم الجهاز" />
          </SelectTrigger>
          <SelectContent>
            {deviceDefinitions.map((def) => (
              <SelectItem key={def.id} value={def.name}>
                {def.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {deviceDefinitions.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            لا يوجد تعريفات أجهزة متاحة. يمكنك 
            <a href="/device-definitions" className="text-blue-600 underline mr-1">
              إضافة تعريفات الأجهزة
            </a>
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="totalPrice">سعر البيع</Label>
        <Input
          id="totalPrice"
          type="number"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          placeholder="أدخل سعر البيع"
          className="form-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="purchasePrice">سعر الشراء</Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder="أدخل سعر الشراء"
          className="form-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="installmentsCount">عدد الأقساط</Label>
        <Input
          id="installmentsCount"
          type="number"
          value={installmentsCount}
          onChange={(e) => setInstallmentsCount(e.target.value)}
          placeholder="أدخل عدد الأقساط"
          className="form-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="frequency">تكرار الدفع</Label>
        <Select
          value={frequency}
          onValueChange={(value) => setFrequency(value as "monthly" | "weekly" | "daily")}
        >
          <SelectTrigger id="frequency" className="form-input">
            <SelectValue placeholder="اختر تكرار الدفع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">شهري</SelectItem>
            <SelectItem value="weekly">أسبوعي</SelectItem>
            <SelectItem value="daily">يومي</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="monthlyInstallment">القسط الشهري (محسوب تلقائيًا)</Label>
        <Input
          id="monthlyInstallment"
          type="number"
          value={monthlyInstallment}
          readOnly
          className="form-input bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          *يتم حساب القسط الشهري تلقائيًا بناءً على السعر الكلي وعدد الأقساط
        </p>
      </div>
      
      {!isEditMode && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-blue-600">
            <strong>ملاحظة:</strong> سيتم احتساب تواريخ الدفعات المستقبلية بعد تسجيل الدفعة الأولى للجهاز.
          </p>
        </div>
      )}
      
      {/* Calculate expected profit if both prices are entered */}
      {Number(totalPrice) > 0 && Number(purchasePrice) > 0 && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-md border border-green-100">
          <div className="text-sm font-medium text-green-800">الربح المتوقع</div>
          <div className="flex justify-between mt-2">
            <div>
              <div className="text-xs text-gray-500">القيمة</div>
              <div className="font-semibold text-green-700" dir="ltr">
                {(Number(totalPrice) - Number(purchasePrice)).toLocaleString('en-US') + " د.ع"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">النسبة</div>
              <div className="font-semibold text-green-700">
                {Number(purchasePrice) > 0 
                  ? ((Number(totalPrice) - Number(purchasePrice)) / Number(purchasePrice) * 100).toFixed(1) + "%" 
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-4 flex justify-end">
        <Button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting 
            ? "جاري الحفظ..." 
            : isEditMode 
              ? "تحديث الجهاز"
              : "إضافة الجهاز"
          }
        </Button>
      </div>
    </form>
  );
}

import { supabase } from "@/integrations/supabase/client";
import { Customer, Device, Payment } from "@/types";

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Customer CRUD operations
export async function addCustomer(name: string, phone: string): Promise<Customer> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      phone,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding customer:", error);
    throw error;
  }

  // Type assertion for Supabase result
  const customerData = data as any;

  return {
    id: customerData.id,
    name: customerData.name,
    phone: customerData.phone,
    devices: [],
    totalDue: 0,
    totalPaid: 0,
    balance: 0
  };
}

export async function getCustomers(): Promise<Customer[]> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*");

  if (error) {
    console.error("Error getting customers:", error);
    throw error;
  }

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select("*");

  if (devicesError) {
    console.error("Error getting devices:", devicesError);
    throw devicesError;
  }

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*");

  if (paymentsError) {
    console.error("Error getting payments:", paymentsError);
    throw paymentsError;
  }

  // Use type assertions for Supabase results
  const customersData = customers as any[];
  const devicesData = devices as any[];
  const paymentsData = payments as any[];

  return customersData.map(customer => {
    const customerDevices = devicesData.filter(device => device.customer_id === customer.id) || [];
    const totalDue = customerDevices.reduce((sum, device) => sum + Number(device.total_price), 0);
    const deviceIds = customerDevices.map(device => device.id);
    const customerPayments = paymentsData.filter(payment => deviceIds.includes(payment.device_id)) || [];
    const totalPaid = customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = totalDue - totalPaid;
    
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      devices: customerDevices.map(device => {
        const devicePayments = paymentsData.filter(payment => payment.device_id === device.id) || [];
        const amountPaid = devicePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const balance = Number(device.total_price) - amountPaid;
        
        // Use a type assertion to handle the frequency property, since it might not be in the database schema
        const deviceWithFrequency = device as any;
        
        return {
          id: device.id,
          customerId: device.customer_id,
          name: device.name,
          totalPrice: Number(device.total_price),
          purchasePrice: Number(device.purchase_price || 0),
          installmentsCount: device.installments_count,
          monthlyInstallment: Number(device.monthly_installment),
          amountPaid: amountPaid,
          balance: balance,
          frequency: deviceWithFrequency.frequency || "monthly",
          payments: devicePayments.map(payment => ({
            id: payment.id,
            deviceId: payment.device_id,
            customerId: payment.customer_id,
            amount: Number(payment.amount),
            date: payment.date
          }))
        };
      }),
      totalDue,
      totalPaid,
      balance
    };
  });
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting customer:", error);
    return undefined;
  }

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select("*")
    .eq("customer_id", id);

  if (devicesError) {
    console.error("Error getting devices:", devicesError);
    throw devicesError;
  }

  const deviceIds = (devices as any[]).map(device => device.id);
  
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .in("device_id", deviceIds.length > 0 ? deviceIds : ['no-devices']);

  if (paymentsError && deviceIds.length > 0) {
    console.error("Error getting payments:", paymentsError);
    throw paymentsError;
  }

  // Use type assertions for Supabase results
  const customerData = customer as any;
  const devicesData = devices as any[] || [];
  const paymentsData = payments as any[] || [];

  const customerDevices = devicesData || [];
  const totalDue = customerDevices.reduce((sum, device) => sum + Number(device.total_price), 0);
  const customerPayments = paymentsData || [];
  const totalPaid = customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = totalDue - totalPaid;
  
  return {
    id: customerData.id,
    name: customerData.name,
    phone: customerData.phone,
    devices: customerDevices.map(device => {
      const devicePayments = paymentsData ? paymentsData.filter(payment => payment.device_id === device.id) : [];
      const amountPaid = devicePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const balance = Number(device.total_price) - amountPaid;
      
      // Use a type assertion to handle the frequency property
      const deviceWithFrequency = device as any;
      
      return {
        id: device.id,
        customerId: device.customer_id,
        name: device.name,
        totalPrice: Number(device.total_price),
        purchasePrice: Number(device.purchase_price || 0),
        installmentsCount: device.installments_count,
        monthlyInstallment: Number(device.monthly_installment),
        amountPaid: amountPaid,
        balance: balance,
        frequency: deviceWithFrequency.frequency || "monthly",
        payments: devicePayments.map(payment => ({
          id: payment.id,
          deviceId: payment.device_id,
          customerId: payment.customer_id,
          amount: Number(payment.amount),
          date: payment.date
        }))
      };
    }),
    totalDue,
    totalPaid,
    balance
  };
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("customers")
    .update({
      name: data.name,
      phone: data.phone,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating customer:", error);
    throw error;
  }

  return getCustomerById(id);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  console.log("Attempting to delete customer with ID:", id);
  
  // Delete from Supabase
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer from Supabase:", error);
    return false;
  }
  
  console.log("Customer deleted successfully from Supabase");
  return true;
}

// Device CRUD operations
export async function addDevice(
  customerId: string, 
  name: string, 
  totalPrice: number, 
  installmentsCount: number,
  frequency: "monthly" | "weekly" | "daily" = "monthly",
  purchasePrice: number = 0
): Promise<Device> {
  const monthlyInstallment = Math.ceil(totalPrice / installmentsCount);
  
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data, error } = await supabase
    .from("devices")
    .insert({
      customer_id: customerId,
      name,
      total_price: totalPrice,
      purchase_price: purchasePrice,
      installments_count: installmentsCount,
      monthly_installment: monthlyInstallment,
      frequency: frequency,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding device:", error);
    throw error;
  }

  // Use a type assertion to handle the resulting data
  const deviceData = data as any;

  return {
    id: deviceData.id,
    customerId: deviceData.customer_id,
    name: deviceData.name,
    totalPrice: Number(deviceData.total_price),
    purchasePrice: Number(deviceData.purchase_price),
    installmentsCount: deviceData.installments_count,
    monthlyInstallment: Number(deviceData.monthly_installment),
    amountPaid: 0,
    balance: Number(deviceData.total_price),
    payments: [],
    frequency: deviceData.frequency || "monthly",
  };
}

export async function getDeviceById(id: string): Promise<Device | undefined> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: device, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting device:", error);
    return undefined;
  }

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .eq("device_id", id);

  if (paymentsError) {
    console.error("Error getting payments:", paymentsError);
    throw paymentsError;
  }

  // Use type assertions for Supabase results
  const deviceData = device as any;
  const paymentsData = payments as any[] || [];

  const devicePayments = paymentsData || [];
  const amountPaid = devicePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = Number(deviceData.total_price) - amountPaid;
  
  return {
    id: deviceData.id,
    customerId: deviceData.customer_id,
    name: deviceData.name,
    totalPrice: Number(deviceData.total_price),
    purchasePrice: Number(device.purchase_price || 0),
    installmentsCount: deviceData.installments_count,
    monthlyInstallment: Number(deviceData.monthly_installment),
    amountPaid: amountPaid,
    balance: balance,
    payments: devicePayments.map(payment => ({
      id: payment.id,
      deviceId: payment.device_id,
      customerId: payment.customer_id,
      amount: Number(payment.amount),
      date: payment.date
    })),
    frequency: deviceData.frequency || "monthly",
  };
}

export async function getDevicesByCustomerId(customerId: string): Promise<Device[]> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: devices, error } = await supabase
    .from("devices")
    .select("*")
    .eq("customer_id", customerId);

  if (error) {
    console.error("Error getting devices:", error);
    throw error;
  }

  if (!devices.length) {
    return [];
  }

  const deviceIds = (devices as any[]).map(device => device.id);

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .in("device_id", deviceIds);

  if (paymentsError) {
    console.error("Error getting payments:", paymentsError);
    throw paymentsError;
  }

  // Use type assertions for Supabase results
  const devicesData = devices as any[];
  const paymentsData = payments as any[] || [];

  return devicesData.map(device => {
    const devicePayments = paymentsData ? paymentsData.filter(payment => payment.device_id === device.id) : [];
    const amountPaid = devicePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Number(device.total_price) - amountPaid;
    
    return {
      id: device.id,
      customerId: device.customer_id,
      name: device.name,
      totalPrice: Number(device.total_price),
      purchasePrice: Number(device.purchase_price || 0),
      installmentsCount: device.installments_count,
      monthlyInstallment: Number(device.monthly_installment),
      amountPaid: amountPaid,
      balance: balance,
      payments: devicePayments.map(payment => ({
        id: payment.id,
        deviceId: payment.device_id,
        customerId: payment.customer_id,
        amount: Number(payment.amount),
        date: payment.date
      })),
      frequency: device.frequency || "monthly",
    };
  });
}

export async function updateDevice(id: string, data: Partial<Device>): Promise<Device | undefined> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("devices")
    .update({
      name: data.name,
      total_price: data.totalPrice,
      purchase_price: data.purchasePrice,
      installments_count: data.installmentsCount,
      monthly_installment: data.monthlyInstallment,
      frequency: data.frequency,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating device:", error);
    throw error;
  }

  return getDeviceById(id);
}

export async function deleteDevice(id: string): Promise<boolean> {
  // Supabase will handle cascading deletes due to ON DELETE CASCADE constraint
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("devices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting device:", error);
    return false;
  }

  return true;
}

// Payment operations
export async function addPayment(deviceId: string, customerId: string, amount: number, date: string): Promise<Payment> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data, error } = await supabase
    .from("payments")
    .insert({
      device_id: deviceId,
      customer_id: customerId,
      amount: amount,
      date: date,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding payment:", error);
    throw error;
  }

  // Type assertion for Supabase result
  const paymentData = data as any;

  return {
    id: paymentData.id,
    deviceId: paymentData.device_id,
    customerId: paymentData.customer_id,
    amount: Number(paymentData.amount),
    date: paymentData.date
  };
}

export async function getPaymentsByDeviceId(deviceId: string): Promise<Payment[]> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("device_id", deviceId);

  if (error) {
    console.error("Error getting payments:", error);
    throw error;
  }

  // Use type assertions for Supabase results
  const paymentsData = payments as any[];

  return paymentsData.map(payment => ({
    id: payment.id,
    deviceId: payment.device_id,
    customerId: payment.customer_id,
    amount: Number(payment.amount),
    date: payment.date
  }));
}

export async function getPaymentsByCustomerId(customerId: string): Promise<Payment[]> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("customer_id", customerId);

  if (error) {
    console.error("Error getting payments:", error);
    throw error;
  }

  // Use type assertions for Supabase results
  const paymentsData = payments as any[];

  return paymentsData.map(payment => ({
    id: payment.id,
    deviceId: payment.device_id,
    customerId: payment.customer_id,
    amount: Number(payment.amount),
    date: payment.date
  }));
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("payments")
    .update({
      amount: data.amount,
      date: data.date,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating payment:", error);
    throw error;
  }

  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching updated payment:", fetchError);
    return undefined;
  }

  // Type assertion for Supabase result
  const paymentData = payment as any;

  return {
    id: paymentData.id,
    deviceId: paymentData.device_id,
    customerId: paymentData.customer_id,
    amount: Number(paymentData.amount),
    date: paymentData.date
  };
}

export async function deletePayment(id: string): Promise<boolean> {
  // @ts-ignore - Suppress TypeScript error for the next line
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting payment:", error);
    return false;
  }

  return true;
}

// Search functionality
export async function searchCustomers(query: string): Promise<Customer[]> {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return getCustomers();
  }
  
  // @ts-ignore - Suppress TypeScript error for the next line
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .or(`name.ilike.%${normalizedQuery}%,phone.ilike.%${normalizedQuery}%`);

  if (error) {
    console.error("Error searching customers:", error);
    throw error;
  }

  // Need to get devices and payments to calculate totals
  return getCustomers().then(allCustomers => {
    return allCustomers.filter(c => 
      (customers as any[]).some(searchResult => searchResult.id === c.id)
    );
  });
}

// Format currency
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US') + " د.ع";
}

// Calculate remaining period based on frequency
export function calculateRemainingPeriod(device: Device): string {
  if (!device || device.balance <= 0) {
    return "تم السداد بالكامل";
  }

  const remainingInstallments = Math.max(
    Math.ceil(device.balance / device.monthlyInstallment),
    0
  );

  if (remainingInstallments <= 0) return "تم السداد بالكامل";

  switch (device.frequency) {
    case "daily":
      return `${remainingInstallments} يوم متبقي`;
    case "weekly":
      return `${remainingInstallments} أسبوع متبقي`;
    case "monthly":
    default:
      return `${remainingInstallments} شهر متبقي`;
  }
}

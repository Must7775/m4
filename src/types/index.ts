
export interface Customer {
  id: string;
  name: string;
  phone: string;
  devices: Device[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}

export interface Device {
  id: string;
  customerId: string;
  name: string;
  totalPrice: number;
  purchasePrice: number; // Added purchase price field
  installmentsCount: number;
  monthlyInstallment: number;
  amountPaid: number;
  balance: number;
  frequency: "monthly" | "weekly" | "daily";
  payments: Payment[];
}

export interface Payment {
  id: string;
  deviceId: string;
  customerId: string;
  amount: number;
  date: string;
}

export interface DeviceDefinition {
  id: string;
  name: string;
  description?: string;
  purchasePrice: number; // Added purchase price field
  createdAt: string;
}

// Add types for direct database operations
export interface DeviceDefinitionInsert {
  name: string;
  description?: string;
  purchase_price?: number;
  created_at?: string;
}

export interface DeviceDefinitionUpdate {
  name?: string;
  description?: string;
  purchase_price?: number;
}

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';

export type FuelType = 'CNG' | 'PETROL' | 'DIESEL' | 'EV';

export interface VehicleLocation {
  lat: number;
  lng: number;
  speed: number;
  ignition: boolean;
  heading?: number;
  updated_at: string;
}

export interface VehicleDocuments {
  insurance_expiry: string; // ISO date
  fitness_expiry: string;
  permit_expiry: string;
  puc_expiry: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  status: VehicleStatus;
  current_odometer: number;
  fuel_level: number; // 0 - 100 percentage
  fuel_type: FuelType;
  chassis_number: string;
  purchase_date: string;
  purchase_cost: number;
  daily_rent_rate: number;
  assigned_driver_id: string | null;
  current_shift_id: string | null;
  last_location: VehicleLocation;
  documents: VehicleDocuments;
}

export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  security_deposit: number;
  status: DriverStatus;
  current_balance: number; // negative indicates debt / deficit
  photo_url?: string;
  joined_date: string;
  assigned_vehicle_id: string | null;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';
export type PaymentMode = 'CASH' | 'UPI' | 'NETBANKING';

export interface GpsPoint {
  lat: number;
  lng: number;
  speed: number;
  ignition?: boolean;
  timestamp: string;
}

export interface Shift {
  id: string;
  vehicle_id: string;
  driver_id: string;
  start_time: string;
  end_time: string | null;
  start_odometer: number;
  end_odometer: number | null;
  total_km: number | null;
  start_fuel: number;
  end_fuel: number | null;
  pre_damages: string[];
  post_damages: string[];
  rent_amount: number;
  penalties: number;
  total_due: number;
  payment_status: PaymentStatus;
  paid_amount: number;
  notes: string;
  gps_trail: GpsPoint[];
}

export type ExpenseCategory =
  | 'SERVICING'
  | 'PUNCTURE'
  | 'OIL_CHANGE'
  | 'CHALLAN'
  | 'CNG_TEST'
  | 'YARD_RENT'
  | 'OTHER';

export interface Expense {
  id: string;
  vehicle_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  receipt_number: string;
}

export interface CollectionRecord {
  id: string;
  shift_id: string;
  driver_id: string;
  amount: number;
  payment_mode: PaymentMode;
  upi_ref?: string;
  collected_at: string;
  collected_by: string;
  receipt_number: string;
}

export interface TelematicsPingPayload {
  device_id: string;
  lat: number;
  lng: number;
  speed: number;
  ignition: boolean;
  heading?: number;
  timestamp: string;
}

export type DocumentComplianceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface DocumentStatusInfo {
  docType: 'insurance' | 'fitness' | 'permit' | 'puc';
  label: string;
  expiryDate: string;
  status: DocumentComplianceStatus;
  daysRemaining: number;
}

import { Vehicle, Driver, Shift, Expense, CollectionRecord, TelematicsPingPayload } from '@/types';

// Client-side API fetchers and sync helpers
export async function apiGetVehicles(): Promise<Vehicle[]> {
  const res = await fetch('/api/vehicles', { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export async function apiGetDrivers(): Promise<Driver[]> {
  const res = await fetch('/api/drivers', { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export async function apiGetShifts(): Promise<Shift[]> {
  const res = await fetch('/api/shifts', { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export async function apiGetCollections(): Promise<CollectionRecord[]> {
  const res = await fetch('/api/finances/collections', { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export async function apiGetExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/finances/expenses', { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export async function apiCheckOutShift(payload: {
  vehicle_id: string;
  driver_id: string;
  start_odometer: number;
  start_fuel: number;
  pre_damages: string[];
  rent_amount: number;
  notes?: string;
}) {
  const res = await fetch('/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiCheckInShift(payload: {
  shift_id: string;
  end_odometer: number;
  end_fuel: number;
  end_time?: string;
  post_damages?: string[];
  penalties?: number;
  total_due?: number;
  notes?: string;
  next_status?: 'AVAILABLE' | 'MAINTENANCE';
}) {
  const res = await fetch('/api/shifts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiSendTelematicsPing(payload: TelematicsPingPayload) {
  const res = await fetch('/api/telematics/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiRecordPayment(payload: {
  shift_id: string;
  driver_id: string;
  amount: number;
  payment_mode: 'CASH' | 'UPI' | 'NETBANKING';
  upi_ref?: string;
  collected_by?: string;
}) {
  const res = await fetch('/api/finances/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiAddExpense(payload: {
  vehicle_id: string;
  category: string;
  description: string;
  amount: number;
  date?: string;
}) {
  const res = await fetch('/api/finances/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiResetSeeds() {
  const res = await fetch('/api/seed', { method: 'POST' });
  return res.json();
}

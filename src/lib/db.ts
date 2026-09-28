import {
  Vehicle,
  Driver,
  Shift,
  Expense,
  CollectionRecord,
  TelematicsPingPayload,
} from '@/types';

// In-memory persistent state container for Next.js server runtime
interface FleetDatabase {
  vehicles: Vehicle[];
  drivers: Driver[];
  shifts: Shift[];
  expenses: Expense[];
  collections: CollectionRecord[];
}

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    plate_number: 'DL 1TA 4821',
    model: 'Maruti WagonR Tour H3 CNG',
    status: 'ASSIGNED',
    current_odometer: 84320,
    fuel_level: 68,
    fuel_type: 'CNG',
    chassis_number: 'MA3EWBF1S00184920',
    purchase_date: '2023-04-12',
    purchase_cost: 675000,
    daily_rent_rate: 800,
    assigned_driver_id: 'drv-001',
    current_shift_id: 'sh-001',
    last_location: {
      lat: 28.6315,
      lng: 77.2167,
      speed: 38,
      ignition: true,
      heading: 145,
      updated_at: '2026-09-27T17:28:00Z',
    },
    documents: {
      fitness_expiry: '2027-04-10', // Valid
      permit_expiry: '2026-10-08',  // Expiring in ~11 days (YELLOW)
      insurance_expiry: '2027-03-15', // Valid
      puc_expiry: '2026-11-20',     // Valid
    },
  },
  {
    id: 'veh-002',
    plate_number: 'HR 55 AJ 9012',
    model: 'Maruti Suzuki Dzire Tour S CNG',
    status: 'ASSIGNED',
    current_odometer: 112450,
    fuel_level: 82,
    fuel_type: 'CNG',
    chassis_number: 'MBHFA71BSM0491024',
    purchase_date: '2022-11-20',
    purchase_cost: 740000,
    daily_rent_rate: 850,
    assigned_driver_id: 'drv-002',
    current_shift_id: 'sh-002',
    last_location: {
      lat: 28.4950,
      lng: 77.0895,
      speed: 0,
      ignition: true, // Idling in Cyber Hub
      heading: 90,
      updated_at: '2026-09-27T17:30:15Z',
    },
    documents: {
      fitness_expiry: '2026-09-15', // EXPIRED (RED)
      permit_expiry: '2027-08-30',  // Valid
      insurance_expiry: '2026-10-05', // Expiring in 8 days (YELLOW)
      puc_expiry: '2026-12-01',     // Valid
    },
  },
  {
    id: 'veh-003',
    plate_number: 'UP 16 BT 3344',
    model: 'Maruti Suzuki Ertiga Tour M CNG (7-Seater)',
    status: 'AVAILABLE',
    current_odometer: 64280,
    fuel_level: 95,
    fuel_type: 'CNG',
    chassis_number: 'MA3ERDA1SL0098231',
    purchase_date: '2024-02-15',
    purchase_cost: 1020000,
    daily_rent_rate: 1100,
    assigned_driver_id: null,
    current_shift_id: null,
    last_location: {
      lat: 28.6280,
      lng: 77.3649, // Parked in Yard: Sector 62 Noida
      speed: 0,
      ignition: false, // Parked / Ignition OFF
      heading: 0,
      updated_at: '2026-09-27T14:10:00Z',
    },
    documents: {
      fitness_expiry: '2027-02-14', // Valid
      permit_expiry: '2027-02-14',  // Valid
      insurance_expiry: '2027-02-14', // Valid
      puc_expiry: '2026-10-09',     // Expiring in 12 days (YELLOW)
    },
  },
  {
    id: 'veh-004',
    plate_number: 'DL 1ZB 7789',
    model: 'Tata Tigor EV (Commercial Fleet Edition)',
    status: 'MAINTENANCE',
    current_odometer: 48920,
    fuel_level: 42,
    fuel_type: 'EV',
    chassis_number: 'MAT615394PLB12091',
    purchase_date: '2024-06-01',
    purchase_cost: 1180000,
    daily_rent_rate: 900,
    assigned_driver_id: null,
    current_shift_id: null,
    last_location: {
      lat: 28.5355,
      lng: 77.2690, // Okhla Phase 3 Workshop
      speed: 0,
      ignition: false, // Parked in Service Station
      heading: 270,
      updated_at: '2026-09-27T11:00:00Z',
    },
    documents: {
      fitness_expiry: '2028-05-30', // Valid
      permit_expiry: '2027-05-30',  // Valid
      insurance_expiry: '2027-05-30', // Valid
      puc_expiry: '2028-05-30',     // Valid (EV)
    },
  },
  {
    id: 'veh-005',
    plate_number: 'UP 14 ET 1122',
    model: 'Hyundai Aura Prime CNG',
    status: 'ASSIGNED',
    current_odometer: 91100,
    fuel_level: 54,
    fuel_type: 'CNG',
    chassis_number: 'MALBK41BCLM094182',
    purchase_date: '2023-08-10',
    purchase_cost: 785000,
    daily_rent_rate: 850,
    assigned_driver_id: 'drv-003',
    current_shift_id: 'sh-003',
    last_location: {
      lat: 28.6469,
      lng: 77.3160, // Near Anand Vihar ISBT
      speed: 46,
      ignition: true, // Moving
      heading: 220,
      updated_at: '2026-09-27T17:32:00Z',
    },
    documents: {
      fitness_expiry: '2027-08-09',
      permit_expiry: '2026-09-20', // EXPIRED (RED)
      insurance_expiry: '2027-08-09',
      puc_expiry: '2026-12-15',
    },
  },
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-001',
    full_name: 'Rajesh Kumar',
    phone: '+91 98101 23456',
    license_number: 'DL-0420180019284',
    security_deposit: 10000,
    status: 'ACTIVE',
    current_balance: -300, // Deficit of ₹300 carried over
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joined_date: '2024-01-15',
    assigned_vehicle_id: 'veh-001',
  },
  {
    id: 'drv-002',
    full_name: 'Amit Singh',
    phone: '+91 98712 34567',
    license_number: 'HR-2620190084311',
    security_deposit: 10000,
    status: 'ACTIVE',
    current_balance: 0, // Clear
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joined_date: '2023-11-10',
    assigned_vehicle_id: 'veh-002',
  },
  {
    id: 'drv-003',
    full_name: 'Mohammad Imran',
    phone: '+91 99110 56789',
    license_number: 'UP-1420200051290',
    security_deposit: 12000,
    status: 'ACTIVE',
    current_balance: -850, // Pending today's rent
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    joined_date: '2024-03-01',
    assigned_vehicle_id: 'veh-005',
  },
  {
    id: 'drv-004',
    full_name: 'Vikram Sharma',
    phone: '+91 98188 44321',
    license_number: 'DL-0120170067823',
    security_deposit: 10000,
    status: 'ACTIVE',
    current_balance: 500, // Advance credit of ₹500
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    joined_date: '2023-06-20',
    assigned_vehicle_id: null, // Ready for handoff
  },
  {
    id: 'drv-005',
    full_name: 'Suresh Yadav',
    phone: '+91 97177 88990',
    license_number: 'UP-1620160032918',
    security_deposit: 10000,
    status: 'ACTIVE',
    current_balance: -1600, // 2 days rent deficit
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    joined_date: '2022-09-05',
    assigned_vehicle_id: null,
  },
];

// Seed GPS trail from Delhi Airport to Connaught Place
const DELHI_GPS_TRAIL = [
  { lat: 28.5562, lng: 77.1000, speed: 45, timestamp: '2026-09-27T08:15:00Z' }, // Airport T3
  { lat: 28.5720, lng: 77.1350, speed: 58, timestamp: '2026-09-27T08:30:00Z' }, // Dhaula Kuan
  { lat: 28.5980, lng: 77.1720, speed: 32, timestamp: '2026-09-27T08:50:00Z' }, // Chanakyapuri
  { lat: 28.6140, lng: 77.1990, speed: 20, timestamp: '2026-09-27T09:10:00Z' }, // India Gate Circle
  { lat: 28.6289, lng: 77.2065, speed: 15, timestamp: '2026-09-27T09:25:00Z' }, // Janpath
  { lat: 28.6315, lng: 77.2167, speed: 38, timestamp: '2026-09-27T09:40:00Z' }, // Connaught Place
  { lat: 28.6420, lng: 77.2280, speed: 42, timestamp: '2026-09-27T10:15:00Z' }, // New Delhi Rly Stn
  { lat: 28.6500, lng: 77.2370, speed: 28, timestamp: '2026-09-27T11:00:00Z' }, // Red Fort / Chandni Chowk
  { lat: 28.6315, lng: 77.2167, speed: 38, timestamp: '2026-09-27T17:28:00Z' }, // Return to CP
];

const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'sh-001',
    vehicle_id: 'veh-001',
    driver_id: 'drv-001',
    start_time: '2026-09-27T07:30:00Z',
    end_time: null, // Active shift
    start_odometer: 84190,
    end_odometer: null,
    total_km: null,
    start_fuel: 90,
    end_fuel: null,
    pre_damages: ['Minor scratch on rear left bumper'],
    post_damages: [],
    rent_amount: 800,
    penalties: 0,
    total_due: 800,
    payment_status: 'PARTIAL',
    paid_amount: 500,
    notes: 'Airport morning dispatch queue',
    gps_trail: DELHI_GPS_TRAIL,
  },
  {
    id: 'sh-002',
    vehicle_id: 'veh-002',
    driver_id: 'drv-002',
    start_time: '2026-09-27T06:45:00Z',
    end_time: null, // Active shift
    start_odometer: 112310,
    end_odometer: null,
    total_km: null,
    start_fuel: 85,
    end_fuel: null,
    pre_damages: ['Small dent on right fender'],
    post_damages: [],
    rent_amount: 850,
    penalties: 0,
    total_due: 850,
    payment_status: 'PAID',
    paid_amount: 850,
    notes: 'Corporate client pick-up Gurgaon',
    gps_trail: [
      { lat: 28.4595, lng: 77.0266, speed: 50, timestamp: '2026-09-27T07:00:00Z' }, // Gurgaon Sector 29
      { lat: 28.4810, lng: 77.0650, speed: 65, timestamp: '2026-09-27T07:45:00Z' }, // IFFCO Chowk
      { lat: 28.4950, lng: 77.0895, speed: 0, timestamp: '2026-09-27T17:30:15Z' },  // Cyber Hub
    ],
  },
  {
    id: 'sh-003',
    vehicle_id: 'veh-005',
    driver_id: 'drv-003',
    start_time: '2026-09-27T08:00:00Z',
    end_time: null, // Active shift
    start_odometer: 90980,
    end_odometer: null,
    total_km: null,
    start_fuel: 75,
    end_fuel: null,
    pre_damages: [],
    post_damages: [],
    rent_amount: 850,
    penalties: 0,
    total_due: 850,
    payment_status: 'PENDING',
    paid_amount: 0,
    notes: 'Ghaziabad Anand Vihar Inter-state route',
    gps_trail: [
      { lat: 28.6700, lng: 77.4200, speed: 52, timestamp: '2026-09-27T08:30:00Z' }, // Ghaziabad Old Bus Stand
      { lat: 28.6469, lng: 77.3160, speed: 46, timestamp: '2026-09-27T17:32:00Z' }, // Anand Vihar
    ],
  },
  // Completed shift for playback audit
  {
    id: 'sh-hist-0926',
    vehicle_id: 'veh-003',
    driver_id: 'drv-004',
    start_time: '2026-09-26T07:00:00Z',
    end_time: '2026-09-26T19:30:00Z',
    start_odometer: 64110,
    end_odometer: 64280,
    total_km: 170,
    start_fuel: 95,
    end_fuel: 95,
    pre_damages: [],
    post_damages: [],
    rent_amount: 1100,
    penalties: 0,
    total_due: 1100,
    payment_status: 'PAID',
    paid_amount: 1100,
    notes: 'Completed Noida - Airport return duty. Checked in clean.',
    gps_trail: [
      { lat: 28.6280, lng: 77.3649, speed: 0, timestamp: '2026-09-26T07:00:00Z' },
      { lat: 28.5850, lng: 77.3120, speed: 55, timestamp: '2026-09-26T08:15:00Z' },
      { lat: 28.5562, lng: 77.1000, speed: 60, timestamp: '2026-09-26T09:45:00Z' },
      { lat: 28.5980, lng: 77.1720, speed: 35, timestamp: '2026-09-26T13:20:00Z' },
      { lat: 28.6280, lng: 77.3649, speed: 0, timestamp: '2026-09-26T19:30:00Z' },
    ],
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    vehicle_id: 'veh-001',
    category: 'OIL_CHANGE',
    description: 'Castrol Magnatec 5W-30 Synthetic engine oil change + oil filter',
    amount: 2200,
    date: '2026-09-24',
    receipt_number: 'EXP-2026-901',
  },
  {
    id: 'exp-002',
    vehicle_id: 'veh-002',
    category: 'PUNCTURE',
    description: 'Rear left tubeless tyre puncture repair + nitrogen top-up',
    amount: 180,
    date: '2026-09-25',
    receipt_number: 'EXP-2026-902',
  },
  {
    id: 'exp-003',
    vehicle_id: 'veh-004',
    category: 'SERVICING',
    description: 'Front disc brake pad replacement & caliper greasing (Okhla Workshop)',
    amount: 3450,
    date: '2026-09-26',
    receipt_number: 'EXP-2026-903',
  },
  {
    id: 'exp-004',
    vehicle_id: 'veh-003',
    category: 'CNG_TEST',
    description: 'Government approved 3-year CNG Hydro-testing cylinder certificate',
    amount: 2800,
    date: '2026-09-18',
    receipt_number: 'EXP-2026-880',
  },
];

const INITIAL_COLLECTIONS: CollectionRecord[] = [
  {
    id: 'col-001',
    shift_id: 'sh-001',
    driver_id: 'drv-001',
    amount: 500,
    payment_mode: 'UPI',
    upi_ref: 'UPI/627019842190',
    collected_at: '2026-09-27T08:10:00Z',
    collected_by: 'Yard Supervisor Sunil',
    receipt_number: 'FP-REC-2026-041',
  },
  {
    id: 'col-002',
    shift_id: 'sh-002',
    driver_id: 'drv-002',
    amount: 850,
    payment_mode: 'CASH',
    collected_at: '2026-09-27T07:05:00Z',
    collected_by: 'Fleet Manager Rakesh',
    receipt_number: 'FP-REC-2026-042',
  },
  {
    id: 'col-003',
    shift_id: 'sh-hist-0926',
    driver_id: 'drv-004',
    amount: 1100,
    payment_mode: 'UPI',
    upi_ref: 'UPI/626910041289',
    collected_at: '2026-09-26T19:35:00Z',
    collected_by: 'Yard Supervisor Sunil',
    receipt_number: 'FP-REC-2026-039',
  },
];

// Global in-memory singleton to persist state across API calls in the same server instance
class FleetStore {
  private data: FleetDatabase;

  constructor() {
    this.data = {
      vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
      drivers: JSON.parse(JSON.stringify(INITIAL_DRIVERS)),
      shifts: JSON.parse(JSON.stringify(INITIAL_SHIFTS)),
      expenses: JSON.parse(JSON.stringify(INITIAL_EXPENSES)),
      collections: JSON.parse(JSON.stringify(INITIAL_COLLECTIONS)),
    };
  }

  public resetToSeeds() {
    this.data = {
      vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
      drivers: JSON.parse(JSON.stringify(INITIAL_DRIVERS)),
      shifts: JSON.parse(JSON.stringify(INITIAL_SHIFTS)),
      expenses: JSON.parse(JSON.stringify(INITIAL_EXPENSES)),
      collections: JSON.parse(JSON.stringify(INITIAL_COLLECTIONS)),
    };
    return this.data;
  }

  public clearAllData() {
    this.data = {
      vehicles: [],
      drivers: [],
      shifts: [],
      expenses: [],
      collections: [],
    };
    return this.data;
  }

  // Vehicles
  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.data.vehicles.find((v) => v.id === id || v.plate_number.replace(/\s+/g, '') === id.replace(/\s+/g, ''));
  }

  public addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const id = `veh-${Date.now().toString().slice(-6)}`;
    const newVehicle: Vehicle = { ...vehicle, id };
    this.data.vehicles.unshift(newVehicle);
    return newVehicle;
  }

  public deleteVehicle(id: string): boolean {
    const idx = this.data.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    this.data.vehicles.splice(idx, 1);
    return true;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const idx = this.data.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.data.vehicles[idx] = { ...this.data.vehicles[idx], ...updates };
    return this.data.vehicles[idx];
  }

  // Drivers
  public getDrivers(): Driver[] {
    return this.data.drivers;
  }

  public getDriverById(id: string): Driver | undefined {
    return this.data.drivers.find((d) => d.id === id);
  }

  public addDriver(driver: Omit<Driver, 'id'>): Driver {
    const id = `drv-${Date.now().toString().slice(-6)}`;
    const newDriver: Driver = { ...driver, id };
    this.data.drivers.unshift(newDriver);
    return newDriver;
  }

  public deleteDriver(id: string): boolean {
    const idx = this.data.drivers.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.data.drivers.splice(idx, 1);
    return true;
  }

  public updateDriver(id: string, updates: Partial<Driver>): Driver | null {
    const idx = this.data.drivers.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.drivers[idx] = { ...this.data.drivers[idx], ...updates };
    return this.data.drivers[idx];
  }

  // Shifts
  public getShifts(): Shift[] {
    return this.data.shifts;
  }

  public getShiftById(id: string): Shift | undefined {
    return this.data.shifts.find((s) => s.id === id);
  }

  public createShift(shift: Omit<Shift, 'id'>): Shift {
    const id = `sh-${Date.now().toString().slice(-6)}`;
    const newShift: Shift = { ...shift, id };
    this.data.shifts.unshift(newShift);

    // Update vehicle status
    this.updateVehicle(shift.vehicle_id, {
      status: 'ASSIGNED',
      assigned_driver_id: shift.driver_id,
      current_shift_id: id,
      fuel_level: shift.start_fuel,
      current_odometer: shift.start_odometer,
    });

    // Update driver assigned vehicle
    this.updateDriver(shift.driver_id, {
      assigned_vehicle_id: shift.vehicle_id,
    });

    return newShift;
  }

  public completeShift(
    shiftId: string,
    params: {
      endOdometer: number;
      endFuel: number;
      endTime: string;
      postDamages: string[];
      penalties: number;
      totalDue: number;
      notes: string;
      nextStatus?: 'AVAILABLE' | 'MAINTENANCE';
    }
  ): { shift: Shift; vehicle: Vehicle; driver: Driver } | null {
    const shiftIdx = this.data.shifts.findIndex((s) => s.id === shiftId);
    if (shiftIdx === -1) return null;

    const shift = this.data.shifts[shiftIdx];
    const totalKm = Math.max(0, params.endOdometer - shift.start_odometer);

    const updatedShift: Shift = {
      ...shift,
      end_time: params.endTime,
      end_odometer: params.endOdometer,
      total_km: totalKm,
      end_fuel: params.endFuel,
      post_damages: params.postDamages,
      penalties: params.penalties,
      total_due: params.totalDue,
      notes: params.notes,
    };
    this.data.shifts[shiftIdx] = updatedShift;

    // Update vehicle
    const vehicleStatus = params.nextStatus || (params.postDamages.length > 0 ? 'MAINTENANCE' : 'AVAILABLE');
    const vehicle = this.updateVehicle(shift.vehicle_id, {
      status: vehicleStatus,
      assigned_driver_id: null,
      current_shift_id: null,
      current_odometer: params.endOdometer,
      fuel_level: params.endFuel,
    })!;

    // Update driver balance
    const driver = this.getDriverById(shift.driver_id)!;
    const unpaidRent = params.totalDue - updatedShift.paid_amount;
    const updatedDriver = this.updateDriver(shift.driver_id, {
      assigned_vehicle_id: null,
      current_balance: driver.current_balance - unpaidRent,
    })!;

    return { shift: updatedShift, vehicle, driver: updatedDriver };
  }

  // Telematics GPS Ingestion
  public ingestTelematics(payload: TelematicsPingPayload): { success: boolean; vehicle?: Vehicle } {
    // Find vehicle by plate or id or device_id match
    const cleanId = payload.device_id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const vehicle = this.data.vehicles.find(
      (v) =>
        v.id.toLowerCase() === payload.device_id.toLowerCase() ||
        v.plate_number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanId
    );

    if (!vehicle) {
      return { success: false };
    }

    vehicle.last_location = {
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed,
      ignition: payload.ignition,
      heading: payload.heading ?? 0,
      updated_at: payload.timestamp || new Date().toISOString(),
    };

    // If vehicle has active shift, append to gps_trail
    if (vehicle.current_shift_id) {
      const shift = this.data.shifts.find((s) => s.id === vehicle.current_shift_id);
      if (shift) {
        shift.gps_trail.push({
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed,
          ignition: payload.ignition,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
      }
    }

    return { success: true, vehicle };
  }

  // Collections & Payments
  public getCollections(): CollectionRecord[] {
    return this.data.collections;
  }

  public recordPayment(params: {
    shift_id: string;
    driver_id: string;
    amount: number;
    payment_mode: 'CASH' | 'UPI' | 'NETBANKING';
    upi_ref?: string;
    collected_by?: string;
  }): { collection: CollectionRecord; receipt: string; updatedDriver: Driver; updatedShift?: Shift } {
    const receipt_number = `FP-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const collection: CollectionRecord = {
      id: `col-${Date.now().toString().slice(-6)}`,
      shift_id: params.shift_id,
      driver_id: params.driver_id,
      amount: params.amount,
      payment_mode: params.payment_mode,
      upi_ref: params.upi_ref,
      collected_at: new Date().toISOString(),
      collected_by: params.collected_by || 'Yard Duty Supervisor',
      receipt_number,
    };
    this.data.collections.unshift(collection);

    // Update driver balance
    const driver = this.getDriverById(params.driver_id)!;
    const updatedDriver = this.updateDriver(params.driver_id, {
      current_balance: driver.current_balance + params.amount,
    })!;

    // Update shift payment status if shift exists
    let updatedShift: Shift | undefined;
    const shift = this.getShiftById(params.shift_id);
    if (shift) {
      const newPaid = shift.paid_amount + params.amount;
      const payment_status = newPaid >= shift.total_due ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';
      const shiftIdx = this.data.shifts.findIndex((s) => s.id === params.shift_id);
      this.data.shifts[shiftIdx] = {
        ...shift,
        paid_amount: newPaid,
        payment_status,
      };
      updatedShift = this.data.shifts[shiftIdx];
    }

    return {
      collection,
      receipt: receipt_number,
      updatedDriver,
      updatedShift,
    };
  }

  // Expenses
  public getExpenses(): Expense[] {
    return this.data.expenses;
  }

  public addExpense(expense: Omit<Expense, 'id' | 'receipt_number'>): Expense {
    const receipt_number = `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now().toString().slice(-6)}`,
      receipt_number,
    };
    this.data.expenses.unshift(newExpense);
    return newExpense;
  }
}

// Global declaration to maintain singleton across Next.js dev reloads
const globalForFleet = globalThis as unknown as { fleetStore?: FleetStore };
export const db = globalForFleet.fleetStore ?? new FleetStore();
if (process.env.NODE_ENV !== 'production') globalForFleet.fleetStore = db;

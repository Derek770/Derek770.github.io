import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicle_id');
    const driverId = searchParams.get('driver_id');
    const activeOnly = searchParams.get('active') === 'true';

    let shifts = db.getShifts();

    if (vehicleId) {
      shifts = shifts.filter((s) => s.vehicle_id === vehicleId);
    }
    if (driverId) {
      shifts = shifts.filter((s) => s.driver_id === driverId);
    }
    if (activeOnly) {
      shifts = shifts.filter((s) => s.end_time === null);
    }

    return NextResponse.json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Check-out workflow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vehicle_id,
      driver_id,
      start_odometer,
      start_fuel,
      pre_damages = [],
      rent_amount = 800,
      notes = '',
      start_time = new Date().toISOString(),
    } = body;

    if (!vehicle_id || !driver_id) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID and Driver ID are required for shift check-out' },
        { status: 400 }
      );
    }

    const vehicle = db.getVehicleById(vehicle_id);
    if (!vehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }
    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: `Vehicle is currently in status: ${vehicle.status}` },
        { status: 400 }
      );
    }

    const driver = db.getDriverById(driver_id);
    if (!driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }
    if (driver.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: `Driver status is ${driver.status}` },
        { status: 400 }
      );
    }

    const newShift = db.createShift({
      vehicle_id,
      driver_id,
      start_time,
      end_time: null,
      start_odometer: Number(start_odometer),
      end_odometer: null,
      total_km: null,
      start_fuel: Number(start_fuel),
      end_fuel: null,
      pre_damages,
      post_damages: [],
      rent_amount: Number(rent_amount),
      penalties: 0,
      total_due: Number(rent_amount),
      payment_status: 'PENDING',
      paid_amount: 0,
      notes,
      gps_trail: [
        {
          lat: vehicle.last_location.lat,
          lng: vehicle.last_location.lng,
          speed: 0,
          timestamp: start_time,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: `Shift ${newShift.id} checked out successfully. Vehicle locked to ASSIGNED.`,
      data: newShift,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Check-in (Return) workflow
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      shift_id,
      end_odometer,
      end_fuel,
      end_time = new Date().toISOString(),
      post_damages = [],
      penalties = 0,
      total_due,
      notes = '',
      next_status = 'AVAILABLE',
    } = body;

    if (!shift_id || end_odometer === undefined || end_fuel === undefined) {
      return NextResponse.json(
        { success: false, error: 'shift_id, end_odometer, and end_fuel are required' },
        { status: 400 }
      );
    }

    const shift = db.getShiftById(shift_id);
    if (!shift) {
      return NextResponse.json({ success: false, error: 'Shift not found' }, { status: 404 });
    }
    if (shift.end_time !== null) {
      return NextResponse.json(
        { success: false, error: 'Shift is already checked in' },
        { status: 400 }
      );
    }

    const finalDue = total_due !== undefined ? Number(total_due) : shift.rent_amount + Number(penalties);

    const result = db.completeShift(shift_id, {
      endOdometer: Number(end_odometer),
      endFuel: Number(end_fuel),
      endTime: end_time,
      postDamages: post_damages,
      penalties: Number(penalties),
      totalDue: finalDue,
      notes,
      nextStatus: next_status,
    });

    if (!result) {
      return NextResponse.json({ success: false, error: 'Failed to complete shift' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Shift ${shift_id} returned successfully. Vehicle status updated to ${result.vehicle.status}.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

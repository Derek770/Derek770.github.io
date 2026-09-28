import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Vehicle } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let vehicles = db.getVehicles();

    if (status) {
      vehicles = vehicles.filter((v) => v.status === status);
    }

    return NextResponse.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plate_number,
      model,
      fuel_type = 'CNG',
      chassis_number = '',
      current_odometer = 0,
      fuel_level = 100,
      daily_rent_rate = 800,
      purchase_date = new Date().toISOString().slice(0, 10),
      purchase_cost = 700000,
      documents,
      last_location,
    } = body;

    if (!plate_number || !model) {
      return NextResponse.json(
        { success: false, error: 'plate_number and model are required' },
        { status: 400 }
      );
    }

    const defaultDocs = documents || {
      fitness_expiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      permit_expiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      insurance_expiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      puc_expiry: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    };

    const defaultLocation = last_location || {
      lat: 28.6139,
      lng: 77.2090,
      speed: 0,
      ignition: false,
      heading: 0,
      updated_at: new Date().toISOString(),
    };

    const newVehicle = db.addVehicle({
      plate_number: plate_number.toUpperCase().trim(),
      model: model.trim(),
      status: 'AVAILABLE',
      current_odometer: Number(current_odometer),
      fuel_level: Number(fuel_level),
      fuel_type,
      chassis_number: chassis_number.trim(),
      purchase_date,
      purchase_cost: Number(purchase_cost),
      daily_rent_rate: Number(daily_rent_rate),
      assigned_driver_id: null,
      current_shift_id: null,
      last_location: defaultLocation,
      documents: defaultDocs,
    });

    return NextResponse.json({ success: true, data: newVehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Vehicle ID required' }, { status: 400 });
    }

    const updated = db.updateVehicle(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Vehicle ID required' }, { status: 400 });
    }

    const deleted = db.deleteVehicle(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

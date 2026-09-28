import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Driver } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let drivers = db.getDrivers();

    if (status) {
      drivers = drivers.filter((d) => d.status === status);
    }

    return NextResponse.json({ success: true, count: drivers.length, data: drivers });
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
      full_name,
      phone,
      license_number,
      security_deposit = 10000,
      current_balance = 0,
      photo_url,
    } = body;

    if (!full_name || !phone || !license_number) {
      return NextResponse.json(
        { success: false, error: 'full_name, phone, and license_number are required' },
        { status: 400 }
      );
    }

    const newDriver = db.addDriver({
      full_name: full_name.trim(),
      phone: phone.trim(),
      license_number: license_number.toUpperCase().trim(),
      security_deposit: Number(security_deposit),
      status: 'ACTIVE',
      current_balance: Number(current_balance),
      photo_url: photo_url || undefined,
      joined_date: new Date().toISOString().slice(0, 10),
      assigned_vehicle_id: null,
    });

    return NextResponse.json({ success: true, data: newDriver }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Driver ID required' }, { status: 400 });
    }

    const updated = db.updateDriver(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
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
      return NextResponse.json({ success: false, error: 'Driver ID required' }, { status: 400 });
    }

    const deleted = db.deleteDriver(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

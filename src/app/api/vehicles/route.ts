import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

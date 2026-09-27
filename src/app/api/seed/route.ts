import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const data = db.resetToSeeds();
    return NextResponse.json({
      success: true,
      message: 'FleetPulse mock database reset to original 5 vehicles, 5 drivers seed data',
      counts: {
        vehicles: data.vehicles.length,
        drivers: data.drivers.length,
        shifts: data.shifts.length,
        expenses: data.expenses.length,
        collections: data.collections.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

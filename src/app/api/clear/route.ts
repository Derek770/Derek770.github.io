import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const data = db.clearAllData();
    return NextResponse.json({
      success: true,
      message: 'All records cleared. System reset to a completely fresh, empty state.',
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

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const collections = db.getCollections();
    return NextResponse.json({ success: true, count: collections.length, data: collections });
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
    const { shift_id, driver_id, amount, payment_mode, upi_ref, collected_by } = body;

    if (!shift_id || !driver_id || amount === undefined || !payment_mode) {
      return NextResponse.json(
        { success: false, error: 'shift_id, driver_id, amount, and payment_mode are required' },
        { status: 400 }
      );
    }

    const result = db.recordPayment({
      shift_id,
      driver_id,
      amount: Number(amount),
      payment_mode,
      upi_ref,
      collected_by,
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded with Receipt #${result.receipt}`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

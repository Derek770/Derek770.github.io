import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const expenses = db.getExpenses();
    return NextResponse.json({ success: true, count: expenses.length, data: expenses });
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
    const { vehicle_id, category, description, amount, date } = body;

    if (!vehicle_id || !category || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'vehicle_id, category, and amount are required' },
        { status: 400 }
      );
    }

    const newExpense = db.addExpense({
      vehicle_id,
      category,
      description: description || '',
      amount: Number(amount),
      date: date || new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({
      success: true,
      message: `Expense of ₹${amount} logged under ${category}`,
      data: newExpense,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

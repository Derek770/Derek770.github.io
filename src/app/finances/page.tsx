'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PaymentModal from '@/components/finances/PaymentModal';
import ReceiptModal, { ReceiptData } from '@/components/finances/ReceiptModal';
import ExpenseModal from '@/components/finances/ExpenseModal';
import {
  Vehicle,
  Driver,
  Shift,
  CollectionRecord,
  Expense,
} from '@/types';
import {
  apiGetVehicles,
  apiGetDrivers,
  apiGetShifts,
  apiGetCollections,
  apiGetExpenses,
} from '@/lib/store';
import { formatINR, formatDateTime, formatDate } from '@/lib/utils';
import {
  IndianRupee,
  Receipt,
  Wrench,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Filter,
} from 'lucide-react';

export default function FinancesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeShiftForPayment, setActiveShiftForPayment] = useState<Shift | null>(null);
  const [activeDriverForPayment, setActiveDriverForPayment] = useState<Driver | null>(null);
  const [activeVehicleForPayment, setActiveVehicleForPayment] = useState<Vehicle | undefined>(undefined);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Active view tab
  const [tab, setTab] = useState<'collections' | 'deficits' | 'expenses'>('collections');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [v, d, s, c, e] = await Promise.all([
        apiGetVehicles(),
        apiGetDrivers(),
        apiGetShifts(),
        apiGetCollections(),
        apiGetExpenses(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setShifts(s);
      setCollections(c);
      setExpenses(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Financial Aggregates
  const totalCollected = collections.reduce((acc, c) => acc + c.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingProfit = totalCollected - totalExpenses;
  const totalOutstandingDeficit = drivers.reduce(
    (acc, d) => (d.current_balance < 0 ? acc + Math.abs(d.current_balance) : acc),
    0
  );

  const handleOpenPayment = (shift: Shift) => {
    const driver = drivers.find((d) => d.id === shift.driver_id);
    const vehicle = vehicles.find((v) => v.id === shift.vehicle_id);
    if (driver) {
      setActiveShiftForPayment(shift);
      setActiveDriverForPayment(driver);
      setActiveVehicleForPayment(vehicle);
    }
  };

  const handlePaymentSuccess = (receipt: ReceiptData) => {
    setActiveShiftForPayment(null);
    setActiveDriverForPayment(null);
    setActiveReceipt(receipt);
    loadData();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19]">
      <Header
        title="Financial Ledger & Daily Collections"
        subtitle="Driver rent collection, rolling deficits, digital receipts, and fleet operating costs"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Financial KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Collections */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Rent Collected
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {formatINR(totalCollected)}
              </span>
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{collections.length} transactions logged</p>
          </div>

          {/* Operating Expenses */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Fleet Operating Costs
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-rose-400">
                {formatINR(totalExpenses)}
              </span>
              <span className="p-1 rounded bg-rose-500/10 text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{expenses.length} maintenance receipts</p>
          </div>

          {/* Net Profit */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Net Operating Profit
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {formatINR(netOperatingProfit)}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Profitable
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Revenue minus maintenance</p>
          </div>

          {/* Driver Deficits */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Driver Rolling Deficit
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {formatINR(totalOutstandingDeficit)}
              </span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Carried-over pending dues</p>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab('collections')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'collections'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Shift Collections
            </button>
            <button
              onClick={() => setTab('deficits')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'deficits'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Driver Balances & Deficits
            </button>
            <button
              onClick={() => setTab('expenses')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === 'expenses'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fleet Expense Logger
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Log Expense</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Daily Collections Dashboard */}
        {tab === 'collections' && (
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Rental Ledger</h3>
                <p className="text-xs text-slate-400">
                  Real-time status of commercial driver rental fees, dues, and payment modes
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {shifts.length} Recorded Shifts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Shift ID / Date</th>
                    <th className="p-3.5">Commercial Driver</th>
                    <th className="p-3.5">Assigned Cab</th>
                    <th className="p-3.5">Expected Rent</th>
                    <th className="p-3.5">Paid Amount</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {shifts.map((shift) => {
                    const driver = drivers.find((d) => d.id === shift.driver_id);
                    const vehicle = vehicles.find((v) => v.id === shift.vehicle_id);
                    const isFullyPaid = shift.payment_status === 'PAID';
                    const isPartial = shift.payment_status === 'PARTIAL';
                    const pendingAmount = Math.max(0, shift.total_due - shift.paid_amount);

                    return (
                      <tr key={shift.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-white block">{shift.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(shift.start_time)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                              {driver?.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">
                                {driver?.full_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {driver?.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-slate-200 block">
                            {vehicle?.plate_number}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {vehicle?.model.split(' ')[0]} {vehicle?.fuel_type}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-amber-300">
                          {formatINR(shift.total_due)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          {formatINR(shift.paid_amount)}
                        </td>
                        <td className="p-3.5">
                          {isFullyPaid && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                          {isPartial && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                              <Clock className="w-3 h-3" />
                              Partial (₹{pendingAmount} due)
                            </span>
                          )}
                          {!isFullyPaid && !isPartial && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {!isFullyPaid ? (
                            <button
                              onClick={() => handleOpenPayment(shift)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm transition-colors"
                            >
                              Mark as Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const col = collections.find((c) => c.shift_id === shift.id);
                                setActiveReceipt({
                                  receiptNumber: col?.receipt_number || `FP-REC-2026-${shift.id}`,
                                  driverName: driver?.full_name || 'Driver',
                                  driverPhone: driver?.phone || '',
                                  vehiclePlate: vehicle?.plate_number || '',
                                  shiftId: shift.id,
                                  amount: shift.paid_amount,
                                  paymentMode: col?.payment_mode || 'UPI',
                                  upiRef: col?.upi_ref,
                                  date: shift.start_time,
                                  collectedBy: col?.collected_by || 'Yard Duty Supervisor',
                                  remainingBalance: driver?.current_balance,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>View Receipt</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Driver Balance & Deficit Tracking */}
        {tab === 'deficits' && (
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Driver Deficits & Rolling Ledger</h3>
                <p className="text-xs text-slate-400">
                  Monitors unpaid rent carried over to the next shift and security deposit collateral
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Driver Name</th>
                    <th className="p-3.5">Contact & License</th>
                    <th className="p-3.5">Security Deposit Held</th>
                    <th className="p-3.5">Current Balance</th>
                    <th className="p-3.5">Deficit Status</th>
                    <th className="p-3.5">Assigned Vehicle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drivers.map((driver) => {
                    const isDeficit = driver.current_balance < 0;
                    const isAdvance = driver.current_balance > 0;
                    const assignedVeh = vehicles.find((v) => v.id === driver.assigned_vehicle_id);

                    return (
                      <tr key={driver.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{driver.full_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {driver.id}</span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-slate-200 block">{driver.phone}</span>
                          <span className="text-[10px] text-slate-500">{driver.license_number}</span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-300">
                          {formatINR(driver.security_deposit)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-sm">
                          <span
                            className={
                              isDeficit
                                ? 'text-rose-400'
                                : isAdvance
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }
                          >
                            {formatINR(driver.current_balance)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {isDeficit ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60">
                              <AlertCircle className="w-3 h-3" />
                              Deficit Due ({formatINR(Math.abs(driver.current_balance))})
                            </span>
                          ) : isAdvance ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3" />
                              Advance Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                              Clear Balance
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono">
                          {assignedVeh ? (
                            <span className="text-emerald-400 font-semibold">
                              {assignedVeh.plate_number}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">None (In Yard)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Fleet Operating Expenses */}
        {tab === 'expenses' && (
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Vehicle Expense Ledger</h3>
                <p className="text-xs text-slate-400">
                  Itemized log of repair bills, CNG certifications, engine oil, and fines
                </p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
              >
                + Log Expense
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Receipt # / Date</th>
                    <th className="p-3.5">Vehicle Plate</th>
                    <th className="p-3.5">Expense Category</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-right">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.map((exp) => {
                    const vehicle = vehicles.find((v) => v.id === exp.vehicle_id);
                    return (
                      <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-white block">{exp.receipt_number}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(exp.date)}</span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-200">
                          {vehicle?.plate_number || exp.vehicle_id}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">{exp.description}</td>
                        <td className="p-3.5 font-mono font-bold text-rose-400 text-right text-sm">
                          -{formatINR(exp.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment / Collection Modal */}
      {activeShiftForPayment && activeDriverForPayment && (
        <PaymentModal
          shift={activeShiftForPayment}
          driver={activeDriverForPayment}
          vehicle={activeVehicleForPayment}
          onClose={() => {
            setActiveShiftForPayment(null);
            setActiveDriverForPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          vehicles={vehicles}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

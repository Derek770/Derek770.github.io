'use client';

import React, { useState } from 'react';
import { X, IndianRupee, CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';
import { Shift, Driver, Vehicle } from '@/types';
import { apiRecordPayment } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { ReceiptData } from './ReceiptModal';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  shift: Shift;
  driver: Driver;
  vehicle?: Vehicle;
  onClose: () => void;
  onSuccess: (receipt: ReceiptData) => void;
}

export default function PaymentModal({
  shift,
  driver,
  vehicle,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const pendingAmount = Math.max(0, shift.total_due - shift.paid_amount);

  const [amount, setAmount] = useState<number>(pendingAmount || shift.rent_amount || 800);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'NETBANKING'>('UPI');
  const [upiRef, setUpiRef] = useState<string>('');
  const [collectedBy, setCollectedBy] = useState<string>('Yard Supervisor Sunil');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiRecordPayment({
        shift_id: shift.id,
        driver_id: driver.id,
        amount: Number(amount),
        payment_mode: paymentMode,
        upi_ref: upiRef || (paymentMode === 'UPI' ? `UPI/${Date.now().toString().slice(-10)}` : undefined),
        collected_by: collectedBy,
      });

      if (res.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        const receiptData: ReceiptData = {
          receiptNumber: res.data.receipt,
          driverName: driver.full_name,
          driverPhone: driver.phone,
          vehiclePlate: vehicle?.plate_number || 'UP 16 BT 3344',
          shiftId: shift.id,
          amount: Number(amount),
          paymentMode,
          upiRef: upiRef || (paymentMode === 'UPI' ? `UPI/${Date.now().toString().slice(-8)}` : undefined),
          date: new Date().toISOString(),
          collectedBy,
          remainingBalance: res.data.updatedDriver.current_balance,
        };
        onSuccess(receiptData);
      } else {
        setErrorMsg(res.error || 'Failed to record payment');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Collect Daily Lease Rent
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Shift {shift.id} • {driver.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Snapshot Details */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Shift Rent:</span>
              <span className="font-mono font-bold text-slate-200">
                {formatINR(shift.total_due)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Already Paid:</span>
              <span className="font-mono text-emerald-400">
                {formatINR(shift.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/80 font-bold">
              <span className="text-slate-300">Remaining Balance Due:</span>
              <span className="font-mono text-amber-400">
                {formatINR(pendingAmount)}
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Collection Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full text-base font-bold font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMode === 'UPI'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('NETBANKING')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMode === 'NETBANKING'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Bank / NEFT</span>
              </button>
            </div>
          </div>

          {/* UPI reference if UPI */}
          {paymentMode === 'UPI' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                UPI Reference / UTR Number
              </label>
              <input
                type="text"
                placeholder="e.g., UPI/627019842190"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Duty Supervisor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Yard Officer Collecting
            </label>
            <input
              type="text"
              value={collectedBy}
              onChange={(e) => setCollectedBy(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{submitting ? 'Recording & Generating Receipt...' : 'Record Payment & Generate Receipt'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { formatINR, formatDateTime } from '@/lib/utils';

export interface ReceiptData {
  receiptNumber: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  shiftId: string;
  amount: number;
  paymentMode: string;
  upiRef?: string;
  date: string;
  collectedBy: string;
  remainingBalance?: number;
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white print:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight">FleetPulse Cabs Ltd.</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Commercial Fleet Yard Operations • Delhi NCR
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Official Receipt #
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {receipt.receiptNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Date & Time
              </span>
              <span className="font-mono text-slate-300">
                {formatDateTime(receipt.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="text-center py-2">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Amount Paid
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-0.5">
              {formatINR(receipt.amount)}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid via {receipt.paymentMode}
            </span>
          </div>

          {/* Details Table */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Commercial Driver:</span>
              <span className="font-bold text-slate-800">{receipt.driverName}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Assigned Cab Plate:</span>
              <span className="font-mono font-bold text-slate-800">
                {receipt.vehiclePlate}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Shift Reference ID:</span>
              <span className="font-mono text-slate-700">{receipt.shiftId}</span>
            </div>
            {receipt.upiRef && (
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">UPI Transaction Ref:</span>
                <span className="font-mono text-slate-700">{receipt.upiRef}</span>
              </div>
            )}
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Yard Officer:</span>
              <span className="text-slate-700">{receipt.collectedBy}</span>
            </div>
            {receipt.remainingBalance !== undefined && (
              <div className="py-2 flex justify-between bg-slate-50 px-2 rounded font-semibold">
                <span className="text-slate-600">Updated Driver Balance:</span>
                <span
                  className={
                    receipt.remainingBalance < 0
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }
                >
                  {formatINR(receipt.remainingBalance)}
                  {receipt.remainingBalance < 0 ? ' (Deficit)' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Watermark / Digital verification */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Digitally by FleetPulse System</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Valid proof of commercial taxi daily lease payment. Non-transferable.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

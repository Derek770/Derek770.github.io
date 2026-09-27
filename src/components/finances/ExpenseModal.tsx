'use client';

import React, { useState } from 'react';
import { X, Wrench, IndianRupee, Plus, Check } from 'lucide-react';
import { Vehicle } from '@/types';
import { apiAddExpense } from '@/lib/store';

interface ExpenseModalProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'OIL_CHANGE', label: 'Engine Oil & Filter Change' },
  { value: 'PUNCTURE', label: 'Tyre Puncture & Wheel Alignment' },
  { value: 'SERVICING', label: 'Routine Servicing & Brake Pads' },
  { value: 'CHALLAN', label: 'Traffic Challan / Fine' },
  { value: 'CNG_TEST', label: 'CNG Hydro-Testing & Leak Audit' },
  { value: 'YARD_RENT', label: 'Fleet Yard Parking Lease' },
  { value: 'OTHER', label: 'Miscellaneous / Accessories' },
];

export default function ExpenseModal({ vehicles, onClose, onSuccess }: ExpenseModalProps) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [category, setCategory] = useState('SERVICING');
  const [amount, setAmount] = useState<number>(1500);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !description.trim() || amount <= 0) {
      setErrorMsg('Please complete all fields with a valid amount.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiAddExpense({
        vehicle_id: vehicleId,
        category,
        description: description.trim(),
        amount: Number(amount),
        date,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to log expense');
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
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Log Vehicle Fleet Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Vehicle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} • {v.model}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Cost (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description / Workshop Vendor
            </label>
            <input
              type="text"
              placeholder="e.g., Castrol engine oil + filter replacement at Noida"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{submitting ? 'Recording Expense...' : 'Log Operating Expense'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

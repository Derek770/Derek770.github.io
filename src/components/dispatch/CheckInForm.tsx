'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, Driver, Shift } from '@/types';
import { apiCheckInShift } from '@/lib/store';
import { calculateShiftReturn } from '@/lib/calculations';
import { formatINR } from '@/lib/utils';
import DamageInspector from './DamageInspector';
import {
  Car,
  User,
  Gauge,
  Fuel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  IndianRupee,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckInFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  shifts: Shift[];
  preselectedShiftId?: string | null;
  onSuccess: () => void;
}

export default function CheckInForm({
  vehicles,
  drivers,
  shifts,
  preselectedShiftId,
  onSuccess,
}: CheckInFormProps) {
  const activeShifts = shifts.filter((s) => s.end_time === null);

  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [endOdometer, setEndOdometer] = useState<number>(0);
  const [endFuel, setEndFuel] = useState<number>(80);
  const [postDamages, setPostDamages] = useState<string[]>([]);
  const [newDamageRemarks, setNewDamageRemarks] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [nextStatus, setNextStatus] = useState<'AVAILABLE' | 'MAINTENANCE'>('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedShiftId && activeShifts.some((s) => s.id === preselectedShiftId)) {
      setSelectedShiftId(preselectedShiftId);
    } else if (activeShifts.length > 0 && !selectedShiftId) {
      setSelectedShiftId(activeShifts[0].id);
    }
  }, [activeShifts, preselectedShiftId, selectedShiftId]);

  const activeShift = shifts.find((s) => s.id === selectedShiftId);
  const assignedVehicle = vehicles.find((v) => v.id === activeShift?.vehicle_id);
  const assignedDriver = drivers.find((d) => d.id === activeShift?.driver_id);

  // Auto initialize ending values
  useEffect(() => {
    if (activeShift) {
      // Suggest ending odometer = start_odometer + 120km realistic shift drive
      setEndOdometer(activeShift.start_odometer + 135);
      setEndFuel(Math.max(10, activeShift.start_fuel - 25));
    }
  }, [activeShift]);

  // Automated Calculations
  const calculations = activeShift
    ? calculateShiftReturn({
        startOdometer: activeShift.start_odometer,
        endOdometer: Number(endOdometer),
        startTime: activeShift.start_time,
        endTime: new Date().toISOString(),
        startFuel: activeShift.start_fuel,
        endFuel: Number(endFuel),
        baseDailyRent: activeShift.rent_amount,
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId || !calculations) return;

    if (endOdometer < (activeShift?.start_odometer || 0)) {
      setErrorMsg('Ending Odometer cannot be less than starting odometer!');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const allNewDamages = [...postDamages];
    if (newDamageRemarks.trim()) allNewDamages.push(newDamageRemarks.trim());

    try {
      const res = await apiCheckInShift({
        shift_id: selectedShiftId,
        end_odometer: Number(endOdometer),
        end_fuel: Number(endFuel),
        end_time: new Date().toISOString(),
        post_damages: allNewDamages,
        penalties: calculations.totalPenalties,
        total_due: calculations.totalRentDue,
        notes: notes || 'Vehicle returned to yard in clean condition',
        next_status: allNewDamages.length > 0 ? 'MAINTENANCE' : nextStatus,
      });

      if (res.success) {
        confetti({ particleCount: 70, spread: 55, origin: { y: 0.6 } });
        setSuccessResult({
          shiftId: selectedShiftId,
          vehiclePlate: assignedVehicle?.plate_number,
          driverName: assignedDriver?.full_name,
          totalKm: calculations.totalKm,
          totalDue: calculations.totalRentDue,
        });
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to complete check-in');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (activeShifts.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-white">All Dispatched Vehicles Checked In</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          There are currently no active cab shifts on the road waiting for return to the yard.
        </p>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-blue-500/40 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Vehicle Checked In & Restocked!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Status updated to <span className="text-blue-400 font-semibold">{nextStatus}</span>
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Shift ID:</span>
            <span className="text-white font-bold">{successResult.shiftId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vehicle / Driver:</span>
            <span className="text-white font-bold">
              {successResult.vehiclePlate} ({successResult.driverName})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Driven:</span>
            <span className="text-emerald-400 font-bold">{successResult.totalKm} km</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">Total Shift Rent Due:</span>
            <span className="text-amber-400 font-bold text-sm">
              {formatINR(successResult.totalDue)}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setSuccessResult(null);
            setPostDamages([]);
            setNewDamageRemarks('');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
        >
          Check In Another Cab
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Select Active Shift */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-blue-400" />
          <span>Select Returning Vehicle & Active Shift</span>
        </label>
        <select
          value={selectedShiftId}
          onChange={(e) => setSelectedShiftId(e.target.value)}
          required
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          {activeShifts.map((s) => {
            const v = vehicles.find((veh) => veh.id === s.vehicle_id);
            const d = drivers.find((drv) => drv.id === s.driver_id);
            return (
              <option key={s.id} value={s.id}>
                {v?.plate_number} ({v?.model}) • Driver: {d?.full_name} • Start Km: {s.start_odometer}
              </option>
            );
          })}
        </select>
      </div>

      {/* Active Shift Snapshot Pill */}
      {activeShift && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Checked Out At:
            </span>
            <span className="font-mono text-slate-200">
              {new Date(activeShift.start_time).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Start Odometer:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {activeShift.start_odometer} km
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Start Fuel/CNG:
            </span>
            <span className="font-mono font-bold text-amber-400">
              {activeShift.start_fuel}%
            </span>
          </div>
        </div>
      )}

      {/* Row 2: Ending Odometer & Ending Fuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ending Odometer */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Ending Odometer (km)</span>
          </label>
          <input
            type="number"
            value={endOdometer}
            onChange={(e) => setEndOdometer(Number(e.target.value))}
            required
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Ending Fuel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Ending Fuel / CNG Level</span>
            </label>
            <span className="text-xs font-bold font-mono text-amber-400">{endFuel}%</span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={endFuel}
              onChange={(e) => setEndFuel(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Automated Calculations Panel */}
      {calculations && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Automated Shift Settlement Calculations</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Driven</span>
              <span className="font-bold text-sm font-mono text-emerald-400">
                {calculations.totalKm} km
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Shift Duration</span>
              <span className="font-bold text-sm font-mono text-slate-200">
                {calculations.durationFormatted}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Base Rent Due</span>
              <span className="font-bold text-sm font-mono text-amber-300">
                {formatINR(calculations.baseRent)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Fuel / Late Penalty</span>
              <span
                className={`font-bold text-sm font-mono ${
                  calculations.totalPenalties > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                +{formatINR(calculations.totalPenalties)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Total Shift Rent Due from Driver:
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              {formatINR(calculations.totalRentDue)}
            </span>
          </div>
        </div>
      )}

      {/* Return Damage Checklist */}
      <DamageInspector
        selectedItems={postDamages}
        onChange={setPostDamages}
        title="Check-In Return Inspection: Any New Scratches / Damages?"
      />

      {/* Remarks */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          New Damage Details / Supervisor Notes
        </label>
        <input
          type="text"
          placeholder="e.g., Clean condition, no new scratches"
          value={newDamageRemarks}
          onChange={(e) => setNewDamageRemarks(e.target.value)}
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Next Vehicle Status */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-300 font-medium">Post-Return Yard Vehicle Status:</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="radio"
              name="nextStatus"
              value="AVAILABLE"
              checked={nextStatus === 'AVAILABLE'}
              onChange={() => setNextStatus('AVAILABLE')}
              className="accent-blue-500"
            />
            Available in Yard
          </label>
          <label className="flex items-center gap-1.5 text-xs text-rose-300 cursor-pointer ml-3">
            <input
              type="radio"
              name="nextStatus"
              value="MAINTENANCE"
              checked={nextStatus === 'MAINTENANCE'}
              onChange={() => setNextStatus('MAINTENANCE')}
              className="accent-rose-500"
            />
            Send to Workshop
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-950/60 transition-all hover:scale-[1.01]"
      >
        <span>{submitting ? 'Calculating & Updating Ledger...' : 'Confirm Vehicle Return & Update Ledger'}</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, Driver } from '@/types';
import { apiCheckOutShift } from '@/lib/store';
import DamageInspector from './DamageInspector';
import { Car, User, Gauge, Fuel, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CheckOutFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  preselectedVehicleId?: string | null;
  onSuccess: () => void;
}

export default function CheckOutForm({
  vehicles,
  drivers,
  preselectedVehicleId,
  onSuccess,
}: CheckOutFormProps) {
  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter((d) => d.status === 'ACTIVE' && !d.assigned_vehicle_id);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [startOdometer, setStartOdometer] = useState<number>(0);
  const [startFuel, setStartFuel] = useState<number>(90);
  const [preDamages, setPreDamages] = useState<string[]>([]);
  const [customDamageNote, setCustomDamageNote] = useState<string>('');
  const [rentAmount, setRentAmount] = useState<number>(800);
  const [startTime, setStartTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ shiftId: string; vehiclePlate: string } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill from vehicle selection
  useEffect(() => {
    if (preselectedVehicleId && availableVehicles.some((v) => v.id === preselectedVehicleId)) {
      setSelectedVehicleId(preselectedVehicleId);
    } else if (availableVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(availableVehicles[0].id);
    }
  }, [availableVehicles, preselectedVehicleId, selectedVehicleId]);

  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(availableDrivers[0].id);
    }
  }, [availableDrivers, selectedDriverId]);

  useEffect(() => {
    const v = vehicles.find((veh) => veh.id === selectedVehicleId);
    if (v) {
      setStartOdometer(v.current_odometer);
      setStartFuel(v.fuel_level);
      setRentAmount(v.daily_rent_rate || 800);
    }
  }, [selectedVehicleId, vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedDriverId) {
      setErrorMsg('Please select both a vehicle and a driver.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const allDamages = [...preDamages];
    if (customDamageNote.trim()) {
      allDamages.push(customDamageNote.trim());
    }

    try {
      const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
      const res = await apiCheckOutShift({
        vehicle_id: selectedVehicleId,
        driver_id: selectedDriverId,
        start_odometer: Number(startOdometer),
        start_fuel: Number(startFuel),
        pre_damages: allDamages,
        rent_amount: Number(rentAmount),
        notes,
      });

      if (res.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSuccessResult({
          shiftId: res.data.id,
          vehiclePlate: selectedVehicle?.plate_number || selectedVehicleId,
        });
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to dispatch vehicle');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Cab Dispatched Successfully!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Vehicle status locked to <span className="text-emerald-400 font-semibold">ASSIGNED</span>
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
          <p>Shift ID: <span className="text-emerald-400 font-bold">{successResult.shiftId}</span></p>
          <p>Vehicle: <span className="text-white font-bold">{successResult.vehiclePlate}</span></p>
          <p>Rent Agreement: <span className="text-amber-300 font-bold">{formatINR(rentAmount)} / shift</span></p>
        </div>
        <button
          onClick={() => {
            setSuccessResult(null);
            setCustomDamageNote('');
            setPreDamages([]);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
        >
          Dispatch Another Cab
        </button>
      </div>
    );
  }

  if (availableVehicles.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Vehicles Available in Yard</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          All commercial fleet cabs are currently dispatched on duty or undergoing maintenance in the workshop.
        </p>
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

      {/* Row 1: Vehicle & Driver Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Available Cab</span>
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            required
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate_number} • {v.model} ({v.fuel_type})
              </option>
            ))}
          </select>
        </div>

        {/* Driver Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assign Active Commercial Driver</span>
          </label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            required
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name} • {d.phone} (Deposit: {formatINR(d.security_deposit)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Starting Odometer & Starting Fuel/CNG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Odometer */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Starting Odometer (km)</span>
          </label>
          <input
            type="number"
            value={startOdometer}
            onChange={(e) => setStartOdometer(Number(e.target.value))}
            required
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Fuel/CNG Level */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Starting Fuel / CNG</span>
            </label>
            <span className="text-xs font-bold font-mono text-emerald-400">{startFuel}%</span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={startFuel}
              onChange={(e) => setStartFuel(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Reserve (10%)</span>
              <span>Half (50%)</span>
              <span>Full (100%)</span>
            </div>
          </div>
        </div>

        {/* Daily Rent Rate */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shift Rent Agreement</span>
          </label>
          <input
            type="number"
            value={rentAmount}
            onChange={(e) => setRentAmount(Number(e.target.value))}
            required
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-amber-300 font-bold font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Vehicle Damages & Inspection Checklist */}
      <DamageInspector
        selectedItems={preDamages}
        onChange={setPreDamages}
        title="Checklist: Existing Vehicle Scratches & Equipment"
      />

      {/* Additional remarks */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Specific Scratch / Damage Remarks
        </label>
        <input
          type="text"
          placeholder="e.g., Minor dent on passenger door, rear bumper paint chip"
          value={customDamageNote}
          onChange={(e) => setCustomDamageNote(e.target.value)}
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01]"
      >
        <span>{submitting ? 'Locking & Generating Shift ID...' : 'Confirm Check-Out & Dispatch Vehicle'}</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
}

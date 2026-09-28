'use client';

import React, { useState } from 'react';
import { X, Car, Plus, ShieldCheck, Fuel, Gauge, IndianRupee } from 'lucide-react';
import { apiCreateVehicle } from '@/lib/store';
import { FuelType } from '@/types';

interface AddVehicleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({ onClose, onSuccess }: AddVehicleModalProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('CNG');
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(100);
  const [dailyRentRate, setDailyRentRate] = useState(800);
  const [chassisNumber, setChassisNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(750000);
  const [fitnessExpiry, setFitnessExpiry] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [permitExpiry, setPermitExpiry] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [insuranceExpiry, setInsuranceExpiry] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [pucExpiry, setPucExpiry] = useState(
    new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || !model.trim()) {
      setErrorMsg('Plate number and vehicle model are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiCreateVehicle({
        plate_number: plateNumber.trim().toUpperCase(),
        model: model.trim(),
        fuel_type: fuelType,
        current_odometer: Number(currentOdometer),
        fuel_level: Number(fuelLevel),
        daily_rent_rate: Number(dailyRentRate),
        chassis_number: chassisNumber.trim() || `CHAS-${Date.now().toString().slice(-8)}`,
        purchase_cost: Number(purchaseCost),
        purchase_date: new Date().toISOString().slice(0, 10),
        documents: {
          fitness_expiry: fitnessExpiry,
          permit_expiry: permitExpiry,
          insurance_expiry: insuranceExpiry,
          puc_expiry: pucExpiry,
        },
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to register vehicle');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Register Commercial Vehicle</h3>
              <p className="text-xs text-slate-400">Add a taxi to your active fleet registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Plate & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Registration Plate</label>
              <input
                type="text"
                placeholder="e.g., DL 1TA 8899"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
                className="w-full text-xs font-mono font-bold uppercase bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Make & Model</label>
              <input
                type="text"
                placeholder="e.g., Maruti Suzuki WagonR Tour"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Fuel Type, Odometer, Daily Rent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="CNG">CNG</option>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="EV">Electric (EV)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Current Odometer (km)</label>
              <input
                type="number"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Daily Lease Rent (₹)</label>
              <input
                type="number"
                value={dailyRentRate}
                onChange={(e) => setDailyRentRate(Number(e.target.value))}
                required
                className="w-full text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Chassis & Purchase Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Chassis Number</label>
              <input
                type="text"
                placeholder="e.g., MA3EWBF1S00184920"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Purchase Cost (₹)</label>
              <input
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section: Compliance Expiry Dates */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliance Document Expiry Dates</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Commercial Fitness Expiry</label>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Commercial Permit Expiry</label>
                <input
                  type="date"
                  value={permitExpiry}
                  onChange={(e) => setPermitExpiry(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Taxi Insurance Expiry</label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Pollution (PUC) Expiry</label>
                <input
                  type="date"
                  value={pucExpiry}
                  onChange={(e) => setPucExpiry(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{submitting ? 'Registering Vehicle...' : 'Register Vehicle in Yard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

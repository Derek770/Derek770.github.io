'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import CheckOutForm from '@/components/dispatch/CheckOutForm';
import CheckInForm from '@/components/dispatch/CheckInForm';
import { Vehicle, Driver, Shift } from '@/types';
import { apiGetVehicles, apiGetDrivers, apiGetShifts } from '@/lib/store';
import { ArrowLeftRight, Car, User, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

function DispatchContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'return' ? 'return' : 'checkout';
  const preVehicleId = searchParams.get('vehicleId');
  const preShiftId = searchParams.get('shiftId');

  const [activeTab, setActiveTab] = useState<'checkout' | 'return'>(initialMode);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [v, d, s] = await Promise.all([
        apiGetVehicles(),
        apiGetDrivers(),
        apiGetShifts(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setShifts(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const onRoadCount = vehicles.filter((v) => v.status === 'ASSIGNED').length;

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19]">
      <Header
        title="Shift Dispatch & Yard Handoff"
        subtitle="Driver vehicle check-out, return audits, damage checklists & automated rent settlement"
      />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Yard Status Quick Banner */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                Available in Yard
              </span>
              <p className="text-xl font-bold text-white mt-0.5">{availableCount} Cabs</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {availableCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                On Duty / Dispatched
              </span>
              <p className="text-xl font-bold text-white mt-0.5">{onRoadCount} Cabs</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {onRoadCount}
            </div>
          </div>
        </div>

        {/* Tab Switcher (Check-Out vs Return) */}
        <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'checkout'
                ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4 stroke-[2.5]" />
            <span>Shift Check-Out (Dispatch)</span>
          </button>

          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'return'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Shift Check-In (Return & Settlement)</span>
          </button>
        </div>

        {/* Active Tab Container */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 sm:p-6 shadow-xl">
          {activeTab === 'checkout' ? (
            <div>
              <div className="mb-5 pb-3 border-b border-slate-800/80">
                <h3 className="text-base font-bold text-white">
                  Yard Vehicle Check-Out Workflow
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect odometer, verify fuel level, confirm pre-existing body scratches, and issue shift to driver.
                </p>
              </div>
              <CheckOutForm
                vehicles={vehicles}
                drivers={drivers}
                preselectedVehicleId={preVehicleId}
                onSuccess={loadData}
              />
            </div>
          ) : (
            <div>
              <div className="mb-5 pb-3 border-b border-slate-800/80">
                <h3 className="text-base font-bold text-white">
                  Vehicle Return & Rent Settlement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record ending mileage, fuel drop, inspect new scratches, and compute total shift kilometers and rent dues.
                </p>
              </div>
              <CheckInForm
                vehicles={vehicles}
                drivers={drivers}
                shifts={shifts}
                preselectedShiftId={preShiftId}
                onSuccess={loadData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DispatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
          Loading yard dispatch center...
        </div>
      }
    >
      <DispatchContent />
    </Suspense>
  );
}

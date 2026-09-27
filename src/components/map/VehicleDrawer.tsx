'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Car,
  User,
  Phone,
  Fuel,
  Gauge,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Vehicle, Driver, Shift } from '@/types';
import { formatINR, formatDuration } from '@/lib/utils';

interface VehicleDrawerProps {
  vehicle: Vehicle | null;
  driver?: Driver | null;
  activeShift?: Shift | null;
  onClose: () => void;
  onPlayRoute?: (shift: Shift) => void;
}

export default function VehicleDrawer({
  vehicle,
  driver,
  activeShift,
  onClose,
  onPlayRoute,
}: VehicleDrawerProps) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!activeShift?.start_time) {
      setElapsed('');
      return;
    }
    const updateElapsed = () => {
      setElapsed(formatDuration(activeShift.start_time));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // update every minute
    return () => clearInterval(interval);
  }, [activeShift]);

  if (!vehicle) return null;

  const isMoving = vehicle.last_location.speed > 5 && vehicle.last_location.ignition;
  const isIdling = vehicle.last_location.speed <= 5 && vehicle.last_location.ignition;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden text-slate-100 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base tracking-wide px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {vehicle.plate_number}
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {vehicle.fuel_type}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{vehicle.model}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Real-time Telemetry Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Telematics Feed
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isMoving
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : isIdling
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMoving ? 'bg-emerald-400 animate-pulse' : isIdling ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {isMoving ? 'Moving on Road' : isIdling ? 'Engine Idling' : 'Parked / Off'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Live Speed</span>
              <span className="font-bold text-lg font-mono text-emerald-400">
                {vehicle.last_location.speed} <span className="text-xs text-slate-400">km/h</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Ignition Status</span>
              <span
                className={`font-semibold text-xs flex items-center gap-1 mt-1 ${
                  vehicle.last_location.ignition ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {vehicle.last_location.ignition ? 'Ignition ON' : 'Ignition OFF'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Fuel / CNG Level</span>
                <span className="font-semibold text-slate-200">{vehicle.fuel_level}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    vehicle.fuel_level > 30 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${vehicle.fuel_level}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Current Odometer</span>
              <span className="font-semibold font-mono text-slate-200 text-xs">
                {vehicle.current_odometer.toLocaleString()} km
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>GPS Updated:</span>
            <span className="font-mono text-slate-300">
              {new Date(vehicle.last_location.updated_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Assigned Driver Profile */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Driver
            </span>
            {driver && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {driver.id}
              </span>
            )}
          </div>

          {driver ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-sm text-emerald-400 overflow-hidden shrink-0">
                  {driver.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={driver.photo_url}
                      alt={driver.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    driver.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">{driver.full_name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {driver.phone}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-mono">
                    Lic: {driver.license_number}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Driver Ledger Balance:</span>
                <span
                  className={`font-semibold font-mono ${
                    driver.current_balance < 0
                      ? 'text-rose-400'
                      : driver.current_balance > 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {formatINR(driver.current_balance)}
                  {driver.current_balance < 0 ? ' (Deficit)' : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-950/50 border border-dashed border-slate-800 text-center">
              <p className="text-xs text-slate-400">No active driver assigned</p>
              <Link
                href={`/dispatch?vehicleId=${vehicle.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors"
              >
                <span>Dispatch Vehicle Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Active Shift Details & Timer */}
        {activeShift && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Shift
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                {activeShift.id}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Time Since Dispatched:
              </span>
              <span className="font-bold font-mono text-emerald-300 text-sm">
                {elapsed || formatDuration(activeShift.start_time)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Start Odometer</span>
                <span className="font-semibold font-mono text-slate-200">
                  {activeShift.start_odometer.toLocaleString()} km
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Expected Daily Rent</span>
                <span className="font-semibold font-mono text-amber-300">
                  {formatINR(activeShift.rent_amount)}
                </span>
              </div>
            </div>

            {/* Play Route button */}
            {activeShift.gps_trail && activeShift.gps_trail.length > 1 && onPlayRoute && (
              <button
                onClick={() => onPlayRoute(activeShift)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 font-semibold text-xs transition-colors"
              >
                <span>Play Live Route Trail ({activeShift.gps_trail.length} GPS points)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 flex items-center gap-2">
        {vehicle.status === 'ASSIGNED' && (
          <Link
            href={`/dispatch?mode=return&shiftId=${vehicle.current_shift_id || ''}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <span>Check-In / Return Cab</span>
          </Link>
        )}
        {vehicle.status === 'AVAILABLE' && (
          <Link
            href={`/dispatch?vehicleId=${vehicle.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs shadow-md transition-colors"
          >
            <span>Dispatch to Driver</span>
          </Link>
        )}
        <Link
          href={`/vehicles`}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="View Compliance Documents"
        >
          <ShieldCheck className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

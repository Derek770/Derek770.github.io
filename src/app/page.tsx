'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import KpiCards from '@/components/dashboard/KpiCards';
import {
  Car,
  Fuel,
  Gauge,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Plus,
  ArrowLeftRight,
  Receipt,
  MapPin,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Vehicle, Driver, Shift, Expense, CollectionRecord } from '@/types';
import {
  apiGetVehicles,
  apiGetDrivers,
  apiGetShifts,
  apiGetCollections,
  apiGetExpenses,
} from '@/lib/store';
import { formatINR, checkDocStatus } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Compute metrics
  const activeCars = vehicles.filter((v) => v.status === 'ASSIGNED').length;
  const availableCars = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const maintenanceCars = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  const todayShifts = shifts.filter((s) => s.start_time.startsWith('2026-09-27') || !s.end_time);
  const collectedToday = collections.reduce((acc, c) => acc + c.amount, 0);
  const totalDueToday = todayShifts.reduce((acc, s) => acc + s.total_due, 0);
  const pendingToday = Math.max(0, totalDueToday - collectedToday);

  // Document alerts
  let docAlertsCount = 0;
  let expiredDocsCount = 0;
  vehicles.forEach((v) => {
    const docs = [
      v.documents.fitness_expiry,
      v.documents.permit_expiry,
      v.documents.insurance_expiry,
      v.documents.puc_expiry,
    ];
    docs.forEach((d) => {
      const st = checkDocStatus(d);
      if (st.status === 'EXPIRED') {
        expiredDocsCount++;
        docAlertsCount++;
      } else if (st.status === 'EXPIRING_SOON') {
        docAlertsCount++;
      }
    });
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19]">
      <Header
        title="Fleet Command Center"
        subtitle="Commercial Taxi Real-Time Dispatch, GPS Telematics & Ledger"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Yard Supervisor Quick Handoffs</h2>
            <p className="text-xs text-slate-400">
              One-click shift check-out, vehicle returns, rent collection, and fleet operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/dispatch"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs shadow-sm shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Check-Out</span>
            </Link>
            <Link
              href="/dispatch?mode=return"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all hover:scale-[1.02]"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Quick Check-In</span>
            </Link>
            <Link
              href="/finances"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-all hover:scale-[1.02]"
            >
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span>+ Log Payment</span>
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Interactive Map</span>
            </Link>
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              title="Refresh Telemetry"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <KpiCards
          activeCars={activeCars}
          totalCars={vehicles.length}
          availableCars={availableCars}
          maintenanceCars={maintenanceCars}
          collectedToday={collectedToday}
          pendingToday={pendingToday}
          docAlertsCount={docAlertsCount}
          expiredDocsCount={expiredDocsCount}
        />

        {/* Compliance Warning Banner if any document is expired */}
        {expiredDocsCount > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-rose-300">
                  Critical Compliance Alert: {expiredDocsCount} Expired Commercial Documents
                </h4>
                <p className="text-xs text-rose-300/80">
                  Vehicles operating with expired fitness or permit risk RTO impoundment and traffic challans.
                </p>
              </div>
            </div>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors shrink-0"
            >
              <span>Audit Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Live Fleet Status Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Live Commercial Fleet Status
              </h3>
              <p className="text-xs text-slate-400">
                Real-time telematics, assigned drivers, fuel levels, and current coordinates
              </p>
            </div>
            <Link
              href="/vehicles"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Manage All Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const assignedDriver = drivers.find((d) => d.id === v.assigned_driver_id);
              const isMoving = v.last_location.speed > 5 && v.last_location.ignition;
              const isIdling = v.last_location.speed <= 5 && v.last_location.ignition;

              return (
                <div
                  key={v.id}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Plate & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-wide text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {v.plate_number}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {v.fuel_type}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300 mt-1">{v.model}</p>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {v.status === 'ASSIGNED' && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              isMoving
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                                : isIdling
                                ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMoving
                                  ? 'bg-emerald-400 animate-pulse'
                                  : isIdling
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {isMoving ? 'Moving' : isIdling ? 'Idling' : 'On Trip'}
                          </span>
                        )}
                        {v.status === 'AVAILABLE' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            In Yard
                          </span>
                        )}
                        {v.status === 'MAINTENANCE' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Workshop
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Driver details */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                      {assignedDriver ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-900/40 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-700/50">
                            {assignedDriver.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              {assignedDriver.full_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {assignedDriver.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600" />
                          Unassigned (Parked in Yard)
                        </div>
                      )}

                      {v.status === 'ASSIGNED' ? (
                        <Link
                          href={`/dispatch?mode=return&shiftId=${v.current_shift_id || ''}`}
                          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/60 px-2 py-1 rounded border border-blue-800/40 transition-colors"
                        >
                          Check-In
                        </Link>
                      ) : v.status === 'AVAILABLE' ? (
                        <Link
                          href={`/dispatch?vehicleId=${v.id}`}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 px-2 py-1 rounded border border-emerald-800/40 transition-colors"
                        >
                          Dispatch
                        </Link>
                      ) : null}
                    </div>

                    {/* Metrics: Fuel, Odometer, Speed */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                          <Fuel className="w-3 h-3 text-amber-400" />
                          <span>Fuel / CNG</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{v.fuel_level}%</span>
                          <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                v.fuel_level > 30 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${v.fuel_level}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                          <Gauge className="w-3 h-3 text-blue-400" />
                          <span>Odometer</span>
                        </div>
                        <span className="font-semibold text-slate-200 font-mono text-[11px]">
                          {v.current_odometer.toLocaleString()} km
                        </span>
                      </div>

                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                          <Navigation className="w-3 h-3 text-emerald-400" />
                          <span>Speed</span>
                        </div>
                        <span className="font-semibold text-slate-200 font-mono text-[11px]">
                          {v.last_location.speed} km/h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: GPS Location link */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {v.last_location.lat.toFixed(4)}, {v.last_location.lng.toFixed(4)}
                    </span>
                    <Link
                      href={`/map?focus=${v.id}`}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Track Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial & Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Collections */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Daily Collections</h3>
                <p className="text-xs text-slate-400">Latest driver rent receipts logged at the yard</p>
              </div>
              <Link
                href="/finances"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View All Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {collections.slice(0, 4).map((c) => {
                const driver = drivers.find((d) => d.id === c.driver_id);
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {driver?.full_name || 'Driver'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {c.payment_mode}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Receipt: {c.receipt_number} • {c.collected_by}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400">
                        +{formatINR(c.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operating Fleet Expenses */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Fleet Expenses</h3>
                <p className="text-xs text-slate-400">Repairs, oil changes, CNG tests & maintenance</p>
              </div>
              <Link
                href="/finances"
                className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Log New Expense</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {expenses.slice(0, 4).map((e) => {
                const vehicle = vehicles.find((v) => v.id === e.vehicle_id);
                return (
                  <div
                    key={e.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {e.description}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {vehicle?.plate_number} • {e.category} • {e.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-400">
                        -{formatINR(e.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

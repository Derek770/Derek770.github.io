'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import AddDriverModal from '@/components/drivers/AddDriverModal';
import { Driver, Vehicle } from '@/types';
import { apiGetDrivers, apiGetVehicles, apiDeleteDriver } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Users,
  Phone,
  CreditCard,
  ShieldAlert,
  Car,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DEFICIT'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      const [d, v] = await Promise.all([apiGetDrivers(), apiGetVehicles()]);
      setDrivers(d);
      setVehicles(v);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteDriver = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove driver ${name} from the active registry?`)) {
      try {
        await apiDeleteDriver(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(search.toLowerCase()) ||
      driver.phone.includes(search) ||
      driver.license_number.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE') return driver.status === 'ACTIVE';
    if (filterStatus === 'DEFICIT') return driver.current_balance < 0;
    return true;
  });

  const totalSecurityDeposits = drivers.reduce((acc, d) => acc + d.security_deposit, 0);
  const activeCount = drivers.filter((d) => d.status === 'ACTIVE').length;
  const deficitCount = drivers.filter((d) => d.current_balance < 0).length;

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19]">
      <Header
        title="Driver Directory & Accounts"
        subtitle="Commercial taxi drivers, security deposit escrows, license records & rolling balances"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Commercial Drivers
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{activeCount}</span>
              <span className="text-xs text-slate-400">/ {drivers.length} registered</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">All verified with commercial badges</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Security Deposit Held
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {formatINR(totalSecurityDeposits)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Escrow collateral for damages & dues</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              Drivers with Deficit
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {deficitCount}
              </span>
              <span className="text-xs text-amber-400/80">Carried-over pending dues</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Requires daily settlement at yard</p>
          </div>
        </div>

        {/* Filter & Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'ALL'
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Drivers ({drivers.length})
              </button>
              <button
                onClick={() => setFilterStatus('DEFICIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'DEFICIT'
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Deficit ({deficitCount})
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Onboard New Driver</span>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filteredDrivers.length === 0 && (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Drivers Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your driver directory is currently empty. Click below to onboard your first commercial driver.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Onboard First Driver</span>
            </button>
          </div>
        )}

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((driver) => {
            const assignedVehicle = vehicles.find((v) => v.id === driver.assigned_vehicle_id);
            const isDeficit = driver.current_balance < 0;

            return (
              <div
                key={driver.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top: Avatar & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0">
                        {driver.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={driver.photo_url}
                            alt={driver.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          driver.full_name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{driver.full_name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {driver.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        {driver.status}
                      </span>
                      <button
                        onClick={() => handleDeleteDriver(driver.id, driver.full_name)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remove Driver"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* License & Deposit */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Driver License:</span>
                      <span className="text-slate-300 font-semibold">{driver.license_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Security Deposit:</span>
                      <span className="text-slate-200 font-bold">
                        {formatINR(driver.security_deposit)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 font-sans">
                      <span className="text-slate-400">Current Balance:</span>
                      <span
                        className={`font-mono font-bold ${
                          isDeficit
                            ? 'text-rose-400'
                            : driver.current_balance > 0
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {formatINR(driver.current_balance)}
                        {isDeficit ? ' (Deficit)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Duty Status:</span>
                    {assignedVehicle ? (
                      <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        {assignedVehicle.plate_number}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Off Duty (In Yard)</span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  {!assignedVehicle ? (
                    <Link
                      href={`/dispatch?driverId=${driver.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Assign Cab
                    </Link>
                  ) : (
                    <Link
                      href={`/dispatch?mode=return`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      Check-In Duty
                    </Link>
                  )}
                  <Link
                    href={`/finances`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Ledger
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

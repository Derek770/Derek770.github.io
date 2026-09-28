'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import AddVehicleModal from '@/components/vehicles/AddVehicleModal';
import { Vehicle, Driver } from '@/types';
import { apiGetVehicles, apiGetDrivers, apiDeleteVehicle, apiClearAllData } from '@/lib/store';
import { formatINR, formatDate, checkDocStatus, getVehicleDocComplianceList } from '@/lib/utils';
import {
  Car,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Fuel,
  Gauge,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ALERTS_ONLY' | 'EXPIRED'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      const [v, d] = await Promise.all([apiGetVehicles(), apiGetDrivers()]);
      setVehicles(v);
      setDrivers(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteVehicle = async (id: string, plate: string) => {
    if (confirm(`Are you sure you want to remove vehicle ${plate} from the fleet registry?`)) {
      try {
        await apiDeleteVehicle(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Warning: This will remove all vehicle, driver, and shift records to give you a completely clean, empty system. Continue?')) {
      try {
        await apiClearAllData();
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.chassis_number.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'ALL') return true;

    const docs = getVehicleDocComplianceList(v.documents);
    if (filterMode === 'EXPIRED') {
      return docs.some((d) => d.status === 'EXPIRED');
    }
    if (filterMode === 'ALERTS_ONLY') {
      return docs.some((d) => d.status === 'EXPIRED' || d.status === 'EXPIRING_SOON');
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19]">
      <Header
        title="Vehicle & Compliance Registry"
        subtitle="Commercial cab profiles, technical specifications & automated RTO compliance expiry monitoring"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Compliance Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`p-4 rounded-xl text-left border transition-all ${
              filterMode === 'ALL'
                ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Fleet Vehicles
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{vehicles.length}</span>
              <span className="text-xs text-slate-400">Commercial Cabs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">View all registered taxis</p>
          </button>

          <button
            onClick={() => setFilterMode('ALERTS_ONLY')}
            className={`p-4 rounded-xl text-left border transition-all ${
              filterMode === 'ALERTS_ONLY'
                ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-950/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Expiring Within 15 Days
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-300">
                {
                  vehicles.filter((v) =>
                    getVehicleDocComplianceList(v.documents).some(
                      (d) => d.status === 'EXPIRING_SOON'
                    )
                  ).length
                }
              </span>
              <span className="text-xs text-amber-400/80">Cabs due for renewal</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Fitness, Insurance or Permits</p>
          </button>

          <button
            onClick={() => setFilterMode('EXPIRED')}
            className={`p-4 rounded-xl text-left border transition-all ${
              filterMode === 'EXPIRED'
                ? 'bg-rose-950/30 border-rose-500/60 shadow-md shadow-rose-950/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Expired Compliance (Critical)
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-400">
                {
                  vehicles.filter((v) =>
                    getVehicleDocComplianceList(v.documents).some((d) => d.status === 'EXPIRED')
                  ).length
                }
              </span>
              <span className="text-xs text-rose-400/80">Challan / Seizure Risk</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Urgent RTO renewal needed</p>
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by plate number, model, or chassis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Register New Cab</span>
            </button>

            {vehicles.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-medium transition-colors"
                title="Wipe records to start completely fresh"
              >
                Clear All Records
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filteredVehicles.length === 0 && (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Vehicles in Registry</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your fleet registry is currently empty. Click below to add your first commercial taxi.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register First Cab</span>
            </button>
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const assignedDriver = drivers.find((d) => d.id === vehicle.assigned_driver_id);
            const docList = getVehicleDocComplianceList(vehicle.documents);
            const hasExpired = docList.some((d) => d.status === 'EXPIRED');
            const hasExpiringSoon = docList.some((d) => d.status === 'EXPIRING_SOON');

            return (
              <div
                key={vehicle.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <Car className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-white tracking-wider px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700">
                          {vehicle.plate_number}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {vehicle.fuel_type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            vehicle.status === 'ASSIGNED'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : vehicle.status === 'AVAILABLE'
                              ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mt-1">{vehicle.model}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/map?focus=${vehicle.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Locate on Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {vehicle.status === 'AVAILABLE' ? (
                      <Link
                        href={`/dispatch?vehicleId=${vehicle.id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950 transition-colors"
                      >
                        + Dispatch
                      </Link>
                    ) : vehicle.status === 'ASSIGNED' ? (
                      <Link
                        href={`/dispatch?mode=return&shiftId=${vehicle.current_shift_id || ''}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
                      >
                        Check-In
                      </Link>
                    ) : null}

                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate_number)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Chassis Number</span>
                    <span className="font-mono text-slate-200 font-medium truncate block">
                      {vehicle.chassis_number}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Current Odometer</span>
                    <span className="font-mono font-bold text-slate-200">
                      {vehicle.current_odometer.toLocaleString()} km
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Daily Lease Rate</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {formatINR(vehicle.daily_rent_rate || 800)} / shift
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Assigned Driver</span>
                    <span className="font-semibold text-emerald-400">
                      {assignedDriver ? assignedDriver.full_name : 'None (Yard Stock)'}
                    </span>
                  </div>
                </div>

                {/* Compliance Document Expiry Tracker */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>RTO Compliance Documents Status</span>
                    </h5>
                    {hasExpired ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                        EXPIRED DOCUMENTS FOUND
                      </span>
                    ) : hasExpiringSoon ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        RENEWAL REQUIRED SOON
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400">
                        ✓ All 4 Documents Valid
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {docList.map((doc) => {
                      const isValid = doc.status === 'VALID';
                      const isExpiring = doc.status === 'EXPIRING_SOON';
                      const isExpired = doc.status === 'EXPIRED';

                      return (
                        <div
                          key={doc.docType}
                          className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${
                            isExpired
                              ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                              : isExpiring
                              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] truncate">{doc.label}</span>
                            {isExpired && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white">
                                EXPIRED
                              </span>
                            )}
                            {isExpiring && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                                {doc.daysRemaining}d left
                              </span>
                            )}
                            {isValid && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                                Valid
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            Expires: {formatDate(doc.expiryDate)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Car, Warehouse, IndianRupee, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface KpiCardsProps {
  activeCars: number;
  totalCars: number;
  availableCars: number;
  maintenanceCars: number;
  collectedToday: number;
  pendingToday: number;
  docAlertsCount: number;
  expiredDocsCount: number;
}

export default function KpiCards({
  activeCars,
  totalCars,
  availableCars,
  maintenanceCars,
  collectedToday,
  pendingToday,
  docAlertsCount,
  expiredDocsCount,
}: KpiCardsProps) {
  const collectionTotal = collectedToday + pendingToday;
  const collectionRate = collectionTotal > 0 ? Math.round((collectedToday / collectionTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Cars on Road */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active on Road
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Car className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{activeCars}</span>
          <span className="text-xs text-slate-400 font-medium">/ {totalCars} Total Fleet</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {Math.round((activeCars / (totalCars || 1)) * 100)}% Utilization
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{maintenanceCars} in workshop</span>
        </div>
      </div>

      {/* 2. Cars in Yard */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available in Yard
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Warehouse className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{availableCars}</span>
          <span className="text-xs text-blue-400 font-medium">Ready for Dispatch</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Cleaned & inspected for next shift</span>
        </div>
      </div>

      {/* 3. Today's Collections */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today&apos;s Collections
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-300 tracking-tight">
            {formatINR(collectedToday)}
          </span>
          <span className="text-xs text-slate-400">collected</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-rose-400 font-medium flex items-center gap-1">
            Pending: {formatINR(pendingToday)}
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {collectionRate}% realized
          </span>
        </div>
      </div>

      {/* 4. Upcoming Document Expirations */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Compliance Alerts
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-rose-400 tracking-tight">{docAlertsCount}</span>
          <span className="text-xs text-slate-400 font-medium">Docs Requiring Action</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          {expiredDocsCount > 0 ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {expiredDocsCount} Expired (Challan Risk)
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">No expired documents</span>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-amber-400">{docAlertsCount - expiredDocsCount} due soon</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import FleetMap from '@/components/map/FleetMap';
import { Vehicle, Driver, Shift } from '@/types';
import { apiGetVehicles, apiGetDrivers, apiGetShifts } from '@/lib/store';

function MapContent() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

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
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
      <Header
        title="Live Fleet Map & Telematics"
        subtitle="Real-time GPS tracker pings, ignition statuses, and route audit trails"
      />
      <div className="flex-1 relative">
        <FleetMap
          vehicles={vehicles}
          drivers={drivers}
          shifts={shifts}
          focusVehicleId={focusId}
          onRefresh={loadData}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
          Loading map viewport...
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}

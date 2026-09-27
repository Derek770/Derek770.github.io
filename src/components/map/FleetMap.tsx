'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Vehicle, Driver, Shift } from '@/types';
import { Loader2 } from 'lucide-react';

const DynamicFleetMap = dynamic(() => import('./FleetMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="text-sm font-medium">Loading Real-Time GPS Telematics Map...</p>
    </div>
  ),
});

interface FleetMapProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  shifts: Shift[];
  focusVehicleId?: string | null;
  onRefresh: () => void;
}

export default function FleetMap(props: FleetMapProps) {
  return <DynamicFleetMap {...props} />;
}

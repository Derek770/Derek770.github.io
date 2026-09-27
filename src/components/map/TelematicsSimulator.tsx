'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Radio, Send, Play, Square, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Vehicle } from '@/types';
import { apiSendTelematicsPing } from '@/lib/store';

interface TelematicsSimulatorProps {
  vehicles: Vehicle[];
  onPingSent: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'IGI Airport T3, Delhi', lat: 28.5562, lng: 77.1000 },
  { name: 'Cyber Hub, Gurgaon', lat: 28.4950, lng: 77.0895 },
  { name: 'Sector 62 Fleet Yard, Noida', lat: 28.6280, lng: 77.3649 },
  { name: 'Anand Vihar ISBT, Delhi', lat: 28.6469, lng: 77.3160 },
  { name: 'Okhla Phase 3 Workshop', lat: 28.5355, lng: 77.2690 },
];

export default function TelematicsSimulator({ vehicles, onPingSent }: TelematicsSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [lat, setLat] = useState<number>(28.6315);
  const [lng, setLng] = useState<number>(77.2167);
  const [speed, setSpeed] = useState<number>(45);
  const [ignition, setIgnition] = useState<boolean>(true);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Auto-drive simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const simStepRef = useRef(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
      setLat(vehicles[0].last_location.lat);
      setLng(vehicles[0].last_location.lng);
    }
  }, [vehicles, selectedVehicleId]);

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    const v = vehicles.find((veh) => veh.id === id);
    if (v) {
      setLat(v.last_location.lat);
      setLng(v.last_location.lng);
      setSpeed(v.last_location.speed);
      setIgnition(v.last_location.ignition);
    }
  };

  const handleSendPing = async () => {
    const v = vehicles.find((veh) => veh.id === selectedVehicleId);
    if (!v) return;

    setSending(true);
    setStatusMsg(null);
    try {
      const result = await apiSendTelematicsPing({
        device_id: v.plate_number, // supports plate or id
        lat,
        lng,
        speed,
        ignition,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        setStatusMsg({ text: `Ping ingested for ${v.plate_number}! Location updated.` });
        onPingSent();
      } else {
        setStatusMsg({ text: result.error || 'Failed to ingest telematics', error: true });
      }
    } catch (err) {
      setStatusMsg({ text: (err as Error).message, error: true });
    } finally {
      setSending(false);
    }
  };

  const startAutoSimulation = () => {
    setIsSimulating(true);
    simStepRef.current = 0;

    // Simulate route towards Connaught Place with small delta
    simIntervalRef.current = setInterval(async () => {
      const v = vehicles.find((veh) => veh.id === selectedVehicleId);
      if (!v) return;

      simStepRef.current += 1;
      const angle = simStepRef.current * 0.15;
      const newLat = Number((28.6315 + Math.sin(angle) * 0.015).toFixed(5));
      const newLng = Number((77.2167 + Math.cos(angle) * 0.015).toFixed(5));
      const newSpeed = Math.floor(35 + Math.random() * 25);

      setLat(newLat);
      setLng(newLng);
      setSpeed(newSpeed);

      await apiSendTelematicsPing({
        device_id: v.plate_number,
        lat: newLat,
        lng: newLng,
        speed: newSpeed,
        ignition: true,
        timestamp: new Date().toISOString(),
      });
      onPingSent();
    }, 3000);
  };

  const stopAutoSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105"
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Telematics Ping Tester</span>
          {isSimulating && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      ) : (
        <div className="w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-100 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                GPS Webhook Tester
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Simulates IoT GPS trackers posting to{' '}
            <code className="text-emerald-400 font-mono">/api/telematics/ping</code>
          </p>

          {/* Vehicle selector */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Select Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} ({v.model.split(' ')[0]}) - {v.status}
                </option>
              ))}
            </select>
          </div>

          {/* Preset location buttons */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Quick Teleport Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setLat(loc.lat);
                    setLng(loc.lng);
                  }}
                  className="text-[10px] text-left p-1.5 rounded bg-slate-900/80 hover:bg-slate-850 hover:text-emerald-300 text-slate-300 border border-slate-800/80 truncate transition-colors"
                  title={loc.name}
                >
                  📍 {loc.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinate inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Speed & Ignition */}
          <div className="grid grid-cols-2 gap-2 text-xs items-center">
            <div>
              <label className="text-[10px] text-slate-400">Speed ({speed} km/h)</label>
              <input
                type="range"
                min="0"
                max="120"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                id="ignitionCheck"
                checked={ignition}
                onChange={(e) => setIgnition(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <label htmlFor="ignitionCheck" className="text-xs text-slate-300 cursor-pointer">
                Ignition ON
              </label>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                statusMsg.error
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              {statusMsg.error ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Check className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{statusMsg.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={handleSendPing}
              disabled={sending || isSimulating}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Posting...' : 'Send Ping'}</span>
            </button>

            {!isSimulating ? (
              <button
                onClick={startAutoSimulation}
                className="flex items-center gap-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
                title="Auto drive cab every 3s"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate</span>
              </button>
            ) : (
              <button
                onClick={stopAutoSimulation}
                className="flex items-center gap-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Vehicle, Driver, Shift, GpsPoint } from '@/types';
import VehicleDrawer from './VehicleDrawer';
import RoutePlaybackControl from './RoutePlaybackControl';
import { Layers, Maximize2, Compass } from 'lucide-react';

interface FleetMapInnerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  shifts: Shift[];
  focusVehicleId?: string | null;
  onRefresh: () => void;
}

export default function FleetMapInner({
  vehicles,
  drivers,
  shifts,
  focusVehicleId,
  onRefresh,
}: FleetMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [vehicleId: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const playbackMarkerRef = useRef<L.Marker | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Playback state
  const [playbackShift, setPlaybackShift] = useState<Shift | null>(null);
  const [playbackPoints, setPlaybackPoints] = useState<GpsPoint[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center in Delhi NCR
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | FleetPulse GPS',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update or create vehicle markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    vehicles.forEach((vehicle) => {
      const { lat, lng, speed, ignition } = vehicle.last_location;
      const isMoving = speed > 5 && ignition;
      const isIdling = speed <= 5 && ignition;

      // Color coding:
      // Green = Moving, Yellow = Idling / Ignition ON, Red = Parked / Ignition OFF, Gray = Offline
      let colorClass = 'bg-slate-500 border-slate-300';
      let radarPulseClass = '';
      let statusText = 'Parked';
      let glowColor = 'rgba(239, 68, 68, 0.4)';

      if (isMoving) {
        colorClass = 'bg-emerald-500 border-emerald-300 text-slate-950 font-bold';
        radarPulseClass = 'pulse-radar-moving';
        statusText = `${speed} km/h`;
        glowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (isIdling) {
        colorClass = 'bg-amber-400 border-amber-200 text-slate-950 font-bold';
        radarPulseClass = 'pulse-radar-idling';
        statusText = 'Idling';
        glowColor = 'rgba(245, 158, 11, 0.5)';
      } else {
        colorClass = 'bg-rose-500 border-rose-300 text-white font-bold';
        statusText = 'OFF';
      }

      const customIcon = L.divIcon({
        className: 'custom-taxi-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div class="${radarPulseClass}" style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${isMoving ? '#10b981' : isIdling ? '#f59e0b' : '#ef4444'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px ${glowColor};
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
                isMoving ? '#34d399' : isIdling ? '#fbbf24' : '#f87171'
              }" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <div style="
              margin-top: 2px;
              padding: 1px 6px;
              border-radius: 9999px;
              font-size: 9px;
              font-family: monospace;
              white-space: nowrap;
              border: 1px solid #334155;
              background: #090d16;
              color: #f8fafc;
              box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            ">
              ${vehicle.plate_number.split(' ')[0]} ${vehicle.plate_number.split(' ')[1] || ''}
            </div>
          </div>
        `,
      });

      if (markersRef.current[vehicle.id]) {
        // Move existing marker
        markersRef.current[vehicle.id].setLatLng([lat, lng]);
        markersRef.current[vehicle.id].setIcon(customIcon);
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicle(vehicle);
        });
        markersRef.current[vehicle.id] = marker;
      }
    });

    // Check if initial focus requested
    if (focusVehicleId) {
      const v = vehicles.find((item) => item.id === focusVehicleId);
      if (v) {
        setSelectedVehicle(v);
        map.setView([v.last_location.lat, v.last_location.lng], 14, { animate: true });
      }
    }
  }, [vehicles, focusVehicleId]);

  // Handle Route Playback Trail
  const handleStartRoutePlayback = (shift: Shift) => {
    if (!shift.gps_trail || shift.gps_trail.length === 0) return;

    setPlaybackShift(shift);
    setPlaybackPoints(shift.gps_trail);
    setPlaybackIndex(0);
    setIsPlaying(true);

    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing polyline if any
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    if (playbackMarkerRef.current) {
      map.removeLayer(playbackMarkerRef.current);
    }

    const latLngs: [number, number][] = shift.gps_trail.map((p) => [p.lat, p.lng]);

    // Draw glowing route polyline
    const polyline = L.polyline(latLngs, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      dashArray: undefined,
    }).addTo(map);

    polylineRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [60, 60], animate: true });

    // Create playback moving car marker
    const startPoint = shift.gps_trail[0];
    const playIcon = L.divIcon({
      className: 'playback-active-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #047857;
          border: 3px solid #6ee7b7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.9);
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      `,
    });

    const pMarker = L.marker([startPoint.lat, startPoint.lng], { icon: playIcon, zIndexOffset: 2000 }).addTo(map);
    playbackMarkerRef.current = pMarker;
  };

  // Playback timer ticker
  useEffect(() => {
    if (!isPlaying || playbackPoints.length === 0) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      return;
    }

    const intervalTime = Math.max(200, 1500 / playbackSpeed);

    playbackTimerRef.current = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= playbackPoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        const pt = playbackPoints[next];
        if (playbackMarkerRef.current && pt) {
          playbackMarkerRef.current.setLatLng([pt.lat, pt.lng]);
        }
        return next;
      });
    }, intervalTime);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, playbackPoints, playbackSpeed]);

  const handleSeek = (index: number) => {
    setPlaybackIndex(index);
    const pt = playbackPoints[index];
    if (playbackMarkerRef.current && pt) {
      playbackMarkerRef.current.setLatLng([pt.lat, pt.lng]);
      mapInstanceRef.current?.panTo([pt.lat, pt.lng]);
    }
  };

  const handleClosePlayback = () => {
    setIsPlaying(false);
    setPlaybackShift(null);
    setPlaybackPoints([]);
    if (polylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (playbackMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(playbackMarkerRef.current);
      playbackMarkerRef.current = null;
    }
  };

  // Center on entire fleet
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map || vehicles.length === 0) return;
    const bounds = L.latLngBounds(vehicles.map((v) => [v.last_location.lat, v.last_location.lng]));
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  const selectedDriver = drivers.find((d) => d.id === selectedVehicle?.assigned_driver_id);
  const selectedShift = shifts.find(
    (s) => s.vehicle_id === selectedVehicle?.id && s.end_time === null
  );

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />


      {/* Map Control Buttons: Recenter & Audit past route */}
      <div className="absolute top-4 right-4 z-[990] flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shadow-xl backdrop-blur-md transition-colors"
          title="Fit Fleet to Screen"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Quick Route Audit Selector */}
        <div className="relative">
          <select
            onChange={(e) => {
              const s = shifts.find((shift) => shift.id === e.target.value);
              if (s) handleStartRoutePlayback(s);
            }}
            value={playbackShift?.id || ''}
            className="text-xs bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-slate-200 shadow-xl focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">Audit Past Route...</option>
            {shifts
              .filter((s) => s.gps_trail && s.gps_trail.length > 1)
              .map((s) => {
                const veh = vehicles.find((v) => v.id === s.vehicle_id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.id} • {veh?.plate_number} ({s.end_time ? 'Completed' : 'Live'})
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Slide-out Vehicle Drawer */}
      <VehicleDrawer
        vehicle={selectedVehicle}
        driver={selectedDriver}
        activeShift={selectedShift}
        onClose={() => setSelectedVehicle(null)}
        onPlayRoute={handleStartRoutePlayback}
      />

      {/* Historical Route Playback Player */}
      {playbackShift && playbackPoints.length > 0 && (
        <RoutePlaybackControl
          shift={playbackShift}
          points={playbackPoints}
          currentIndex={playbackIndex}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onSpeedChange={setPlaybackSpeed}
          onClose={handleClosePlayback}
        />
      )}
    </div>
  );
}

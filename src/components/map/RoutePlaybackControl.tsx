'use client';

import React from 'react';
import { Play, Pause, RotateCcw, X, Gauge, MapPin, Zap } from 'lucide-react';
import { Shift, GpsPoint } from '@/types';

interface RoutePlaybackControlProps {
  shift: Shift;
  points: GpsPoint[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
  onClose: () => void;
}

export default function RoutePlaybackControl({
  shift,
  points,
  currentIndex,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onSeek,
  onSpeedChange,
  onClose,
}: RoutePlaybackControlProps) {
  const currentPoint = points[currentIndex] || points[0];
  const maxSpeed = Math.max(...points.map((p) => p.speed || 0));

  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[680px] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 z-[1000] text-slate-100 space-y-3">
      {/* Top row: Shift summary & close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Route Playback Audit
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {shift.id}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Shift GPS Trail • {points.length} coordinates recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400">Max Speed:</span>
            <span className="font-mono font-bold text-amber-300 text-xs">{maxSpeed} km/h</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrubber slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={points.length - 1}
          value={currentIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Start: {new Date(points[0]?.timestamp || '').toLocaleTimeString()}</span>
          <span className="text-emerald-400 font-semibold">
            Point {currentIndex + 1} of {points.length}
          </span>
          <span>End: {new Date(points[points.length - 1]?.timestamp || '').toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Control bar: Play/Pause, speed, live coordinates */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onSeek(0)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Restart Route"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed selectors */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono ml-2">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentPoint?.speed || 0} km/h</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>
              {currentPoint?.lat.toFixed(4)}, {currentPoint?.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

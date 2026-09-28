'use client';

import React from 'react';
import { CheckSquare, Square, AlertCircle, Camera } from 'lucide-react';

interface DamageInspectorProps {
  selectedItems: string[];
  onChange: (items: string[]) => void;
  title?: string;
}

const CHECKLIST_AREAS = [
  'Front Bumper & Grille',
  'Rear Bumper & Dicky',
  'Windshield & Windows Glass',
  'Driver Side Doors (Left)',
  'Passenger Side Doors (Right)',
  'Tyres Condition & Spare Wheel',
  'Jack & Tool Kit Available',
  'CNG Cylinder Seal & Fitment',
];

export default function DamageInspector({
  selectedItems,
  onChange,
  title = 'Vehicle Pre-Inspection Checklist & Damages',
}: DamageInspectorProps) {
  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      onChange(selectedItems.filter((i) => i !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{title}</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          {selectedItems.length} issues flagged
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CHECKLIST_AREAS.map((area) => {
          const isSelected = selectedItems.includes(area);
          return (
            <button
              type="button"
              key={area}
              onClick={() => toggleItem(area)}
              className={`flex items-center gap-2.5 p-2 rounded-lg text-xs text-left transition-colors border ${
                isSelected
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="truncate">{area}</span>
            </button>
          );
        })}
      </div>

      {/* Vehicle photo upload */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Vehicle Inspection Photo:</span>
        </div>
        <label className="cursor-pointer text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40 transition-colors">
          Browse / Camera
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const name = e.target.files[0].name;
                if (!selectedItems.includes(`Photo attached: ${name}`)) {
                  onChange([...selectedItems, `Photo attached: ${name}`]);
                }
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

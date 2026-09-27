'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  ArrowLeftRight,
  Users,
  Car,
  Receipt,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { apiResetSeeds } from '@/lib/store';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Live Fleet Map', href: '/map', icon: MapPin, highlight: true },
  { label: 'Dispatch & Handoff', href: '/dispatch', icon: ArrowLeftRight },
  { label: 'Driver Registry', href: '/drivers', icon: Users },
  { label: 'Vehicles & Compliance', href: '/vehicles', icon: Car },
  { label: 'Financial Ledger', href: '/finances', icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [resetting, setResetting] = React.useState(false);

  const handleResetSeeds = async () => {
    if (confirm('Reset mock database back to default 5 vehicles, 5 drivers, and active shifts?')) {
      setResetting(true);
      try {
        await apiResetSeeds();
        window.location.reload();
      } catch (err) {
        console.error(err);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Fleet<span className="text-emerald-400">Pulse</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                Taxi Ops Control
              </p>
            </div>
          </Link>
        </div>

        {/* Live Status indicator */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Delhi-NCR Fleet Hub
          </span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/50">
            5 CABS
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.highlight && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Yard Supervisor info & reset */}
      <div className="p-4 border-t border-slate-800/60 space-y-3 bg-slate-950/60">
        <button
          onClick={handleResetSeeds}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting Data...' : 'Reset Mock Seed Data'}
        </button>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
            SY
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">Sunil Yadav</p>
            <p className="text-[11px] text-slate-400 truncate">Yard Supervisor (Noida Hub)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Receipt, PlusCircle, Radio, Clock } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenQuickCheckout?: () => void;
  onOpenQuickReturn?: () => void;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            {title || 'Commercial Fleet Command Center'}
          </h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live GPS Telemetry Pulse indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400">GPS INGESTION: LIVE</span>
        </div>

        {/* Digital Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '17:35:00'} IST</span>
        </div>

        {/* Quick action buttons */}
        <Link
          href="/dispatch"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors shadow-sm shadow-emerald-950"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Check-Out</span>
        </Link>

        <Link
          href="/dispatch?mode=return"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Return</span>
        </Link>

        <Link
          href="/finances"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors border border-slate-800"
        >
          <Receipt className="w-3.5 h-3.5 text-amber-400" />
          <span>Collections</span>
        </Link>
      </div>
    </header>
  );
}

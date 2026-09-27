import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'FleetPulse | Commercial Fleet & Driver Management System',
  description:
    'Production-ready Fleet Management Platform for commercial taxi operators: real-time GPS telematics, shift dispatch & return, daily rental fee ledger, and vehicle compliance tracker.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col md:flex-row bg-[#0b0f19] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

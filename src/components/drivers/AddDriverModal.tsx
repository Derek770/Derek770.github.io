'use client';

import React, { useState } from 'react';
import { X, User, Plus, Phone, CreditCard, Shield } from 'lucide-react';
import { apiCreateDriver } from '@/lib/store';

interface AddDriverModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDriverModal({ onClose, onSuccess }: AddDriverModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState(10000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !licenseNumber.trim()) {
      setErrorMsg('Full name, phone, and license number are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiCreateDriver({
        full_name: fullName.trim(),
        phone: phone.trim(),
        license_number: licenseNumber.trim().toUpperCase(),
        security_deposit: Number(securityDeposit),
        current_balance: Number(currentBalance),
        photo_url: photoUrl.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to onboard driver');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Onboard Commercial Driver</h3>
              <p className="text-xs text-slate-400">Add an active commercial driver to registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Driver Full Name</label>
            <input
              type="text"
              placeholder="e.g., Rajesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Mobile Phone</label>
            <input
              type="tel"
              placeholder="+91 98101 XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* License Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Commercial Driving License</label>
            <input
              type="text"
              placeholder="e.g., DL-0420180019284"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              className="w-full text-xs font-mono font-bold uppercase bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Deposit & Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Security Deposit (₹)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Opening Balance (₹)</label>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Photo URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{submitting ? 'Onboarding Driver...' : 'Onboard Driver to Fleet'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DocumentComplianceStatus, DocumentStatusInfo, VehicleDocuments } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function checkDocStatus(expiryDateIso: string): {
  status: DocumentComplianceStatus;
  daysRemaining: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateIso);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: "EXPIRED", daysRemaining };
  } else if (daysRemaining <= 15) {
    return { status: "EXPIRING_SOON", daysRemaining };
  }
  return { status: "VALID", daysRemaining };
}

export function getVehicleDocComplianceList(docs: VehicleDocuments): DocumentStatusInfo[] {
  const list: { key: keyof VehicleDocuments; label: string; docType: DocumentStatusInfo["docType"] }[] = [
    { key: "fitness_expiry", label: "Commercial Fitness", docType: "fitness" },
    { key: "permit_expiry", label: "Commercial Permit", docType: "permit" },
    { key: "insurance_expiry", label: "Taxi Insurance", docType: "insurance" },
    { key: "puc_expiry", label: "PUC Certificate", docType: "puc" },
  ];

  return list.map((item) => {
    const expiry = docs[item.key];
    const { status, daysRemaining } = checkDocStatus(expiry);
    return {
      docType: item.docType,
      label: item.label,
      expiryDate: expiry,
      status,
      daysRemaining,
    };
  });
}

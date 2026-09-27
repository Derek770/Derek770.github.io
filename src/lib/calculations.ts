export interface ShiftCalculationParams {
  startOdometer: number;
  endOdometer: number;
  startTime: string;
  endTime: string;
  startFuel: number;
  endFuel: number;
  baseDailyRent?: number; // default ₹800
  gracePeriodHours?: number; // standard shift duration limit, e.g. 14 hours
}

export interface ShiftCalculationResult {
  totalKm: number;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string;
  baseRent: number;
  latePenalty: number;
  fuelPenalty: number;
  damagePenalty: number;
  totalPenalties: number;
  totalRentDue: number;
}

export function calculateShiftReturn({
  startOdometer,
  endOdometer,
  startTime,
  endTime,
  startFuel,
  endFuel,
  baseDailyRent = 800,
  gracePeriodHours = 14,
}: ShiftCalculationParams): ShiftCalculationResult {
  // 1. Total Kilometers Driven
  const totalKm = Math.max(0, endOdometer - startOdometer);

  // 2. Total Shift Duration
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const durationHours = Math.floor(totalMinutes / 60);
  const durationMinutes = totalMinutes % 60;
  const durationFormatted = `${durationHours}h ${durationMinutes}m`;

  // 3. Late penalty calculation (₹50 per hour if shift exceeds gracePeriodHours, e.g. 14 hours)
  let latePenalty = 0;
  const exactHours = diffMs / (1000 * 60 * 60);
  if (exactHours > gracePeriodHours) {
    const overdueHours = Math.ceil(exactHours - gracePeriodHours);
    latePenalty = overdueHours * 50;
  }

  // 4. Low fuel/CNG deficit penalty
  // If returned with less fuel than checked out with, charge ₹8 per % deficit
  let fuelPenalty = 0;
  if (endFuel < startFuel) {
    const fuelDropPercent = startFuel - endFuel;
    fuelPenalty = fuelDropPercent * 8; // approx ₹800 for 100% full tank
  }

  const damagePenalty = 0; // custom input if damages noted
  const totalPenalties = latePenalty + fuelPenalty + damagePenalty;
  const totalRentDue = baseDailyRent + totalPenalties;

  return {
    totalKm,
    durationHours,
    durationMinutes,
    durationFormatted,
    baseRent: baseDailyRent,
    latePenalty,
    fuelPenalty,
    damagePenalty,
    totalPenalties,
    totalRentDue,
  };
}

export function calculateRollingBalance(
  currentBalance: number,
  rentDue: number,
  paidAmount: number
): {
  newBalance: number;
  isDeficit: boolean;
  deficitAmount: number;
} {
  // currentBalance: positive = credit/advance, negative = debt
  // Net balance = currentBalance - rentDue + paidAmount
  const newBalance = currentBalance - rentDue + paidAmount;
  return {
    newBalance,
    isDeficit: newBalance < 0,
    deficitAmount: newBalance < 0 ? Math.abs(newBalance) : 0,
  };
}

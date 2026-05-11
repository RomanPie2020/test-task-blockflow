import { weightLimits } from "../constants/onboarding";
import type { WeightUnit } from "../types/onboarding";

export const isValidWeight = (value: number, unit: WeightUnit) => {
  const { min, max } = weightLimits[unit];

  return value >= min && value <= max;
};

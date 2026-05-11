import type { WeightUnit } from "../types/onboarding";

export const wishOptions = ["😊 wish1", "🥳 wish2", "⚖️ wish3", "💚 wish4", "☺️ wish5"];

export const weightLimits: Record<WeightUnit, { min: number; max: number; placeholder: string; hint: string }> = {
  kg: {
    min: 10,
    max: 200,
    placeholder: "56",
    hint: "Please enter a value from 10 kg to 200 kg",
  },
  lbs: {
    min: 22,
    max: 485,
    placeholder: "123",
    hint: "Please enter a value between 22 lbs and 485 lbs",
  },
};

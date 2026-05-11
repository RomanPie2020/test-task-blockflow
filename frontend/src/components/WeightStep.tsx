import { weightLimits } from "../constants/onboarding";
import type { WeightUnit } from "../types/onboarding";

interface WeightStepProps {
  isValid: boolean;
  unit: WeightUnit;
  value: string;
  onContinue: () => void;
  onUnitChange: (unit: WeightUnit) => void;
  onValueChange: (value: string) => void;
}

export function WeightStep({ isValid, unit, value, onContinue, onUnitChange, onValueChange }: WeightStepProps) {
  const limits = weightLimits[unit];
  const showValidationError = Boolean(value) && !isValid;

  return (
    <section className="weightSection">
      <div className="unitSwitch">
        <button
          type="button"
          className={`unitOption ${unit === "lbs" ? "active" : ""}`}
          onClick={() => onUnitChange("lbs")}
        >
          lbs
        </button>
        <button
          type="button"
          className={`unitOption ${unit === "kg" ? "active" : ""}`}
          onClick={() => onUnitChange("kg")}
        >
          kg
        </button>
      </div>

      <input
        className={`weightInput ${showValidationError ? "invalid" : ""}`}
        type="number"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={limits.placeholder}
      />
      <div className={`rangeHint ${showValidationError ? "error" : ""}`}>{limits.hint}</div>

      {isValid && (
        <div className="goalCard">
          <p className="goalTitle">⚖ Goal: Lose 5% of your weight</p>
          <p className="goalText">
            Even small, steady changes can make a meaningful difference. We&apos;ll support you with a balanced plan to
            help you feel lighter, healthier, and more confident over time.
          </p>
        </div>
      )}

      <button className="continueButton" type="button" disabled={!isValid} onClick={onContinue}>
        Continue
      </button>
    </section>
  );
}

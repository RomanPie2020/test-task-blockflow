import type { Step } from "../types/onboarding";

interface ProgressHeaderProps {
  currentStep: Step;
  isBackDisabled: boolean;
  onBack: () => void;
}

export function ProgressHeader({ currentStep, isBackDisabled, onBack }: ProgressHeaderProps) {
  const progress = (currentStep / 3) * 100;

  return (
    <div className="topBar">
      <button type="button" className="backButton" onClick={onBack} disabled={isBackDisabled}>
        ‹
      </button>
      <div className="lineTrack">
        <div className="lineFill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

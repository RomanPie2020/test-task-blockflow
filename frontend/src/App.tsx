import { useMemo, useState } from "react";
import { ProgressHeader } from "./components/ProgressHeader";
import { RunStep } from "./components/RunStep";
import { WeightStep } from "./components/WeightStep";
import { WishStep } from "./components/WishStep";
import { wishOptions } from "./constants/onboarding";
import { useJobRunner } from "./hooks/useJobRunner";
import type { Step, WeightUnit } from "./types/onboarding";
import { isValidWeight } from "./utils/weight";
import "./App.css";

const stepTitles: Record<Step, string> = {
  1: "What is your main wish?",
  2: "What is your goal weight?",
  3: "Create something good for you...",
};

function App() {
  const [step, setStep] = useState<Step>(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [weightValue, setWeightValue] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");

  const { error, isHttpLoading, job, resetRunner, runningMode, startHttpRun, startWebSocketRun } = useJobRunner();

  const numericWeight = Number(weightValue);
  const isWeightValid = useMemo(() => isValidWeight(numericWeight, unit), [numericWeight, unit]);

  const goBack = () => {
    setStep((currentStep) => (currentStep === 1 ? 1 : ((currentStep - 1) as Step)));
  };

  const resetFlow = () => {
    resetRunner();
    setStep(1);
    setSelectedOption("");
    setWeightValue("");
    setUnit("kg");
  };

  const getJobPayload = () => ({
    selectedOption,
    numberValue: numericWeight,
  });

  return (
    <main className="page">
      {step < 3 && (
        <ProgressHeader currentStep={step} isBackDisabled={step === 1 || runningMode !== null} onBack={goBack} />
      )}

      <div className="card">
        <h1>{stepTitles[step]}</h1>

        {step === 1 && (
          <WishStep
            options={wishOptions}
            selectedOption={selectedOption}
            onContinue={() => setStep(2)}
            onSelect={setSelectedOption}
          />
        )}

        {step === 2 && (
          <WeightStep
            isValid={isWeightValid}
            unit={unit}
            value={weightValue}
            onContinue={() => setStep(3)}
            onUnitChange={setUnit}
            onValueChange={setWeightValue}
          />
        )}

        {step === 3 && (
          <RunStep
            error={error}
            isHttpLoading={isHttpLoading}
            job={job}
            runningMode={runningMode}
            onReset={resetFlow}
            onStartHttp={() => void startHttpRun(getJobPayload())}
            onStartWebSocket={() => void startWebSocketRun(getJobPayload())}
          />
        )}
      </div>
    </main>
  );
}

export default App;

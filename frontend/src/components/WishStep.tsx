interface WishStepProps {
  options: string[];
  selectedOption: string;
  onContinue: () => void;
  onSelect: (option: string) => void;
}

export function WishStep({ options, selectedOption, onContinue, onSelect }: WishStepProps) {
  return (
    <section>
      <div className="options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`option ${selectedOption === option ? "active" : ""}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <button type="button" disabled={!selectedOption} onClick={onContinue}>
        Continue
      </button>
    </section>
  );
}

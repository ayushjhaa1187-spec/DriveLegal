'use client';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Location & Vehicle" },
  { n: 2, label: "Violation" },
  { n: 3, label: "Result" },
];

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-md mx-auto mb-10">
      {STEPS.map((step, i) => {
        const isCompleted = step.n < currentStep;
        const isActive = step.n === currentStep;
        return (
          <div key={step.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                  ${isCompleted ? "bg-brand-navy border-brand-navy text-white" : ""}
                  ${isActive ? "bg-white border-brand-navy text-brand-navy shadow-lg shadow-blue-200" : ""}
                  ${!isCompleted && !isActive ? "bg-zinc-100 border-zinc-200 text-zinc-400" : ""}
                `}
              >
                {isCompleted ? "✓" : step.n}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap transition-colors
                  ${isActive ? "text-brand-navy" : "text-zinc-400"}
                `}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-5 mx-1 transition-colors duration-300 ${isCompleted ? "bg-brand-navy" : "bg-zinc-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

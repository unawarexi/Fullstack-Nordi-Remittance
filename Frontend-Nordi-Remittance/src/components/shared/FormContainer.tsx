import React from "react";

export const FormContainer = ({
  children,
  step,
  totalSteps,
}: {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}) => {
  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      {/* Progress Bar Placeholder */}
      <div className="mb-8">
        <div className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
          Step {step} of {totalSteps}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

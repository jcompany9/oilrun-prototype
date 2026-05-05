interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${currentStep} / ${totalSteps} 단계`}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const idx = i + 1
        const isCurrent = idx === currentStep
        const isFilled = idx <= currentStep
        const size = isCurrent ? 10 : 6
        return (
          <span
            key={idx}
            className="block rounded-full transition-all duration-200"
            style={{
              width: size,
              height: size,
              backgroundColor: isFilled ? "#1E40AF" : "#E5E7EB",
            }}
          />
        )
      })}
    </div>
  )
}

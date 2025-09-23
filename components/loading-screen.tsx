"use client"

import { useAppState } from "@/hooks/use-app-state"
import { Loader2, FileText, Sparkles, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

export function LoadingScreen() {
  const { state } = useAppState()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: FileText, label: "Reading file", description: "Analyzing document structure..." },
    { icon: Sparkles, label: "Processing content", description: "Extracting text and images..." },
    { icon: CheckCircle, label: "Creating website", description: "Building your website..." },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 15, 95)

        // Update step based on progress
        if (newProgress < 30) setCurrentStep(0)
        else if (newProgress < 70) setCurrentStep(1)
        else setCurrentStep(2)

        return newProgress
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  const CurrentIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <CurrentIcon className="h-10 w-10 text-primary" />
          </div>

          {/* Animated spinner overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-24 w-24 text-primary/20 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">{state.ui.loadingTitle || steps[currentStep].label}</h2>

        <p className="text-muted-foreground mb-6">{state.ui.loadingMessage || steps[currentStep].description}</p>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground">{Math.round(progress)}% complete</div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            return (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <StepIcon className="h-4 w-4" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Progress } from './ui/progress'
import { Card } from './ui/card'
import { Sparkles, Eye, Palette, Wand2 } from 'lucide-react'

interface AnalysisProgressProps {
  isAnalyzing: boolean
}

const analysisSteps = [
  { icon: Eye, label: 'Analyzing facial features', duration: 2000 },
  { icon: Palette, label: 'Detecting skin undertones', duration: 3000 },
  { icon: Wand2, label: 'Generating color palette', duration: 2500 },
  { icon: Sparkles, label: 'Creating recommendations', duration: 2500 }
]

export function AnalysisProgress({ isAnalyzing }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    let stepIndex = 0
    let progressValue = 0
    
    const runStep = () => {
      if (stepIndex >= analysisSteps.length) return
      
      setCurrentStep(stepIndex)
      const stepDuration = analysisSteps[stepIndex].duration
      const stepProgress = 100 / analysisSteps.length
      
      const interval = setInterval(() => {
        progressValue += (stepProgress / stepDuration) * 50
        setProgress(Math.min(progressValue, (stepIndex + 1) * stepProgress))
      }, 50)
      
      setTimeout(() => {
        clearInterval(interval)
        stepIndex++
        if (stepIndex < analysisSteps.length) {
          runStep()
        }
      }, stepDuration)
    }
    
    runStep()
  }, [isAnalyzing])

  if (!isAnalyzing) return null

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-0 shadow-lg">
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3">Analyzing Your Colors</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our advanced AI is analyzing your photo to create your personalized color palette
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-muted/50" />
        </div>
        
        <div className="space-y-4">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-500 ${
                  isActive ? 'bg-primary/10 text-primary scale-105' : 
                  isCompleted ? 'bg-green-50 text-green-700' : 
                  'text-muted-foreground'
                }`}
              >
                <div className={`p-3 rounded-xl transition-all duration-500 ${
                  isActive ? 'bg-gradient-to-br from-primary to-accent shadow-lg animate-pulse' : 
                  isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-md' : 
                  'bg-muted/50'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive || isCompleted ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
                {isCompleted && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </Card>
  )
}
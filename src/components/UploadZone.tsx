import { useState, useCallback } from 'react'
import { Upload, Image, X, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { validateFileUpload } from '../utils/security'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  isAnalyzing: boolean
}

export function UploadZone({ onFileSelect, selectedFile, isAnalyzing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setUploadError(null)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      const validation = validateFileUpload(imageFile)
      if (validation.isValid) {
        onFileSelect(imageFile)
      } else {
        setUploadError(validation.error || 'Invalid file')
      }
    } else {
      setUploadError('Please upload an image file (JPG, PNG, WebP, GIF, BMP, TIFF)')
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFileUpload(file)
      if (validation.isValid) {
        onFileSelect(file)
      } else {
        setUploadError(validation.error || 'Invalid file')
      }
    }
  }, [onFileSelect])

  const clearFile = useCallback(() => {
    setUploadError(null)
    onFileSelect(null as any)
  }, [onFileSelect])

  if (selectedFile) {
    return (
      <Card className="relative overflow-hidden">
        <div className="aspect-square max-w-md mx-auto">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            className="w-full h-full object-cover rounded-lg"
          />
          {!isAnalyzing && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearFile}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`relative border-2 border-dashed transition-all duration-300 ${
        isDragOver
          ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/5 scale-105 shadow-lg'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:shadow-md'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
          isDragOver 
            ? 'bg-gradient-to-br from-primary to-accent shadow-lg animate-bounce-gentle' 
            : 'bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20'
        }`}>
          <Upload className={`w-10 h-10 transition-colors duration-300 ${
            isDragOver ? 'text-white' : 'text-primary'
          }`} />
        </div>
        
        <h3 className="text-xl font-bold mb-3">
          {isDragOver ? 'Drop your photo here!' : 'Upload Your Photo'}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          {isDragOver 
            ? 'Release to upload your photo for analysis'
            : 'Drag and drop your photo here, or click to browse. Best results with clear, well-lit photos.'
          }
        </p>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        
        <Button asChild className="gradient-bg text-white hover:shadow-lg transition-all duration-300 px-8 py-3 text-lg">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Image className="w-5 h-5 mr-3" />
            Choose Photo
          </label>
        </Button>
        
        <div className="mt-6 space-y-2">
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, WebP, GIF, BMP, TIFF up to 15MB
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Works with most photo qualities
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Any lighting conditions accepted
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
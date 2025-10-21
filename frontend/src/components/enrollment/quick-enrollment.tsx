'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { endpoints } from '@/lib/api'
import { Camera, XCircle, RotateCcw } from 'lucide-react'

interface QuickEnrollmentProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (result: unknown) => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function QuickEnrollment({ isOpen, onClose, onComplete, videoRef, canvasRef }: QuickEnrollmentProps) {
  const [name, setName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const capturePhoto = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          ctx.drawImage(videoRef.current, 0, 0)
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, 'image/jpeg', 0.9)
        }
      }
    })
  }

  const handleEnrollment = async () => {
    if (!name.trim()) {
      setError('Please enter a name')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const photo = await capturePhoto()
      const formData = new FormData()
      formData.append('name', name)
      formData.append('files', photo, 'quick_enroll.jpg')
      formData.append('use_augmentation', 'true')
      formData.append('augmentation_preset', 'balanced')

      const response = await endpoints.enroll(formData)
      console.log('Quick enrollment successful:', response.data)
      onComplete(response.data)
      onClose()
    } catch (error) {
      console.error('Enrollment error:', error)
      setError('Failed to enroll person. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Quick Enrollment</CardTitle>
              <CardDescription>
                Capture one photo for basic recognition
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Person&apos;s Name</Label>
            <Input
              id="quick-name"
              placeholder="Enter name to enroll"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Ready to capture from camera</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleEnrollment}
              disabled={!name.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture & Enroll
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

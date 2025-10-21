'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { endpoints } from '@/lib/api'
import { Camera, CheckCircle, XCircle, RotateCcw, Smile, Eye, ArrowLeft, ArrowRight } from 'lucide-react'

interface GuidedEnrollmentProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (result: unknown) => void
}

const POSE_INSTRUCTIONS = [
  { id: 1, title: "Look Straight", description: "Face the camera directly with a neutral expression", icon: Eye },
  { id: 2, title: "Look Left", description: "Turn your head slightly to the left", icon: ArrowLeft },
  { id: 3, title: "Look Right", description: "Turn your head slightly to the right", icon: ArrowRight },
  { id: 4, title: "Look Up", description: "Tilt your head up slightly", icon: ArrowLeft },
  { id: 5, title: "Look Down", description: "Tilt your head down slightly", icon: ArrowRight },
  { id: 6, title: "Smile", description: "Give a natural smile", icon: Smile },
  { id: 7, title: "Neutral", description: "Return to neutral expression", icon: Eye },
  { id: 8, title: "Look Left", description: "Turn your head to the left again", icon: ArrowLeft },
  { id: 9, title: "Look Right", description: "Turn your head to the right again", icon: ArrowRight },
  { id: 10, title: "Look Up", description: "Tilt your head up again", icon: ArrowLeft },
  { id: 11, title: "Look Down", description: "Tilt your head down again", icon: ArrowRight },
  { id: 12, title: "Smile", description: "Give another natural smile", icon: Smile },
  { id: 13, title: "Neutral", description: "Return to neutral expression", icon: Eye },
  { id: 14, title: "Look Left", description: "Final left turn", icon: ArrowLeft },
  { id: 15, title: "Look Right", description: "Final right turn", icon: ArrowRight }
]

export function GuidedEnrollment({ isOpen, onClose, onComplete }: GuidedEnrollmentProps) {
  const [name, setName] = useState('')
  const [currentPose, setCurrentPose] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<Blob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      resetEnrollment()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setError('Camera access denied or not available')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const resetEnrollment = () => {
    setName('')
    setCurrentPose(0)
    setCapturedPhotos([])
    setError(null)
    setCountdown(0)
  }

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

  const startCountdown = () => {
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          captureCurrentPose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const captureCurrentPose = async () => {
    try {
      setIsCapturing(true)
      const photo = await capturePhoto()
      setCapturedPhotos(prev => [...prev, photo])
      setCurrentPose(prev => prev + 1)
    } catch (error) {
      console.error('Error capturing photo:', error)
      setError('Failed to capture photo')
    } finally {
      setIsCapturing(false)
    }
  }

  const processEnrollment = async () => {
    if (capturedPhotos.length === 0) return

    try {
      setIsProcessing(true)
      setError(null)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('use_augmentation', 'true')
      formData.append('augmentation_preset', 'aggressive') // Use aggressive for guided enrollment
      
      // Add all captured photos
      capturedPhotos.forEach((photo, index) => {
        formData.append('files', photo, `pose_${index + 1}.jpg`)
      })

      const response = await endpoints.enroll(formData)
      console.log('Guided enrollment successful:', response.data)
      onComplete(response.data)
      onClose()
    } catch (error) {
      console.error('Enrollment error:', error)
      setError('Failed to enroll person. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentInstruction = POSE_INSTRUCTIONS[currentPose]
  const progress = (currentPose / POSE_INSTRUCTIONS.length) * 100
  const isComplete = currentPose >= POSE_INSTRUCTIONS.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Guided Enrollment</CardTitle>
              <CardDescription>
                Follow the poses to create a high-accuracy face profile
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              <XCircle className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="enroll-name">Person&apos;s Name</Label>
            <Input
              id="enroll-name"
              placeholder="Enter name to enroll"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {currentPose} / {POSE_INSTRUCTIONS.length} poses</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Camera Feed */}
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Countdown Overlay */}
                {countdown > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-6xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
                
                {/* Capturing Overlay */}
                {isCapturing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p>Capturing...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              {!isComplete ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="p-4 bg-blue-100 rounded-lg mb-4">
                      <currentInstruction.icon className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                      <h3 className="text-lg font-semibold text-blue-900">
                        {currentInstruction.title}
                      </h3>
                      <p className="text-blue-700">
                        {currentInstruction.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={startCountdown}
                      disabled={!name.trim() || isCapturing || countdown > 0}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {countdown > 0 ? `Capturing in ${countdown}...` : 'Capture This Pose'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-100 rounded-lg">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" />
                    <h3 className="text-lg font-semibold text-green-900">
                      All Poses Captured!
                    </h3>
                    <p className="text-green-700">
                      {capturedPhotos.length} photos ready for enrollment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={processEnrollment}
                      disabled={!name.trim() || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Enrollment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Captured Photos Preview */}
              {capturedPhotos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Captured Photos ({capturedPhotos.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {capturedPhotos.map((_, index) => (
                      <div key={index} className="w-12 h-12 bg-gray-200 rounded border-2 border-green-500 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { Play, Square, Camera, Upload } from 'lucide-react'

export function LiveFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [enrollName, setEnrollName] = useState('')
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [recognitionResults, setRecognitionResults] = useState<any[]>([])
  
  const { webcam, setWebcamState } = useAppStore()

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (webcam.stream) {
        webcam.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [webcam.stream])

  const startWebcam = async () => {
    try {
      setWebcamState({ error: null })
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setWebcamState({ 
          isActive: true, 
          stream,
          error: null 
        })
        console.log('Camera started successfully')
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
      setWebcamState({ 
        error: 'Camera access denied or not available' 
      })
    }
  }

  const stopWebcam = () => {
    if (webcam.stream) {
      webcam.stream.getTracks().forEach(track => track.stop())
      setWebcamState({ 
        isActive: false, 
        stream: null,
        isRecognizing: false 
      })
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureFrame = (): Promise<Blob> => {
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

  const startRecognition = async () => {
    if (!webcam.isActive) return
    
    setIsRecognizing(true)
    setWebcamState({ isRecognizing: true })
    
    const recognitionLoop = async () => {
      if (!webcam.isActive) return
      
      try {
        const blob = await captureFrame()
        const formData = new FormData()
        formData.append('file', blob, 'webcam.jpg')
        
        console.log('Sending recognition request...')
        const response = await endpoints.recognize(formData, 0.5)
        console.log('Recognition response:', response.data)
        setRecognitionResults(response.data.faces || [])
        
        // Draw bounding boxes on canvas
        if (canvasRef.current && response.data.faces) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Clear previous drawings
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Draw new frame
            if (videoRef.current) {
              ctx.drawImage(videoRef.current, 0, 0)
            }
            
            // Draw bounding boxes
            response.data.faces.forEach((face: any) => {
              const [x1, y1, x2, y2] = face.bbox
              ctx.strokeStyle = face.matched ? '#00ff00' : '#ff0000'
              ctx.lineWidth = 3
              ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
              
              // Draw label
              const label = face.matched 
                ? `${face.name} (${(face.confidence * 100).toFixed(0)}%)`
                : `Unknown (${(face.confidence * 100).toFixed(0)}%)`
              
              ctx.font = '16px Arial'
              const textMetrics = ctx.measureText(label)
              const textWidth = textMetrics.width
              
              ctx.fillStyle = 'rgba(0,0,0,0.8)'
              ctx.fillRect(x1, y1 - 30, textWidth + 12, 30)
              
              ctx.fillStyle = face.matched ? '#00ff00' : '#ff0000'
              ctx.fillText(label, x1 + 6, y1 - 8)
            })
          }
        }
      } catch (error) {
        console.error('Recognition error:', error)
      }
      
      // Continue loop only if still recognizing
      if (webcam.isActive) {
        setTimeout(recognitionLoop, 1000)
      }
    }
    
    // Start the recognition loop
    recognitionLoop()
  }

  const stopRecognition = () => {
    setIsRecognizing(false)
    setWebcamState({ isRecognizing: false })
  }

  const enrollFromWebcam = async () => {
    if (!enrollName.trim() || !webcam.isActive) return
    
    setIsEnrolling(true)
    try {
      const blob = await captureFrame()
      const formData = new FormData()
      formData.append('name', enrollName)
      formData.append('files', blob, 'webcam.jpg')
      formData.append('use_augmentation', 'true')
      formData.append('augmentation_preset', 'balanced')
      
      const response = await endpoints.enroll(formData)
      console.log('Enrollment successful:', response.data)
      setEnrollName('')
    } catch (error) {
      console.error('Enrollment error:', error)
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Recognition Feed</h1>
        <p className="text-muted-foreground">
          Monitor camera feed, enroll new faces, and track recognition overlays.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Video Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Feed</CardTitle>
            <CardDescription>
              Real-time video feed with face detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto"
                  style={{ display: webcam.isActive ? 'block' : 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-auto"
                  style={{ display: webcam.isActive ? 'block' : 'none' }}
                />
                {!webcam.isActive && (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2" />
                      <p>Camera not active</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!webcam.isActive ? (
                  <Button 
                    onClick={startWebcam} 
                    className="flex-1 hover:bg-primary/90 transition-colors"
                    disabled={webcam.error !== null}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {webcam.error ? 'Camera Error' : 'Start Camera'}
                  </Button>
                ) : (
                  <Button 
                    onClick={stopWebcam} 
                    variant="destructive" 
                    className="flex-1 hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Recognition Controls</CardTitle>
            <CardDescription>
              Start/stop recognition and enroll new faces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recognition Controls */}
            <div className="space-y-2">
              <Label>Recognition</Label>
              <div className="flex space-x-2">
                {!isRecognizing ? (
                  <Button 
                    onClick={startRecognition} 
                    disabled={!webcam.isActive}
                    className="flex-1 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Recognition
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecognition} 
                    variant="destructive" 
                    className="flex-1 hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recognition
                  </Button>
                )}
              </div>
            </div>

            {/* Enrollment Controls */}
            <div className="space-y-2">
              <Label htmlFor="enroll-name">Enrollment</Label>
              <Input
                id="enroll-name"
                placeholder="Enter name to enroll"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                disabled={!webcam.isActive}
              />
              <Button 
                onClick={enrollFromWebcam}
                disabled={!webcam.isActive || !enrollName.trim() || isEnrolling}
                className="w-full hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isEnrolling ? 'Enrolling...' : 'Enroll from Camera'}
              </Button>
            </div>

            {/* Results */}
            {recognitionResults.length > 0 && (
              <div className="space-y-2">
                <Label>Recognition Results</Label>
                <div className="space-y-1">
                  {recognitionResults.map((face, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">
                        {face.matched ? face.name : 'Unknown'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {(face.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {webcam.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {webcam.error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

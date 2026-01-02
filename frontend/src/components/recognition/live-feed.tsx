'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { Play, Square, Camera, Users, Settings2, Zap, ShieldCheck } from 'lucide-react'
import { GuidedEnrollment } from '@/components/enrollment/guided-enrollment'
import { QuickEnrollment } from '@/components/enrollment/quick-enrollment'
import { RecognitionOverlay } from './recognition-overlay'
import { ActivityLog, ActivityEvent } from './activity-log'
import { v4 as uuidv4 } from 'uuid'

export function LiveFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  // Canvas used only for capturing frames, effectively invisible/utility
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionResults, setRecognitionResults] = useState<any[]>([])
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const [showGuidedEnrollment, setShowGuidedEnrollment] = useState(false)
  const [showQuickEnrollment, setShowQuickEnrollment] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const { webcam, setWebcamState } = useAppStore()

  // Video Dimensions state for Overlay scaling
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (videoContainerRef.current) {
        setContainerDimensions({
          width: videoContainerRef.current.clientWidth,
          height: videoContainerRef.current.clientHeight
        })
      }
      if (videoRef.current) {
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        })
      }
    }

    // Initial check
    updateDimensions()

    // Add resize listener
    window.addEventListener('resize', updateDimensions)

    // Polling for video metadata loading
    const interval = setInterval(updateDimensions, 1000)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearInterval(interval)
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
          width: { ideal: 1280 }, // Using higher resolution for "Hero" feel
          height: { ideal: 720 },
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
      const errorMsg = 'Camera access denied or not available'
      setWebcamState({ error: errorMsg })
      setErrors(prev => [...prev, errorMsg])
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
    setIsRecognizing(false)
    setRecognitionResults([])
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

  const handleRecognitionResponse = (faces: any[]) => {
    setRecognitionResults(faces || [])

    if (faces && faces.length > 0) {
      faces.forEach(face => {
        // Add to activity log if:
        // 1. It is a matched face (known person) OR 
        // 2. It is an unknown person (optional, maybe filter noise)

        // Simple throttle logic: don't add if same person was seen in last 2 seconds
        // For now, simpler: just add everything to show activity

        const newEvent: ActivityEvent = {
          id: uuidv4(), // Need consistent IDs
          name: face.matched ? face.name : 'Unknown',
          confidence: face.confidence,
          matched: face.matched,
          timestamp: new Date()
        }

        setActivityEvents(prev => {
          // Avoid duplicates at top of list
          if (prev.length > 0 && prev[0].name === newEvent.name && (new Date().getTime() - prev[0].timestamp.getTime() < 2000)) {
            return prev
          }
          return [newEvent, ...prev].slice(0, 50) // Keep last 50
        })
      })
    }
  }

  const startRecognition = async () => {
    if (!webcam.isActive) return

    // Check backend health status first
    try {
      await endpoints.status()
    } catch (e: any) {
      const code = e?.response?.status
      const msg = code ? `Backend status failed: ${code}` : 'Backend unreachable'
      setErrors(prev => [...prev, msg])
      return
    }

    setIsRecognizing(true)
    setWebcamState({ isRecognizing: true })

    // Recognition Loop
    const loop = async () => {
      if (!webcam.isActive) return // break loop 

      try {
        const blob = await captureFrame()
        const formData = new FormData()
        formData.append('file', blob, 'webcam.jpg')

        const response = await endpoints.recognize(formData, 0.5)

        // Update Overlay Data
        handleRecognitionResponse(response.data.faces)

      } catch (error: any) {
        // Silent fail or minimal logs to avoid thrashing
        console.warn("Recognition loop error", error)
      }

      // Continue loop
      // We check a ref or state variable. 
      // Since closure captures state, we need to be careful. 
      // Relying on the fact that if component unmounts or stop is called, we handle cleanup elsewhere or just rely on webcam.isActive check which might be stale in closure?
      // Better to have a mutable ref for control loop.
    }
  }

  // Ref-based loop control to avoid closure staleness issues
  const isLooping = useRef(false)

  useEffect(() => {
    if (isRecognizing && webcam.isActive) {
      isLooping.current = true

      const runLoop = async () => {
        while (isLooping.current && webcam.isActive) {
          const startTime = Date.now()
          try {
            const blob = await captureFrame()
            const formData = new FormData()
            formData.append('file', blob, 'webcam.jpg')
            const response = await endpoints.recognize(formData, 0.5)
            handleRecognitionResponse(response.data.faces)
          } catch (e) {
            console.error("Loop error", e)
          }

          // Min wait time to avoid CPU hogging
          const elapsed = Date.now() - startTime
          const wait = Math.max(0, 500 - elapsed) // Max 2 FPS approx for smoothness
          await new Promise(r => setTimeout(r, wait))
        }
      }
      runLoop()
    } else {
      isLooping.current = false
    }
    return () => { isLooping.current = false }
  }, [isRecognizing, webcam.isActive])


  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 p-4">
      {/* Main Video Area */}
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600 w-7 h-7" />
              Live Surveillance
              {webcam.isActive && (
                <span className="flex h-2.5 w-2.5 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm">Real-time threat detection & monitoring</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControls(!showControls)}
            className={showControls ? 'bg-slate-100' : ''}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Controls
          </Button>
        </div>

        {/* Hero Video Card */}
        <Card className="flex-1 relative overflow-hidden bg-black rounded-2xl border-0 shadow-2xl ring-1 ring-slate-900/5 group">
          {/* Video Container */}
          <div ref={videoContainerRef} className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover opacity-90"
              style={{ display: webcam.isActive ? 'block' : 'none' }}
            />

            {/* Overlay Layer */}
            {webcam.isActive && videoDimensions.width > 0 && (
              <RecognitionOverlay
                faces={recognitionResults}
                videoDimensions={videoDimensions}
                containerDimensions={containerDimensions}
              />
            )}

            {/* Fallback / Empty State */}
            {!webcam.isActive && (
              <div className="text-center text-slate-500">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                  <Camera className="h-10 w-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-400">Camera Feed Offline</p>
                <p className="text-sm text-slate-600">Start the camera to begin surveillance</p>
                <Button
                  onClick={startWebcam}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-900/20"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Activate Camera
                </Button>
              </div>
            )}

            {/* Floating Controls Overlay */}
            {/* Floating Controls Overlay */}
            {showControls && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/70 hover:scale-105 z-50">
                {/* Camera Toggle */}
                {webcam.isActive ? (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full h-12 w-12"
                    onClick={stopWebcam}
                    title="Stop Camera"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="rounded-full h-12 w-12 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    onClick={startWebcam}
                    title="Start Camera"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </Button>
                )}

                <div className="w-px h-6 bg-white/20 mx-1"></div>

                {/* Recognition Toggle */}
                {!isRecognizing ? (
                  <Button
                    size="lg"
                    className="rounded-full bg-blue-600 hover:bg-blue-500 border-0 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={startRecognition}
                    disabled={!webcam.isActive}
                  >
                    <Zap className="h-4 w-4 mr-2 fill-current" />
                    Start AI Scan
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 px-6 animate-pulse"
                    onClick={() => setIsRecognizing(false)}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Scanning...
                  </Button>
                )}

                <div className="w-px h-6 bg-white/20 mx-1"></div>

                {/* Enrollment Triggers */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={() => setShowQuickEnrollment(true)}
                  disabled={!webcam.isActive}
                  title="Quick Enroll"
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={() => setShowGuidedEnrollment(true)}
                  disabled={!webcam.isActive}
                  title="Guided Enroll"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Error Toasts - Absolute positioned within video area */}
            {errors.length > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
                {errors.map((err, i) => (
                  <div key={i} className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg backdrop-blur-sm pointer-events-auto flex items-center justify-between animate-in slide-in-from-top-2">
                    <span>{err}</span>
                    <button onClick={() => setErrors(prev => prev.filter((_, idx) => idx !== i))} className="ml-2 opacity-80 hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hidden capture utility */}
          <canvas ref={canvasRef} className="hidden" />
        </Card>
      </div>

      {/* Sidebar / Activity Log */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4">
        {/* Stats / Status Card could go here */}

        {/* Activity Feed */}
        <div className="flex-1 min-h-[400px]">
          <ActivityLog events={activityEvents} />
        </div>
      </div>

      {/* Enrollment Modals */}
      <GuidedEnrollment
        isOpen={showGuidedEnrollment}
        onClose={() => setShowGuidedEnrollment(false)}
        onComplete={() => setShowGuidedEnrollment(false)}
      />

      <QuickEnrollment
        isOpen={showQuickEnrollment}
        onClose={() => setShowQuickEnrollment(false)}
        onComplete={() => setShowQuickEnrollment(false)}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    </div>
  )
}

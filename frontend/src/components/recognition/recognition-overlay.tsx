import { motion } from 'framer-motion'
import { User, UserX } from 'lucide-react'

interface RecognitionOverlayProps {
    faces: any[]
    videoDimensions: { width: number; height: number }
    containerDimensions: { width: number; height: number }
}

export function RecognitionOverlay({ faces, videoDimensions, containerDimensions }: RecognitionOverlayProps) {
    if (!faces || faces.length === 0) return null

    // Calculate scaling factors to map video coordinates to container coordinates
    const scaleX = containerDimensions.width / videoDimensions.width
    const scaleY = containerDimensions.height / videoDimensions.height

    // Use the smaller scale to maintain aspect ratio (fit)
    // Or if we want to fill, we might need different logic.
    // Assuming object-fit: cover or contain logic in parent. 
    // For now, let's assume the video element fills the container or we use these scales directly.
    // A safer approach for "responsive" video is usually to rely on % based on the video's intrinsic aspect ratio,
    // but here we will try to position absolutely based on computed scales.

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {faces.map((face, index) => {
                const [x1, y1, x2, y2] = face.bbox

                const style = {
                    left: `${x1 * scaleX}px`,
                    top: `${y1 * scaleY}px`,
                    width: `${(x2 - x1) * scaleX}px`,
                    height: `${(y2 - y1) * scaleY}px`,
                }

                return (
                    <motion.div
                        key={`${face.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute border-2 rounded-lg flex flex-col items-center justify-end pb-2"
                        style={{
                            borderColor: face.matched ? '#10b981' : '#ef4444', // green-500 : red-500
                            boxShadow: face.matched ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 15px rgba(239, 68, 68, 0.4)',
                            ...style
                        }}
                    >
                        {/* Label Tag */}
                        <div
                            className={`
                absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full 
                flex items-center gap-2 whitespace-nowrap shadow-md backdrop-blur-md
                ${face.matched ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}
              `}
                        >
                            {face.matched ? <User className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs font-bold tracking-wide">{face.matched ? face.name : 'Unknown'}</span>
                                <span className="text-[10px] opacity-80 font-mono">{(face.confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>

                        {/* Corner Indicators for tech feel */}
                        <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 -mt-1 -ml-1 ${face.matched ? 'border-emerald-400' : 'border-red-400'}`}></div>
                        <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 -mt-1 -mr-1 ${face.matched ? 'border-emerald-400' : 'border-red-400'}`}></div>
                        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 -mb-1 -ml-1 ${face.matched ? 'border-emerald-400' : 'border-red-400'}`}></div>
                        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 -mb-1 -mr-1 ${face.matched ? 'border-emerald-400' : 'border-red-400'}`}></div>
                    </motion.div>
                )
            })}
        </div>
    )
}

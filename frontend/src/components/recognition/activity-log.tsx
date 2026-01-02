import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, User, UserX } from "lucide-react"

export interface ActivityEvent {
    id: string
    name: string
    timestamp: Date
    confidence: number
    matched: boolean
    image?: string // Potential for small face crop history
}

interface ActivityLogProps {
    events: ActivityEvent[]
}

export function ActivityLog({ events }: ActivityLogProps) {
    return (
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white/50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Live Activity
                    <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-normal">
                        {events.length} Events
                    </Badge>
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Waiting for detection...</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-slate-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                                <Avatar className="h-9 w-9 border border-slate-100">
                                    <AvatarImage src={event.image} />
                                    <AvatarFallback className={`${event.matched ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {event.matched ? event.name.charAt(0).toUpperCase() : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {event.matched ? event.name : 'Unknown Person'}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${event.matched ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50'}`}>
                                            {event.matched ? 'Verified' : 'Unrecognized'}
                                        </Badge>
                                        <span className="text-[10px] text-slate-500">
                                            {(event.confidence * 100).toFixed(0)}% match
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  gradient?: string
  className?: string
}

export function MetricsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendUp = true,
  gradient = "from-blue-500 to-cyan-500",
  className 
}: MetricsCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
      className
    )}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
              trendUp 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            )}>
              {trendUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          )}
        </div>
        
        {/* Decorative element */}
        <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      </div>
    </div>
  )
}

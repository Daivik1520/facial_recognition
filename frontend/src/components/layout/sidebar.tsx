'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  Settings, 
  Users, 
  UserCheck,
  Activity,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'System overview and metrics'
  },
  {
    name: 'Live Feed',
    href: '/live',
    icon: Camera,
    description: 'Real-time face recognition'
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: UserCheck,
    description: 'Attendance records and management'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Reports and insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  }
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-slate-200/60">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Face Recognition
              </h1>
              <p className="text-slate-600 text-sm font-medium">v2.0 System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors duration-200",
                  isActive
                    ? "bg-white/20"
                    : "bg-slate-100 group-hover:bg-slate-200"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-white" : "text-slate-900 group-hover:text-slate-900"
                  )}>
                    {item.name}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    isActive ? "text-blue-100" : "text-slate-500 group-hover:text-slate-600"
                  )}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/60">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">System Status</p>
              <p className="text-xs text-emerald-700">All systems operational</p>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
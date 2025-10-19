'use client'

import { Camera, Users, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Users },
    { name: 'Live Feed', href: '/live', icon: Camera },
    { name: 'Analytics', href: '/attendance', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Face Recognition System</h1>
              <p className="text-sm text-muted-foreground">v2.0</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Button 
                key={item.name}
                variant={isActive ? "default" : "ghost"} 
                size="sm"
                onClick={() => router.push(item.href)}
                className={isActive ? "bg-primary text-primary-foreground" : ""}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

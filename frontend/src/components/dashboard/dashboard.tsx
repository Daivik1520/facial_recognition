'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricsCard } from './metrics-card'
import { Sidebar } from '@/components/layout/sidebar'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { Users, UserCheck, Activity, Clock, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export function Dashboard() {
  const router = useRouter()
  const {
    systemStatus,
    attendanceStats,
    isLoading,
    setSystemStatus,
    setAttendanceStats,
    setLoading
  } = useAppStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Dashboard: Fetching data...')

        // Fetch system status
        console.log('Dashboard: Fetching status...')
        const statusResponse = await endpoints.status()
        console.log('Dashboard: Status response:', statusResponse.data)
        setSystemStatus(statusResponse.data)

        // Fetch attendance stats
        console.log('Dashboard: Fetching attendance...')
        const attendanceResponse = await endpoints.attendance()
        console.log('Dashboard: Attendance response:', attendanceResponse.data)
        setAttendanceStats(attendanceResponse.data)

        console.log('Dashboard: Data fetch completed successfully')
      } catch (error) {
        console.error('Dashboard: Failed to fetch data:', error)
        console.error('Dashboard: Error details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [setSystemStatus, setAttendanceStats, setLoading])

  const attendanceRate = attendanceStats?.total_attendance_records && systemStatus?.enrolled_count
    ? Math.round((attendanceStats.today_attendance / systemStatus.enrolled_count) * 100)
    : 0

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'enroll':
        router.push('/live')
        break
      case 'live':
        router.push('/live')
        break
      case 'analytics':
        router.push('/analytics')
        break
      case 'export':
        // For now, just show an alert - you can implement actual export later
        alert('Export functionality will be implemented soon!')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-80">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 font-medium">Monitor your face recognition system performance and attendance data</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Last updated</div>
                  <div className="text-xs text-slate-400">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Welcome to Your Command Center</h2>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Monitor real-time face recognition performance, track attendance patterns, and manage your surveillance system with advanced analytics.
                </p>
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Real-time Processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">Advanced Analytics</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <Activity className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Enrolled Faces"
              value={systemStatus?.enrolled_count || 0}
              description="Total enrolled individuals"
              icon={Users}
              trend="+12%"
              trendUp={true}
              gradient="from-blue-500 to-cyan-500"
            />
            <MetricsCard
              title="Today's Attendance"
              value={attendanceStats?.today_attendance || 0}
              description={`${attendanceRate}% attendance rate`}
              icon={UserCheck}
              trend="+8%"
              trendUp={true}
              gradient="from-emerald-500 to-teal-500"
            />
            <MetricsCard
              title="Total Records"
              value={attendanceStats?.total_attendance_records || 0}
              description="All-time attendance records"
              icon={Activity}
              trend="+24%"
              trendUp={true}
              gradient="from-purple-500 to-pink-500"
            />
            <MetricsCard
              title="Active Days"
              value={attendanceStats?.total_days_recorded || 0}
              description="Days with recorded activity"
              icon={Clock}
              trend="+5%"
              trendUp={true}
              gradient="from-orange-500 to-red-500"
            />
          </div>

        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
            <CardDescription>Common system operations and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <button
                onClick={() => handleQuickAction('enroll')}
                className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Enroll New Person</div>
              </button>
              <button
                onClick={() => handleQuickAction('live')}
                className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">View Live Feed</div>
              </button>
              <button
                onClick={() => handleQuickAction('analytics')}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Analytics Report</div>
              </button>
              <button
                onClick={() => handleQuickAction('export')}
                className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              >
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Export Data</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

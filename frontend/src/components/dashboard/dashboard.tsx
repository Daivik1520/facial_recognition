'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricsCard } from './metrics-card'
import { Sidebar } from '@/components/layout/sidebar'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { Users, UserCheck, Activity, Clock, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export function Dashboard() {
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
        
        // Fetch system status
        const statusResponse = await endpoints.status()
        setSystemStatus(statusResponse.data)
        
        // Fetch attendance stats
        const attendanceResponse = await endpoints.attendance()
        setAttendanceStats(attendanceResponse.data)
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
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

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* System Status Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">System Status</CardTitle>
                    <CardDescription className="text-slate-600 mt-2">
                      Real-time system health and performance metrics
                    </CardDescription>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">AI Model</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Active</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{systemStatus?.model || 'InsightFace Buffalo_L'}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Processing Status</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">Real-time Detection</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Enrolled Individuals</h4>
                  <div className="space-y-2">
                    {systemStatus?.enrolled_names?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {systemStatus.enrolled_names.slice(0, 6).map((name: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-white text-slate-700 rounded-full text-sm font-medium shadow-sm">
                            {name}
                          </span>
                        ))}
                        {systemStatus.enrolled_names.length > 6 && (
                          <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                            +{systemStatus.enrolled_names.length - 6} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No individuals enrolled yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Attendance Card */}
          <div>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Today's Attendance</CardTitle>
                    <CardDescription className="text-slate-600">
                      Live attendance tracking
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                      {attendanceStats?.today_attendance || 0}
                    </div>
                    <div className="text-sm text-emerald-700 font-medium">
                      People Present Today
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">
                      {attendanceRate}% of enrolled
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 text-sm">Attendees List</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {attendanceStats?.today_names?.length ? (
                        attendanceStats.today_names.map((name: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700">{name}</span>
                            <div className="ml-auto">
                              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Present
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 text-sm">No attendance recorded today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Enroll New Person</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">View Live Feed</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Analytics Report</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Export Data</div>
              </button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

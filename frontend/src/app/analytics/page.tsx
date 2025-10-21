'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/layout/sidebar'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { BarChart3, TrendingUp, Users, Clock, Activity, Eye, Target, Zap, Calendar, Download, RefreshCw } from 'lucide-react'

export default function AnalyticsPage() {
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
        console.log('Analytics: Fetching data...')
        
        const statusResponse = await endpoints.status()
        setSystemStatus(statusResponse.data)
        
        const attendanceResponse = await endpoints.attendance()
        setAttendanceStats(attendanceResponse.data)
        
        console.log('Analytics: Data fetch completed successfully')
      } catch (error) {
        console.error('Analytics: Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setSystemStatus, setAttendanceStats, setLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
                <p className="text-slate-600 font-medium">
                  Comprehensive insights and performance metrics
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-blue-200 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </button>
                <button className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-emerald-200 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Analytics Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Advanced Analytics Dashboard</h2>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Monitor real-time performance, track attendance patterns, and analyze recognition accuracy with comprehensive data insights.
                </p>
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">Real-time Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Precision Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Instant Insights</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">
                    {systemStatus?.enrolled_count || 0}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Total Enrolled</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Registered individuals in system</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">
                    {attendanceStats?.today_attendance || 0}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Today's Attendance</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">People present today</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    <span>+24%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">
                    {attendanceStats?.total_attendance_records || 0}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Total Records</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">All-time attendance records</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">
                    {attendanceStats?.total_days_recorded || 0}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Active Days</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Days with recorded activity</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Attendance Trends</CardTitle>
                    <CardDescription>Daily attendance patterns and insights</CardDescription>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Charts Coming Soon</h3>
                    <p className="text-slate-600">Advanced visualization with real-time data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Recognition Performance</CardTitle>
                    <CardDescription>Face recognition accuracy and speed metrics</CardDescription>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Performance Metrics</h3>
                    <p className="text-slate-600">Real-time accuracy and speed analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">System Information</CardTitle>
                  <CardDescription>Current system configuration and status</CardDescription>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    AI Model
                  </h4>
                  <p className="text-slate-600 font-medium">{systemStatus?.model || 'InsightFace ArcFace'}</p>
                  <p className="text-xs text-slate-500 mt-1">Advanced face recognition engine</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-emerald-600" />
                    System Status
                  </h4>
                  <p className="text-green-600 font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Operational
                  </p>
                  <p className="text-xs text-slate-500 mt-1">All systems running normally</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Enrolled Individuals
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {systemStatus?.enrolled_names?.slice(0, 5).map((name: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {name}
                      </span>
                    ))}
                    {systemStatus?.enrolled_names && systemStatus.enrolled_names.length > 5 && (
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                        +{systemStatus.enrolled_names.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-orange-600" />
                    Today's Attendees
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {attendanceStats?.today_names?.slice(0, 5).map((name: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {name}
                      </span>
                    ))}
                    {attendanceStats?.today_names && attendanceStats.today_names.length > 5 && (
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                        +{attendanceStats.today_names.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



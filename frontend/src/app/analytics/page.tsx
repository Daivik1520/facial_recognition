'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sidebar } from '@/components/layout/sidebar'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import axios from 'axios'
import { BarChart3, TrendingUp, Users, Clock, Activity, Eye, Target, Zap, Calendar, Download, RefreshCw, UserX, Search, Filter } from 'lucide-react'

export default function AnalyticsPage() {
  const {
    systemStatus,
    attendanceStats,
    isLoading,
    setSystemStatus,
    setAttendanceStats,
    setLoading
  } = useAppStore()

  // Absentee Checker State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterHouse, setFilterHouse] = useState('')
  const [absenteeData, setAbsenteeData] = useState<any>(null)
  const [isLoadingAbsentees, setIsLoadingAbsentees] = useState(false)

  const fetchAbsentees = async () => {
    try {
      setIsLoadingAbsentees(true)
      const params = new URLSearchParams()
      if (selectedDate) params.append('date', selectedDate)
      if (filterClass) params.append('student_class', filterClass)
      if (filterSection) params.append('section', filterSection)
      if (filterHouse) params.append('house', filterHouse)

      const response = await axios.get(`http://localhost:8000/api/attendance/absentees?${params.toString()}`)
      setAbsenteeData(response.data)
    } catch (error) {
      console.error('Failed to fetch absentees:', error)
    } finally {
      setIsLoadingAbsentees(false)
    }
  }

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

          {/* Absentee Checker */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                    <UserX className="h-6 w-6 mr-2 text-red-500" />
                    Absentee Checker
                  </CardTitle>
                  <CardDescription>Check who is absent on any day, filter by class, section, or house</CardDescription>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Search className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters Row */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="date-picker" className="text-sm font-medium">Date</Label>
                  <Input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-class" className="text-sm font-medium">Class</Label>
                  <Input
                    id="filter-class"
                    placeholder="e.g. 10"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-section" className="text-sm font-medium">Section</Label>
                  <Input
                    id="filter-section"
                    placeholder="e.g. A"
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-house" className="text-sm font-medium">House</Label>
                  <Input
                    id="filter-house"
                    placeholder="e.g. Red"
                    value={filterHouse}
                    onChange={(e) => setFilterHouse(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={fetchAbsentees}
                    disabled={isLoadingAbsentees}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    {isLoadingAbsentees ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Check Absentees
                  </Button>
                </div>
              </div>

              {/* Results */}
              {absenteeData && (
                <div className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{absenteeData.total_enrolled}</div>
                      <div className="text-sm text-blue-600">Total Enrolled</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-700">{absenteeData.total_filtered}</div>
                      <div className="text-sm text-purple-600">Filtered</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{absenteeData.total_present}</div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{absenteeData.total_absent}</div>
                      <div className="text-sm text-red-600">Absent</div>
                    </div>
                  </div>

                  {/* Absentees Table */}
                  {absenteeData.absentees.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">#</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Class</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Section</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">House</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {absenteeData.absentees.map((person: any, index: number) => (
                            <tr key={index} className="hover:bg-red-50/50 transition-colors">
                              <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                              <td className="px-4 py-3">
                                <span className="font-medium text-slate-900">{person.name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {person.student_class || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  {person.section || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                  {person.house || '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Everyone is Present!</h3>
                      <p className="text-green-700">No absentees found for the selected date and filters.</p>
                    </div>
                  )}
                </div>
              )}

              {!absenteeData && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select Date and Filters</h3>
                  <p className="text-slate-500">Choose a date and optionally filter by class, section, or house, then click "Check Absentees"</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}



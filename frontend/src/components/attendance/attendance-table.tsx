'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store'
import { endpoints } from '@/lib/api'
import { formatDate, formatTime, formatConfidence } from '@/lib/utils'
import { Search, Download, RefreshCw } from 'lucide-react'

export function AttendanceTable() {
  const { 
    attendanceRecords, 
    attendanceFilters, 
    setAttendanceRecords, 
    setAttendanceFilters 
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  const fetchAttendanceRecords = async () => {
    try {
      setIsLoading(true)
      const response = await endpoints.attendanceRecords()
      setAttendanceRecords(response.data.records || [])
    } catch (error) {
      console.error('Failed to fetch attendance records:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !attendanceFilters.search || 
      record.name.toLowerCase().includes(attendanceFilters.search.toLowerCase()) ||
      record.status.toLowerCase().includes(attendanceFilters.search.toLowerCase()) ||
      record.date.includes(attendanceFilters.search) ||
      record.time.includes(attendanceFilters.search)

    const matchesStatus = attendanceFilters.status === 'all' || 
      record.status === attendanceFilters.status

    const matchesDateFrom = !attendanceFilters.dateFrom || 
      record.date >= attendanceFilters.dateFrom

    const matchesDateTo = !attendanceFilters.dateTo || 
      record.date <= attendanceFilters.dateTo

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  })

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[attendanceFilters.sortBy as keyof typeof a]
    const bValue = b[attendanceFilters.sortBy as keyof typeof b]
    
    if (attendanceFilters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: string) => {
    if (attendanceFilters.sortBy === column) {
      setAttendanceFilters({ 
        sortOrder: attendanceFilters.sortOrder === 'asc' ? 'desc' : 'asc' 
      })
    } else {
      setAttendanceFilters({ 
        sortBy: column, 
        sortOrder: 'asc' 
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status.toLowerCase()) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Ledger</h1>
        <p className="text-muted-foreground">
          Review attendance history with advanced filtering and search capabilities.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search names, status, dates..."
                  value={attendanceFilters.search}
                  onChange={(e) => setAttendanceFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={attendanceFilters.status}
                onChange={(e) => setAttendanceFilters({ status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={attendanceFilters.dateFrom}
                onChange={(e) => setAttendanceFilters({ dateFrom: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={attendanceFilters.dateTo}
                onChange={(e) => setAttendanceFilters({ dateTo: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button onClick={fetchAttendanceRecords} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedRecords.length} of {attendanceRecords.length} records
        </p>
        <div className="text-sm text-muted-foreground">
          {sortedRecords.filter(r => r.status === 'Present').length} Present, {' '}
          {sortedRecords.filter(r => r.status === 'Absent').length} Absent
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    Date {attendanceFilters.sortBy === 'date' && (attendanceFilters.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('time')}
                  >
                    Time {attendanceFilters.sortBy === 'time' && (attendanceFilters.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Name {attendanceFilters.sortBy === 'name' && (attendanceFilters.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('confidence')}
                  >
                    Confidence {attendanceFilters.sortBy === 'confidence' && (attendanceFilters.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    Status {attendanceFilters.sortBy === 'status' && (attendanceFilters.sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                      {isLoading ? 'Loading...' : 'No records found'}
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle text-sm">
                        {formatDate(record.date)}
                      </td>
                      <td className="p-4 align-middle text-sm">
                        {record.time}
                      </td>
                      <td className="p-4 align-middle text-sm font-medium">
                        {record.name}
                      </td>
                      <td className="p-4 align-middle text-sm">
                        {record.confidence ? formatConfidence(record.confidence) : 'N/A'}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={getStatusBadge(record.status)}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

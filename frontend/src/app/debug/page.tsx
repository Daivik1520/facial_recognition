'use client'

import { useEffect, useState } from 'react'
import { endpoints } from '@/lib/api'

export default function DebugPage() {
  const [status, setStatus] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing API connection...')
      
      // Test status endpoint
      console.log('Testing /api/status...')
      const statusResponse = await endpoints.status()
      console.log('Status response:', statusResponse)
      setStatus(statusResponse.data)
      
      // Test attendance endpoint
      console.log('Testing /api/attendance...')
      const attendanceResponse = await endpoints.attendance()
      console.log('Attendance response:', attendanceResponse)
      setAttendance(attendanceResponse.data)
      
    } catch (err: any) {
      console.error('API Test Error:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Debug Page</h1>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={testAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 border rounded">
            <h3 className="text-xl font-bold mb-2">Status API Response</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="text-xl font-bold mb-2">Attendance API Response</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(attendance, null, 2)}
            </pre>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="text-xl font-bold mb-2">API Configuration</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}</p>
            <p><strong>Status Endpoint:</strong> /api/status</p>
            <p><strong>Attendance Endpoint:</strong> /api/attendance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

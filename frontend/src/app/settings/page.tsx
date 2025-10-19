'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Camera, Database, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { endpoints } from '@/lib/api'

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [deleteName, setDeleteName] = useState('')

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all enrolled faces? This action cannot be undone.')) {
      return
    }
    
    setIsClearing(true)
    try {
      await endpoints.clearAll()
      alert('All enrolled faces have been cleared.')
    } catch (error) {
      console.error('Error clearing faces:', error)
      alert('Error clearing faces. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  const handleDeletePerson = async () => {
    if (!deleteName.trim()) {
      alert('Please enter a name to delete.')
      return
    }
    
    try {
      await endpoints.deletePerson(deleteName)
      alert(`Person "${deleteName}" has been deleted.`)
      setDeleteName('')
    } catch (error) {
      console.error('Error deleting person:', error)
      alert('Error deleting person. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Model</Label>
              <p className="text-sm text-muted-foreground">InsightFace ArcFace</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <p className="text-sm text-green-600">Online</p>
            </div>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <p className="text-sm text-muted-foreground">http://127.0.0.1:8000</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage enrolled faces and attendance data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-name">Delete Person</Label>
              <div className="flex space-x-2">
                <Input
                  id="delete-name"
                  placeholder="Enter name to delete"
                  value={deleteName}
                  onChange={(e) => setDeleteName(e.target.value)}
                />
                <Button 
                  onClick={handleDeletePerson}
                  variant="destructive"
                  disabled={!deleteName.trim()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={handleClearAll}
                variant="destructive"
                disabled={isClearing}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear All Enrolled Faces'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Camera Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Settings
            </CardTitle>
            <CardDescription>
              Configure camera and recognition parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recognition Threshold</Label>
              <p className="text-sm text-muted-foreground">0.5 (Default)</p>
            </div>
            <div className="space-y-2">
              <Label>Camera Resolution</Label>
              <p className="text-sm text-muted-foreground">Auto-detect</p>
            </div>
            <div className="space-y-2">
              <Label>Face Detection Model</Label>
              <p className="text-sm text-muted-foreground">RetinaFace</p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              System version and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <p className="text-sm text-muted-foreground">2.0.0</p>
            </div>
            <div className="space-y-2">
              <Label>Frontend</Label>
              <p className="text-sm text-muted-foreground">Next.js 15.5.6</p>
            </div>
            <div className="space-y-2">
              <Label>Backend</Label>
              <p className="text-sm text-muted-foreground">FastAPI + InsightFace</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

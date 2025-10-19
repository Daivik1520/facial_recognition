import { create } from 'zustand'
import { 
  SystemStatus, 
  AttendanceRecord, 
  WebcamState, 
  EnrollmentState, 
  AttendanceFilters,
  AnalyticsReport 
} from '@/types'

interface AppState {
  // System Status
  systemStatus: SystemStatus | null
  isLoading: boolean
  error: string | null
  
  // Attendance
  attendanceRecords: AttendanceRecord[]
  attendanceStats: any
  
  // Webcam
  webcam: WebcamState
  
  // Enrollment
  enrollment: EnrollmentState
  
  // Filters
  attendanceFilters: AttendanceFilters
  
  // Analytics
  analyticsReport: AnalyticsReport | null
  
  // Actions
  setSystemStatus: (status: SystemStatus | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAttendanceRecords: (records: AttendanceRecord[]) => void
  setAttendanceStats: (stats: any) => void
  setWebcamState: (state: Partial<WebcamState>) => void
  setEnrollmentState: (state: Partial<EnrollmentState>) => void
  setAttendanceFilters: (filters: Partial<AttendanceFilters>) => void
  setAnalyticsReport: (report: AnalyticsReport | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  systemStatus: null,
  isLoading: false,
  error: null,
  attendanceRecords: [],
  attendanceStats: null,
  webcam: {
    isActive: false,
    isRecognizing: false,
    stream: null,
    error: null,
  },
  enrollment: {
    isEnrolling: false,
    progress: 0,
    currentStep: '',
    error: null,
  },
  attendanceFilters: {
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc',
  },
  analyticsReport: null,
  
  // Actions
  setSystemStatus: (status) => set({ systemStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setAttendanceRecords: (records) => set({ attendanceRecords: records }),
  setAttendanceStats: (stats) => set({ attendanceStats: stats }),
  setWebcamState: (state) => set((prev) => ({ 
    webcam: { ...prev.webcam, ...state } 
  })),
  setEnrollmentState: (state) => set((prev) => ({ 
    enrollment: { ...prev.enrollment, ...state } 
  })),
  setAttendanceFilters: (filters) => set((prev) => ({ 
    attendanceFilters: { ...prev.attendanceFilters, ...filters } 
  })),
  setAnalyticsReport: (report) => set({ analyticsReport: report }),
  reset: () => set({
    systemStatus: null,
    isLoading: false,
    error: null,
    attendanceRecords: [],
    attendanceStats: null,
    webcam: {
      isActive: false,
      isRecognizing: false,
      stream: null,
      error: null,
    },
    enrollment: {
      isEnrolling: false,
      progress: 0,
      currentStep: '',
      error: null,
    },
    attendanceFilters: {
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc',
    },
    analyticsReport: null,
  }),
}))

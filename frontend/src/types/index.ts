// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success?: boolean
}

// Face Recognition Types
export interface FaceResult {
  bbox: [number, number, number, number]
  matched: boolean
  name: string | null
  confidence: number
  det_score: number
}

export interface RecognitionResponse {
  count: number
  faces: FaceResult[]
  attendance_logged?: string[]
}

// Enrollment Types
export interface EnrollmentRequest {
  name: string
  files: File[]
  use_augmentation?: boolean
  augmentation_preset?: 'minimal' | 'balanced' | 'aggressive'
}

export interface EnrollmentResponse {
  message: string
  total_enrolled: number
  images_processed: number
  successful_enrollments?: number
  total_embeddings?: number
  augmented_count?: number
  original_count?: number
  avg_quality?: number
  augmentation_used?: boolean
  augmentation_preset?: string
}

// Attendance Types
export interface AttendanceRecord {
  date: string
  time: string
  name: string
  confidence: number | null
  status: string
}

export interface AttendanceStats {
  today_attendance: number
  today_names: string[]
  total_days_recorded: number
  total_attendance_records: number
}

// System Status Types
export interface SystemStatus {
  enrolled_count: number
  enrolled_names: string[]
  model: string
  attendance: AttendanceStats
}

// Analytics Types
export interface DailyStats {
  daily_attendance: Record<string, { Name: number; Confidence: number }>
  total_days: number
  avg_daily_attendance: number
  max_daily_attendance: number
  avg_confidence: number
}

export interface PersonStats {
  [name: string]: {
    Date_count: number
    Date_nunique: number
    Confidence_mean: number
    Confidence_min: number
    Confidence_max: number
    DateTime_min: string
    DateTime_max: string
    attendance_rate: number
  }
}

export interface TimePatterns {
  hourly_distribution: Record<string, number>
  daily_distribution: Record<string, number>
  peak_hour: number | null
  peak_day: string | null
  weekly_trends: Record<string, number>
}

export interface ConfidenceAnalysis {
  overall_stats: {
    count: number
    mean: number
    std: number
    min: number
    '25%': number
    '50%': number
    '75%': number
    max: number
  }
  by_person: Record<string, {
    mean: number
    std: number
    count: number
  }>
  low_confidence_alerts: {
    count: number
    threshold: number
    recent_issues: any[]
  }
  confidence_distribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
}

export interface SystemHealth {
  database_health: {
    enrolled_people: number
    total_embeddings: number
    avg_embeddings_per_person: number
    attendance_records: number
  }
  recent_activity: {
    last_24h_recognitions: number
    unique_people_24h: number
    avg_confidence_24h: number
  }
  data_quality: {
    missing_confidence: number
    invalid_dates: number
    duplicate_records: number
  }
}

export interface AnalyticsReport {
  report_generated: string
  period_days: number
  daily_stats: DailyStats
  person_stats: PersonStats
  time_patterns: TimePatterns
  confidence_analysis: ConfidenceAnalysis
  system_health: SystemHealth
}

// UI State Types
export interface WebcamState {
  isActive: boolean
  isRecognizing: boolean
  stream: MediaStream | null
  error: string | null
}

export interface EnrollmentState {
  isEnrolling: boolean
  progress: number
  currentStep: string
  error: string | null
}

export interface AttendanceFilters {
  search: string
  status: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

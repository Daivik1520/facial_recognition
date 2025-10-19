"""
Advanced analytics and reporting for the face recognition system.
Provides insights into attendance patterns, system performance, and usage statistics.
"""
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import json
import csv
from collections import defaultdict, Counter

class AttendanceAnalytics:
    """Advanced analytics for attendance data."""
    
    def __init__(self, attendance_file: Path = None, embeddings_file: Path = None):
        self.attendance_file = attendance_file or Path("data/processed/attendance.csv")
        self.embeddings_file = embeddings_file or Path("data/processed/face_embeddings.json")
    
    def load_attendance_data(self) -> pd.DataFrame:
        """Load attendance data into a pandas DataFrame."""
        if not self.attendance_file.exists():
            return pd.DataFrame(columns=['Date', 'Time', 'Name', 'Confidence', 'Status'])
        
        df = pd.read_csv(self.attendance_file)
        df['DateTime'] = pd.to_datetime(df['Date'] + ' ' + df['Time'])
        df['Confidence'] = pd.to_numeric(df['Confidence'], errors='coerce')
        return df
    
    def get_daily_stats(self, days: int = 30) -> Dict:
        """Get daily attendance statistics for the last N days."""
        df = self.load_attendance_data()
        if df.empty:
            return {}
        
        # Filter to last N days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        df['Date'] = pd.to_datetime(df['Date']).dt.date
        df_filtered = df[df['Date'] >= start_date]
        
        # Daily attendance counts
        daily_counts = df_filtered.groupby('Date').agg({
            'Name': 'nunique',  # Unique people per day
            'Confidence': 'mean'  # Average confidence
        }).round(3)
        
        return {
            'daily_attendance': daily_counts.to_dict('index'),
            'total_days': len(daily_counts),
            'avg_daily_attendance': daily_counts['Name'].mean(),
            'max_daily_attendance': daily_counts['Name'].max(),
            'avg_confidence': daily_counts['Confidence'].mean()
        }
    
    def get_person_stats(self) -> Dict:
        """Get per-person attendance statistics."""
        df = self.load_attendance_data()
        if df.empty:
            return {}
        
        person_stats = df.groupby('Name').agg({
            'Date': ['count', 'nunique'],  # Total records, unique days
            'Confidence': ['mean', 'min', 'max'],
            'DateTime': ['min', 'max']  # First and last seen
        }).round(3)
        
        # Flatten column names
        person_stats.columns = ['_'.join(col).strip() for col in person_stats.columns]
        
        # Calculate attendance rate (assuming working days)
        total_days = (datetime.now().date() - df['DateTime'].min().date()).days + 1
        working_days = max(1, total_days * 5 // 7)  # Approximate working days
        
        for person in person_stats.index:
            unique_days = person_stats.loc[person, 'Date_nunique']
            person_stats.loc[person, 'attendance_rate'] = (unique_days / working_days * 100)
        
        return person_stats.to_dict('index')
    
    def get_time_patterns(self) -> Dict:
        """Analyze attendance time patterns."""
        df = self.load_attendance_data()
        if df.empty:
            return {}
        
        df['Hour'] = df['DateTime'].dt.hour
        df['DayOfWeek'] = df['DateTime'].dt.day_name()
        df['WeekOfYear'] = df['DateTime'].dt.isocalendar().week
        
        return {
            'hourly_distribution': df['Hour'].value_counts().sort_index().to_dict(),
            'daily_distribution': df['DayOfWeek'].value_counts().to_dict(),
            'peak_hour': df['Hour'].mode().iloc[0] if not df['Hour'].mode().empty else None,
            'peak_day': df['DayOfWeek'].mode().iloc[0] if not df['DayOfWeek'].mode().empty else None,
            'weekly_trends': df.groupby('WeekOfYear')['Name'].nunique().to_dict()
        }
    
    def get_confidence_analysis(self) -> Dict:
        """Analyze recognition confidence patterns."""
        df = self.load_attendance_data()
        if df.empty:
            return {}
        
        confidence_stats = df['Confidence'].describe()
        
        # Confidence distribution by person
        person_confidence = df.groupby('Name')['Confidence'].agg(['mean', 'std', 'count']).round(3)
        
        # Low confidence alerts (potential issues)
        low_confidence_threshold = 0.5
        low_confidence_records = df[df['Confidence'] < low_confidence_threshold]
        
        return {
            'overall_stats': confidence_stats.to_dict(),
            'by_person': person_confidence.to_dict('index'),
            'low_confidence_alerts': {
                'count': len(low_confidence_records),
                'threshold': low_confidence_threshold,
                'recent_issues': low_confidence_records.tail(10).to_dict('records')
            },
            'confidence_distribution': {
                'excellent': len(df[df['Confidence'] >= 0.8]) / len(df) * 100,
                'good': len(df[(df['Confidence'] >= 0.6) & (df['Confidence'] < 0.8)]) / len(df) * 100,
                'fair': len(df[(df['Confidence'] >= 0.4) & (df['Confidence'] < 0.6)]) / len(df) * 100,
                'poor': len(df[df['Confidence'] < 0.4]) / len(df) * 100
            }
        }
    
    def get_system_health(self) -> Dict:
        """Get system health and performance metrics."""
        df = self.load_attendance_data()
        
        # Load embeddings data
        embeddings_count = 0
        enrolled_people = 0
        if self.embeddings_file.exists():
            try:
                with open(self.embeddings_file, 'r') as f:
                    embeddings_data = json.load(f)
                    enrolled_people = len(embeddings_data)
                    embeddings_count = sum(len(embs) for embs in embeddings_data.values())
            except:
                pass
        
        # Recent activity (last 24 hours)
        if not df.empty:
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_activity = df[df['DateTime'] > recent_cutoff]
            
            return {
                'database_health': {
                    'enrolled_people': enrolled_people,
                    'total_embeddings': embeddings_count,
                    'avg_embeddings_per_person': embeddings_count / max(1, enrolled_people),
                    'attendance_records': len(df)
                },
                'recent_activity': {
                    'last_24h_recognitions': len(recent_activity),
                    'unique_people_24h': recent_activity['Name'].nunique() if not recent_activity.empty else 0,
                    'avg_confidence_24h': recent_activity['Confidence'].mean() if not recent_activity.empty else 0
                },
                'data_quality': {
                    'missing_confidence': df['Confidence'].isna().sum(),
                    'invalid_dates': 0,  # Could add date validation
                    'duplicate_records': df.duplicated().sum()
                }
            }
        else:
            return {
                'database_health': {
                    'enrolled_people': enrolled_people,
                    'total_embeddings': embeddings_count,
                    'avg_embeddings_per_person': embeddings_count / max(1, enrolled_people),
                    'attendance_records': 0
                },
                'recent_activity': {
                    'last_24h_recognitions': 0,
                    'unique_people_24h': 0,
                    'avg_confidence_24h': 0
                },
                'data_quality': {
                    'missing_confidence': 0,
                    'invalid_dates': 0,
                    'duplicate_records': 0
                }
            }
    
    def generate_report(self, days: int = 30) -> Dict:
        """Generate a comprehensive analytics report."""
        return {
            'report_generated': datetime.now().isoformat(),
            'period_days': days,
            'daily_stats': self.get_daily_stats(days),
            'person_stats': self.get_person_stats(),
            'time_patterns': self.get_time_patterns(),
            'confidence_analysis': self.get_confidence_analysis(),
            'system_health': self.get_system_health()
        }
    
    @staticmethod
    def _stringify_keys(data):
        """Recursively convert dictionary keys to strings for JSON serialization."""
        if isinstance(data, dict):
            new_dict = {}
            for key, value in data.items():
                str_key = str(key)
                new_dict[str_key] = AttendanceAnalytics._stringify_keys(value)
            return new_dict
        if isinstance(data, list):
            return [AttendanceAnalytics._stringify_keys(item) for item in data]
        return data

    def export_report(self, output_file: Path = None, format: str = 'json') -> Path:
        """Export analytics report to file."""
        if output_file is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = Path(f"data/processed/analytics_report_{timestamp}.{format}")
        
        report = self.generate_report()
        report = self._stringify_keys(report)
        
        if format.lower() == 'json':
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2, default=str)
        elif format.lower() == 'csv':
            # Export key metrics to CSV
            daily_stats = report.get('daily_stats', {}).get('daily_attendance', {})
            df_daily = pd.DataFrame(daily_stats).T
            df_daily.to_csv(output_file)
        
        return output_file
    
    def get_attendance_trends(self, days: int = 90) -> Dict:
        """Analyze attendance trends over time."""
        df = self.load_attendance_data()
        if df.empty:
            return {}
        
        # Group by week
        df['Week'] = df['DateTime'].dt.to_period('W')
        weekly_stats = df.groupby('Week').agg({
            'Name': 'nunique',
            'Confidence': 'mean'
        }).round(3)
        
        # Calculate trends
        if len(weekly_stats) > 1:
            attendance_trend = np.polyfit(range(len(weekly_stats)), weekly_stats['Name'], 1)[0]
            confidence_trend = np.polyfit(range(len(weekly_stats)), weekly_stats['Confidence'], 1)[0]
        else:
            attendance_trend = 0
            confidence_trend = 0
        
        return {
            'weekly_stats': weekly_stats.to_dict('index'),
            'trends': {
                'attendance_slope': float(attendance_trend),
                'confidence_slope': float(confidence_trend),
                'attendance_direction': 'increasing' if attendance_trend > 0 else 'decreasing' if attendance_trend < 0 else 'stable',
                'confidence_direction': 'improving' if confidence_trend > 0 else 'declining' if confidence_trend < 0 else 'stable'
            }
        }

import type { Database } from './database.types';

export type JmLocationType = Database['public']['Enums']['jm_location_type'];
export type JmEmployeeStatus = Database['public']['Enums']['jm_employee_status'];
export type JmAttendanceStatus = Database['public']['Enums']['jm_attendance_status'];
export type JmPerformanceType = Database['public']['Enums']['jm_performance_type'];
export type JmUserRole = Database['public']['Enums']['jm_user_role'];

export type JmLocation = Database['public']['Tables']['jm_locations']['Row'];
export type JmLocationInsert = Database['public']['Tables']['jm_locations']['Insert'];
export type JmLocationUpdate = Database['public']['Tables']['jm_locations']['Update'];

export type JmProfile = Database['public']['Tables']['jm_profiles']['Row'];
export type JmProfileInsert = Database['public']['Tables']['jm_profiles']['Insert'];
export type JmProfileUpdate = Database['public']['Tables']['jm_profiles']['Update'];

export type JmEmployeeProfile = Database['public']['Tables']['jm_employee_profiles']['Row'];
export type JmEmployeeProfileInsert = Database['public']['Tables']['jm_employee_profiles']['Insert'];
export type JmEmployeeProfileUpdate = Database['public']['Tables']['jm_employee_profiles']['Update'];

export type JmEmployeeAttendance = Database['public']['Tables']['jm_employee_attendance']['Row'];
export type JmEmployeeAttendanceInsert = Database['public']['Tables']['jm_employee_attendance']['Insert'];
export type JmEmployeeAttendanceUpdate = Database['public']['Tables']['jm_employee_attendance']['Update'];

export type JmEmployeePerformanceNote = Database['public']['Tables']['jm_employee_performance_notes']['Row'];
export type JmEmployeePerformanceNoteInsert = Database['public']['Tables']['jm_employee_performance_notes']['Insert'];
export type JmEmployeePerformanceNoteUpdate = Database['public']['Tables']['jm_employee_performance_notes']['Update'];

export type JmEmployeeSalary = Database['public']['Tables']['jm_employee_salaries']['Row'];
export type JmEmployeeSalaryInsert = Database['public']['Tables']['jm_employee_salaries']['Insert'];
export type JmEmployeeSalaryUpdate = Database['public']['Tables']['jm_employee_salaries']['Update'];

// ─── Extended Compound Types ─────────────────────────────────────────────────

export type JmEmployeeWithLocation = JmEmployeeProfile & {
  location?: JmLocation | null;
};

export type JmAttendanceWithEmployee = JmEmployeeAttendance & {
  employee?: (JmEmployeeProfile & { location?: JmLocation | null }) | null;
};

export type JmPerformanceWithEmployee = JmEmployeePerformanceNote & {
  employee?: (JmEmployeeProfile & { location?: JmLocation | null }) | null;
};

export type JmSalaryWithEmployee = JmEmployeeSalary & {
  employee?: (JmEmployeeProfile & { location?: JmLocation | null }) | null;
};

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  halfDayToday: number;
  attendanceRate: number;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  halfDay: number;
  late: number;
  onLeave: number;
}

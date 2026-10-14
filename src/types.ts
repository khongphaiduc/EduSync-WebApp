export interface ScheduleItem {
  id: string
  time: string
  subject: string
  classCode: string
  room: string
  lessonNumber: string
  totalLessons: number
  dayOfWeek?: string
}

export interface ClassItem {
  id: string
  name: string
  code: string
  semester: string
  studentsCount: number
  status: 'active' | 'upcoming' | 'finished'
  statusText: string
  typeIcon: 'code' | 'database' | 'mobile' | 'architecture'
}

export interface ApplicationRequest {
  id: string
  studentName: string
  studentCode: string
  avatar: string
  requestType: 'Xin nghỉ học' | 'Phúc khảo điểm' | 'Bảo lưu kết quả' | 'Xin hoãn thi'
  submissionDate: string
  status: 'pending' | 'approved' | 'rejected'
  statusText: string
  reason: string
  className: string
  courseName: string
  attachment?: string
}

export interface StudentGrade {
  id: string
  studentCode: string
  fullName: string
  avatar: string
  attendance: number // 10%
  midterm: number // 30%
  practical: number // 20%
  finalExam: number // 40%
  totalScore: number
  letterGrade: string
  status: 'Đạt' | 'Không đạt' | 'Cảnh báo'
  notes?: string
}

export type ActiveNavTab =
  | 'dashboard'
  | 'classes'
  | 'grades'
  | 'schedule'
  | 'students'
  | 'requests'
  | 'notifications'
  | 'materials'
  | 'reports'

export type AdminNavTab =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'subjects'
  | 'semesters'
  | 'sections'
  | 'assignment'
  | 'schedule'
  | 'requests'
  | 'notifications'
  | 'accounts'
  | 'settings'

export type PortalMode = 'admin' | 'teacher'

export interface FacultyStat {
  faculty: string
  students: number
  teachers: number
  sections: number
}

export interface SectionClassItem {
  id: string
  code: string
  subjectName: string
  teacherName: string
  studentCount: number
  semester: string
  status: 'active' | 'upcoming' | 'completed'
  statusText: string
}

export interface ActivityEvent {
  id: string
  time: string
  title: string
  location: string
  color: 'blue' | 'pink' | 'orange' | 'purple'
}

export interface AuthUserData {
  userId: string
  email: string
  role: 1 | 2 | 3 // 1: Admin, 2: Lecturer, 3: Student
  accessToken: string
  accessTokenExpiresAtUtc: string
  refreshToken: string
  refreshTokenExpiresAtUtc: string
}

export interface LoginApiResponse {
  success: boolean
  message: string
  data?: AuthUserData
}

export interface ApiStudentItem {
  id: string
  studentCode: string
  fullName: string
  email: string
  majorId: string
  majorName: string
  enrollmentYear: number
  status: string
  avatarUrl: string | null
}

export interface ApiStudentListData {
  items: ApiStudentItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ApiStudentListResponse {
  success: boolean
  message: string
  data?: ApiStudentListData
}





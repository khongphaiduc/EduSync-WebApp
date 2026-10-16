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

export interface ApiLecturerItem {
  id: string
  userId: string
  lecturerCode: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string | null
  isActive: boolean
}

export interface ApiLecturerListData {
  items: ApiLecturerItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ApiLecturerListResponse {
  success: boolean
  message: string
  data?: ApiLecturerListData
}

export interface CreateLecturerRequest {
  email: string
  password?: string
  lecturerCode: string
  fullName: string
  phone: string
}

export interface CreateLecturerResponse {
  success: boolean
  message: string
  data?: ApiLecturerItem
}

export interface ApiCourseItem {
  id: string
  courseCode: string
  courseName: string
  credits: number
  description: string
}

export interface ApiCourseListResponse {
  success: boolean
  message: string
  data?: ApiCourseItem[]
}

export interface CreateCourseRequest {
  courseCode: string
  courseName: string
  credits: number
  description: string
}

export interface CreateCourseResponse {
  success: boolean
  message: string
  data?: ApiCourseItem
}

export interface ApiSemesterItem {
  id: string
  name: string
  academicYear: string
  startDate: string
  endDate: string
}

export interface ApiSemesterListResponse {
  success: boolean
  message: string
  data?: ApiSemesterItem[]
}

export interface CreateSemesterRequest {
  name: string
  academicYear: string
  startDate: string
  endDate: string
}

export interface CreateSemesterResponse {
  success: boolean
  message: string
  data?: ApiSemesterItem
}

export interface ApiCourseSectionItem {
  id: string
  courseId: string
  courseCode?: string
  courseName?: string
  semesterId: string
  semesterName?: string
  academicYear?: string
  lecturerId: string
  lecturerName?: string
  sectionCode: string
  capacity: number
  status: string
}

export interface ApiCourseSectionListData {
  items: ApiCourseSectionItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ApiCourseSectionListResponse {
  success: boolean
  message: string
  data?: ApiCourseSectionListData
}

export interface CreateCourseSectionRequest {
  courseId: string
  semesterId: string
  lecturerId: string
  sectionCode: string
  capacity: number
}

export interface CreateCourseSectionResponse {
  success: boolean
  message: string
  data?: ApiCourseSectionItem
}

export interface WeeklySlotRequest {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  startTime: string
  endTime: string
  room?: string
}

export interface GenerateSessionsRequest {
  fromDate: string
  toDate: string
  timeZoneId?: string
  weeklySlots: WeeklySlotRequest[]
  excludeDates?: string[]
}

export interface ApiClassSessionItem {
  id: string
  courseSectionId: string
  startAtUtc: string
  endAtUtc: string
  room: string | null
  topic: string | null
  status: 'Scheduled' | 'Cancelled' | 'Completed' | string
}

export interface GenerateSessionsResponse {
  success: boolean
  message: string
  data?: {
    courseSectionId: string
    createdCount: number
    sessions: ApiClassSessionItem[]
  }
  errors?: Record<string, string[]>
}

export interface ApiClassSessionListResponse {
  success: boolean
  message: string
  data?: ApiClassSessionItem[]
}

export interface UpdateClassSessionRequest {
  startAtUtc?: string
  endAtUtc?: string
  room?: string
  topic?: string
  status?: 'Scheduled' | 'Cancelled' | 'Completed' | string
  timeZoneId?: string
  clearRoom?: boolean
  clearTopic?: boolean
}

export interface UpdateClassSessionResponse {
  success: boolean
  message: string
  data?: ApiClassSessionItem
}

export interface ApiStudentRequestItem {
  id: string
  studentId: string
  studentCode: string
  studentName: string
  requestType: string
  title: string
  content: string
  startDate: string | null
  endDate: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | string
  submittedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  response: string | null
}

export interface ApiStudentRequestListData {
  items: ApiStudentRequestItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ApiStudentRequestListResponse {
  success: boolean
  message: string
  data?: ApiStudentRequestListData
}

export interface ApiSectionStudentItem {
  enrollmentId: string
  studentId: string
  studentCode: string
  fullName: string
  email: string
  studentStatus: string
  enrollmentStatus: string
  enrolledAt: string
}

export interface ApiSectionStudentListData {
  items: ApiSectionStudentItem[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ApiSectionStudentListResponse {
  success: boolean
  message: string
  data?: ApiSectionStudentListData
}

export interface CreateGradeComponentRequest {
  name: string
  weight: number
  maxScore: number
}

export interface ApiGradeComponentItem {
  id: string
  courseSectionId: string
  name: string
  weight: number
  maxScore: number
}

export interface CreateGradeComponentResponse {
  success: boolean
  message: string
  data?: ApiGradeComponentItem
}

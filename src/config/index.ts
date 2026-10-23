import devConfig from './appsettings.development.json'
import prodConfig from './appsettings.production.json'

export interface AppConfig {
  apiBaseUrl: string
  authEndpoint: string
  environment: string
  timeoutMs: number
}

const isProduction = import.meta.env.PROD

export const appConfig: AppConfig = isProduction ? prodConfig : devConfig

export const API_BASE_URL = appConfig.apiBaseUrl
export const LOGIN_URL = `${appConfig.apiBaseUrl}${appConfig.authEndpoint}`
export const getStudentsUrl = (page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/students?page=${page}&pageSize=${pageSize}`
export const getCreateStudentUrl = () => `${appConfig.apiBaseUrl}/api/students`
export const getMajorsUrl = () => `${appConfig.apiBaseUrl}/api/majors`
export const getLecturersUrl = (page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/lecturers?page=${page}&pageSize=${pageSize}`
export const getCreateLecturerUrl = () => `${appConfig.apiBaseUrl}/api/lecturers`
export const getCoursesUrl = (limit = 20) => `${appConfig.apiBaseUrl}/api/courses?limit=${limit}`
export const getSemestersUrl = () => `${appConfig.apiBaseUrl}/api/semesters`
export const getCourseSectionsUrl = (page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/course-sections?page=${page}&pageSize=${pageSize}`
export const getGenerateSessionsUrl = (sectionId: string) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/sessions/generate`
export const getSectionSessionsUrl = (
  sectionId: string,
  from: string,
  to: string,
  timeZoneId = 'Asia/Ho_Chi_Minh'
) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/sessions?from=${encodeURIComponent(
    from
  )}&to=${encodeURIComponent(to)}&timeZoneId=${encodeURIComponent(timeZoneId)}`
export const getUpdateSessionUrl = (sessionId: string) =>
  `${appConfig.apiBaseUrl}/api/class-sessions/${sessionId}`
export const getStudentRequestsUrl = (
  page = 1,
  pageSize = 20,
  status?: string,
  requestType?: string,
  studentId?: string
) => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  if (status && status !== 'ALL') params.set('status', status)
  if (requestType && requestType !== 'ALL') params.set('requestType', requestType)
  if (studentId && studentId.trim()) params.set('studentId', studentId.trim())
  return `${appConfig.apiBaseUrl}/api/requests?${params.toString()}`
}
export const getLecturerCourseSectionsUrl = (page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/lecturers/me/course-sections?page=${page}&pageSize=${pageSize}`
export const getCourseSectionStudentsUrl = (sectionId: string, page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/students?page=${page}&pageSize=${pageSize}`
export const getGradeComponentsUrl = (sectionId: string) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/grade-components`
export const getLecturerScheduleUrl = (
  from: string,
  to: string,
  timeZoneId = 'Asia/Ho_Chi_Minh'
) =>
  `${appConfig.apiBaseUrl}/api/lecturers/me/schedule?from=${encodeURIComponent(
    from
  )}&to=${encodeURIComponent(to)}&timeZoneId=${encodeURIComponent(timeZoneId)}`
export const getStudentScheduleUrl = (
  from: string,
  to: string,
  timeZoneId = 'Asia/Ho_Chi_Minh'
) =>
  `${appConfig.apiBaseUrl}/api/students/me/schedule?from=${encodeURIComponent(
    from
  )}&to=${encodeURIComponent(to)}&timeZoneId=${encodeURIComponent(timeZoneId)}`
export const getSessionAttendanceUrl = (sessionId: string) =>
  `${appConfig.apiBaseUrl}/api/class-sessions/${sessionId}/attendance`
export const getCourseSectionGradesUrl = (sectionId: string, page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/grades?page=${page}&pageSize=${pageSize}`
export const getUpdateCourseSectionGradesUrl = (sectionId: string) =>
  `${appConfig.apiBaseUrl}/api/course-sections/${sectionId}/grades`

export default appConfig


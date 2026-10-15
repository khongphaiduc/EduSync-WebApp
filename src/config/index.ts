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
export const getLecturersUrl = (page = 1, pageSize = 20) =>
  `${appConfig.apiBaseUrl}/api/lecturers?page=${page}&pageSize=${pageSize}`
export const getCreateLecturerUrl = () => `${appConfig.apiBaseUrl}/api/lecturers`
export const getCoursesUrl = (limit = 20) => `${appConfig.apiBaseUrl}/api/courses?limit=${limit}`
export const getSemestersUrl = () => `${appConfig.apiBaseUrl}/api/semesters`

export default appConfig


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

export default appConfig


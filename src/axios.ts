import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const AxiosResourceAdditionalProps = Symbol('axios-resource/AxiosResourceAdditionalProps')
export interface IAxiosResourceRequestConfig extends AxiosRequestConfig {
  [AxiosResourceAdditionalProps]: {
    action: unknown
  }
}

export const interceptorUrlFormatter = (config: AxiosRequestConfig): AxiosRequestConfig => {
  if (!config.params) {
    return config
  }
  for (const paramName of Object.keys(config.params)) {
    const param = config.params[paramName]
    if (config.url && (config.url.indexOf(`{${paramName}}`) > -1)) {
      config.url = config.url.replace(`{${paramName}}`, param)
      delete config.params[paramName]
    }
  }
  return config
}

export interface IActionMetaAuthorization {
  meta: {
    authorization: string
  }
}
const actionHasMetaAuthorization = (action: unknown): action is IActionMetaAuthorization => {
  const actionTyped = action as IActionMetaAuthorization
  return !!(
    actionTyped &&
    typeof actionTyped === 'object' &&
    actionTyped.meta &&
    actionTyped.meta.authorization &&
    typeof actionTyped.meta.authorization === 'string'
  )
}
export const interceptorAuthorizationToken = (config: AxiosRequestConfig) => {
  const configExtended = config as IAxiosResourceRequestConfig
  const action = configExtended[AxiosResourceAdditionalProps].action
  if (actionHasMetaAuthorization(action)) {
    if (!config.headers) {
      config.headers = {}
    }
    configExtended.headers.Authorization = action.meta.authorization
  }
  return configExtended
}

export const createAxiosInstanceFactory = (config: AxiosRequestConfig & { baseURL: string }) => () => {
  const axiosInstance = axios.create(config)
  axiosInstance.interceptors.request.use(interceptorUrlFormatter)
  axiosInstance.interceptors.request.use(interceptorAuthorizationToken)
  return axiosInstance
}

export type ICreateAxiosInstanceFromUrl = (resourceUrl: string) => AxiosInstance

export const createAxiosResourceFactory = (createAxiosInstance: () => AxiosInstance): ICreateAxiosInstanceFromUrl =>
(resourceUrl) => {
  const axiosInstance = createAxiosInstance()
  axiosInstance.defaults.baseURL += resourceUrl
  return axiosInstance
}

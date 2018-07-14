import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const AxiosResourceAdditionalProps = Symbol('axiosResource')
export interface IAxiosResourceRequestConfig extends AxiosRequestConfig {
  [AxiosResourceAdditionalProps]: {
    action: any
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

export const interceptorAuthorizationToken = (config: AxiosRequestConfig) => {
  const configExtended = config as IAxiosResourceRequestConfig
  const action = configExtended[AxiosResourceAdditionalProps].action
  if (action.meta && action.meta.authorization) {
    configExtended.headers.Authorization = action.meta.authorization
  }
  return configExtended
}

export const createAxiosInstanceFactory = (config: AxiosRequestConfig) => () => {
  const axiosInstance = axios.create(config)
  axios.interceptors.request.use(interceptorUrlFormatter)
  axios.interceptors.request.use(interceptorAuthorizationToken)
  return axiosInstance
}

export type ICreateAxiosInstanceFromUrl = (resourceUrl: string) => AxiosInstance

export const createAxiosResourceFactory = (createAxiosInstance: () => AxiosInstance): ICreateAxiosInstanceFromUrl =>
(resourceUrl) => {
  const axiosInstance = createAxiosInstance()
  axiosInstance.defaults.baseURL += resourceUrl
  return axiosInstance
}

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// TODO: Make me a Symbol
export const AxiosResourceAdditionalProps = 'axios-resource/AxiosResourceAdditionalProps'
export interface IAxiosResourceRequestConfigExtraData {
  action: unknown
}
export interface IAxiosResourceRequestConfig extends AxiosRequestConfig {
  [AxiosResourceAdditionalProps]: IAxiosResourceRequestConfigExtraData
}

/**
 * @description
 * Finds tokens inside of {} in config.url, matches them by keys of config.params,
 * replaces them with matched values, removes matched keys from config.params
 *
 * @example
 * const axiosInstance = axios.create()
 * axiosInstance.interceptors.request.use(interceptorUrlFormatter)
 * axiosInstance.request({
 *   url: '/{id}',
 *   baseUrl: 'http://localhost:3000/resource',
 *   method: 'POST',
 *   data: {
 *     field: 'value'
 *   },
 *   params: {
 *     id: '123'
 *   }
 * })
 * // interceptorUrlFormatter processes config before making an ajax request. Processed config:
 * // {
 * //   url: '/123',
 * //   baseUrl: 'http://localhost:3000/resource',
 * //   method: 'POST',
 * //   data: {
 * //     field: 'value'
 * //   },
 * //   params: {}
 * // }
 */
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
  return !!(actionTyped.meta && actionTyped.meta.authorization)
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

export type IAxiosResourceInterceptor =
(config: AxiosRequestConfig) => Promise<AxiosRequestConfig> | AxiosRequestConfig
export interface ICreateAxiosInstanceFactoryParams extends AxiosRequestConfig {
  baseURL: string,
  interceptors?: IAxiosResourceInterceptor[]
}
export type ICreateAxiosInstanceFromUrl = (resourceUrl: string) => AxiosInstance
export const createAxiosResourceFactory = (
  {
    interceptors = [],
    ...config
  }: ICreateAxiosInstanceFactoryParams
): ICreateAxiosInstanceFromUrl =>
(resourceUrl) => {
  const axiosInstance = axios.create(config)
  axiosInstance.interceptors.request.use(interceptorUrlFormatter)
  for (const interceptor of interceptors) {
    axiosInstance.interceptors.request.use(interceptor)
  }
  axiosInstance.defaults.baseURL += resourceUrl
  return axiosInstance
}

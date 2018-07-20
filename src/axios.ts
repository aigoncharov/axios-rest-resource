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
 * Axios interceptor. Finds tokens inside of {} in config.url, matches them by keys of config.params,
 * replaces them with matched values, removes matched keys from config.params.
 * Applied by default to an axios instance created by createAxiosResourceFactory
 *
 * @example
 * ```js
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
 * ```
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

interface IActionMetaAuthorization {
  meta: {
    authorization: string
  }
}
/**
 * @hidden
 */
const actionHasMetaAuthorization = (action: unknown): action is IActionMetaAuthorization => {
  const actionTyped = action as IActionMetaAuthorization
  return !!(actionTyped.meta && actionTyped.meta.authorization)
}
/**
 * @description
 * Axios resource interceptor. Requires config to be IAxiosResourceRequestConfig.
 * Finds action inside of config by AxiosResourceAdditionalProps, if action.meta has authorization,
 * adds Authorization header = action.meta.authorization. Useful for JWT tokens.
 *
 * @example
 * ```js
 * const axiosInstance = axios.create()
 * axiosInstance.interceptors.request.use(interceptorAuthorizationToken)
 * axiosInstance.request({
 *   url: '/',
 *   baseUrl: 'http://localhost:3000/resource',
 *   method: 'POST',
 *   [AxiosResourceAdditionalProps]: {
 *     action: { meta: 'testToken', type: 'ACTION' }
 *   }
 * })
 * // interceptorAuthorizationToken processes config before making an ajax request. Processed config:
 * // {
 * //   url: '/',
 * //   baseUrl: 'http://localhost:3000/resource',
 * //   method: 'POST',
 * //   headers: {
 * //     Authorization: 'testToken'
 * //   }
 * // }
 * ```
 */
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
/**
 * @description
 * Factory that accepts default axios request config and an optional array of request interceptors,
 * returns a function that accepts a resource url and returns a configured axios instance.
 * Always applies default interceptorUrlFormatter to allow token substituion in url. @see interceptorUrlFormatter
 * If you pass no interceptors only default interceptorUrlFormatteris applied.
 * Interceptors you provided are applied with respect to the order.
 * Default interceptorUrlFormatter is always applied first.
 *
 * @example
 * ```js
 * const createAxiosResource = createAxiosResourceFactory({ baseUrl: 'http://localhost:3000' })
 * const entity1Resource = createAxiosResource('/entity1') // baseUrl will be http://localhost:3000/entity1
 * const entity2Resource = createAxiosResource('/entity2') // baseUrl will be http://localhost:3000/entity2
 * entity1Resource.request({ url: '/', method: 'GET' })
 * // sends GET http://localhost:3000/entity1
 * entity2Resource.request({ url: '/{id}', method: 'DELETE', params: { id: '123' } })
 * // sends DELTE http://localhost:3000/entity2/123
 * ```
 */
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

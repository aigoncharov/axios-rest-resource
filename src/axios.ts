import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

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
 *   baseURL: 'http://localhost:3000/resource',
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
 * //   baseURL: 'http://localhost:3000/resource',
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

export interface ICreateAxiosInstanceFactoryParams extends AxiosRequestConfig {
  baseURL: string
}
export type ICreateAxiosInstanceFromUrl = (resourceUrl: string) => AxiosInstance
/**
 * @description
 * Factory that accepts default axios request config,
 * returns a function that accepts a resource url and returns a configured axios instance.
 * That instance have resourceUrl appended to baseURL and 'Accept' header set to 'application/json'.
 * Always applies default interceptorUrlFormatter to allow token substituion in url. @see interceptorUrlFormatter
 * If you pass any headers in your config it merges default 'Accept' header with what you pass in.
 *
 * @example
 * ```js
 * const createAxiosResource = createAxiosResourceFactory({ baseURL: 'http://localhost:3000' })
 * const entity1Resource = createAxiosResource('/entity1') // baseURL will be http://localhost:3000/entity1
 * const entity2Resource = createAxiosResource('/entity2') // baseURL will be http://localhost:3000/entity2
 * entity1Resource.request({ url: '/', method: 'GET' })
 * // sends GET http://localhost:3000/entity1
 * entity2Resource.request({ url: '/{id}', method: 'DELETE', params: { id: '123' } })
 * // sends DELTE http://localhost:3000/entity2/123
 * ```
 */
export const createAxiosResourceFactory = (
  {
    baseURL,
    headers = {},
    ...config
  }: ICreateAxiosInstanceFactoryParams
): ICreateAxiosInstanceFromUrl =>
(resourceUrl) => {
  const axiosInstance = axios.create({
    baseURL: `${baseURL}${resourceUrl}`,
    headers: {
      Accept: 'application/json',
      ...headers
    },
    ...config
  })
  axiosInstance.interceptors.request.use(interceptorUrlFormatter)
  return axiosInstance
}

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export type IAxiosInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig

const requestFormatterInterceptor: IAxiosInterceptor = (config) => {
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

export const defaultInterceptors: IAxiosInterceptor[] = [ requestFormatterInterceptor ]

export type IAxiosTrasformerExtended = (data: any, headers: any, meta: any) => any

const insertAuthHeaderTransformer = (data: any, headers: any, meta: any) => {
  if (meta && meta.authorization) {
    headers.Authorization = meta.authorization
  }
  return data
}

export const defaultTransformers: IAxiosTrasformerExtended[] = [ insertAuthHeaderTransformer ]

export interface ICreateAxiosInstanceFactoryOptions {
  urlPrefix?: string,
  headersMutator?: (headers: any) => any,
  interceptors?: IAxiosInterceptor[],
  transformers?: IAxiosTrasformerExtended[],
  axiosInstanceCreator?: () => AxiosInstance
}

export interface IAxiosInstanceExtended extends AxiosInstance {
  transformers: IAxiosTrasformerExtended[]
}

export const defaultFactoryOptions: ICreateAxiosInstanceFactoryOptions = {
  axiosInstanceCreator: axios.create,
  headersMutator: (headers) => headers.post['Content-Type'] = 'application/json',
  interceptors: defaultInterceptors,
  transformers: defaultTransformers,
  urlPrefix: ''
}

export type ICreateAxiosInstance = (resourceUrl: string) => IAxiosInstanceExtended

export const createAxiosInstanceFactory =
(
  { urlPrefix, headersMutator, transformers, interceptors, axiosInstanceCreator }: ICreateAxiosInstanceFactoryOptions =
  defaultFactoryOptions
): ICreateAxiosInstance =>
(resourceUrl) => {
  const axiosInstance = axiosInstanceCreator() as IAxiosInstanceExtended
  axiosInstance.defaults.baseURL = `${urlPrefix}${resourceUrl}`

  if (headersMutator) {
    headersMutator(axiosInstance.defaults.headers)
  }

  axiosInstance.transformers = transformers || []

  if (interceptors) {
    interceptors.forEach((interceptor) => axiosInstance.interceptors.request.use(interceptor))
  }

  return axiosInstance
}

export const createAxiosInstance = createAxiosInstanceFactory()

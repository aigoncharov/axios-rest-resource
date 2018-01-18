import { AxiosPromise, AxiosTransformer } from 'axios'
import { createAxiosInstance as createAxiosInstanceDefault, ICreateAxiosInstance } from './axios'

export interface IAPIRequestConfig {
  params?: { [ index: string ]: string },
  headers?: { [ index: string ]: string }
}

export interface IActionMeta<Payload, Meta> {
  payload?: Payload,
  meta?: Meta,
  type: string
}

export type IAPIMethod = (action: IActionMeta<any, any>, requestConfig?: IAPIRequestConfig) => AxiosPromise

export interface IResource {
  read: IAPIMethod,
  readOne: IAPIMethod,
  create: IAPIMethod,
  update: IAPIMethod,
  remove: IAPIMethod
}

export interface IAPIMethodSchema {
  method: string,
  url?: string
}

export interface IResourceSchema {
  read: IAPIMethodSchema,
  readOne: IAPIMethodSchema,
  create: IAPIMethodSchema,
  update: IAPIMethodSchema,
  remove: IAPIMethodSchema
}

export type IExtendedResourceSchema<ExtendedResource> =
  IResourceSchema & { [ K in keyof ExtendedResource ]: IAPIMethodSchema }

export const defaultResourceSchema: IResourceSchema = {
  create: {
    method: 'post'
  },
  read: {
    method: 'get'
  },
  readOne: {
    method: 'get',
    url: '/{id}'
  },
  remove: {
    method: 'delete',
    url: '/{id}'
  },
  update: {
    method: 'put',
    url: '/{id}'
  }
}

const defaultRequestConfig: IAPIRequestConfig = {
  headers: {},
  params: {}
}
const defaultAction: IActionMeta<any, any> = {
  type: ''
}

export const buildResourceFromSchemaFactory =
(createAxiosInstance: ICreateAxiosInstance = createAxiosInstanceDefault) =>
<ExtendedResource extends { [ index: string ]: IAPIMethod } = {}>(
  resourceUrl: string,
  resourceSchema: IExtendedResourceSchema<ExtendedResource> =
  {} as IExtendedResourceSchema<ExtendedResource>
) => {
  resourceSchema = Object.assign({}, defaultResourceSchema, resourceSchema)
  const axiosInstance = createAxiosInstance(resourceUrl)
  const resource = {} as IResource & ExtendedResource
  for (const methodName of Object.keys(resourceSchema)) {
    const schema = resourceSchema[methodName]
    Object.assign(
      resource,
      {
        [methodName]: ({ payload, meta } = defaultAction, requestConfig = defaultRequestConfig) =>
          axiosInstance.request({
            ...schema,
            data: payload,
            headers: requestConfig.headers,
            params: requestConfig.params,
            transformRequest: [ ...axiosInstance.transformers.map((fn) => (data: any, headers: any) =>
              fn(data, headers, meta)),
              ...axiosInstance.defaults.transformRequest as AxiosTransformer[]]
          })
      }
    )
  }
  return resource
}

export const buildResourceFromSchema = buildResourceFromSchemaFactory()

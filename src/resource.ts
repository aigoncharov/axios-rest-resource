import { AxiosPromise, AxiosRequestConfig } from 'axios'
import { AxiosResourceAdditionalProps, ICreateAxiosInstanceFromUrl } from './axios'

export interface IActionMeta<Payload, Meta> {
  payload?: Payload,
  meta?: Meta,
  type: string
}

export type IAPIMethod = (action: IActionMeta<any, any>, requestConfig?: Partial<AxiosRequestConfig>) => AxiosPromise

export interface IResource {
  [ index: string ]: IAPIMethod
}

export interface IResourceDefault {
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

export const resourceSchemaDefault = {
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

export interface IBuildParams {
  url: string
}

export interface IBuildParamsExtended<
ExtendedResource> extends IBuildParams {
  schema: { [ Key in keyof ExtendedResource ]: IAPIMethodSchema }
}

export class ResourceBuilder {
  private schema = resourceSchemaDefault
  constructor (
    private createAxiosInstance: ICreateAxiosInstanceFromUrl
  ) {}

  public build <ExtendedResource extends object,
  PropertyTypeCheck extends IResource & ExtendedResource = IResource & ExtendedResource> ({
    url,
    schema
  }: IBuildParamsExtended<ExtendedResource>) {
    const axiosInstance = this.createAxiosInstance(url)
    const resource = {} as ExtendedResource & IResource
    for (const methodName of Object.keys(schema)) {
      const methodSchema = (schema as any as IResource & ExtendedResource)[methodName]
      resource[methodName] = (action, requestConfig = {}) => axiosInstance.request({
        ...methodSchema,
        ...requestConfig,
        data: action.payload,
        [AxiosResourceAdditionalProps]: action
      } as AxiosRequestConfig)
    }
    return resource as ExtendedResource
  }

  public buildDefault ({ url }: IBuildParams) {
    return this.build<IResourceDefault>({ url, schema: this.schema })
  }
}

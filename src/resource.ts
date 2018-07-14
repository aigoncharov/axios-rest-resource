import { AxiosPromise, AxiosRequestConfig } from 'axios'
import {
  AxiosResourceAdditionalProps,
  ICreateAxiosInstanceFromUrl
} from './axios'

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
export interface IBuildParamsExtended<ResourceMethods extends string> extends IBuildParams {
  schema: { [ Key in ResourceMethods ]: IAPIMethodSchema }
}
export type IBuildParamsExtendedRes<ResourceMethods extends string> = {
  [ Key in ResourceMethods ]: IAPIMethod
}

export class ResourceBuilder {
  protected _schema = resourceSchemaDefault
  constructor (
    private createAxiosInstance: ICreateAxiosInstanceFromUrl
  ) {}

  public build (
    buildParams: IBuildParams
  ): IResourceDefault
  public build <
    ResourceMethods extends string
  > (
    buildParams: IBuildParamsExtended<ResourceMethods>
  ): IBuildParamsExtendedRes<ResourceMethods>
  public build <
    ResourceMethods extends string
  > (
    buildParams: IBuildParams | IBuildParamsExtended<ResourceMethods>
  ): IResourceDefault | IBuildParamsExtendedRes<ResourceMethods> {
    const { url } = buildParams
    let schema: { [ index: string ]: IAPIMethodSchema } = this._schema
    if (this._isBuildRapamsExtended(buildParams)) {
      schema = buildParams.schema
    }
    const axiosInstance = this.createAxiosInstance(url)
    const resource = {} as IBuildParamsExtendedRes<ResourceMethods> & IResource
    for (const methodName of Object.keys(schema)) {
      const methodSchema = schema[methodName]
      resource[methodName] = (action, requestConfig = {}) => axiosInstance.request({
        ...methodSchema,
        ...requestConfig,
        data: action.payload,
        [AxiosResourceAdditionalProps]: action
      } as AxiosRequestConfig)
    }
    return resource as IBuildParamsExtendedRes<ResourceMethods>
  }

  protected _isBuildRapamsExtended<ResourceMethods extends string> (
    buildParams: IBuildParams | IBuildParamsExtended<ResourceMethods>
  ): buildParams is IBuildParamsExtended<ResourceMethods> {
    return !!(buildParams as IBuildParamsExtended<ResourceMethods>).schema
  }
}

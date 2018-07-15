import { AxiosPromise, AxiosRequestConfig } from 'axios'

import {
  AxiosResourceAdditionalProps,
  createAxiosResourceFactory,
  IAxiosResourceRequestConfigExtraData,
  ICreateAxiosInstanceFactoryParams,
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
  protected readonly _schemaDefault = resourceSchemaDefault
  protected readonly _createAxiosResource: ICreateAxiosInstanceFromUrl
  constructor (
    createParams: ICreateAxiosInstanceFromUrl | ICreateAxiosInstanceFactoryParams
  ) {
    if (this._isAxiosResourceFactoryParams(createParams)) {
      this._createAxiosResource = createAxiosResourceFactory(createParams)
      return
    }
    this._createAxiosResource = createParams
  }

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
    let schema: { [ index: string ]: IAPIMethodSchema } = this._schemaDefault
    if (this._isBuildRapamsExtended(buildParams)) {
      schema = buildParams.schema
    }
    const axiosInstance = this._createAxiosResource(url)
    const resource = {} as IBuildParamsExtendedRes<ResourceMethods> & IResource
    for (const methodName of Object.keys(schema)) {
      const methodSchema = schema[methodName]
      resource[methodName] = (action, requestConfig = {}) => axiosInstance.request({
        ...requestConfig,
        ...methodSchema,
        data: action.payload,
        [AxiosResourceAdditionalProps]: { action } as IAxiosResourceRequestConfigExtraData
      } as AxiosRequestConfig)
    }
    return resource as IBuildParamsExtendedRes<ResourceMethods>
  }

  protected _isBuildRapamsExtended<ResourceMethods extends string> (
    buildParams: IBuildParams | IBuildParamsExtended<ResourceMethods>
  ): buildParams is IBuildParamsExtended<ResourceMethods> {
    return !!(buildParams as IBuildParamsExtended<ResourceMethods>).schema
  }

  protected _isAxiosResourceFactoryParams (
    createParams: ICreateAxiosInstanceFromUrl | ICreateAxiosInstanceFactoryParams
  ): createParams is ICreateAxiosInstanceFactoryParams {
    return typeof createParams === 'object'
  }
}

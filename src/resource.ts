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

/**
 * @description
 * Default resource schema used by ResourceBuilder.prototype.build
 */
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

/**
 * @description
 * Axios resource builder itself.
 *
 * @param createParams
 * Either axios request config with an optional array of request interceptors or
 * a function that accepts a resource url and returns an axios instance.
 * If you pass axios request config with an optional array of request interceptors
 * it calls createAxiosResourceFactory under the hood. @see createAxiosResourceFactory
 *
 * @example
 * ```js
 * // utils/axios-rest-resource.js
 * import { ResourceBuilder } from 'axios-rest-resource'
 *
 * export const resourceBuilder = new ResourceBuilder({ baseUrl: 'http://localhost:3000' })
 *
 * // use it later to create pre-configured axios instances for every resource
 * ```
 */
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

  /**
   * @description
   * Creates an axios instance using a function passed (created) into ResourceBuilder constructor and
   * a url passed into this method.
   * Returns an object which has the same properties as a schema you provided (or default schema).
   * Each one of this properties is a function which accepts an action and an optional request config,
   * makes a request using the axios instance created earlier and returns a Promise of this request.
   * action.payload is used as 'data' of the request. Method and optional url from the schema are used
   * as 'method' and 'url' accordingly. You can pass any additional properties with the optional request config.
   * Be aware that the optional request config is applied first.
   * That means you can not override method and url from schema there. You can not override 'data' as well.
   * An additional property [AxiosResourceAdditionalProps] is passed to the request config.
   * It's an object with action property inside of it. The action that triggered the request is saved there.
   * you can use it in your interceptors later. @see interceptorAuthorizationToken
   *
   * @param buildParams
   * An object wih resource url and optional resource schema.
   * By default resourceSchemaDefault is used as a schema for the new resource.
   * @see resourceSchemaDefault
   *
   * @example
   * ```js
   * // utils/axios-rest-resource.js
   * import { ResourceBuilder } from 'axios-rest-resource'
   *
   * export const resourceBuilder = new ResourceBuilder({ baseUrl: 'http://localhost:3000' })
   *
   * // api/entity1.js
   * import { resourceBuilder } from 'utils/axios-rest-resource'
   *
   * export const entity1Resource = resourceBuilder.build({ url: '/entity1' })
   * // uses default schema
   * // exports an object
   * // {
   * //   create: (action, requestConfig) => axiosPromise // sends POST http://localhost:3000/entity1,
   * //   read: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1,
   * //   readOne: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1/{id},
   * //   remove: (action, requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity1/{id},
   * //   update: (action, requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity1/{id}
   * // }
   *
   * // sagas/entity1.js
   * import { entity1Resource } from 'api/entity1'
   *
   * // action here is { type: 'ENTITY1_READ_INIT' }
   * export function* entity1ReadSaga (action) {
   *   const res = yield call([entity1Resource, entity1Resource.read], action)
   *   // sends GET http://localhost:3000/entity1
   *   yield put({ type: 'ENTITY1_READ_SUCCESS', payload: res })
   * }
   * // action here is { type: 'ENTITY1_READ_ONE_INIT', meta: { id: '123'} }
   * export function* entity1ReadOneSaga (action) {
   *   const res = yield call([entity1Resource, entity1Resource.readOne], action, { params: { id: action.meta.id } })
   *   // sends GET http://localhost:3000/entity1/123
   *   yield put({ type: 'ENTITY1_READ_ONE_SUCCESS', payload: res })
   * }
   *
   * // api/entity2.js
   * import { resourceBuilder } from 'utils/axios-rest-resource'
   *
   * export const entity1Resource = resourceBuilder.build({
   *   url: '/entity1',
   *   schema: {
   *     doSomething1: {
   *       url: '/do-something1',
   *       method: 'POST'
   *     }
   *   }
   * })
   * // uses cusom schema
   * // exports an object
   * // {
   * //   doSomething1: (action, requestConfig) => axiosPromise
   * //   // sends POST http://localhost:3000/entity1/do-something1
   * // }
   *
   * // sagas/entity2.js
   * import { entity2Resource } from 'api/entity2'
   *
   * // action here is { type: 'ENTITY2_DO_SOMETHING1_INIT' }
   * export function* entity2DoSomething1Saga (action) {
   *   const res = yield call([entity1Resource, entity2Resource.doSomething1], action)
   *   // sends POST http://localhost:3000/entity2/do-something1
   *   yield put({ type: 'ENTITY2_DO_SOMETHING1_SUCCESS', payload: res })
   * }
   * ```
   */
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

[axios-resource](../README.md) > ["resource](../modules/_resource_d_.md) > [ResourceBuilder](../classes/_resource_d_.resourcebuilder.md)

# Class: ResourceBuilder

*__description__*: Axios resource builder itself.

*__param__*: Either axios request config with an optional array of request interceptors or a function that accepts a resource url and returns an axios instance. If you pass axios request config with an optional array of request interceptors it calls createAxiosResourceFactory under the hood. @see createAxiosResourceFactory

*__example__*: 
```js
// utils/axios-resource.js
import { ResourceBuilder } from 'axios-resource'

export const resourceBuilder = new ResourceBuilder({ baseUrl: 'http://localhost:3000' })

// use it later to create pre-configured axios instances for every resource
```

## Hierarchy

**ResourceBuilder**

## Index

### Constructors

* [constructor](_resource_d_.resourcebuilder.md#constructor)

### Methods

* [build](_resource_d_.resourcebuilder.md#build)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ResourceBuilder**(createParams: * [ICreateAxiosInstanceFromUrl](../modules/_axios_d_.md#icreateaxiosinstancefromurl) &#124; [ICreateAxiosInstanceFactoryParams](../interfaces/_axios_d_.icreateaxiosinstancefactoryparams.md)*): [ResourceBuilder](_resource_d_.resourcebuilder.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| createParams |  [ICreateAxiosInstanceFromUrl](../modules/_axios_d_.md#icreateaxiosinstancefromurl) &#124; [ICreateAxiosInstanceFactoryParams](../interfaces/_axios_d_.icreateaxiosinstancefactoryparams.md)|

**Returns:** [ResourceBuilder](_resource_d_.resourcebuilder.md)

___

## Methods

<a id="build"></a>

###  build

▸ **build**(buildParams: *[IBuildParams](../interfaces/_resource_d_.ibuildparams.md)*): [IResourceDefault](../interfaces/_resource_d_.iresourcedefault.md)

▸ **build**ResourceMethods(buildParams: *[IBuildParamsExtended](../interfaces/_resource_d_.ibuildparamsextended.md)<`ResourceMethods`>*): [IBuildParamsExtendedRes](../modules/_resource_d_.md#ibuildparamsextendedres)<`ResourceMethods`>

*__description__*: Creates an axios instance using a function passed (created) into ResourceBuilder constructor and a url passed into this method. Returns an object which has the same properties as a schema you provided (or default schema). Each one of this properties is a function which accepts an action and an optional request config, makes a request using the axios instance created earlier and returns a Promise of this request. action.payload is used as 'data' of the request. Method and optional url from the schema are used as 'method' and 'url' accordingly. You can pass any additional properties with the optional request config. Be aware that the optional request config is applied first. That means you can not override method and url from schema there. You can not override 'data' as well. An additional property \[AxiosResourceAdditionalProps\] is passed to the request config. It's an object with action property inside of it. The action that triggered the request is saved there. you can use it in your interceptors later. @see interceptorAuthorizationToken

*__see__*: resourceSchemaDefault

*__example__*: 
```js
// utils/axios-resource.js
import { ResourceBuilder } from 'axios-resource'

export const resourceBuilder = new ResourceBuilder({ baseUrl: 'http://localhost:3000' })

// api/entity1.js
import { resourceBuilder } from 'utils/axios-resource'

export const entity1Resource = resourceBuilder.build({ url: '/entity1' })
// uses default schema
// exports an object
// {
//   create: (action, requestConfig) => axiosPromise // sends POST http://localhost:3000/entity1,
//   read: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1,
//   readOne: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1/{id},
//   remove: (action, requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity1/{id},
//   update: (action, requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity1/{id}
// }

// sagas/entity1.js
import { entity1Resource } from 'api/entity1'

// action here is { type: 'ENTITY1_READ_INIT' }
export function* entity1ReadSaga (action) {
  const res = yield call([entity1Resource, entity1Resource.read], action)
  // sends GET http://localhost:3000/entity1
  yield put({ type: 'ENTITY1_READ_SUCCESS', payload: res })
}
// action here is { type: 'ENTITY1_READ_ONE_INIT', meta: { id: '123'} }
export function* entity1ReadOneSaga (action) {
  const res = yield call([entity1Resource, entity1Resource.readOne], action, { params: { id: action.meta.id } })
  // sends GET http://localhost:3000/entity1/123
  yield put({ type: 'ENTITY1_READ_ONE_SUCCESS', payload: res })
}

// api/entity2.js
import { resourceBuilder } from 'utils/axios-resource'

export const entity1Resource = resourceBuilder.build({
  url: '/entity1',
  schema: {
    doSomething1: {
      url: '/do-something1',
      method: 'POST'
    }
  }
})
// uses cusom schema
// exports an object
// {
//   doSomething1: (action, requestConfig) => axiosPromise
//   // sends POST http://localhost:3000/entity1/do-something1
// }

// sagas/entity2.js
import { entity2Resource } from 'api/entity2'

// action here is { type: 'ENTITY2_DO_SOMETHING1_INIT' }
export function* entity2DoSomething1Saga (action) {
  const res = yield call([entity1Resource, entity2Resource.doSomething1], action)
  // sends POST http://localhost:3000/entity2/do-something1
  yield put({ type: 'ENTITY2_DO_SOMETHING1_SUCCESS', payload: res })
}
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| buildParams | [IBuildParams](../interfaces/_resource_d_.ibuildparams.md) |  An object wih resource url and optional resource schema. By default resourceSchemaDefault is used as a schema for the new resource. |

**Returns:** [IResourceDefault](../interfaces/_resource_d_.iresourcedefault.md)

**Type parameters:**

#### ResourceMethods :  `string`
**Parameters:**

| Param | Type |
| ------ | ------ |
| buildParams | [IBuildParamsExtended](../interfaces/_resource_d_.ibuildparamsextended.md)<`ResourceMethods`> |

**Returns:** [IBuildParamsExtendedRes](../modules/_resource_d_.md#ibuildparamsextendedres)<`ResourceMethods`>

___


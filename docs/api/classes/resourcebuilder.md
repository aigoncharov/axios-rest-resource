[axios-rest-resource](../README.md) > [ResourceBuilder](../classes/resourcebuilder.md)

# Class: ResourceBuilder

_**description**_: Axios resource builder itself.

_**param**_: Either axios request config or a function that accepts a resource url and returns an axios instance. If you pass axios request config it calls createAxiosResourceFactory under the hood. @see createAxiosResourceFactory

_**example**_:

```js
// utils/resource.js
import { ResourceBuilder } from "axios-rest-resource";

export const resourceBuilder = new ResourceBuilder({
  baseURL: "http://localhost:3000"
});

// use it later to create pre-configured axios instances for every resource
```

## Hierarchy

**ResourceBuilder**

## Index

### Constructors

- [constructor](resourcebuilder.md#constructor)

### Methods

- [build](resourcebuilder.md#build)

---

## Constructors

<a id="constructor"></a>

### constructor

⊕ **new ResourceBuilder**(createParams: _ [ICreateAxiosInstanceFromUrl](../#icreateaxiosinstancefromurl) &#124; [ICreateAxiosInstanceFactoryParams](../interfaces/icreateaxiosinstancefactoryparams.md)_): [ResourceBuilder](resourcebuilder.md)

**Parameters:**

| Param        | Type                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| createParams | [ICreateAxiosInstanceFromUrl](../#icreateaxiosinstancefromurl) &#124; [ICreateAxiosInstanceFactoryParams](../interfaces/icreateaxiosinstancefactoryparams.md) |

**Returns:** [ResourceBuilder](resourcebuilder.md)

---

## Methods

<a id="build"></a>

### build

▸ **build**(buildParams: _[IBuildParams](../interfaces/ibuildparams.md)_): [IResourceDefault](../interfaces/iresourcedefault.md)

▸ **build**ResourceMethods(buildParams: _[IBuildParamsExtended](../interfaces/ibuildparamsextended.md)<`ResourceMethods`>_): [IBuildParamsExtendedRes](../#ibuildparamsextendedres)<`ResourceMethods`>

_**description**_: Creates an axios instance using a function passed (created) into ResourceBuilder constructor and a url passed into this method. Returns an object which has the same properties as a schema you provided (or default schema). Each one of this properties is a function which accepts an optional request config, makes a request using the axios instance created earlier and returns a Promise of this request. Method and optional url from the schema are used as 'method' and 'url' accordingly. You can pass any additional properties with the optional request config. Be aware that the optional request config is applied first. That means you can not override method and url from schema there.

_**see**_: resourceSchemaDefault

_**example**_:

```js
// utils/resource.js
import { ResourceBuilder } from 'axios-rest-resource'

export const resourceBuilder = new ResourceBuilder({ baseURL: 'http://localhost:3000' })

// api/entity1.js
import { resourceBuilder } from 'utils/resource'

export const entity1Resource = resourceBuilder.build({ url: '/entity1' })
// uses default schema
// exports an object
// {
//   create: (requestConfig) => axiosPromise // sends POST http://localhost:3000/entity1,
//   read: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1,
//   readOne: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1/{id},
//   remove: (requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity1/{id},
//   update: (requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity1/{id}
// }

// whenever you want to make a request
import { entity1Resource } from 'api/entity1'

const resRead = entity1Resource.read()
// sends GET http://localhost:3000/entity1
// resRead is a Promise of data received from the server

const resReadOne = entity1Resource.readOne({ params: { id } })
// for id = '123'
// sends GET http://localhost:3000/entity1/123
// resReadOne is a Promise of data received from the server

const resCreate = entity1Resource.create({ data })
// for data = { field1: 'test' }
// sends POST http://localhost:3000/entity1 with body { field1: 'test' }
// resCreate is a Promise of data received from the server

// api/entity2.js
import { resourceBuilder } from 'utils/resource'

export const entity1Resource = resourceBuilder.build<'doSomething1'>({
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
//   doSomething1: (requestConfig) => axiosPromise
//   // sends POST http://localhost:3000/entity1/do-something1
// }

// whenever you want to make a request
import { entity2Resource } from 'api/entity2'

const resDoSomething1 = await entity2Resource.doSomething1()
// sends POST http://localhost:3000/entity2/do-something1
// resDoSomething1 is a Promise of data received from the server
```

**Parameters:**

| Param       | Type                                          | Description                                                                                                                         |
| ----------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| buildParams | [IBuildParams](../interfaces/ibuildparams.md) | An object wih resource url and optional resource schema. By default resourceSchemaDefault is used as a schema for the new resource. |

**Returns:** [IResourceDefault](../interfaces/iresourcedefault.md)

**Type parameters:**

#### ResourceMethods : `string`

**Parameters:**

| Param       | Type                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| buildParams | [IBuildParamsExtended](../interfaces/ibuildparamsextended.md)<`ResourceMethods`> |

**Returns:** [IBuildParamsExtendedRes](../#ibuildparamsextendedres)<`ResourceMethods`>

---

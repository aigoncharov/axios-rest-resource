# axios-rest-resource

## Index

### Classes

- [ResourceBuilder](classes/resourcebuilder.md)

### Interfaces

- [IAPIMethodSchema](interfaces/iapimethodschema.md)
- [IBuildParams](interfaces/ibuildparams.md)
- [IBuildParamsExtended](interfaces/ibuildparamsextended.md)
- [ICreateAxiosInstanceFactoryParams](interfaces/icreateaxiosinstancefactoryparams.md)
- [IResource](interfaces/iresource.md)
- [IResourceDefault](interfaces/iresourcedefault.md)

### Type aliases

- [IAPIMethod](#iapimethod)
- [IBuildParamsExtendedRes](#ibuildparamsextendedres)
- [ICreateAxiosInstanceFromUrl](#icreateaxiosinstancefromurl)
- [IResourceSchemaKeysDefault](#iresourceschemakeysdefault)

### Functions

- [createAxiosResourceFactory](#createaxiosresourcefactory)
- [interceptorUrlFormatter](#interceptorurlformatter)

### Object literals

- [resourceSchemaDefault](#resourceschemadefault)

---

## Type aliases

<a id="iapimethod"></a>

### IAPIMethod

**ΤIAPIMethod**: _`function`_

#### Type declaration

▸(requestConfig?: _`Partial`<`AxiosRequestConfig`>_): `AxiosPromise`

**Parameters:**

| Param                    | Type                            |
| ------------------------ | ------------------------------- |
| `Optional` requestConfig | `Partial`<`AxiosRequestConfig`> |

**Returns:** `AxiosPromise`

---

<a id="ibuildparamsextendedres"></a>

### IBuildParamsExtendedRes

**ΤIBuildParamsExtendedRes**: _`object`_

#### Type declaration

---

<a id="icreateaxiosinstancefromurl"></a>

### ICreateAxiosInstanceFromUrl

**ΤICreateAxiosInstanceFromUrl**: _`function`_

#### Type declaration

▸(resourceUrl: _`string`_): `AxiosInstance`

**Parameters:**

| Param       | Type     |
| ----------- | -------- |
| resourceUrl | `string` |

**Returns:** `AxiosInstance`

---

<a id="iresourceschemakeysdefault"></a>

### IResourceSchemaKeysDefault

**ΤIResourceSchemaKeysDefault**: _ "create" &#124; "read" &#124; "readOne" &#124; "remove" &#124; "update"
_

---

## Functions

<a id="createaxiosresourcefactory"></a>

### `<Const>` createAxiosResourceFactory

_**description**_: Factory that accepts default axios request config, returns a function that accepts a resource url and returns a configured axios instance. That instance have resourceUrl appended to baseURL and 'Accept' header set to 'application/json'. Always applies default interceptorUrlFormatter to allow token substituion in url. @see interceptorUrlFormatter If you pass any headers in your config it merges default 'Accept' header with what you pass in.

_**example**_:

```js
const createAxiosResource = createAxiosResourceFactory({
  baseURL: "http://localhost:3000"
});
const entity1Resource = createAxiosResource("/entity1"); // baseURL will be http://localhost:3000/entity1
const entity2Resource = createAxiosResource("/entity2"); // baseURL will be http://localhost:3000/entity2
entity1Resource.request({ url: "/", method: "GET" });
// sends GET http://localhost:3000/entity1
entity2Resource.request({
  url: "/{id}",
  method: "DELETE",
  params: { id: "123" }
});
// sends DELTE http://localhost:3000/entity2/123
```

▸ **createAxiosResourceFactory**(\_\_namedParameters: _`object`_): [ICreateAxiosInstanceFromUrl](#icreateaxiosinstancefromurl)

**Parameters:**

| Param               | Type     |
| ------------------- | -------- |
| \_\_namedParameters | `object` |

**Returns:** [ICreateAxiosInstanceFromUrl](#icreateaxiosinstancefromurl)

---

<a id="interceptorurlformatter"></a>

### `<Const>` interceptorUrlFormatter

_**description**_: Axios interceptor. Finds tokens inside of {} in config.url, matches them by keys of config.params, replaces them with matched values, removes matched keys from config.params. Applied by default to an axios instance created by createAxiosResourceFactory

_**example**_:

```js
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(interceptorUrlFormatter);
axiosInstance.request({
  url: "/{id}",
  baseURL: "http://localhost:3000/resource",
  method: "POST",
  data: {
    field: "value"
  },
  params: {
    id: "123"
  }
});
// interceptorUrlFormatter processes config before making an ajax request. Processed config:
// {
//   url: '/123',
//   baseURL: 'http://localhost:3000/resource',
//   method: 'POST',
//   data: {
//     field: 'value'
//   },
//   params: {}
// }
```

▸ **interceptorUrlFormatter**(config: _`AxiosRequestConfig`_): `AxiosRequestConfig`

**Parameters:**

| Param  | Type                 |
| ------ | -------------------- |
| config | `AxiosRequestConfig` |

**Returns:** `AxiosRequestConfig`

---

## Object literals

<a id="resourceschemadefault"></a>

### `<Const>` resourceSchemaDefault

_**description**_: Default resource schema used by ResourceBuilder.prototype.build

**resourceSchemaDefault**: _`object`_

<a id="resourceschemadefault.create"></a>

#### create

**create**: _`object`_

<a id="resourceschemadefault.create.method"></a>

#### method

**● method**: _`string`_ = "post"

---

---

<a id="resourceschemadefault.read"></a>

#### read

**read**: _`object`_

<a id="resourceschemadefault.read.method-1"></a>

#### method

**● method**: _`string`_ = "get"

---

---

<a id="resourceschemadefault.readone"></a>

#### readOne

**readOne**: _`object`_

<a id="resourceschemadefault.readone.method-2"></a>

#### method

**● method**: _`string`_ = "get"

---

<a id="resourceschemadefault.readone.url"></a>

#### url

**● url**: _`string`_ = "/{id}"

---

---

<a id="resourceschemadefault.remove"></a>

#### remove

**remove**: _`object`_

<a id="resourceschemadefault.remove.method-3"></a>

#### method

**● method**: _`string`_ = "delete"

---

<a id="resourceschemadefault.remove.url-1"></a>

#### url

**● url**: _`string`_ = "/{id}"

---

---

<a id="resourceschemadefault.update"></a>

#### update

**update**: _`object`_

<a id="resourceschemadefault.update.method-4"></a>

#### method

**● method**: _`string`_ = "put"

---

<a id="resourceschemadefault.update.url-2"></a>

#### url

**● url**: _`string`_ = "/{id}"

---

---

---

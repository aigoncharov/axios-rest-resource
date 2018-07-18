[axios-resource](../README.md) > ["axios](../modules/_axios_d_.md)

# External module: "axios

## Index

### Interfaces

* [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)
* [IAxiosResourceRequestConfigExtraData](../interfaces/_axios_d_.iaxiosresourcerequestconfigextradata.md)
* [ICreateAxiosInstanceFactoryParams](../interfaces/_axios_d_.icreateaxiosinstancefactoryparams.md)

### Type aliases

* [IAxiosResourceInterceptor](_axios_d_.md#iaxiosresourceinterceptor)
* [ICreateAxiosInstanceFromUrl](_axios_d_.md#icreateaxiosinstancefromurl)

### Variables

* [AxiosResourceAdditionalProps](_axios_d_.md#axiosresourceadditionalprops)
* [createAxiosResourceFactory](_axios_d_.md#createaxiosresourcefactory)
* [interceptorAuthorizationToken](_axios_d_.md#interceptorauthorizationtoken)
* [interceptorUrlFormatter](_axios_d_.md#interceptorurlformatter)

---

## Type aliases

<a id="iaxiosresourceinterceptor"></a>

###  IAxiosResourceInterceptor

**ΤIAxiosResourceInterceptor**: *`function`*

#### Type declaration
▸(config: *`AxiosRequestConfig`*):  `Promise`<`AxiosRequestConfig`> &#124; `AxiosRequestConfig`

**Parameters:**

| Param | Type |
| ------ | ------ |
| config | `AxiosRequestConfig` |

**Returns:**  `Promise`<`AxiosRequestConfig`> &#124; `AxiosRequestConfig`

___
<a id="icreateaxiosinstancefromurl"></a>

###  ICreateAxiosInstanceFromUrl

**ΤICreateAxiosInstanceFromUrl**: *`function`*

#### Type declaration
▸(resourceUrl: *`string`*): `AxiosInstance`

**Parameters:**

| Param | Type |
| ------ | ------ |
| resourceUrl | `string` |

**Returns:** `AxiosInstance`

___

## Variables

<a id="axiosresourceadditionalprops"></a>

### `<Const>` AxiosResourceAdditionalProps

**● AxiosResourceAdditionalProps**: *"axios-resource/AxiosResourceAdditionalProps"* = "axios-resource/AxiosResourceAdditionalProps"

___
<a id="createaxiosresourcefactory"></a>

### `<Const>` createAxiosResourceFactory

**● createAxiosResourceFactory**: *`function`*

*__description__*: Factory that accepts default axios request config and an optional array of request interceptors, returns a function that accepts a resource url and returns a configured axios instance. Always applies default interceptorUrlFormatter to allow token substituion in url. @see interceptorUrlFormatter If you pass no interceptors only default interceptorUrlFormatteris applied. Interceptors you provided are applied with respect to the order. Default interceptorUrlFormatter is always applied first.

*__example__*: 
```js
const createAxiosResource = createAxiosResourceFactory({ baseUrl: 'http://localhost:3000' })
const entity1Resource = createAxiosResource('/entity1') // baseUrl will be http://localhost:3000/entity1
const entity2Resource = createAxiosResource('/entity2') // baseUrl will be http://localhost:3000/entity2
entity1Resource.request({ url: '/', method: 'GET' })
// sends GET http://localhost:3000/entity1
entity2Resource.request({ url: '/{id}', method: 'DELETE', params: { id: '123' } })
// sends DELTE http://localhost:3000/entity2/123
```

#### Type declaration
▸(__namedParameters: *`object`*): [ICreateAxiosInstanceFromUrl](_axios_d_.md#icreateaxiosinstancefromurl)

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** [ICreateAxiosInstanceFromUrl](_axios_d_.md#icreateaxiosinstancefromurl)

___
<a id="interceptorauthorizationtoken"></a>

### `<Const>` interceptorAuthorizationToken

**● interceptorAuthorizationToken**: *`function`*

*__description__*: Axios resource interceptor. Requires config to be IAxiosResourceRequestConfig. Finds action inside of config by AxiosResourceAdditionalProps, if action.meta has authorization, adds Authorization header = action.meta.authorization. Useful for JWT tokens.

*__example__*: 
```js
const axiosInstance = axios.create()
axiosInstance.interceptors.request.use(interceptorAuthorizationToken)
axiosInstance.request({
  url: '/',
  baseUrl: 'http://localhost:3000/resource',
  method: 'POST',
  [AxiosResourceAdditionalProps]: {
    action: { meta: 'testToken', type: 'ACTION' }
  }
})
// interceptorAuthorizationToken processes config before making an ajax request. Processed config:
// {
//   url: '/',
//   baseUrl: 'http://localhost:3000/resource',
//   method: 'POST',
//   headers: {
//     Authorization: 'testToken'
//   }
// }
```

#### Type declaration
▸(config: *`AxiosRequestConfig`*): [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| config | `AxiosRequestConfig` |

**Returns:** [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)

___
<a id="interceptorurlformatter"></a>

### `<Const>` interceptorUrlFormatter

**● interceptorUrlFormatter**: *`function`*

*__description__*: Axios interceptor. Finds tokens inside of {} in config.url, matches them by keys of config.params, replaces them with matched values, removes matched keys from config.params. Applied by default to an axios instance created by createAxiosResourceFactory

*__example__*: 
```js
const axiosInstance = axios.create()
axiosInstance.interceptors.request.use(interceptorUrlFormatter)
axiosInstance.request({
  url: '/{id}',
  baseUrl: 'http://localhost:3000/resource',
  method: 'POST',
  data: {
    field: 'value'
  },
  params: {
    id: '123'
  }
})
// interceptorUrlFormatter processes config before making an ajax request. Processed config:
// {
//   url: '/123',
//   baseUrl: 'http://localhost:3000/resource',
//   method: 'POST',
//   data: {
//     field: 'value'
//   },
//   params: {}
// }
```

#### Type declaration
▸(config: *`AxiosRequestConfig`*): `AxiosRequestConfig`

**Parameters:**

| Param | Type |
| ------ | ------ |
| config | `AxiosRequestConfig` |

**Returns:** `AxiosRequestConfig`

___


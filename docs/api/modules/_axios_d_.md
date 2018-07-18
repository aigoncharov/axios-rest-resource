[axios-resource](../README.md) > ["axios"](../modules/_axios_d_.md)

# External module: "axios"

## Index

### Interfaces

- [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)
- [IAxiosResourceRequestConfigExtraData](../interfaces/_axios_d_.iaxiosresourcerequestconfigextradata.md)
- [ICreateAxiosInstanceFactoryParams](../interfaces/_axios_d_.icreateaxiosinstancefactoryparams.md)

### Type aliases

- [IAxiosResourceInterceptor](_axios_d_.md#iaxiosresourceinterceptor)
- [ICreateAxiosInstanceFromUrl](_axios_d_.md#icreateaxiosinstancefromurl)

### Variables

- [AxiosResourceAdditionalProps](_axios_d_.md#axiosresourceadditionalprops)
- [createAxiosResourceFactory](_axios_d_.md#createaxiosresourcefactory)
- [interceptorAuthorizationToken](_axios_d_.md#interceptorauthorizationtoken)
- [interceptorUrlFormatter](_axios_d_.md#interceptorurlformatter)

---

## Type aliases

<a id="iaxiosresourceinterceptor"></a>

### IAxiosResourceInterceptor

**ΤIAxiosResourceInterceptor**: _`function`_

#### Type declaration

▸(config: _`AxiosRequestConfig`_): `Promise`<`AxiosRequestConfig`> &#124; `AxiosRequestConfig`

**Parameters:**

| Param  | Type                 |
| ------ | -------------------- |
| config | `AxiosRequestConfig` |

**Returns:** `Promise`<`AxiosRequestConfig`> &#124; `AxiosRequestConfig`

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

## Variables

<a id="axiosresourceadditionalprops"></a>

### `<Const>` AxiosResourceAdditionalProps

**● AxiosResourceAdditionalProps**: _"axios-resource/AxiosResourceAdditionalProps"_ = "axios-resource/AxiosResourceAdditionalProps"

---

<a id="createaxiosresourcefactory"></a>

### `<Const>` createAxiosResourceFactory

**● createAxiosResourceFactory**: _`function`_

_**description**_: Factory that accepts default axios request config and an optional array of request interceptors, returns a function that accepts a resource url and returns a configured axios instance. Always applies default interceptorUrlFormatter to allow token substituion in url. @see interceptorUrlFormatter If you pass no interceptors only default interceptorUrlFormatteris applied. Interceptors you provided are applied with respect to the order. Default interceptorUrlFormatter is always applied first.

_**example**_:

```js
const createAxiosResource = createAxiosResourceFactory({
  baseUrl: "http://localhost:3000"
});
const entity1Resource = createAxiosResource("/entity1"); // baseUrl will be http://localhost:3000/entity1
const entity2Resource = createAxiosResource("/entity2"); // baseUrl will be http://localhost:3000/entity2
entity1Resource.request({ url: "/", method: "GET" });
// sends GET http://localhost:3000/entity1
entity2Resource.request({
  url: "/{id}",
  method: "DELETE",
  params: { id: "123" }
});
// sends DELTE http://localhost:3000/entity2/123
```

#### Type declaration

▸(\__namedParameters: *`object`*): [ICreateAxiosInstanceFromUrl](\_axios_d_.md#icreateaxiosinstancefromurl)

**Parameters:**

| Param               | Type     |
| ------------------- | -------- |
| \_\_namedParameters | `object` |

**Returns:** [ICreateAxiosInstanceFromUrl](_axios_d_.md#icreateaxiosinstancefromurl)

---

<a id="interceptorauthorizationtoken"></a>

### `<Const>` interceptorAuthorizationToken

**● interceptorAuthorizationToken**: _`function`_

_**description**_: Axios resource interceptor. Requires config to be IAxiosResourceRequestConfig. Finds action inside of config by AxiosResourceAdditionalProps, if action.meta has authorization, adds Authorization header = action.meta.authorization. Useful for JWT tokens.

_**example**_:

```js
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(interceptorAuthorizationToken);
axiosInstance.request({
  url: "/",
  baseUrl: "http://localhost:3000/resource",
  method: "POST",
  [AxiosResourceAdditionalProps]: {
    action: { meta: "testToken", type: "ACTION" }
  }
});
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

▸(config: _`AxiosRequestConfig`_): [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)

**Parameters:**

| Param  | Type                 |
| ------ | -------------------- |
| config | `AxiosRequestConfig` |

**Returns:** [IAxiosResourceRequestConfig](../interfaces/_axios_d_.iaxiosresourcerequestconfig.md)

---

<a id="interceptorurlformatter"></a>

### `<Const>` interceptorUrlFormatter

**● interceptorUrlFormatter**: _`function`_

_**description**_: Axios interceptor. Finds tokens inside of {} in config.url, matches them by keys of config.params, replaces them with matched values, removes matched keys from config.params. Applied by default to an axios instance created by createAxiosResourceFactory

_**example**_:

```js
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(interceptorUrlFormatter);
axiosInstance.request({
  url: "/{id}",
  baseUrl: "http://localhost:3000/resource",
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
//   baseUrl: 'http://localhost:3000/resource',
//   method: 'POST',
//   data: {
//     field: 'value'
//   },
//   params: {}
// }
```

#### Type declaration

▸(config: _`AxiosRequestConfig`_): `AxiosRequestConfig`

**Parameters:**

| Param  | Type                 |
| ------ | -------------------- |
| config | `AxiosRequestConfig` |

**Returns:** `AxiosRequestConfig`

---

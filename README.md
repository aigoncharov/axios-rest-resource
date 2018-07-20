# axios-resource

A small library that creates a pre-configured instance of axios to make HTTP requests to REST resources. Written in Typescript. Heavily inspired by AngularJS' $resource.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Quick start](#quick-start)
- [Request interceptors](#request-interceptors)
- [Default interceptors](#default-interceptors)
- [Creating custom interceptors](#creating-custom-interceptors)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm i axios-resource axios
```

## Quick start

- Create axios-resource module in your utils folder

  ```ts
  // utils/axios-resource.ts
  import { ResourceBuilder } from "axios-resource";

  export const resourceBuilder = new ResourceBuilder({
    baseUrl: "http://localhost:3000"
  });
  ```

- Using a newly created resource builder create an actual resource

  ```ts
  // api/entity1.js
  import { resourceBuilder } from "utils/axios-resource";

  export const entity1Resource = resourceBuilder.build({ url: "/entity1" });
  // exports an object
  // {
  //   create: (action, requestConfig) => axiosPromise // sends POST http://localhost:3000/entity1,
  //   read: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1,
  //   readOne: (action, requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1/{id},
  //   remove: (action, requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity1/{id},
  //   update: (action, requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity1/{id}
  // }
  ```

- Use your resource in your saga

  ```ts
  import { entity1Resource } from "api/entity1";

  // action here is { type: 'ENTITY1_READ_INIT' }
  export function* entity1ReadSaga(action) {
    const res = yield call([entity1Resource, entity1Resource.read], action);
    // sends GET http://localhost:3000/entity1
    yield put({ type: "ENTITY1_READ_SUCCESS", payload: res });
  }
  // action here is { type: 'ENTITY1_READ_ONE_INIT', meta: { id: '123'} }
  export function* entity1ReadOneSaga(action) {
    const res = yield call([entity1Resource, entity1Resource.readOne], action, {
      params: { id: action.meta.id }
    });
    // sends GET http://localhost:3000/entity1/123
    yield put({ type: "ENTITY1_READ_ONE_SUCCESS", payload: res });
  }
  ```

## Request interceptors

You can pass an optional array of request interceptors to ResourceBuilder's constructor

```ts
const resourceBuilder = new ResourceBuilder({
  baseUrl: "http://localhost:3000",
  interceptors: [myRequestInterceptor]
});
```

You can read more about interceptors [here](https://github.com/axios/axios#interceptors). The only difference with axios' original interceptors is that axios-resource passes an extended version of [AxiosRequestConfig](https://github.com/axios/axios#request-config) to its interceptors. It has an additional property [AxiosResourceAdditionalProps](_axios_d_.md#axiosresourceadditionalprops). You can read more about it [here](docs/interfaces/_axios_d_.iaxiosresourcerequestconfig.md). It contains an object with an action that triggerred that request. Most of the time you do not need to worry about it unless you want to access that action's data.

## Default interceptors

Axios-recource exposes two pre-defined interceptors:

- [interceptorUrlFormatter](docs/_axios_d_.md#interceptorurlformatter)
- [interceptorAuthorizationToken](_axios_d_.md#interceptorauthorizationtoken)

interceptorUrlFormatter is always applied. interceptorAuthorizationToken you have to apply manually if you want to.

You can do it like this:

```ts
import { ResourceBuilder, interceptorAuthorizationToken } from "axios-resource";

const resourceBuilder = new ResourceBuilder({
  baseUrl: "http://localhost:3000",
  interceptors: [interceptorAuthorizationToken]
});
```

## Creating custom interceptors

Here's how you can create an interceptor that logs all requests adn apply it:

```ts
import { ResourceBuilder } from "axios-resource";
import { AxiosRequestConfig } from "axios";

const interceptorLog = (config: AxiosRequestConfig) => {
  console.log(
    `axios-resource.interceptorLog -> request ${JSON.stringify(config)}`
  );
  return config;
};

const resourceBuilder = new ResourceBuilder({
  baseUrl: "http://localhost:3000",
  interceptors: [interceptorAuthorizationToken]
});
```

If you want to access that additional property [AxiosResourceAdditionalProps](_axios_d_.md#axiosresourceadditionalprops), you can do this:

```ts
import {
  ResourceBuilder,
  IAxiosResourceRequestConfig,
  AxiosResourceAdditionalProps
} from "axios-resource";
import { AxiosRequestConfig } from "axios";

const interceptorLogAction = (config: AxiosRequestConfig) => {
  const configExtended = config as IAxiosResourceRequestConfig;
  console.log(
    `axios-resource.interceptorLogAction -> action ${JSON.stringify(
      configExtended[AxiosResourceAdditionalProps].action
    )}`
  );
  return configExtended;
};

const resourceBuilder = new ResourceBuilder({
  baseUrl: "http://localhost:3000",
  interceptors: [interceptorAuthorizationToken, interceptorLogAction]
});
```

## API

[API reference](docs/api/README.md)

# axios-rest-resource [![Build Status](https://travis-ci.org/keenondrums/axios-rest-resource.svg?branch=master)](https://travis-ci.org/keenondrums/axios-rest-resource)

A small library that creates a pre-configured instance of axios to make HTTP requests to REST resources. Written in Typescript. Heavily inspired by AngularJS' $resource.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Quick start](#quick-start)
- [URL token substituion](#url-token-substituion)
- [Custom resource schema](#custom-resource-schema)
- [Adavanced usage](#adavanced-usage)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm i axios-rest-resource axios
```

## Quick start

- Create resource module in your utils folder

  ```ts
  // utils/resource.ts
  import { ResourceBuilder } from "axios-rest-resource";

  export const resourceBuilder = new ResourceBuilder({
    baseURL: "http://localhost:3000"
  });
  ```

- Using a newly created resource builder create an actual resource

  ```ts
  // api/entity1.js
  import { resourceBuilder } from "utils/resource";

  export const entity1Resource = resourceBuilder.build({ url: "/entity1" });
  // exports an object
  // {
  //   create: (requestConfig) => axiosPromise // sends POST http://localhost:3000/entity1,
  //   read: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1,
  //   readOne: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity1/{id},
  //   remove: (requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity1/{id},
  //   update: (requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity1/{id}
  // }
  ```

- Use your resource whenever you want to make an AJAX call

  ```ts
  import { entity1Resource } from "api/entity1";

  const resRead = entity1Resource.read();
  // sends GET http://localhost:3000/entity1
  // resRead is a Promise of data received from the server

  const resReadOne = entity1Resource.readOne({ params: { id } });
  // for id = '123'
  // sends GET http://localhost:3000/entity1/123
  // resReadOne is a Promise of data received from the server

  const resCreate = entity1Resource.create({ data });
  // for data = { field1: 'test' }
  // sends POST http://localhost:3000/entity1 with body { field1: 'test' }
  // resCreate is a Promise of data received from the server

  const resUpdate = entity1Resource.update({ data, params: { id } });
  // for data = { field1: 'test' } and id = '123'
  // sends PUT http://localhost:3000/entity1/123 with body { field1: 'test' }
  // resUpdate is a Promise of data received from the server

  const resRemove = entity1Resource.remove({ params: { id } });
  // for id = '123'
  // sends DELETE http://localhost:3000/entity1/123
  // resRemove is a Promise of data received from the server
  ```

## URL token substituion

axios-rest-resource applies [interceptorUrlFormatter](docs/api/README.md#interceptorurlformatter) interceptor by default. It handles {token} substituin in URLs.

## Custom resource schema

- Create resource module in your utils folder

  ```ts
  // utils/resource.ts
  import { ResourceBuilder } from "axios-rest-resource";

  export const resourceBuilder = new ResourceBuilder({
    baseURL: "http://localhost:3000"
  });
  ```

- Using a newly created resource builder create an actual resource

  ```ts
  // api/entity2.js
  import {
    IResourceSchemaKeysDefault,
    resourceSchemaDefault
  } from "axios-rest-resource";
  import { resourceBuilder } from "utils/resource";

  export const entity2Resource = resourceBuilder.build<
    IResourceSchemaKeysDefault | "doSomething"
  >({
    schema: {
      ...resourceSchemaDefault,
      doSomething: {
        method: "post",
        url: "/do-something"
      }
    },
    url: "/entity2"
  });
  // exports an object
  // {
  //   create: (requestConfig) => axiosPromise // sends POST http://localhost:3000/entity2,
  //   read: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity2,
  //   readOne: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity2/{id},
  //   remove: (requestConfig) => axiosPromise // sends DELETE http://localhost:3000/entity2/{id},
  //   update: (requestConfig) => axiosPromise // sends PUT http://localhost:3000/entity2/{id},
  //   doSomething: (requestConfig) => axiosPromise // sends POST http://localhost:3000/entity2/do-something
  // }
  ```

- Use your resource whenever you want to make an AJAX call

  ```ts
  import { entity2Resource } from "api/entity2";

  const resRead = entity2Resource.read();
  // sends GET http://localhost:3000/entity2
  // resRead is a Promise of data received from the server

  const resReadOne = entity2Resource.readOne({ params: { id } });
  // for id = '123'
  // sends GET http://localhost:3000/entity2/123
  // resReadOne is a Promise of data received from the server

  const resCreate = entity2Resource.create({ data });
  // for data = { field1: 'test' }
  // sends POST http://localhost:3000/entity2 with body { field1: 'test' }
  // resCreate is a Promise of data received from the server

  const resUpdate = entity2Resource.update({ data, params: { id } });
  // for data = { field1: 'test' } and id = '123'
  // sends PUT http://localhost:3000/entity2/123 with body { field1: 'test' }
  // resUpdate is a Promise of data received from the server

  const resRemove = entity2Resource.remove({ params: { id } });
  // for id = '123'
  // sends DELETE http://localhost:3000/entity2/123
  // resRemove is a Promise of data received from the server

  const resDoSomething = entity2Resource.doSomething();
  // sends POST http://localhost:3000/entity2/do-something
  // resDoSomething is a Promise of data received from the server
  ```

You custom schema does not need to extend default schema if you do not want that

```ts
// api/entity.js
import { resourceBuilder } from "utils/resource";

export const entityResource = resourceBuilder.build<"doSomething">({
  schema: {
    doSomething: {
      method: "post",
      url: "/do-something"
    }
  },
  url: "/entity"
});
// exports an object
// {
//   doSomething: (requestConfig) => axiosPromise // sends POST http://localhost:3000/entity/do-something
// }
```

Alternatively you can use a partial of a default schema

```ts
// api/entity.js
import { resourceSchemaDefault } from "axios-rest-resource";
import { resourceBuilder } from "utils/resource";

const { read, readOne } = resourceSchemaDefault;

export const entityResource = resourceBuilder.build<"read" | "readOne">({
  schema: {
    read,
    readOne
  },
  url: "/entity"
});
// exports an object
// {
//   read: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity,
//   readOne: (requestConfig) => axiosPromise // sends GET http://localhost:3000/entity/{id},
// }
```

## Adavanced usage

You can pass a custom axios instance factory to ResourceBuilder. It's useful if you want to do something more with your axios instance like add an interceptor.

```ts
import { ResourceBuilder } from "axios-rest-resource";
import axios, { AxiosInstance } from "axios";

const createAxiosInstanceFromUrl = (resourceUrl: string): AxiosInstance => {
  const axiosInstance = axios.create({
    // Don't forget to append resourceUrl to baseURL
    baseURL: `http://localshot:3000${resourceUrl}`,
    // It might be a good idea to tell your server what data you expect in return
    headers: {
      Accept: "application/json"
    }
  });
  // This time we want to add response interceptors
  axiosInstance.interceptors.response.use(myResponeInterceptor);
  // Don't forget to add interceptorUrlFormatter if you want to keep {token} replacement in urls
  axiosInstance.interceptors.request.use(interceptorUrlFormatter);
  return axiosInstance;
};

export const resourceBuilder = new ResourceBuilder(createAxiosInstanceFromUrl);
```

As you can see there's a lot you have to remember. Not to keep all those things in mind you can utilize [createAxiosResourceFactory](docs/api/README.md#createaxiosresourcefactory).

```ts
import {
  ResourceBuilder,
  createAxiosResourceFactory
} from "axios-rest-resource";
import { AxiosInstance } from "axios";

const createAxiosResource = createAxiosResourceFactory({
  baseURL: "http://localshot:3000"
});
const createAxiosInstanceFromUrl = (resourceUrl: string): AxiosInstance => {
  // Creates an axios instance with appended resourceUrl and applied interceptorUrlFormatter. You can pass an additional array of request interceptors just like with ResourceBuilder. In fact ResourceBuilder uses this very function uner the hood.
  const axiosInstance = createAxiosResource(resourceUrl);
  // Add that response interceptor
  axiosInstance.interceptors.response.use(myResponeInterceptor);
  return axiosInstance;
};

export const resourceBuilder = new ResourceBuilder(createAxiosInstanceFromUrl);
```

## API

[API reference](docs/api/README.md)

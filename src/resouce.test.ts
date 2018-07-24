import { AxiosRequestConfig } from 'axios'
import { expect } from 'chai'
import * as moxios from 'moxios'
import { createSandbox, SinonSandbox } from 'sinon'

import {
  createAxiosResourceFactory
} from './axios'
import {
  IAPIMethodSchema,
  IBuildParams,
  IBuildParamsExtended,
  IResourceDefault,
  ResourceBuilder,
  resourceSchemaDefault
} from './resource'

describe('resource', () => {
  let sinon: SinonSandbox

  beforeEach(() => {
    sinon = createSandbox()
    moxios.install()
  })
  afterEach(() => {
    sinon.restore()
    moxios.uninstall()
  })

  describe(`${ResourceBuilder.constructor.name}`, () => {
    const ignoreRequestConfigKeys: Array<keyof AxiosRequestConfig> = [
      'method',
      'url'
    ]
    const resourceBuilderValidate = async (
      resourceBuilder: ResourceBuilder,
      resourceBuilderParams: IBuildParams | IBuildParamsExtended<string>,
      resourceMethodConfig?: AxiosRequestConfig
    ) => {
      moxios.stubRequest(/.*/, {
        responseText: 'OK',
        status: 200
      })
      const spyCreateAxiosResource = sinon.spy((resourceBuilder as any), '_createAxiosResource')
      const resource = resourceBuilder.build(resourceBuilderParams)
      expect(spyCreateAxiosResource.callCount).to.be.equal(1)
      expect(typeof resource).to.be.equal('object')
      const schema = (resourceBuilderParams as IBuildParamsExtended<string>).schema || resourceSchemaDefault
      for (const schemaKey of Object.keys(schema)) {
        const methodSchema = schema[schemaKey]
        expect(resource).to.have.property(schemaKey)
        const resourceMethod = resource[schemaKey as keyof IResourceDefault]
        expect(typeof resourceMethod).be.equal('function')
        const axiosPromise = resourceMethod(resourceMethodConfig)
        expect(axiosPromise instanceof Promise).to.be.equal(true)
        await axiosPromise
        const requestConfigRes = moxios.requests.mostRecent().config
        expect(typeof requestConfigRes).to.be.equal('object')
        expect(requestConfigRes).to.have.property('method', methodSchema.method.toLowerCase())
        if (resourceMethodConfig) {
          for (const requestConfigKey of Object.keys(resourceMethodConfig)) {
            if (ignoreRequestConfigKeys.indexOf(requestConfigKey as keyof AxiosRequestConfig) !== -1) {
              continue
            }
            const requestConfigVal = resourceMethodConfig[requestConfigKey as keyof AxiosRequestConfig]
            if (requestConfigKey === 'headers') {
              // requestConfigVal = headers object
              for (const headersKey of Object.keys(requestConfigVal)) {
                const headersVal = requestConfigVal[headersKey]
                expect(requestConfigRes[requestConfigKey]).to.have.property(headersKey, headersVal)
              }
              continue
            }
            expect(requestConfigRes).to.have.property(requestConfigKey, requestConfigVal)
          }
        }
      }
      return schema
    }
    describe('build', () => {
      it('success: default schema', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const requestConfig = {
          data: 'test'
        }
        const resourceBuilder = new ResourceBuilder({ baseURL })
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL },
          requestConfig
        )
        expect(schemaRes).to.be.equal(resourceSchemaDefault)
      })

      it('success: no request config', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const resourceBuilder = new ResourceBuilder({ baseURL })
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL }
        )
        expect(schemaRes).to.be.equal(resourceSchemaDefault)
      })

      it('success: accepts ICreateAxiosInstanceFromUrl', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const requestConfig = {
          data: 'test'
        }
        const createAxiosResource = createAxiosResourceFactory({ baseURL })
        const resourceBuilder = new ResourceBuilder(createAxiosResource)
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL },
          requestConfig
        )
        expect(schemaRes).to.be.equal(resourceSchemaDefault)
      })

      it('success: custom schema', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const requestConfig = {
          data: 'test'
        }
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const resourceBuilder = new ResourceBuilder({ baseURL })
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL, schema },
          requestConfig
        )
        expect(schemaRes).to.be.equal(schema)
      })

      it('success: custom request params', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const requestConfig = {
          headers: {
            test: 'test'
          },
          payload: 'test'
        }
        const resourceBuilder = new ResourceBuilder({ baseURL })
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL, schema },
          requestConfig
        )
        expect(schemaRes).to.be.equal(schema)
      })

      it('success: custom request params with ignored keys', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const requestConfig = {
          data: 'test',
          headers: {
            test: 'test'
          },
          method: 'should not be overridden',
          url: 'should not be overridden'
        }
        const resourceBuilder = new ResourceBuilder({ baseURL })
        const schemaRes = await resourceBuilderValidate(
          resourceBuilder,
          { url: resourceURL, schema },
          requestConfig
        )
        expect(schemaRes).to.be.equal(schema)
      })
    })
  })
})

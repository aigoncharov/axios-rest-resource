import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { expect } from 'chai'
import * as moxios from 'moxios'
import { createSandbox, SinonSandbox } from 'sinon'

import { AxiosResourceAdditionalProps, createAxiosInstanceFactory, createAxiosResourceFactory } from './axios'
import {
  IActionMeta,
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
    const resourceBuilderValidate = async (
      axiosConfig: AxiosRequestConfig & { baseURL: string },
      resourceBuilderParams: IBuildParams | IBuildParamsExtended<string>,
      resourceMethodParams: [ IActionMeta<any, any>, AxiosRequestConfig? ]
    ) => {
      moxios.stubRequest(/.*/, {
        responseText: 'OK',
        status: 200
      })
      const createAxiosInstance = createAxiosInstanceFactory(axiosConfig)
      const createAxiosResource = createAxiosResourceFactory(createAxiosInstance)
      const resourceBuilder = new ResourceBuilder(createAxiosResource)
      const spyCreateAxiosResource = sinon.spy((resourceBuilder as any), '_createAxiosResource')
      const resource = resourceBuilder.build(resourceBuilderParams)
      expect(spyCreateAxiosResource.callCount).to.be.equal(1)
      expect(typeof resource).to.be.equal('object')
      const [ createdAxiosInstance ]: AxiosInstance[] = spyCreateAxiosResource.returnValues
      const schema = (resourceBuilderParams as IBuildParamsExtended<string>).schema || resourceSchemaDefault
      for (const schemaKey of Object.keys(schema)) {
        const methodSchema = schema[schemaKey as keyof typeof schema]
        const spyCreatedAxiosInstanceRequest = sinon.spy(createdAxiosInstance, 'request')
        expect(resource).to.have.property(schemaKey)
        const resourceMethod = resource[schemaKey as keyof IResourceDefault]
        expect(typeof resourceMethod).be.equal('function')
        const axiosPromise = resourceMethod(...resourceMethodParams)
        expect(axiosPromise instanceof Promise).to.be.equal(true)
        await axiosPromise
        const requestConfigRes: AxiosRequestConfig = spyCreatedAxiosInstanceRequest.args[0][0]
        expect(typeof requestConfigRes).to.be.equal('object')
        expect(requestConfigRes).to.have.property('method', methodSchema.method)
        const [ action, requestConfig ] = resourceMethodParams
        expect(requestConfigRes).to.have.property('data', action.payload)
        expect(requestConfigRes).to.have.property(AxiosResourceAdditionalProps, action)
        if (requestConfig) {
          for (const requestConfigKey of Object.keys(requestConfig)) {
            if (requestConfigKey === 'data') {
              continue
            }
            const requestConfigVal = requestConfig[requestConfigKey as keyof AxiosRequestConfig]
            expect(requestConfigRes).to.have.property(requestConfigKey, requestConfigVal)
          }
        }
        spyCreatedAxiosInstanceRequest.restore()
      }
      return schema
    }
    describe('build', () => {
      it('success: default schema', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const action = {
          payload: 'test',
          type: 'ACTION'
        }
        const schemaRes = await resourceBuilderValidate(
          { baseURL },
          { url: resourceURL },
          [ action ]
        )
        expect(schemaRes).to.be.equal(resourceSchemaDefault)
      })

      it('success: custom schema', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const action = {
          payload: 'test',
          type: 'ACTION'
        }
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const schemaRes = await resourceBuilderValidate(
          { baseURL },
          { url: resourceURL, schema },
          [ action ]
        )
        expect(schemaRes).to.be.equal(schema)
      })

      it('success: custom request params', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const action = {
          payload: 'test',
          type: 'ACTION'
        }
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const requestParams: AxiosRequestConfig = {
          headers: {
            test: 'test'
          }
        }
        const schemaRes = await resourceBuilderValidate(
          { baseURL },
          { url: resourceURL, schema },
          [ action, requestParams ]
        )
        expect(schemaRes).to.be.equal(schema)
      })

      it('success: custom request params with data', async () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const action = {
          payload: 'test',
          type: 'ACTION'
        }
        const schema: { [ index: string ]: IAPIMethodSchema } = {
          test: {
            method: 'PUT'
          }
        }
        const requestParams: AxiosRequestConfig = {
          data: 'should not be overridden',
          headers: {
            test: 'test'
          }
        }
        const schemaRes = await resourceBuilderValidate(
          { baseURL },
          { url: resourceURL, schema },
          [ action, requestParams ]
        )
        expect(schemaRes).to.be.equal(schema)
      })
    })
  })
})

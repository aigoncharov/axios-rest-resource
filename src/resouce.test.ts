import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { expect } from 'chai'
import { createSandbox, SinonSandbox } from 'sinon'

import { AxiosResourceAdditionalProps, createAxiosInstanceFactory, createAxiosResourceFactory } from './axios'
import { IResourceDefault, ResourceBuilder, resourceSchemaDefault } from './resource'

describe('resource', () => {
  let sinon: SinonSandbox

  beforeEach(() => {
    sinon = createSandbox()
  })
  afterEach(() => sinon.restore())

  describe(`${ResourceBuilder.constructor.name}`, () => {
    describe('build', () => {
      it('success: default schema', () => {
        const baseURL = 'http://localhost:3000'
        const resourceURL = '/resource'
        const action = {
          payload: 'test',
          type: 'ACTION'
        }
        const createAxiosInstance = createAxiosInstanceFactory({ baseURL })
        const createAxiosResource = createAxiosResourceFactory(createAxiosInstance)
        const resourceBuilder = new ResourceBuilder(createAxiosResource)
        const spyCreateAxiosResource = sinon.spy((resourceBuilder as any), '_createAxiosResource')
        const resource = resourceBuilder.build({
          url: resourceURL
        })
        expect(spyCreateAxiosResource.callCount).to.be.equal(1)
        expect(typeof resource).to.be.equal('object')
        const [ createdAxiosInstance ]: AxiosInstance[] = spyCreateAxiosResource.returnValues
        for (const defaultSchemaKey of Object.keys(resourceSchemaDefault)) {
          const methodSchema = resourceSchemaDefault[defaultSchemaKey as keyof typeof resourceSchemaDefault]
          const spyCreatedAxiosInstanceRequest = sinon.spy(createdAxiosInstance, 'request')
          expect(resource).to.have.property(defaultSchemaKey)
          const resourceMethod = resource[defaultSchemaKey as keyof IResourceDefault]
          expect(typeof resourceMethod).be.equal('function')
          // TODO: Mock server
          const axiosPromise = resourceMethod(action)
          expect(axiosPromise instanceof Promise).to.be.equal(true)
          const requestConfig: AxiosRequestConfig = spyCreatedAxiosInstanceRequest.args[0][0]
          expect(typeof requestConfig).to.be.equal('object')
          expect(requestConfig).to.have.property('method', methodSchema.method)
          expect(requestConfig).to.have.property('data', action.payload)
          expect(requestConfig).to.have.property(AxiosResourceAdditionalProps, action)
          spyCreatedAxiosInstanceRequest.restore()
        }
      })
    })
  })
})

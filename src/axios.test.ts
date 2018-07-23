import axios, { AxiosRequestConfig } from 'axios'
import { expect } from 'chai'
import * as moxios from 'moxios'

import {
  AxiosResourceAdditionalProps,
  createAxiosResourceFactory,
  IAxiosResourceRequestConfig,
  ICreateAxiosInstanceFactoryParams,
  interceptorAuthorizationToken,
  interceptorUrlFormatter
} from './axios'

describe('axios', () => {
  beforeEach(() => moxios.install())
  afterEach(() => moxios.uninstall())

  const checkIsAxiosInstance = (target: object) => {
    const axiosInstanceRef = axios.create()
    for (const key of Object.keys(axiosInstanceRef)) {
      expect(target).to.have.property(key)
    }
  }

  describe('createAxiosResourceFactory', () => {
    const createAxiosResourceAndValidate = (
      axiosResourceFactoryParams: ICreateAxiosInstanceFactoryParams,
      resourceURL: string
    ) => {
      const createAxiosResource = createAxiosResourceFactory(axiosResourceFactoryParams)
      expect(typeof createAxiosResource).to.be.equal('function')
      const axiosInstance = createAxiosResource(resourceURL)
      expect(axiosInstance.defaults.baseURL).to.be.equal(`${axiosResourceFactoryParams.baseURL}${resourceURL}`)
      checkIsAxiosInstance(axiosInstance)
      return axiosInstance
    }
    it('success: creates axios resource', () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      createAxiosResourceAndValidate({ baseURL }, resourceURL)
    })

    it('success: creates axios resource and sets defaults', () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      const headers = {
        common: {
          Authorization: 'test'
        }
      }
      const axiosInstance = createAxiosResourceAndValidate({ baseURL, headers }, resourceURL)
      expect(axiosInstance.defaults.headers.common).to.have.property('Authorization', headers.common.Authorization)
    })

    it('success: applies default headers', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {
        url: ''
      }
      const axiosInstance = createAxiosResourceAndValidate({ baseURL }, resourceURL)
      const axiosPromise = axiosInstance.request(requestConfig)
      await new Promise((resolve) => moxios.wait(resolve))
      expect(moxios.requests.count()).to.be.equal(1)
      const request = moxios.requests.mostRecent()
      expect(request.url).to.be.equal(`${baseURL}${resourceURL}`)
      expect(request.headers).to.have.property('Accept', 'application/json')
      await request.respondWith({ status: 200 })
      await axiosPromise
    })

    it('success: applies default interceptors', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig: IAxiosResourceRequestConfig = {
        params: {
          id: 'testId'
        },
        url: '/{id}/test',
        [AxiosResourceAdditionalProps]: {
          action: {
            type: 'ACTION'
          }
        }
      }
      const axiosInstance = createAxiosResourceAndValidate({ baseURL }, resourceURL)
      const manager = axiosInstance.interceptors.request as any
      expect(manager.handlers.length).to.be.equal(1)
      expect(manager.handlers[0].fulfilled).to.be.equal(interceptorUrlFormatter)
      const axiosPromise = axiosInstance.request(requestConfig)
      await new Promise((resolve) => moxios.wait(resolve))
      expect(moxios.requests.count()).to.be.equal(1)
      const request = moxios.requests.mostRecent()
      expect(request.url).to.be.equal(`${baseURL}${resourceURL}/testId/test`)
      await request.respondWith({ status: 200 })
      await axiosPromise
    })

    it('success: applies additional interceptors', async () => {
      const authorization = 'testAuthorizationHeader'
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      const requestConfig: IAxiosResourceRequestConfig = {
        params: {
          id: 'testId'
        },
        url: '/{id}/test',
        [AxiosResourceAdditionalProps]: {
          action: {
            meta: {
              authorization
            },
            type: 'ACTION'
          }
        }
      }
      const axiosInstance = createAxiosResourceAndValidate(
        { baseURL, interceptors: [ interceptorAuthorizationToken ] },
        resourceURL
      )
      const manager = axiosInstance.interceptors.request as any
      expect(manager.handlers.length).to.be.equal(2)
      expect(manager.handlers[0].fulfilled).to.be.equal(interceptorAuthorizationToken)
      expect(manager.handlers[1].fulfilled).to.be.equal(interceptorUrlFormatter)
      const axiosPromise = axiosInstance.request(requestConfig)
      await new Promise((resolve) => moxios.wait(resolve))
      expect(moxios.requests.count()).to.be.equal(1)
      const request = moxios.requests.mostRecent()
      expect(request.url).to.be.equal(`${baseURL}${resourceURL}/testId/test`)
      expect(request.headers).to.have.property('Authorization', authorization)
      await request.respondWith({ status: 200 })
      await axiosPromise
    })
  })

  describe('interceptorUrlFormatter', () => {
    it('success: replaces {tokens} in url and removes used params', () => {
      const config: AxiosRequestConfig = {
        params: {
          id: '12345',
          unusedParam: 'test'
        },
        url: 'http://localhost:3000/{id}'
      }
      const configUpd = interceptorUrlFormatter(config)
      expect(configUpd.url).to.be.equal('http://localhost:3000/12345')
      expect(typeof configUpd.params).to.be.equal('object')
      expect(Object.keys(configUpd.params).length).to.be.equal(1)
      expect(configUpd.params).to.have.property('unusedParam', config.params.unusedParam)
      expect(configUpd.params).not.to.have.property('id')
    })

    it('success: returns original config if no params found', () => {
      const config: AxiosRequestConfig = {
        url: 'http://localhost:3000/'
      }
      const configUpd = interceptorUrlFormatter(config)
      expect(configUpd).to.be.deep.equal(config)
    })
  })

  describe('interceptorAuthorizationToken', () => {
    it('success: adds Authorization header', () => {
      const token = 'test'
      const config: IAxiosResourceRequestConfig = {
        [AxiosResourceAdditionalProps]: {
          action: {
            meta: {
              authorization: token
            }
          }
        },
        url: 'http://localhost:3000'
      }
      const configUpd = interceptorAuthorizationToken(config)
      expect(configUpd.headers).to.have.property('Authorization', token)
    })

    it('success: returns original config if no params found', () => {
      const config: AxiosRequestConfig = {
        url: 'http://localhost:3000/'
      }
      const configUpd = interceptorUrlFormatter(config)
      expect(configUpd).to.be.deep.equal(config)
    })
  })
})

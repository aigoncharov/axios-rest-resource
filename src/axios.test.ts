import axios, { AxiosRequestConfig } from 'axios'
import { expect } from 'chai'
import * as moxios from 'moxios'

import {
  createAxiosResourceFactory,
  ICreateAxiosInstanceFactoryParams,
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

    it('success: applies default headers', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {}
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

    it('success: merges headers', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      const headers = {
        Authorization: 'test'
      }
      const requestConfig = {}
      const axiosInstance = createAxiosResourceAndValidate({ baseURL, headers }, resourceURL)
      const axiosPromise = axiosInstance.request(requestConfig)
      await new Promise((resolve) => moxios.wait(resolve))
      expect(moxios.requests.count()).to.be.equal(1)
      const request = moxios.requests.mostRecent()
      expect(request.url).to.be.equal(`${baseURL}${resourceURL}`)
      expect(request.headers).to.have.property('Accept', 'application/json')
      expect(request.headers).to.have.property('Authorization', headers.Authorization)
      await request.respondWith({ status: 200 })
      await axiosPromise
    })

    it('success: overrides headers', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      const headers = {
        Accept: 'text/html'
      }
      const requestConfig = {}
      const axiosInstance = createAxiosResourceAndValidate({ baseURL, headers }, resourceURL)
      const axiosPromise = axiosInstance.request(requestConfig)
      await new Promise((resolve) => moxios.wait(resolve))
      expect(moxios.requests.count()).to.be.equal(1)
      const request = moxios.requests.mostRecent()
      expect(request.url).to.be.equal(`${baseURL}${resourceURL}`)
      expect(request.headers).to.have.property('Accept', headers.Accept)
      await request.respondWith({ status: 200 })
      await axiosPromise
    })

    it('success: applies default interceptors', async () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/resource'
      const requestConfig = {
        params: {
          id: 'testId'
        },
        url: '/{id}/test'
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
})

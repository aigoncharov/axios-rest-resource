import axios, { AxiosRequestConfig } from 'axios'
import { expect } from 'chai'

import {
  AxiosResourceAdditionalProps,
  createAxiosInstanceFactory,
  createAxiosResourceFactory,
  IAxiosResourceRequestConfig,
  interceptorAuthorizationToken,
  interceptorUrlFormatter
} from './axios'

describe('axios', () => {
  const checkIsAxiosInstance = (target: object) => {
    const axiosInstanceRef = axios.create()
    for (const key of Object.keys(axiosInstanceRef)) {
      expect(target).to.have.property(key)
    }
  }
  describe('createAxiosInstanceFactory', () => {
    const createInstanceAndValidate = (config: AxiosRequestConfig & { baseURL: string }) => {
      const createAxiosInstance = createAxiosInstanceFactory(config)
      expect(typeof createAxiosInstance).to.be.equal('function')
      const axiosInstance = createAxiosInstance()
      expect(typeof axiosInstance).to.be.equal('function')
      checkIsAxiosInstance(axiosInstance)
      expect(axiosInstance.defaults.baseURL).to.be.equal(config.baseURL)
      return axiosInstance
    }
    it('success: creates axios instance factory', () => {
      const baseURL = 'http://localhost:3000'
      createInstanceAndValidate({ baseURL })
    })

    it('success: creates axios instance factory and sets defaults', () => {
      const baseURL = 'http://localhost:3000'
      const headers = {
        common: {
          Authorization: 'test'
        }
      }
      const axiosInstance = createInstanceAndValidate({
        baseURL,
        headers
      })
      expect(axiosInstance.defaults.headers.common).to.have.property('Authorization', headers.common.Authorization)
    })

    it('success: applies default interceptors', () => {
      const baseURL = 'http://localhost:3000'
      const axiosInstance = createInstanceAndValidate({ baseURL })
      const manager = axiosInstance.interceptors.request as any
      expect(manager.handlers.length).to.be.equal(2)
      expect(manager.handlers[0].fulfilled).to.be.equal(interceptorUrlFormatter)
      expect(manager.handlers[1].fulfilled).to.be.equal(interceptorAuthorizationToken)
    })
  })

  describe('createAxiosResourceFactory', () => {
    it('success: creates axios resource factory', () => {
      const baseURL = 'http://localhost:3000'
      const resourceURL = '/test'
      const createAxiosInstance = createAxiosInstanceFactory({ baseURL })
      const createAxiosResource = createAxiosResourceFactory(createAxiosInstance)
      const axiosInstance = createAxiosResource(resourceURL)
      expect(axiosInstance.defaults.baseURL).to.be.equal(`${baseURL}${resourceURL}`)
      checkIsAxiosInstance(axiosInstance)
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

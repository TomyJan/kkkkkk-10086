import fetch from 'node-fetch'
import https from 'https'
import { Response } from 'node-fetch'
let controller = new AbortController()
let signal = controller.signal
export default class networks {
  /**
   * 构造一个网络请求对象。
   * @param {string} data.url 请求地址
   * @param {object} [data.headers = {}] 请求头对象
   * @param {string} [data.type = 'json'] 返回参数类型, 可选值包括 'json', 'text', 'arrayBuffer', 'blob'
   * @param {string} [data.method = 'GET'] 请求方法, 可选值包括 'GET' 和 'POST'
   * @param {*} [data.body = ''] 请求体数据。对于 POST 请求，可设置请求体内容
   * @param {boolean} [data.isAgent = false] 是否启用 HTTPS 代理
   * @param {AbortSignal} [data.issignal] 用于中止请求的信号对象
   * @param {number} [data.timeout = 15000] 请求超时时间，单位毫秒
   */
  constructor(data) {
    this.url = data.url
    this.headers = data.headers || {}
    this.type = data.type || 'json'
    this.method = data.method || 'GET'
    this.body = data.body || ''
    this.data = {}
    this.agent = data.isAgent
      ? new https.Agent({
          rejectUnauthorized: false,
        })
      : ''
    this.signal = data.issignal ? signal : undefined
    this.timeout = data.timeout || 15000
    this.isGetResult = false
    this.timer = ''
  }

  get config() {
    let data = {
      headers: this.headers,
      method: this.method,
      agent: this.agent,
      signal: this.signal,
    }
    if (this.method == 'post') {
      data = { ...data, body: JSON.stringify(this.body) || '' }
    }
    return data
  }

  async getfetch() {
    try {
      if (this.method == 'post') {
        data = { ...data, body: JSON.stringify(this.body) || '' }
      }
      let result = await this.returnResult()
      if (result.status === 504) {
        return result
      }
      this.isGetResult = true
      return result
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async returnResult() {
    if (this.timeout && this.signal) {
      return Promise.race([this.timeoutPromise(this.timeout), fetch(this.url, this.config)]).then((res) => {
        console.log(this.timer)
        clearTimeout(this.timer)
        return res
      })
    }
    return fetch(this.url, this.config)
  }

  async getLongLink() {
    try {
      let result = await this.returnResult()
      return result.url
    } catch (error) {
      console.log(error)
      return ''
    }
  }

  /** 获取数据并处理数据的格式化，默认json */
  async getData(new_fetch = '') {
    try {
      if (!new_fetch) {
        let result = await this.returnResult()
        if (result.status === 504) {
          return result
        }
        this.fetch = result
        this.isGetResult = true
      } else {
        this.fetch = new_fetch
      }
      switch (this.type) {
        case 'json':
          await this.Tojson()
          break
        case 'text':
          await this.ToText()
          break
        case 'arrayBuffer':
          await this.ToArrayBuffer()
          break
        case 'blob':
          await this.ToBlob()
          break
      }
      return this.fetch
    } catch (error) {
      console.log(error)
      return false
    }
  }

  /** 获取响应头 */
  async getHeaders() {
    try {
      this.fetch = await this.returnResult()

      if (this.fetch) {
        if (this.fetch.headers) {
          const headers = this.fetch.headers
          const headersObject = {}
          for (const [key, value] of headers.entries()) {
            headersObject[key] = value
          }
          return headersObject
        } else {
          console.log('未获取到响应头')
          return null
        }
      } else {
        console.log('未获取到响应对象')
        return null
      }
    } catch (error) {
      console.log('获取响应头失败:', error)
      return null
    }
  }

  async Tojson() {
    if (this.fetch.headers.get('content-type').includes('json')) {
      this.fetch = await this.fetch.json()
    } else {
      this.fetch = await this.fetch.text()
      this.type = 'text'
    }
  }

  async ToText() {
    this.fetch = await this.fetch.text()
  }

  async ToArrayBuffer() {
    this.fetch = await this.fetch.arrayBuffer()
  }
  async ToBlob() {
    this.fetch = await this.fetch.blob()
  }

  timeoutPromise(timeout) {
    return new Promise((resolve, reject) => {
      this.timer = setTimeout(() => {
        console.log('执行力')
        resolve(new Response('timeout', { status: 504, statusText: 'timeout ' }))
        controller.abort()
      }, timeout)
    })
  }
}

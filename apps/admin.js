import { Config } from '../model/config.js'
import BiLogin from '../model/bilibili/login.js'
import { refresh_token } from '../model/bilibili/cookie.js'

let _path = process.cwd()

async function updateConfig(key, value, e) {
  Config[key] = value
  e.reply('设置成功！')
}

function getValue(msg) {
  if (msg.includes('开启')) return true
  if (msg.includes('关闭')) return false
}

export class admin extends plugin {
  constructor(e) {
    super({
      name: 'kkkkkk-10086-管理',
      dsc: 'admin',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(KKK|kkk|kkkkkk-10086)设置$',
          fnc: 'set',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置(视频解析|解析)(开启|关闭)$',
          fnc: 'tools',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置(默认视频解析|默认解析)(开启|关闭)$',
          fnc: 'defaulttool',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置(评论解析|评论)(开启|关闭)$',
          fnc: 'comments',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置缓存删除(开启|关闭)$',
          fnc: 'temp',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置抖音ck$',
          fnc: 'setdyck',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置评论图片(开启|关闭)$',
          fnc: 'commentsimg',
          permission: 'master',
        },
        {
          reg: '^#*(KKK|kkk|kkkkkk-10086)设置B站ck$',
          fnc: 'setbilick',
          permission: 'master',
        },
        {
          reg: '^#?(kkk)?B站(扫码)?登录$',
          fnc: 'Blogin',
          permission: 'master',
        },
      ],
    })
    // this.task = {
    //   cron: '0 1 * * *',
    //   name: '刷新B站ck',
    //   fnc: () => this.refresh_token(),
    //   log: true,
    // }
  }

  async refresh_token() {
    await refresh_token()
  }

  async Blogin(e) {
    await new BiLogin(e).Login()
  }

  async set(e) {
    let text = []
    for (let i = 0; i < this.rule.length; i++) {
      let reg = this.rule[i].reg + '\n'
      text.push(reg)
    }
    e.reply(text)
  }

  async defaulttool(e) {
    const value = getValue(e.msg)
    await updateConfig('defaulttool', value, e)
    e.reply('重启以应用更新', true)
  }

  async tools(e) {
    const value = getValue(e.msg)
    await updateConfig('videotool', value, e)
    e.reply('重启以应用更新', true)
  }

  async comments(e) {
    const value = getValue(e.msg)
    await updateConfig('comments', value, e)
  }

  async temp(e) {
    const value = getValue(e.msg)
    await updateConfig('rmmp4', value, e)
  }

  async setbilick(e) {
    this.setContext('savedyck')
    const img = `${_path}/plugins/kkkkkk-10086/resources/pic/pic1.png`
    await this.reply(['请发送抖音ck\n', '教程：https://docs.qq.com/doc/DRExRWUh1a3l4bnlI\n', segment.image(img)], true)
    return false
  }
  async savebilick() {
    if (this.e.message[0].type != 'text') {
      await this.reply('设置错误', true)
      this.finish('savdbilick')
    }
    const value = this.e.message[0].text
    await updateConfig('ck', value, this.e)
    this.finish('savebilick')
  }

  async commentsimg(e) {
    const value = getValue(e.msg)
    await updateConfig('commentsimg', value, e)
  }

  async setdyck(e) {
    this.setContext('savedyck')
    const img = `${_path}/plugins/kkkkkk-10086/resources/pic/pic1.png`
    await this.reply(['请发送抖音ck\n', '教程：https://docs.qq.com/doc/DRExRWUh1a3l4bnlI\n', segment.image(img)], true)
    return false
  }
  async savedyck() {
    if (this.e.message[0].type != 'text') {
      await this.reply('设置错误', true)
      this.finish('savddyck')
    }
    const value = this.e.message[0].text
    await updateConfig('bilibilick', value, this.e)
    this.finish('savedyck')
  }
}

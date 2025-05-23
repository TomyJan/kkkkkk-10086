import Bilidata from './getdata.js'
import { getBilibiliData } from '@ikenxuan/amagi'
import { Base, Config, Render, DB, Version } from '../../components/index.js'
import { sendMsg, segment, logger } from '../../lib/public/index.js'
import YAML from 'yaml'
import fs from 'fs'

export default class Bilibilipush extends Base {
  /**
   * 构造函数
   * @param {Object} e 事件对象，提供给实例使用的事件相关信息，默认为空对象{}
   * @param {boolean} force 强制执行标志，用于控制实例行为，默认值未定义
   * @returns 无返回值
   */
  constructor (e = {}, force) {
    super(e) // 调用父类的构造函数
    // 判断当前bot适配器是否为'QQBot'，如果是，则直接返回true，否则继续执行
    if (this.botadapter === 'QQBot') {
      return true
    }
    this.force = force // 保存传入的强制执行标志
  }

  /**
   * 执行主要的操作流程，包括检查缓存并根据需要获取和更新用户数据。
   * 该函数首先检查Redis缓存中是否存在用户数据，如果不存在或已过时，则重新获取数据并更新缓存。
   * 数据不一致时，会进行强制推送或根据时间戳更新推送内容。
   *
   * @returns {Promise<boolean>} 操作完成的状态，成功为true，失败为false。
   */
  async action () {
    if (await this.checkremark()) return true

    try {
      let data = await this.getuserdata()
      data = this.findMismatchedDynamicIds(data)

      if (Object.keys(data).length === 0) return true

      if (this.force) return await this.forcepush(data)
      else return await this.getdata(data)
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * 异步获取数据并根据动态类型处理和发送动态信息。
   * @param {Object} data - 包含动态相关信息的对象。
   * - data 动态信息对象，必须包含 dynamic_id, host_mid, group_id, type 等属性。
   */
  async getdata (data) {
    let nocd_data
    for (const dynamicId in data) {
      const dynamicCARDINFO = await new Bilidata('动态卡片信息').GetData({ dynamic_id: dynamicId })
      const userINFO = await new Bilidata('用户名片信息').GetData({ host_mid: data[dynamicId].host_mid })
      let emojiDATA = await new Bilidata('EMOJI').GetData()
      emojiDATA = extractEmojisData(emojiDATA.data.packages)
      const dycrad = dynamicCARDINFO.data.card && dynamicCARDINFO.data.card.card && JSON.parse(dynamicCARDINFO.data.card.card)
      let img
      let send = true
      logger.debug(`UP: ${data[dynamicId].remark}\n动态id：${dynamicId}\nhttps://t.bilibili.com/${dynamicId}`)
      switch (data[dynamicId].dynamic_type) {
        /** 处理图文动态 */
        case 'DYNAMIC_TYPE_DRAW': {
          /**
             * 生成图片数组
             * 该函数没有参数。
             * @returns {Object[]} imgArray - 包含图片源地址的对象数组。
             */
          const cover = () => {
            // 初始化一个空数组来存放图片对象
            const imgArray = []
            // 遍历dycrad.item.pictures数组，将每个图片的img_src存入对象，并将该对象加入imgArray
            for (let i = 0; i < dycrad.item.pictures.length; i++) {
              const obj = {
                image_src: dycrad.item.pictures[i].img_src
              }
              imgArray.push(obj)
            }
            // 返回包含所有图片对象的数组
            return imgArray
          }

          img = await Render.render(
            'html/bilibili/dynamic/DYNAMIC_TYPE_DRAW',
            {
              image_url: cover(),
              text: replacetext(br(data[dynamicId].Dynamic_Data.modules.module_dynamic.desc.text), data[dynamicId].Dynamic_Data),
              dianzan: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.like.count),
              pinglun: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.comment.count),
              share: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.forward.count),
              create_time: this.convertTimestampToDateTime(data[dynamicId].Dynamic_Data.modules.module_author.pub_ts),
              avater_url: data[dynamicId].Dynamic_Data.modules.module_author.face,
              share_url: 'https://t.bilibili.com/' + data[dynamicId].Dynamic_Data.id_str,
              username: checkvip(userINFO.data.card),
              fans: this.count(userINFO.data.follower),
              user_shortid: data[dynamicId].host_mid,
              total_favorited: this.count(userINFO.data.like_num),
              following_count: this.count(userINFO.data.card.attention),
              dynamicTYPE: '图文动态推送'
            }
          )
          break
        }
        /** 处理纯文动态 */
        case 'DYNAMIC_TYPE_WORD': {
          let text = replacetext(data[dynamicId].Dynamic_Data.modules.module_dynamic.desc.text, data[dynamicId].Dynamic_Data)
          for (const item of emojiDATA) {
            if (text.includes(item.text)) {
              if (text.includes('[') && text.includes(']')) {
                text = text.replace(/\[[^\]]*\]/g, `<img src="${item.url}"/>`).replace(/\\/g, '')
              }
              text += '&#160'
            }
          }
          img = await Render.render(
            'html/bilibili/dynamic/DYNAMIC_TYPE_WORD',
            {
              text: br(text),
              dianzan: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.like.count),
              pinglun: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.comment.count),
              share: this.count(data[dynamicId].Dynamic_Data.modules.module_stat.forward.count),
              create_time: this.convertTimestampToDateTime(data[dynamicId].Dynamic_Data.modules.module_author.pub_ts),
              avater_url: data[dynamicId].Dynamic_Data.modules.module_author.face,
              share_url: 'https://t.bilibili.com/' + data[dynamicId].Dynamic_Data.id_str,
              username: checkvip(userINFO.data.card),
              fans: this.count(userINFO.data.follower),
              user_shortid: data[dynamicId].host_mid,
              total_favorited: this.count(userINFO.data.like_num),
              following_count: this.count(userINFO.data.card.attention),
              dynamicTYPE: '纯文动态推送'
            }
          )
          break
        }
        /** 处理视频动态 */
        case 'DYNAMIC_TYPE_AV': {
          if (data[dynamicId].Dynamic_Data.modules.module_dynamic.major.type === 'MAJOR_TYPE_ARCHIVE') {
            const aid = data[dynamicId].Dynamic_Data.modules.module_dynamic.major.archive.aid
            const bvid = data[dynamicId].Dynamic_Data.modules.module_dynamic.major.archive.bvid
            const INFODATA = await new Bilidata('bilibilivideo').GetData({ id_type: 'bvid', id: bvid })
            nocd_data = await getBilibiliData('单个视频下载信息数据', '', { avid: INFODATA.INFODATA.data.aid, cid: INFODATA.INFODATA.data.cid })

            img = await Render.render(
              'html/bilibili/dynamic/DYNAMIC_TYPE_AV',
              {
                image_url: [{ image_src: INFODATA.INFODATA.data.pic }],
                text: br(INFODATA.INFODATA.data.title),
                desc: br(dycrad.desc),
                dianzan: this.count(INFODATA.INFODATA.data.stat.like),
                pinglun: this.count(INFODATA.INFODATA.data.stat.reply),
                share: this.count(INFODATA.INFODATA.data.stat.share),
                create_time: this.convertTimestampToDateTime(INFODATA.INFODATA.data.ctime),
                avater_url: INFODATA.INFODATA.data.owner.face,
                share_url: 'https://www.bilibili.com/video/' + bvid,
                username: checkvip(userINFO.data.card),
                fans: this.count(userINFO.data.follower),
                user_shortid: data[dynamicId].host_mid,
                total_favorited: this.count(userINFO.data.like_num),
                following_count: this.count(userINFO.data.card.attention),
                dynamicTYPE: '视频动态推送'
              }
            )
          }
          break
        }
        /** 处理直播动态 */
        case 'DYNAMIC_TYPE_LIVE_RCMD': {
          img = await Render.render(
            'html/bilibili/dynamic/DYNAMIC_TYPE_LIVE_RCMD',
            {
              image_url: [{ image_src: dycrad.live_play_info.cover }],
              text: br(dycrad.live_play_info.title),
              liveinf: br(`${dycrad.live_play_info.area_name} | 房间号: ${dycrad.live_play_info.room_id}`),
              username: userINFO.data.card.name,
              avater_url: userINFO.data.card.face,
              fans: this.count(userINFO.data.follower),
              create_time: this.convertTimestampToDateTime(data[dynamicId].Dynamic_Data.modules.module_author.pub_ts),
              now_time: this.getCurrentTime(),
              share_url: 'https://live.bilibili.com/' + dycrad.live_play_info.room_id,
              dynamicTYPE: '直播动态推送'
            }
          )
          break
        }
        /** 未处理的动态类型 */
        default: {
          send = false
          logger.warn(`UP主：${data[dynamicId].remark}「${data[dynamicId].dynamic_type}」动态类型的暂未支持推送`)
          break
        }
      }

      // 遍历 group_id 数组，并发送消息
      try {
        for (const groupId of data[dynamicId].group_id) {
          const [group_id, uin] = groupId.split(':')
          let status, video
          if (send) status = await sendMsg(uin, group_id, img)
          if (data[dynamicId].dynamic_type === 'DYNAMIC_TYPE_AV') {
            try {
              // 判断是否发送视频动态的视频
              if (send && Config.bilibili.senddynamicvideo) {
                // 下载视频
                video = await this.DownLoadVideo(nocd_data.data.durl[0].url, 'tmp_' + Date.now(), false, { uin, group_id })
                if (video) await sendMsg(uin, group_id, segment.video(video.filepath))
              }
            } catch (error) {
              logger.error(error)
            } finally {
              if (send && Config.bilibili.senddynamicvideo && video) await this.removeFile(video?.filepath)
            }
          }

          if (status || !send) {
            const DBdata = await DB.FindGroup('bilibili', groupId)

            /**
             * 检查 DBdata 中是否存在与给定 host_mid 匹配的项
             * @param {Object} DBdata - 包含数据的对象
             * @param {string} secUidToCheck - 要检查的 host_mid
             * @returns {string} 匹配的 host_mid
             */
            const findMatchingSecUid = (DBdata, host_midToCheck) => {
              for (const host_mid in DBdata) {

                if (DBdata.hasOwnProperty(host_mid) && DBdata[host_mid].host_mid === host_midToCheck) {
                  return host_midToCheck
                }
              }
              return false // 未找到匹配的 host_mid，返回 false
            }
            let newEntry
            if (DBdata) {
              // 如果 DBdata 存在，遍历 DBdata 来查找对应的 host_mid
              let found = false

              if (data[dynamicId].host_mid === findMatchingSecUid(DBdata, data[dynamicId].host_mid)) {
                // 如果找到了对应的 host_mid ，将 dynamicId 添加到 dynamic_idlist 数组中
                const isSecUidFound = findMatchingSecUid(DBdata, data[dynamicId].host_mid)
                if (isSecUidFound && this.force ? true : !DBdata[data[dynamicId].host_mid].dynamic_idlist.includes(dynamicId)) {
                  DBdata[isSecUidFound].dynamic_idlist.push(dynamicId)
                  DBdata[isSecUidFound].create_time = Number(data[dynamicId].create_time)
                  await DB.UpdateGroupData('bilibili', groupId, DBdata)
                  found = true
                }
              }

              if (!found) {
                // 如果没有找到对应的 host_mid ，创建一个新的条目
                newEntry = {
                  remark: data[dynamicId].remark,
                  create_time: data[dynamicId].create_time,
                  host_mid: data[dynamicId].host_mid,
                  dynamic_idlist: [dynamicId],
                  avatar_img: data[dynamicId].Dynamic_Data.modules.module_author.face,
                  dynamic_type: data[dynamicId].dynamic_type
                }
                DBdata[data[dynamicId].host_mid] = newEntry
                // 更新数据库
                await DB.UpdateGroupData('bilibili', groupId, DBdata)
              }
            } else {
              // 如果 DBdata 为空，创建新的条目
              await DB.CreateSheet('bilibili', groupId, {
                [data[dynamicId].host_mid]: {
                  remark: data[dynamicId].remark,
                  create_time: data[dynamicId].create_time,
                  host_mid: data[dynamicId].host_mid,
                  dynamic_idlist: [dynamicId],
                  avatar_img: data[dynamicId].Dynamic_Data.modules.module_author.face,
                  dynamic_type: data[dynamicId].dynamic_type
                }
              })
            }
          }
        }
      } catch (error) {
        logger.error(error)
      }
    }
  }

  /**
   * 异步获取用户动态数据，并可选择写入结果到redis
   *
   * @param {boolean} write 指示是否将结果写入redis
   * @param {Array} host_mid_list 包含要获取数据的用户uid列表的对象数组
   * @returns {Array} 返回一个包含用户动态信息的数组
   */
  async getuserdata () {
    const willbepushlist = {}

    try {
      for (const item of Config.pushlist.bilibili) {
        const dynamic_list = await new Bilidata('获取用户空间动态').GetData({ host_mid: item.host_mid })
        const ALL_DBdata = await DB.FindAll('bilibili')

        // 将数据库中的 group_id 转换为 Set，便于后续检查是否存在
        const dbGroupIds = new Set(Object.keys(ALL_DBdata).map(groupIdStr => groupIdStr.split(':')[0]))

        // 配置文件中的 group_id 转换为对象数组，每个对象包含群号和机器人账号
        const configGroupIdObjs = item.group_id.map(groupIdStr => {
          const [groupId, robotId] = groupIdStr.split(':')
          return { groupId: Number(groupId), robotId }
        })

        // 找出新添加的群组ID
        const newGroupIds = configGroupIdObjs.filter(groupIdObj => !dbGroupIds.has(groupIdObj.groupId))

        if (dynamic_list.data.items.length > 0) {
          // 遍历接口返回的视频列表
          for (const dynamic of dynamic_list.data.items) {
            const now = new Date().getTime()
            const createTime = parseInt(dynamic.modules.module_author.pub_ts, 10) * 1000
            const timeDifference = (now - createTime) / 1000 // 时间差，单位秒

            const is_top = dynamic.modules.module_tag?.text === '置顶' // 是否为置顶
            let shouldPush = false // 是否列入推送数组
            // let shouldBreak = false // 是否跳出循环
            let exitTry = false // 是否退出 try 块
            if (is_top || (newGroupIds.length > 0 && timeDifference < 86400)) {
              shouldPush = true
            }
            // 如果 置顶视频的 aweme_id 不在数据库中，或者视频是新发布的（1天内），则 push 到 willbepushlist
            if ((newGroupIds.length > 0 && timeDifference < 86400) || shouldPush || timeDifference < 86400) {
              // 确保 willbepushlist[aweme.aweme_id] 是一个对象
              if (!willbepushlist[dynamic.id_str]) {
                willbepushlist[dynamic.id_str] = {
                  remark: item.remark,
                  host_mid: item.host_mid,
                  create_time: dynamic.modules.module_author.pub_ts,
                  group_id: newGroupIds.map(groupIdObj => `${groupIdObj.groupId}:${groupIdObj.robotId}`),
                  Dynamic_Data: dynamic, // 存储 dynamic 对象
                  avatar_img: dynamic.modules.module_author.face,
                  dynamic_type: dynamic.type
                }
              }
              // willbepushlist[dynamic.id_str].group_id = newGroupIds.length > 0 ? [...newGroupIds] : [...item.group_id] // item.group_id 为配置文件的 group_id
            }
          }
        } else {
          throw new Error(`「${item.remark}」的动态列表数量为零！`)
        }
      }
    } catch (error) {
      logger.error(error)
    }

    const DBdata = await DB.FindAll('bilibili')
    // 这里是强制数组的第一个对象中的内容 DBdata[0]?.data 因为调用这个函数的上层有遍历群组逻辑
    // DBdata[0]?.data 则是当前群组的推送用户数据
    return { willbepushlist, DBdata }
  }

  /**
   * 设置或更新特定 host_mid 的群组信息。
   * @param {Object} data 包含 card 对象。
   * @returns {Promise<string>} 操作成功或失败的消息字符串。
   */
  async setting (data) {
    let msg
    const host_mid = data.data.card.mid
    const config = YAML.parse(fs.readFileSync(Version.pluginPath + '/config/config/pushlist.yaml', 'utf8')) // 读取配置文件
    const group_id = this.e.group_id

    // 初始化或确保 bilibilipushlist 数组存在
    if (!config.bilibili) {
      config.bilibili = []
    }

    // 检查是否存在相同的 host_mid
    const existingItem = config.bilibili.find((item) => item.host_mid === host_mid)

    if (existingItem) {
      // 如果已经存在相同的 host_mid ，则检查是否存在相同的 group_id
      let has = false
      let groupIndexToRemove = -1 // 用于记录要删除的 group_id 对象的索引
      for (let index = 0; index < existingItem.group_id.length; index++) {
        // 分割每个对象的 id 属性，并获取第一部分
        const item = existingItem.group_id[index]
        const existingGroupId = item.split(':')[0]

        // 检查分割后的第一部分是否与提供的 group_id 相同
        if (existingGroupId === String(group_id)) {
          has = true
          groupIndexToRemove = index
          break // 找到匹配项后退出循环
        }
      }
      if (has) {
        // 如果已存在相同的 group_id，则删除它
        existingItem.group_id.splice(groupIndexToRemove, 1)
        logger.info(`\n删除成功！${data.data.card.name}\nUID：${host_mid}`)
        msg = `群：${group_id}\n删除成功！${data.data.card.name}\nUID：${host_mid}`
      } else {
        const status = await DB.FindGroup('bilibili', `${group_id}:${this.e.self_id}`)
        if (!status) {
          await DB.CreateSheet('bilibili', `${group_id}:${this.e.self_id}`, {}, this.e.self_id)
        }
        // 否则，将新的 group_id 添加到该 host_mid 对应的数组中
        existingItem.group_id.push(`${group_id}:${this.e.self_id}`)
        msg = `群：${group_id}\n添加成功！${data.data.card.name}\nUID：${host_mid}`
        logger.info(`\n设置成功！${data.data.card.name}\nUID：${host_mid}`)
      }
    } else {
      const status = await DB.FindGroup('bilibili', `${group_id}:${this.e.self_id}`)
      if (!status) {
        await DB.CreateSheet('bilibili', `${group_id}:${this.e.self_id}`, {}, this.e.self_id)
      }
      // 不存在相同的 host_mid，新增一个配置项
      config.bilibili.push({ host_mid, group_id: [`${group_id}:${this.e.self_id}`], remark: data.data.card.name })
      msg = `群：${group_id}\n添加成功！${data.data.card.name}\nUID：${host_mid}`
    }

    // 更新配置文件
    Config.modify('pushlist', 'bilibili', config.bilibili)
    return msg
  }

  /**
   * 将时间戳转换为日期时间字符串
   * @param {number} timestamp - 表示秒数的时间戳
   * @returns {string} 格式为YYYY-MM-DD HH:MM的日期时间字符串
   */
  convertTimestampToDateTime (timestamp) {
    // 创建一个Date对象，时间戳乘以1000是为了转换为毫秒
    const date = new Date(timestamp * 1000)
    const year = date.getFullYear() // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0') // 获取月份，确保两位数显示
    const day = String(date.getDate()).padStart(2, '0') // 获取日，确保两位数显示
    const hours = String(date.getHours()).padStart(2, '0') // 获取小时，确保两位数显示
    const minutes = String(date.getMinutes()).padStart(2, '0') // 获取分钟，确保两位数显示

    // 返回格式化后的日期时间字符串
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  /**
   * 获取当前时间，并格式化为年-月-日 时:分:秒的字符串形式
   * 参数：无
   * 返回值：格式化后的时间字符串，例如"2023-03-15 12:30:45"
   */
  getCurrentTime () {
    // 创建一个Date对象以获取当前时间
    const now = new Date()
    // 获取年、月、日、时、分、秒
    const year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()
    let hour = now.getHours()
    let minute = now.getMinutes()
    let second = now.getSeconds()
    // 对月、日、时、分、秒进行两位数格式化
    month = month < 10 ? '0' + month : month
    day = day < 10 ? '0' + day : day
    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second
    // 拼接时间为字符串，并返回
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  }

  findMismatchedDynamicIds (inputData) {
    if (!inputData.DBdata) return inputData.willbepushlist
    const willbepushByGroupId = {}
    for (const dynamicId in inputData.willbepushlist) {
      inputData.willbepushlist[dynamicId].group_id.forEach((groupId) => {
        if (!willbepushByGroupId[groupId]) {
          willbepushByGroupId[groupId] = []
        }
        willbepushByGroupId[groupId].push(dynamicId)
      })
    }

    // 遍历 DBdata，找出存在于 willbepushByGroupId 中的 group_id
    for (const groupId in inputData.DBdata) {
      if (willbepushByGroupId[groupId]) {
        // 遍历每个 group_id 下的 host_mid
        for (const host_mid in inputData.DBdata[groupId]) {
          // 检查 dynamic_idlist 中的每个 dynamic_id
          inputData.DBdata[groupId][host_mid].dynamic_idlist.forEach((dynamicId) => {
            // 如果 dynamic_id 存在于 willbepushByGroupId[groupId] 中
            if (willbepushByGroupId[groupId].includes(dynamicId)) {
              // 移除 willbepushlist 中对应的视频对象
              delete inputData.willbepushlist[dynamicId]
            }
          })
        }
      }
    }

    return inputData.willbepushlist
  }

  /**
   * 检查并更新配置文件中指定用户的备注信息。
   * 该函数会遍历配置文件中的用户列表，对于没有备注或备注为空的用户，会从外部数据源获取其备注信息，并更新到配置文件中。
   *
   */
  async checkremark () {
    // 读取配置文件内容
    const config = YAML.parse(fs.readFileSync(Version.pluginPath + '/config/config/pushlist.yaml', 'utf8'))
    const abclist = []
    if (Config.pushlist.bilibili === null || Config.pushlist.bilibili.length === 0) return true
    // 遍历配置文件中的用户列表，收集需要更新备注信息的用户
    for (let i = 0; i < Config.pushlist.bilibili.length; i++) {
      const remark = Config.pushlist.bilibili[i].remark
      const group_id = Config.pushlist.bilibili[i].group_id
      const host_mid = Config.pushlist.bilibili[i].host_mid

      if (remark == undefined || remark === '') {
        abclist.push({ host_mid, group_id })
      }
    }

    // 如果有需要更新备注的用户，则逐个获取备注信息并更新到配置文件中
    if (abclist.length > 0) {
      for (let i = 0; i < abclist.length; i++) {
        // 从外部数据源获取用户备注信息
        const resp = await new Bilidata('用户名片信息').GetData({ host_mid: abclist[i].host_mid })
        const remark = resp.data.card.name
        // 在配置文件中找到对应的用户，并更新其备注信息
        const matchingItemIndex = config.bilibili.findIndex((item) => item.host_mid === abclist[i].host_mid)
        if (matchingItemIndex !== -1) {
          config.bilibili[matchingItemIndex].remark = remark
        }
      }
      // 将更新后的配置文件内容写回文件
      Config.modify('pushlist', 'bilibili', config.bilibili)
    }
  }

  async forcepush (data) {
    for (const detail in data) {
      data[detail].group_id = [...[`${this.e.group_id}:${this.e.self_id}`]]
    }
    await this.getdata(data)
  }
}

/**
 * 将换行符替换为HTML的<br>标签。
 * @param {string} data 需要进行换行符替换的字符串。
 * @returns {string} 替换后的字符串，其中的换行符\n被<br>替换。
 */
function br (data) {
  // 使用正则表达式将所有换行符替换为<br>
  return (data = data.replace(/\n/g, '<br>'))
}

/**
 * 检查成员是否为VIP，并根据VIP状态改变其显示颜色。
 * @param {Object} member - 成员对象，需要包含vip属性，该属性应包含vipStatus和nickname_color（可选）。
 * @returns {String} 返回成员名称的HTML标签字符串，VIP成员将显示为特定颜色，非VIP成员显示为默认颜色。
 */
function checkvip (member) {
  // 根据VIP状态选择不同的颜色显示成员名称
  return member.vip.vipStatus === 1
    ? `<span style="color: ${member.vip.nickname_color || '#FB7299'}; font-weight: bold;">${member.name}</span>`
    : `<span style="color: #606060">${member.name}</span>`
}

/**
 * 处理并提取表情数据，返回一个包含表情名称和URL的对象数组。
 * @param {Array} data - 表情数据的数组，每个元素包含一个表情包的信息。
 * @returns {Array} 返回一个对象数组，每个对象包含text(表情名称)和url(表情图片地址)属性。
 */
function extractEmojisData (data) {
  const emojisData = []

  // 遍历data数组中的每个表情包
  data.forEach((packages) => {
    // 遍历每个表情包中的每个表情
    packages.emote.forEach((emote) => {
      try {
        // 尝试将表情的URL转换为URL对象，如果成功则将其添加到emojisData数组中
        // new URL(emote.url)
        emojisData.push({ text: emote.text, url: emote.url })
      } catch { } // 如果URL无效，则忽略该表情
    })
  })

  return emojisData
}

function replacetext (text, obj) {
  for (const tag of obj.modules.module_dynamic.desc.rich_text_nodes) {
    // 对正则表达式中的特殊字符进行转义
    const escapedText = tag.orig_text.replace(/([.*+?^${}()|[\]\\])/g, '\\$1').replace(/\n/g, '\\n')
    const regex = new RegExp(escapedText, 'g')
    switch (tag.type) {
      case 'RICH_TEXT_NODE_TYPE_TOPIC':
      case 'RICH_TEXT_NODE_TYPE_AT': {
        text = text.replace(regex, `<span style="color: #0C6692;">${tag.orig_text}</span>`)
        break
      }
      case 'RICH_TEXT_NODE_TYPE_LOTTERY': {
        text = text.replace(regex, `<span style="color: #0C6692;"><svg style="width: 65px;height: 65px;margin: 0 -15px -12px 0;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20" width="20" height="20"><path d="M3.7499750000000005 9.732083333333334C4.095158333333333 9.732083333333334 4.374975 10.011875000000002 4.374975 10.357083333333334L4.374975 15.357083333333334C4.374975 15.899458333333335 4.8147 16.339166666666667 5.357116666666667 16.339166666666667L14.642833333333334 16.339166666666667C15.185250000000002 16.339166666666667 15.625 15.899458333333335 15.625 15.357083333333334L15.625 10.357083333333334C15.625 10.011875000000002 15.904791666666668 9.732083333333334 16.25 9.732083333333334C16.595166666666668 9.732083333333334 16.875 10.011875000000002 16.875 10.357083333333334L16.875 15.357083333333334C16.875 16.589833333333335 15.875625000000001 17.589166666666667 14.642833333333334 17.589166666666667L5.357116666666667 17.589166666666667C4.124341666666667 17.589166666666667 3.124975 16.589833333333335 3.124975 15.357083333333334L3.124975 10.357083333333334C3.124975 10.011875000000002 3.4048 9.732083333333334 3.7499750000000005 9.732083333333334z" fill="currentColor"></path><path d="M2.4106916666666667 7.3214250000000005C2.4106916666666667 6.384516666666666 3.1702083333333335 5.625 4.107116666666667 5.625L15.892833333333334 5.625C16.82975 5.625 17.58925 6.384516666666666 17.58925 7.3214250000000005L17.58925 8.917583333333335C17.58925 9.74225 16.987583333333337 10.467208333333334 16.13125 10.554C15.073666666666668 10.661208333333335 13.087708333333333 10.803583333333334 10 10.803583333333334C6.912275 10.803583333333334 4.9263 10.661208333333335 3.8687250000000004 10.554C3.0123833333333336 10.467208333333334 2.4106916666666667 9.74225 2.4106916666666667 8.917583333333335L2.4106916666666667 7.3214250000000005zM4.107116666666667 6.875C3.8605666666666667 6.875 3.6606916666666667 7.0748750000000005 3.6606916666666667 7.3214250000000005L3.6606916666666667 8.917583333333335C3.6606916666666667 9.135250000000001 3.8040833333333333 9.291041666666667 3.9947583333333334 9.310375C5.0068 9.412958333333334 6.950525000000001 9.553583333333334 10 9.553583333333334C13.049458333333334 9.553583333333334 14.993166666666669 9.412958333333334 16.005166666666668 9.310375C16.195875 9.291041666666667 16.33925 9.135250000000001 16.33925 8.917583333333335L16.33925 7.3214250000000005C16.33925 7.0748750000000005 16.139375 6.875 15.892833333333334 6.875L4.107116666666667 6.875z" fill="currentColor"></path><path d="M5.446408333333333 4.464341666666667C5.446408333333333 3.1329416666666665 6.525716666666667 2.0536333333333334 7.857116666666667 2.0536333333333334C9.188541666666666 2.0536333333333334 10.267833333333334 3.1329416666666665 10.267833333333334 4.464341666666667L10.267833333333334 6.875058333333333L7.857116666666667 6.875058333333333C6.525716666666667 6.875058333333333 5.446408333333333 5.795741666666666 5.446408333333333 4.464341666666667zM7.857116666666667 3.3036333333333334C7.216075000000001 3.3036333333333334 6.696408333333334 3.8233 6.696408333333334 4.464341666666667C6.696408333333334 5.105391666666667 7.216075000000001 5.6250583333333335 7.857116666666667 5.6250583333333335L9.017833333333334 5.6250583333333335L9.017833333333334 4.464341666666667C9.017833333333334 3.8233 8.498166666666668 3.3036333333333334 7.857116666666667 3.3036333333333334z" fill="currentColor"></path><path d="M9.732083333333334 4.464341666666667C9.732083333333334 3.1329416666666665 10.811416666666666 2.0536333333333334 12.142833333333334 2.0536333333333334C13.474250000000001 2.0536333333333334 14.553583333333336 3.1329416666666665 14.553583333333336 4.464341666666667C14.553583333333336 5.795741666666666 13.474250000000001 6.875058333333333 12.142833333333334 6.875058333333333L9.732083333333334 6.875058333333333L9.732083333333334 4.464341666666667zM12.142833333333334 3.3036333333333334C11.501791666666666 3.3036333333333334 10.982083333333334 3.8233 10.982083333333334 4.464341666666667L10.982083333333334 5.6250583333333335L12.142833333333334 5.6250583333333335C12.783875 5.6250583333333335 13.303583333333334 5.105391666666667 13.303583333333334 4.464341666666667C13.303583333333334 3.8233 12.783875 3.3036333333333334 12.142833333333334 3.3036333333333334z" fill="currentColor"></path><path d="M10 4.732058333333334C10.345166666666666 4.732058333333334 10.625 5.011875 10.625 5.357058333333334L10.625 16.428500000000003C10.625 16.773666666666667 10.345166666666666 17.053500000000003 10 17.053500000000003C9.654791666666668 17.053500000000003 9.375 16.773666666666667 9.375 16.428500000000003L9.375 5.357058333333334C9.375 5.011875 9.654791666666668 4.732058333333334 10 4.732058333333334z" fill="currentColor"></path></svg> ${tag.orig_text}</span>`)
        break
      }
      case 'RICH_TEXT_NODE_TYPE_WEB': {
        text = text.replace(regex, `<span style="color: #0C6692;"><svg style="width: 60px;height: 60px;margin: 0 -15px -12px 0;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20" width="20" height="20"><path d="M9.571416666666666 7.6439C9.721125 7.33675 10.091416666666667 7.209108333333334 10.398583333333335 7.358808333333333C10.896041666666667 7.540316666666667 11.366333333333333 7.832000000000001 11.767333333333333 8.232975C13.475833333333334 9.941541666666668 13.475833333333334 12.711625 11.767333333333333 14.420166666666669L9.704916666666666 16.482583333333334C7.996383333333334 18.191125000000003 5.226283333333334 18.191125000000003 3.5177416666666668 16.482583333333334C1.8091916666666668 14.774041666666669 1.8091916666666668 12.003916666666667 3.5177416666666668 10.295375L5.008791666666667 8.804333333333334C5.252875 8.56025 5.6486 8.56025 5.892683333333334 8.804333333333334C6.136758333333334 9.048416666666668 6.136758333333334 9.444125000000001 5.892683333333334 9.688208333333334L4.401625 11.179250000000001C3.1812333333333336 12.399666666666667 3.1812333333333336 14.378291666666668 4.401625 15.598708333333335C5.622000000000001 16.819083333333335 7.60065 16.819083333333335 8.821041666666668 15.598708333333335L10.883416666666667 13.536291666666667C12.103833333333334 12.315916666666666 12.103833333333334 10.337250000000001 10.883416666666667 9.116875C10.582458333333333 8.815875 10.229416666666667 8.600908333333333 9.856458333333334 8.471066666666667C9.549333333333333 8.321375 9.421708333333335 7.9510499999999995 9.571416666666666 7.6439z" fill="currentColor"></path><path d="M15.597541666666668 4.402641666666667C14.377166666666668 3.1822500000000002 12.398541666666667 3.1822500000000002 11.178125000000001 4.402641666666667L9.11575 6.465033333333333C7.895358333333333 7.685425 7.895358333333333 9.664041666666668 9.11575 10.884458333333333C9.397666666666668 11.166375 9.725916666666667 11.371583333333334 10.073083333333333 11.500958333333333C10.376583333333334 11.658083333333334 10.495291666666667 12.031416666666667 10.338208333333332 12.334875C10.181083333333333 12.638375 9.80775 12.757083333333334 9.504291666666667 12.6C9.042416666666666 12.420333333333334 8.606383333333333 12.142833333333334 8.231858333333333 11.768333333333334C6.523316666666667 10.059791666666667 6.523316666666667 7.289691666666666 8.231858333333333 5.58115L10.29425 3.5187583333333334C12.002791666666667 1.8102083333333334 14.772875 1.8102083333333334 16.481458333333336 3.5187583333333334C18.19 5.2273000000000005 18.19 7.997400000000001 16.481458333333336 9.705916666666667L15.054916666666667 11.132458333333334C14.810875000000001 11.3765 14.415166666666668 11.3765 14.171041666666667 11.132458333333334C13.927 10.888333333333334 13.927 10.492625 14.171041666666667 10.248541666666666L15.597541666666668 8.822041666666667C16.81791666666667 7.601666666666667 16.81791666666667 5.623025 15.597541666666668 4.402641666666667z" fill="currentColor"></path></svg> ${tag.text}</span>`)
        break
      }
      case 'RICH_TEXT_NODE_TYPE_EMOJI': {
        const regex = new RegExp(tag.orig_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        text = text.replace(regex, `<img src='${tag.emoji.icon_url}' style='height: 60px; margin: 0 0 -10px 0;'>`)
        break
      }
    }
  }
  return text
}

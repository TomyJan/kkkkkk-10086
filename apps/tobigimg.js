import plugin from '../../../lib/plugins/plugin.js'
import ArkMsg from "../../xiaofei-plugin/model/ArkMsg.js"
import fs from "fs"
import parseImageFileParam from "oicq"
export class example extends plugin {
    constructor () {
      super({
        name: '大图',
        dsc: '简单开发示例',
        /* oicq文档：https://oicqjs.github.io/oicq/#events */
        event: 'message',
        priority: 50,
        rule: [
          {
            reg: '^7$',
            fnc: 'douy'
          }
  ]})}
  async douy(e) {
    let imglocal = ('D:/GitHub/Yunzai-Bot/Yunzai-Bot/plugins/example/01.jpg')
    let json = {
        "actionData": "",
        "actionData_A" :"",
        "app": "com.tencent.imagetextbot",
        "appID": "",
        "config": {
            "ctime": 0,
            "menuMode": 0,
            "showSender": 0,
            "token": 0,
            "type": "normal"
        },
        "desc": "",
        "extra": {},
        "meta": {
            "robot": {
                "cover": "https://p9-pc-sign.douyinpic.com/tos-cn-i-0813c001/05fec3e2d8044e2bae10bdbaac884465~tplv-dy-aweme-images:q75.webp?x-expires=1679583600&x-signature=zhd20dLYPOL8lwTx6BLIQOZVcrk%3D&from=3213915784&s=PackSourceEnum_AWEME_DETAIL&se=false&biz_tag=aweme_images&l=202303092310500922A0992AD3E4329236",
                "jump_url": "",
                "subtitle": "",
                "title":{
                    "qq":0,
                    "type":"at"
                    }
            }
        },
        "prompt": '',
        "sourceAd":"",
        "sourceName":"",
        "sourceUrl":"",
        "text":"",
        "ver":"1.0.0.11",
        "view":"index"
    }
    let img = await parseImageFileParam(img)
    json.meta.robot.cover = img;
    await this.e.reply(await ArkMsg.Share(JSON.stringify(json), e))
    //console.log(json)
}}
// 定义一个函数，来生成一个只有图片的json数据
function ShareImage_JSON(e, preview, src) {
    let json = {
        "actionData": "",
        "actionData_A" :"",
        "app": "com.tencent.imagetextbot",
        "appID": "",
        "config": {
            "ctime": 0,
            "menuMode": 0,
            "showSender": 0,
            "token": 0,
            "type": "normal"
        },
        "desc": "",
        "extra": {},
        "meta": {
            "robot": {
                "cover": "https://p9-pc-sign.douyinpic.com/tos-cn-i-0813c001/05fec3e2d8044e2bae10bdbaac884465~tplv-dy-aweme-images:q75.webp?x-expires=1679583600&x-signature=zhd20dLYPOL8lwTx6BLIQOZVcrk%3D&from=3213915784&s=PackSourceEnum_AWEME_DETAIL&se=false&biz_tag=aweme_images&l=202303092310500922A0992AD3E4329236",
                "jump_url": "",
                "subtitle": "",
                "title":{
                    "qq":0,
                    "type":"at"
                    }
            }
        },
        "prompt": '',
        "sourceAd":"",
        "sourceName":"",
        "sourceUrl":"",
        "text":"",
        "ver":"1.0.0.11",
        "view":"index"
    }
    json.meta.detail.iconLeft.push({
        url: preview
    });
    json.meta.detail.iconRight.push({
        url: src
    });
    return { data: json };
}


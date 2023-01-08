import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import uploadRecord from '../yenai-plugin/model/uploadRecord.js';
const dz = {
  "阿巴": "1",
  "阿妈": "2",
  "阿姐": "3",
  "木": "4",
  "怒目": "5",
  "阿可": "6",
  "波波": "7",
  "阿休": "8",
  "阿捏": "9",
  "阿夜": "10",
  "阿秀": "11",
  "那鸡": "12",
  "煞": "13",
  "妮码": "14",
  "拿瓦": "15",
  "秃发": "16",
  "炸": "17",
  "老阔": "18",
  "破": "19",
  "手": "20",
  "脚": "21",
  "肚子": "22",
  "拉巴": "23",
  "公巴": "24",
  /*"": "25",
  "": "26",
  "": "27",
  "": "28",*/
  "我": "29",
  "测": "30",
  "你们": "31",
  "码": "32",
  "当他需要一个鼓励": "33",
  "我会笑着说": "34",
  "来": "35",
  "我测你们码": "36",
  "没开口他们": "37",
  "会笑着对我": "38",
  "测不出来": "39",
  "你好我是顶真": "40",
  "雪豹闭嘴": "41",
  "你是讨口子": "42",
  "你太拽了": "43",
  "你像葫芦侠": "44",
  "你这辈子找": "45",
  "我跟你说": "46",
  "我必收拾你": "47",
  "我天不怕地": "48",
  "只怕阿妈": "49",
  "不能说藏话": "50",
  "好我知道了": "51",
  "在教我做": "52",
  "对": "53",
  "我是顶真": "54",
  "OK": "55",
  "等一下": "56",
  "我跟蛇": "57",
  "你好": "58",
  "你想不想抽": "59",
  "我觉得你需要": "60",
  "悦克5代": "61",
  "我要过肺": "62",
  "我还要回龙": "63",
  "扎西德勒": "64",
  "吉祥如意": "65",
  "秋蝶某": "66",
  "就是你好的": "67",
  "在山里": "68",
  "麻麻生": "69",
  "四川省": "70",
  /*"": "71",
  "": "72",
  "": "73",
  "": "74",*/
  "雪豹闭嘴": "75",
  "不要坏了我的好事": "76",
  "到时候回家": "77",
  "我让阿妈打": "78",
  "在山里我能": "79",
  "雪豹叫": "80",
  "芝士雪豹": "81",
  "舍利叫": "82",
  "芝士舍利": "83",
  "狐狸叫": "84",
  "芝士狐狸": "85",
  "土拨鼠叫": "86",
  "芝士土拨鼠  ": "87",
  "章子叫": "88",
  "芝士章子": "89",
  "绵阳叫": "90",
  "芝士绵阳": "91",
  // "": "92",
  "芝士": "93",
  "我测你们码": "94",
  // "": "95",
  "芝士": "96",
  "讨口子": "97",
  "芝士我的个": "98",
  "音乐": "99",
}
const dz2 = {
  "最长的测码": "01",
  "醉赤壁": "02",
}

const jireg = new RegExp(`^(${Object.keys(dz).join("|")})$`)
const jireg2 = new RegExp(`^(${Object.keys(dz2).join("|")})$`)
export class example extends plugin {
  constructor() {
    super({
      name: '丁真盒',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: jireg,
          fnc: 'dingzhen'
        },
        {
          reg: jireg2,
          fnc: 'dingzhen2'
        },
        {
          reg: "^丁真盒$",
          fnc: 'help'
        }
      ]

    })
  }


  async dingzhen(e) {
    e.reply(await uploadRecord(`http://jilehe.125ks.cn/Voice/dzh/res/${encodeURIComponent(dz[e.msg])}.mp3`, 0, false))
  }
  async dingzhen2(e) {
    e.reply(await uploadRecord(`E:/Yunzai-Bot/plugins/kkkkkk-10086/resources/鸡音盒/${encodeURIComponent(dz2[e.msg])}.mp3`, 0, false))
  }

  async help(e) {
    e.reply(Object.keys({...dz,...dz2}).join("，"))
  }
}


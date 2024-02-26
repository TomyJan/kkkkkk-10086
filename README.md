# kkkkkk-10086

一个[Miao-Yunzai](https://github.com/yoimiya-kokomi/Miao-Yunzai)的自用辅助插件

###### 没学过，全靠 cv

群：[795874649](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=S8y6baEcSkO6TEO5kEdfgmJhz79Oxdw5&authKey=ficWQytHGz3KIv5i0HpGbEeMBpABBXfjEMYRzo3ZwMV%2B0Y5mq8cC0Yxbczfa904H&noverify=0&group_code=795874649)

## 安装

### Yunzai-Bot 或 Miao-Yunzai 根目录下打开 CMD 执行：

```sh
# 使用 Gitee
git clone --depth=1 https://gitee.com/ikenxuan/kkkkkk-10086.git ./plugins/kkkkkk-10086/

# 使用 GitHub
git clone --depth=1 https://github.com/ikenxuan/kkkkkk-10086.git ./plugins/kkkkkk-10086/

# 使用ghproxy
git clone --depth=1 https://mirror.ghproxy.com/https://github.com/ikenxuan/kkkkkk-10086.git ./plugins/kkkkkk-10086/
```

```sh
# 安装依赖 任选一个
yarn --production
pnpm install -P
npm install --production
```

TRSS-Yunzai 还未测试

## 功能(其实就一个)

### 抖音作品解析

**抖音**使用官方接口，解析视频并渲染评论图片返回

- #?kkk 设置
- #kkk 设置视频解析(开启|关闭)
- #kkk 设置默认视频解析(开启|关闭)
- #kkk 设置缓存删除(开启|关闭)

使用前需要配置抖音 cookie，使用 [#kkk 设置抖音 ck] 查看教程

### 建议使用[锅巴后台](https://gitee.com/guoba-yunzai/guoba-plugin)修改配置文件或 手动修改(不建议)

配置文件路径：

```sh
# 初次使用自动创建
/plugins/kkkkkk-10086/config/config.json
```

## TODO

- [ ] 重构

## 参考

- https://gitee.com/xfdown/xiaofei-plugin

- https://github.com/ikechan8370/chatgpt-plugin

- https://github.com/B1gM8c/X-Bogus

- https://gitee.com/kyrzy0416/rconsole-plugin

- https://gitee.com/think-first-sxs/reset-qianyu-plugin

## 友情链接

- Yunzai-Bot (V3): [☞GitHub](https://github.com/yoimiya-kokomi/Miao-Yunzai) | [☞Gitee](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)
- Yunzai-Bot 插件库 [☞Github](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) | [☞Gitee](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index)

import { Amagi, getBilibiliData } from './index.js'
const client = new Amagi({
  douyin: '',
  bilibili: ''
}).initServer(true)
await client.startClient(client.Instance, 4567)
const douyinData = await client.getDouyinData('官方emoji数据')
const bilibiliData = await getBilibiliData('emoji数据')
console.log({ douyinData, bilibiliData })
if (douyinData && bilibiliData) {
  client.Instance.close()
  process.exit(0)
}
else {
  process.exit(1)
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLE1BQU0sR0FBRyxDQUFBO0FBRTFDLE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDO0lBQ3ZCLE1BQU0sRUFBRSxFQUFFO0lBQ1YsUUFBUSxFQUFFLEVBQUU7Q0FDYixDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBRS9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMxRCxNQUFNLFlBQVksR0FBRyxNQUFNLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUVyRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUE7QUFFekMsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFLENBQUM7SUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUM7S0FBTSxDQUFDO0lBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDIn0=
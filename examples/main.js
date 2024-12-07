console.log(ZGC)
const ZrenderGeoConverter = ZGC.ZrenderGeoConverter
// 创建一个用于显示坐标的 DOM 元素
const coordDisplay = document.createElement('div')
coordDisplay.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 4px;'
document.body.appendChild(coordDisplay)

// 初始化转换器和地图
const container = document.getElementById('container')
const zr = zrender.init(container)

// 示例边界点坐标
const boundaryPoints = [
  [117.06253857125165, 39.09863340023474],
  [117.06288621978578, 39.09863340023474],
  [117.06288621978578, 39.098903196343855],
  [117.06253857125165, 39.098903196343855],
  [117.06253857125165, 39.09863340023474],
]

// 创建转换器
const converter = new ZrenderGeoConverter(container, boundaryPoints)

// 绘制边界多边形
const points = boundaryPoints.map(point =>
  converter.toZrenderCoord(point[0], point[1]),
)

const polygon = new zrender.Polygon({
  shape: { points },
  style: {
    fill: 'rgba(220, 20, 60, 0.4)',
    stroke: '#DC143C',
    lineWidth: 2,
  },
})
zr.add(polygon)

// 添���坐标转换演示点
let demoPoint = null

// 监听鼠标移动事件
zr.on('mousemove', (e) => {
  const screenX = Math.round(e.offsetX)
  const screenY = Math.round(e.offsetY)
  const [lng, lat] = converter.eventToWgs84Coord(e)

  // 更新坐标显示
  coordDisplay.innerHTML = `
    屏幕坐标: (${screenX}, ${screenY})<br>
    经纬度: (${lng.toFixed(6)}, ${lat.toFixed(6)})
  `
})

// 点击添加标记点
zr.on('click', (e) => {
  const [lng, lat] = converter.eventToWgs84Coord(e)
  const [x, y] = converter.toZrenderCoord(lng, lat)

  // 移除之前的点
  if (demoPoint)
    zr.remove(demoPoint)

  // 添加新点
  demoPoint = new zrender.Circle({
    shape: {
      cx: x,
      cy: y,
      r: 5,
    },
    style: {
      fill: '#1890ff',
      stroke: '#fff',
      lineWidth: 2,
    },
  })

  // 添加标签
  const text = new zrender.Text({
    style: {
      text: `经度: ${lng.toFixed(6)}\n纬度: ${lat.toFixed(6)}`,
      x: x + 10,
      y: y - 20,
      fontSize: 12,
      fill: '#333',
    },
  })

  zr.add(demoPoint)
  zr.add(text)
})

// 添加绘制指定经纬度点的函数
function drawPointByCoordinate(lng, lat) {
  const [x, y] = converter.toZrenderCoord(lng, lat)

  // 创建点
  const point = new zrender.Circle({
    shape: {
      cx: x,
      cy: y,
      r: 5,
    },
    style: {
      fill: '#1890ff',
      stroke: '#fff',
      lineWidth: 2,
    },
  })

  // 创建标签
  const text = new zrender.Text({
    style: {
      text: `经度: ${lng.toFixed(6)}\n纬度: ${lat.toFixed(6)}`,
      x: x + 10,
      y: y - 20,
      fontSize: 12,
      fill: '#333',
    },
  })

  zr.add(point)
  zr.add(text)

  return { point, text } // 返回点和文本对象，方便后续需要删除时使用
}

// 使用示例：
drawPointByCoordinate(117.062732180068, 39.098744938701046)

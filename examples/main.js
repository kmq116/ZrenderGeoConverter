console.log(ZGC)
const ZrenderGeoConverter = ZGC.ZrenderGeoConverter
// 示例 GeoJSON 数据（这里使用一个简单的多边形）
const container = document.getElementById('container')
const zr = zrender.init(container)

// 边界点坐标
const boundaryPoints = [
  [
    113.62080877953491,
    23.59105955273317,
  ],
  [
    113.6206257816226,
    23.590995209181585,
  ],
  [
    113.62072960492719,
    23.590919913496734,
  ],
  [
    113.62089915809486,
    23.590963037394033,
  ],
  [
    113.62092978223495,
    23.591042440089254,
  ],
  [
    113.62093874539875,
    23.591117051198495,
  ],
  [
    113.62080877953491,
    23.59105955273317,
  ],
]

// 创建Zrender地理坐标转换器
this.converter = new ZrenderGeoConverter(container, boundaryPoints)

// 绘制多边形
const points = boundaryPoints.map(point =>
  this.converter.toZrenderCoord(point[0], point[1]),
)
console.log({ points })

const polygon = new zrender.Polygon({
  shape: { points },
  style: {
    fill: 'rgba(220, 20, 60, 0.4)',
    stroke: '#DC143C',
    lineWidth: 2,
  },
})
zr.add(polygon)

// 监听鼠标移动事件
zr.on('mousemove', (e) => {
  this.screenX = Math.round(e.offsetX)
  this.screenY = Math.round(e.offsetY);
  // 使用事件对象直接转换坐标
  [this.lng, this.lat] = this.converter.eventToWgs84Coord(e)
})

// 监听点击事件示例
zr.on('click', (e) => {
  const [lng, lat] = this.converter.eventToWgs84Coord(e)
  console.log('点击位置经纬度:', lng, lat)

  // 在点击位置添加一个点
  const [x, y] = this.converter.toZrenderCoord(lng, lat)
  const point = new zrender.Circle({
    shape: {
      cx: x,
      cy: y,
      r: 5,
    },
    style: {
      fill: 'blue',
    },
  })
  zr.add(point)
})

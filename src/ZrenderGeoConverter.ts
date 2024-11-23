import * as turf from '@turf/turf'

/**
 * Zrender地理坐标转换工具
 * 用于将WGS84地理坐标转换为Zrender屏幕坐标，或反向转换
 */
export class ZrenderGeoConverter {
  private container: HTMLElement
  private containerSize: { width: number, height: number }
  private bounds!: { minX: number, maxX: number, minY: number, maxY: number }
  private options: { padding: number }

  /**
   * @param {HTMLElement} container - DOM容器元素
   * @param {Array<Array<number>>} boundaryPoints - 边界点的经纬度坐标数组 [[lng, lat], ...]
   * @param {object} options - 配置项
   * @param {number} options.padding - 边界填充比例，默认0
   */
  constructor(
    container: HTMLElement,
    boundaryPoints: [number, number][],
    options: { padding?: number } = {},
  ) {
    this.container = container
    this.containerSize = {
      width: container.clientWidth,
      height: container.clientHeight,
    }

    // 初始化边界
    this.initBounds(boundaryPoints)

    // 配置项
    this.options = {
      padding: 0,
      ...options,
    }

    // 应用padding
    if (this.options.padding) {
      const rangeX = this.bounds.maxX - this.bounds.minX
      const rangeY = this.bounds.maxY - this.bounds.minY
      this.bounds.minX -= rangeX * this.options.padding
      this.bounds.maxX += rangeX * this.options.padding
      this.bounds.minY -= rangeY * this.options.padding
      this.bounds.maxY += rangeY * this.options.padding
    }
  }

  /**
   * 初始化边界范围
   * @private
   */
  initBounds(geoPoints: [number, number][]) {
    // 转换为墨卡托投影
    const polygon = turf.polygon([geoPoints])
    const mercatorPolygon = turf.toMercator(polygon)
    const mercatorPoints = mercatorPolygon.geometry.coordinates[0]

    // 计算边界
    this.bounds = {
      minX: Math.min(...mercatorPoints.map((p: number[]) => p[0])),
      maxX: Math.max(...mercatorPoints.map((p: number[]) => p[0])),
      minY: Math.min(...mercatorPoints.map((p: number[]) => p[1])),
      maxY: Math.max(...mercatorPoints.map((p: number[]) => p[1])),
    }
  }

  /**
   * 将WGS84经纬度坐标转换为Zrender屏幕坐标
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @returns {Array<number>} [x, y] 屏幕坐标
   */
  toZrenderCoord(lng: number, lat: number) {
    // 转换为墨卡托坐标
    const point = turf.point([lng, lat])
    const mercator = turf.toMercator(point)
    const [mercatorX, mercatorY] = mercator.geometry.coordinates

    // 计算缩放比例
    const scaleX
      = this.containerSize.width / (this.bounds.maxX - this.bounds.minX)
    const scaleY
      = this.containerSize.height / (this.bounds.maxY - this.bounds.minY)
    const scale = Math.min(scaleX, scaleY)

    // 转换为屏幕坐标，y轴从底部开始
    const x = (mercatorX - this.bounds.minX) * scale
    const y
      = this.containerSize.height - (mercatorY - this.bounds.minY) * scale

    return [x, y]
  }

  /**
   * 将屏幕坐标转换为WGS84经纬度坐标
   * @param {number} x - 屏幕x坐标
   * @param {number} y - 屏幕y坐标
   * @returns {Array<number>} [lng, lat] WGS84经纬度坐标
   */
  toWgs84Coord(x: number, y: number) {
    // 计算缩放比例
    const scaleX
      = this.containerSize.width / (this.bounds.maxX - this.bounds.minX)
    const scaleY
      = this.containerSize.height / (this.bounds.maxY - this.bounds.minY)
    const scale = Math.min(scaleX, scaleY)

    // 从屏幕坐标转回墨卡托坐标
    const mercatorX = x / scale + this.bounds.minX
    const mercatorY
      = (this.containerSize.height - y) / scale + this.bounds.minY

    // 从墨卡托坐标转回WGS84
    const point = turf.point([mercatorX, mercatorY])
    const wgs84Point = turf.toWgs84(point)
    return wgs84Point.geometry.coordinates
  }

  /**
   * 将Zrender事件对象中的坐标转换为WGS84经纬度坐标
   * @param {object} e - Zrender事件对象
   * @returns {Array<number>} [lng, lat] WGS84经纬度坐标
   */
  eventToWgs84Coord(e: { offsetX: number, offsetY: number }) {
    return this.toWgs84Coord(e.offsetX, e.offsetY)
  }
}

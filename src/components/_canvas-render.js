function renderRect (rect, ctx) {
  const { x, y, width, height } = rect.params
  ctx.strokeRect(x, y, width, height)
}

function renderEllipse (shape, ctx) {
  const { cx: x, cy: y, rx: a, ry: b } = shape.params
  const k = 0.5522848
  const ox = a * k
  const oy = b * k
  ctx.beginPath()
  ctx.moveTo(x - a, y)
  ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b)
  ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y)
  ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b)
  ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y)
  ctx.closePath()
  ctx.stroke()
}

function renderPolyline (shape, ctx) {
  const start = shape.params.points[0]
  const points = shape.params.points.slice(1)
  ctx.lineJoin = shape.style['stroke-linejoin'] || 'miter'
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.forEach((point) => {
    ctx.lineTo(point[0], point[1])
  })
  ctx.stroke()
  ctx.lineJoin = 'miter'
}

function renderText (shape, ctx) {
  const { texts } = shape.params
  ctx.font = `${shape.style['font-size']}px Yahei`
  texts.forEach((text) => {
    const { content, x, y } = text
    ctx.fillText(content, x, y)
  })
}

function renderShape (shape, ctx) {
  ctx.strokeStyle = shape.style.stroke
  ctx.lineWidth = shape.style['stroke-width']
  ctx.fillStyle = shape.style.fill

  switch (shape.type) {
    case 'rect':
      renderRect(shape, ctx)
      break
    case 'ellipse':
      renderEllipse(shape, ctx)
      break
    case 'polyline':
      renderPolyline(shape, ctx)
      break
    case 'multiple-text':
      renderText(shape, ctx)
      break
    default:
  }
}

export default function canvasRender (
  shapes,
  img,
  width,
  height,
  root
) {
  const canvas = document.createElement('canvas')
  const el = root || document.body
  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)
  el.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0, width, height)
  shapes.forEach((shape) => {
    renderShape(shape, ctx)
  })

  let result = ''
  try {
    result = Promise.resolve(canvas.toDataURL('image/png'))
  } catch (err) {
    result = Promise.reject(new Error(`保存图片失败了: ${err}`))
  }
  el.removeChild(canvas)

  return result
}

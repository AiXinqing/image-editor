export default function canvasRotate (
  img,
  width,
  height,
  root
) {
  const canvas = document.createElement('canvas')
  const el = root || document.body
  canvas.setAttribute('width', height)
  canvas.setAttribute('height', width)
  el.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.save()
  ctx.clearRect(0, 0, width, height)
  ctx.translate(width / 2, height / 2)
  ctx.rotate(Math.PI / 2)
  ctx.translate(-width / 2, -height / 2)
  ctx.drawImage(img, (width - height) / 2, (width - height) / 2, width, height)
  // ctx.drawImage(img, width / 2 - width / 2, height / 2 - height / 2)
  ctx.restore()
  let result = ''
  try {
    result = Promise.resolve(canvas.toDataURL('image/png'))
  } catch (err) {
    result = Promise.reject(new Error(`保存图片失败了: ${err}`))
  }
  el.removeChild(canvas)

  return result
}

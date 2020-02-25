<template>
  <div class="image-editor">
    <div class="image-editor--top">
      <div
        ref="imageBox"
        class="image-editor__scroll"
      >
        <div class="image-editor__out-wrapper">
          <div
            ref="editorBox"
            :style="{
              width: boxSize[0],
              height: boxSize[1],
              left: translateOffset[0] + 'px',
              top: translateOffset[1] + 'px'
            }"
            :class="boxClass"
            class="image-editor__wrapper"
          >
            <div
              class="image-editor__image-container"
              :style="{
                width: boxSize[0],
                height: boxSize[1]
              }"
            >
              <img
                ref="imageRef"
                :src="imgUrl"
                crossOrigin="anonymous"
                @load="handleImageLoad"
              >
            </div>
            <Previewer
              :pre-shape="preShape"
              :shapes="historyShapes"
              :view-box="viewBox"
              :scale="scaleState.value"
              @drag-move="handleMoveFunc"
              @drag-end="handleEndFunc"
            />
            <div
              v-if="isInputShow"
              ref="textInputRef"
              :style="{
                top: textState.pos[1] + 'px',
                left: textState.pos[0] + 'px',
                'font-size': size + 'px',
                color: color
              }"
              class="text-input"
              contenteditable
              @input="handleInputFunc"
              @blur="handleEndInputFunc"
            />
          </div>
        </div>
      </div>
      <right-controls
        :actions="rightControlsActions"
        :history-shapes="historyShapes"
        :redo-shapes="recoverShapes"
        :zoom-in-able="zoomInAble"
        :drag-able="dragState.enable"
        @action-fired="handleAction"
      />
    </div>
    <bottom-controls
      v-show="!dragState.enable"
      v-model="states"
      @save-image="save"
    />
  </div>
</template>

<script>
import Previewer from './_previewer'
import bottomControls from './_bottom-controls'
import rightControls from './_right-controls'
import canvasRender, { saveRotateImage } from './_canvas-render'

const TIMES_SIZE = 10
const CHECK_SIZE = 30
const ARROW_SIZE = 5
const LINE_HEIGHT = 20

export const ImageEditor = {
  name: 'ImageEditor',
  components: {
    Previewer,
    bottomControls,
    rightControls
  },

  props: {
    value: {
      type: String,
      required: true
    },

    /*
     * 决定缩放的限制，前提是图片都是等比缩放（不变形）
     * contain 表示最大限制为缩放到刚好不溢出（同background-size: contain）
     * cover 表示最大限制为不能宽高都溢出（同background-size: cover)
     * disabled 表示禁用缩放
     * unlimit 表示无限制, 溢出后可滚动查看
     */
    scaleSize: {
      type: String,
      default: 'contain',
      validator (val) {
        return ['cover', 'disabled', 'contain', 'unlimit'].includes(val)
      }
    }
  },
  data () {
    return {
      // 画笔状态
      states: {
        shapeType: 'rect',
        color: 'red',
        size: 2
      },
      // 文本状态
      textState: {
        content: '',
        pos: null
      },
      // 缩放状态
      scaleState: {
        // 缩放限制，0表示无限制
        limit: 0,
        value: 1
      },
      // 图片初始尺寸
      imageSize: null,
      // 未确定的形状（通常是移动过程中的形状)
      preShape: null,
      // 已绘制上的图形
      historyShapes: [],
      // 被删除，待恢复的图形
      recoverShapes: [],
      // 平移的偏移量
      translateOffset: [0, 0],
      // 拖拽状态
      dragState: {
        enable: false,
        draging: false,
        start: null
      }
    }
  },

  computed: {
    size () {
      return this.states.size
    },

    shapeType () {
      return this.states.shapeType
    },

    color () {
      return this.states.color
    },

    type () {
      switch (this.shapeType) {
        case 'check':
        case 'times':
        case 'arrow':
          return 'polyline'
        default:
          return this.shapeType
      }
    },

    rightControlsActions () {
      if (this.scaleSize === 'disabled') {
        return ['rotate', 'undo', 'redo', 'reset', 'drag']
      }
      // undefined 意味着使用所有功能
      return undefined
    },

    textInputEnable () {
      return this.shapeType === 'text'
    },

    isInputShow () {
      return this.textInputEnable && this.textState.pos
    },

    boxSize () {
      if (this.imageSize) {
        return this.imageSize.map(item => `${item * this.scaleState.value}px`)
      }
      return ['auto', 'auto']
    },

    boxClass () {
      return {
        dragable: this.dragState.enable,
        draging: this.dragState.enable && this.dragState.draging
      }
    },

    viewBox () {
      if (this.imageSize) {
        return `0 0 ${this.imageSize[0]} ${this.imageSize[1]}`
      }
      return '0 0 300 150'
    },

    zoomInAble () {
      return this.scaleState.limit === 0 ||
        this.scaleState.limit > this.scaleState.value
    },

    imgUrl () {
      const shapes = this.historyShapes
      let img_url = this.value
      if (shapes.length && shapes[0].type === 'rotate') {
        img_url = shapes[0].params.img
      }
      return img_url
    }
  },

  watch: {
    value: {
      immediate: true,
      handler () {
        this.reset()
      }
    }
  },

  methods: {
    save () {
      this.getImageData().then((url) => {
        this.$emit('input', url)
      }).catch((err) => {
        this.$emit('save-fail', err)
      })
    },

    getImageData () {
      const [width, height] = this.imageSize
      return canvasRender(
        this.historyShapes,
        this.$refs.imageRef,
        width,
        height,
        this.$refs.editorBox
      )
    },

    reset () {
      this.dragState = {
        enable: false,
        draging: false,
        start: null
      }
      this.historyShapes = []
      this.recoverShapes = []
      this.rotateHistories = []
    },

    afterImageUpdate () {
      this.scaleState = {
        limit: 0,
        value: 1
      }
      this.translateOffset = [0, 0]
      this.imageSize = null
    },

    translate (deltaX, deltaY) {
      const [startX, startY] = this.dragState.start
      this.translateOffset = [
        startX + deltaX,
        startY + deltaY
      ]
    },

    sitFitView () {
      if (this.scaleSize === 'disabled') return
      const [iw, ih] = this.imageSize
      const { width, height } = this.$refs.imageBox.getBoundingClientRect()
      const zoom = Math.max(iw / width, ih / height)
      this.setScale(Math.min(this.scaleState.value, 1 / zoom))
    },

    updateLimit () {
      const [iw, ih] = this.imageSize
      const { width, height } = this.$refs.imageBox.getBoundingClientRect()
      switch (this.scaleSize) {
        case 'unlimit':
          this.scaleState.limit = 0
          break
        case 'contain':
          this.scaleState.limit = 1 / Math.max(iw / width, ih / height)
          break
        case 'cover':
          this.scaleState.limit = 1 / Math.min(iw / width, ih / height)
          break
        default:
      }
    },

    toggleDragEanble () {
      this.dragState.enable = !this.dragState.enable
    },

    handleImageLoad () {
      this.afterImageUpdate()
      this.$nextTick(() => {
        const { width, height } = this.$refs.imageRef.getBoundingClientRect()
        this.imageSize = [width, height]
        this.updateLimit()
        this.sitFitView()
      })
    },

    handleAction (type) {
      switch (type) {
        case 'undo':
          this.undoFunc()
          break
        case 'redo':
          this.redoFunc()
          break
        case 'reset':
          this.resetFunc()
          break
        case 'zoomIn':
          this.zoomInFunc()
          break
        case 'zoomOut':
          this.zoomOutFunc()
          break
        case 'drag':
          this.toggleDragEanble()
          break
        case 'rotate':
          this.transformFunc()
          break
        default:
      }
    },

    handleMoveFunc ({ start, current, originStart, originCurrent }) {
      if (this.dragState.enable) {
        if (!this.dragState.draging) {
          this.dragState.draging = true
          this.dragState.start = this.translateOffset
        }
        this.translate(
          originCurrent[0] - originStart[0],
          originCurrent[1] - originStart[1]
        )
      } else {
        this.addPreShape(start, current)
      }
    },

    handleEndFunc ({ start, current, originStart, originCurrent }) {
      if (this.dragState.enable) {
        this.translate(
          originCurrent[0] - originStart[0],
          originCurrent[1] - originStart[1]
        )
        this.dragState.draging = false
        this.dragState.start = null
        return
      }
      if (this.textInputEnable) {
        if (!this.textState.content) {
          this.showInputBox(start)
        }
      } else {
        this.addPreShape(start, current)
        const shape = {
          ...this.preShape,
          id: `shape-${Date.now()}`
        }
        this.preShape = null
        this.historyShapes.push(shape)
      }
    },

    showInputBox (point) {
      const [x, y] = point
      this.textState.pos = [x * this.scaleState.value - 5, y * this.scaleState.value - 15]
      this.$nextTick(() => {
        this.$refs.textInputRef.focus()
      })
    },

    handleInputFunc () {
      this.textState.content = this.$refs.textInputRef.innerHTML
    },

    handleEndInputFunc () {
      if (!this.textState.content) {
        this.textState.pos = null
        return
      }
      const spaceReg = /<div>|<\/div><div>|<\/div>/
      const words = this.textState.content.split(spaceReg)
      const [x, y] = this.textState.pos
      const shape = {
        id: `shape-${Date.now()}`,
        type: 'multiple-text',
        params: {
          texts: words
            .map(item => item.replace(/&nbsp;/g, ' '))
            .filter(item => item.trim())
            .reduce((acc, item, index) => {
              if (item !== '<br>') {
                acc.push({
                  content: item,
                  x: (x + 5) / this.scaleState.value,
                  y: (y + index * LINE_HEIGHT + 20) / this.scaleState.value
                })
              }
              return acc
            }, [])
        },
        style: {
          'font-size': this.size / this.scaleState.value,
          fill: this.color
        }
      }
      this.historyShapes.push(shape)
      this.textState.pos = null
      setTimeout(() => {
        this.textState.content = ''
      }, 10)
    },

    addPreShape (p1, p2) {
      let Arr = []
      const l = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) || 1
      const sin = (p2[1] - p1[1]) / l
      const cos = (p2[0] - p1[0]) / l
      const times_size = TIMES_SIZE / this.scaleState.value
      const check_size = CHECK_SIZE / this.scaleState.value
      const arrow_size = l / 20 + ARROW_SIZE
      this.preShape = this.preShape || {
        type: this.type,
        id: 'preShape',
        params: {},
        rotateCount: this.rotateHistories.length,
        style: {
          fill: 'transparent',
          stroke: this.color,
          'stroke-width': this.size
        }
      }
      switch (this.shapeType) {
        case 'rect': // 矩形
          this.preShape.params = {
            x: Math.min(p1[0], p2[0]),
            y: Math.min(p1[1], p2[1]),
            width: Math.abs(p1[0] - p2[0]),
            height: Math.abs(p1[1] - p2[1])
          }
          break
        case 'ellipse': // 圆形
          this.preShape.params = {
            cx: (p1[0] + p2[0]) / 2,
            cy: (p1[1] + p2[1]) / 2,
            rx: Math.abs(p1[0] - p2[0]) / 2,
            ry: Math.abs(p1[1] - p2[1]) / 2
          }
          break
        case 'polyline': // 曲线
          if (this.preShape.params.points) {
            this.preShape.params = {
              points: [...this.preShape.params.points, p2]
            }
          } else {
            this.preShape.params = {
              points: [p1, p2]
            }
          }
          break
        case 'check': // 打勾
          this.preShape.params = {
            points: [
              [p1[0] - check_size / 2, p1[1] - 0.1 * 2 / 3 * check_size],
              [p1[0] - 1 / 6 * check_size, p1[1] + 1 / 3 * check_size],
              [p1[0] + check_size / 2, p1[1] - 1 / 3 * check_size]
            ]
          }
          break
        case 'times': // 错
          this.preShape.params = {
            points: [
              [p1[0] - times_size, p1[1] - times_size],
              [p1[0] + times_size, p1[1] + times_size],
              p1,
              [p1[0] + times_size, p1[1] - times_size],
              [p1[0] - times_size, p1[1] + times_size]
            ]
          }
          break
        case 'arrow': // 箭头
          Arr = [
            [p2[0] - arrow_size * (Math.sqrt(3) * cos + sin), p2[1] - arrow_size * (Math.sqrt(3) * sin - cos)],
            [p2[0] - arrow_size * (Math.sqrt(3) * cos - sin), p2[1] - arrow_size * (Math.sqrt(3) * sin + cos)]
          ]
          this.preShape.params = {
            points: [
              p1,
              p2,
              Arr[0],
              p2,
              Arr[1],
              p2
            ]
          }
          this.preShape.style = {
            fill: 'transparent',
            stroke: this.color,
            'stroke-width': this.size,
            'stroke-linejoin': 'round'
          }
          break
      }
    },

    undoFunc () {
      const last = this.historyShapes.pop()
      if (!last) return
      if (last.type === 'rotate') {
        this.undoRotate(last)
      }
      this.recoverShapes.push(last)
    },

    redoFunc () {
      const last = this.recoverShapes.pop()
      if (last) {
        if (last instanceof Array) {
          this.historyShapes = this.historyShapes.concat(last)
        } else {
          if (last.type === 'rotate') {
            this.addRotateOperate(last)
          } else {
            this.historyShapes.push(last)
          }
        }
      }
    },

    resetFunc () {
      const shapes = this.historyShapes.splice(0, this.historyShapes.length)
      this.recoverShapes.push(shapes)
    },

    setScale (value) {
      if (this.scaleState.limit === 0) {
        this.scaleState.value = value
      } else {
        this.scaleState.value = Math.min(this.scaleState.limit, value)
      }
    },

    addRotateOperate (state) {
      this.historyShapes = [state]
    },

    undoRotate (state) {
      this.historyShapes = [...state.params.shapes]
    },

    transformFunc () {
      const [width, height] = this.imageSize
      this.getImageData().then((url) => {
        saveRotateImage(url, width, height, this.$refs.editorBox)
          .then((data) => {
            // 存储旋转前的状态
            this.addRotateOperate({
              id: `operate-${Date.now()}`,
              type: 'rotate',
              params: {
                img: data,
                shapes: [...this.historyShapes]
              },
              style: {}
            })
          })
      })
    },

    zoomInFunc () {
      this.setScale(this.scaleState.value * 1.2)
    },

    zoomOutFunc () {
      this.setScale(this.scaleState.value / 1.2)
    }
  }
}

export default ImageEditor
</script>

<style lang="less">
  .image-editor {
    width: 100%;
    height: 100%;

    &--top {
      display: flex;
      flex-direction: row;
      height: calc(100% - 66px);
    }

    &--bottom {
      flex-shrink: 0;
      height: 66px;
    }

    &__scroll {
      width: calc(100% - 80px);
      overflow: auto;
      writing-mode: vertical-lr;
      background-color: rgba(0,0,0,0.3);
    }

    &__controls--right {
      flex-shrink: 0;
      width: 80px;
    }

    &__out-wrapper {
      margin: auto;
      writing-mode: horizontal-tb;
      width: 100%;
    }

    &__wrapper {
      margin: auto;
      position: relative;

      &.dragable {
        cursor: grab;
      }

      &.draging {
        cursor: grabbing;
      }
    }

    canvas {
      visibility: visible;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
    }

    &__image-container {
      display: inline-block;
    }

    img {
      display: block;
      width: 100%;
    }

    .color-item {
      display: inline-block;
      width: 16px;
      height: 16px;
    }

    .text-input {
      position: absolute;
      width: 200px;
      min-height: 30px;
      line-height: 20px;
      background-color: white;
      border: 1px solid red;
      border-radius: 4px;
      padding: 4px;
      outline: none;

      &:focus {
        outline: none;
      }
    }
  }
</style>

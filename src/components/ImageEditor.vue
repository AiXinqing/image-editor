<template>
  <div class="image-editor">
    <div class="image-editor--top">
      <div class="image-editor__scroll">
        <div
          ref="editorBox"
          :style="{
            width: boxSize[0] + 'px',
            height: boxSize[1] + 'px'
          }"
          class="image-editor__wrappper"
        >
          <img
            ref="imageRef"
            :src="value"
            @load="handleImageLoad"
          >
          <Previewer
            :pre-shape="preShape"
            :shapes="historyShapes"
            :viewBox="viewBox"
            :scale="scale"
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
      <right-controls
        @action-fired="handleAction"
      />
    </div>
    <bottom-controls v-model="states" />
  </div>
</template>

<script>
import Previewer from './_previewer'
import bottomControls from './_bottom-controls'
import rightControls from './_right-controls'

const TIMES_SIZE = 10
const ARROW_SIZE = 5
const LINE_HEIGHT = 20

export default {
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
    }
  },
  data () {
    return {
      states: {
        shapeType: 'rect',
        color: 'red',
        size: 2
      },
      textState: {
        content: '',
        pos: null
      },
      scale: 1,
      imageSize: null,
      preShape: null,
      historyShapes: [],
      recoverShapes: [],
      text_drawing: ''
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

    textInputEnable () {
      return this.shapeType === 'text'
    },

    isInputShow () {
      return this.textInputEnable && this.textState.pos
    },

    boxSize () {
      if (this.imageSize) {
        return this.imageSize.map(item => item * this.scale)
      }
      return ['auto', 'auto']
    },

    viewBox () {
      if (this.imageSize) {
        return `0 0 ${this.imageSize[0]} ${this.imageSize[1]}`
      }
      return '0 0 300 150'
    }
  },

  methods: {
    save () {
      const canvas = document.createElement('canvas')
      const { width, height } = this.$refs.editorBox.getBoundingClientRect()
      canvas.setAttribute('width', width)
      canvas.setAttribute('height', height)
      this.$el.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.$refs.imageRef, 0, 0, width, height)
      // 绘制形状到canvas
      ctx.strokeRect(10, 10, 300, 200)

      const imgurl = canvas.toDataURL('image/png')
      this.$emit('input', imgurl)
      this.$el.removeChild(canvas)
    },

    handleImageLoad () {
      const { width, height } = this.$refs.imageRef.getBoundingClientRect()
      this.imageSize = [width, height]
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
        default:
      }
    },

    handleMoveFunc ({ start, current }) {
      this.addPreShape(start, current)
    },

    handleEndFunc ({ start, current }) {
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
      this.textState.pos = [x - 5, y - 15]
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
                  x: 5 + x,
                  y: y + index * LINE_HEIGHT + 20
                })
              }
              return acc
            }, [])
        },
        style: {
          'font-size': this.size,
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

      this.preShape = this.preShape || {
        type: this.type,
        id: 'preShape',
        params: {},
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
              [p1[0], p1[1] + 8],
              [p1[0] + 10, p1[1] + 20],
              [p1[0] + 30, p1[1]]
            ]
          }
          break
        case 'times': // 错
          this.preShape.params = {
            points: [
              [p1[0] - 10, p1[1] - TIMES_SIZE],
              [p1[0] + TIMES_SIZE, p1[1] + TIMES_SIZE],
              p1,
              [p1[0] + TIMES_SIZE, p1[1] - TIMES_SIZE],
              [p1[0] - TIMES_SIZE, p1[1] + TIMES_SIZE]
            ]
          }
          break
        case 'arrow': // 箭头
          Arr = [
            [p2[0] - ARROW_SIZE * (Math.sqrt(3) * cos + sin), p2[1] - ARROW_SIZE * (Math.sqrt(3) * sin - cos)],
            [p2[0] - ARROW_SIZE * (Math.sqrt(3) * cos - sin), p2[1] - ARROW_SIZE * (Math.sqrt(3) * sin + cos)]
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
        case 'text': // 文字
          this.preShape.params = {
            x: p1[0],
            y: p1[1],
            width: '200px',
            height: '50%',
            fill: this.color
          }
          this.preShape.text = this.text_drawing
          this.preShape.style = {
            size: this.size,
            color: this.color,
            'font-family': 'auto'
          }
          break
      }
    },

    undoFunc () {
      const last = this.historyShapes.pop()
      if (last) {
        this.recoverShapes.push(last)
      }
    },

    redoFunc () {
      const last = this.recoverShapes.pop()
      if (last) {
        if (last instanceof Array) {
          this.historyShapes = this.historyShapes.concat(last)
        } else {
          this.historyShapes.push(last)
        }
      }
    },

    resetFunc () {
      const shapes = this.historyShapes.splice(0, this.historyShapes.length)
      this.recoverShapes.push(shapes)
    },

    zoomInFunc () {
      this.scale = this.scale * 1.2
    },

    zoomOutFunc () {
      this.scale = this.scale / 1.2
    }
  }
}
</script>

<style lang="less">
  .image-editor__scroll{
    background: rgba(0,0,0,0.3);
  }
  .image-editor {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    &--top {
      display: flex;
      flex-direction: row;
      flex: 1 0 0;
    }

    &--bottom {
      flex-shrink: 0;
    }

    &__scroll {
      flex: 1 0 0;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__controls--right {
      flex-shrink: 0;
    }

    &__wrappper {
      display: inline-flex;
      position: relative;
    }

    canvas {
      visibility: hidden;
      position: absolute;
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

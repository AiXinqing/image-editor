<template>
  <div class="image-editor">
    <div class="image-editor--top">
      <div class="image-editor__scroll">
        <div
          ref="editorBox"
          class="image-editor__wrappper"
        >
          <img
            ref="imageRef"
            :src="value"
          >
          <Previewer
            :pre-shape="preShape"
            :shapes="historyShapes"
            @drag-move="handleMoveFunc"
            @drag-end="handleEndFunc"
          />
        </div>
      </div>
      <div class="image-editor__controls--right">右侧控件</div>
    </div>
    <bottom-controls
      v-model="states"
    />
  </div>
</template>

<script>
import Previewer from './_previewer'
import bottomControls from './_bottom-controls'

const TIMES_SIZE = 10
const ARROW_SIZE = 5

export default {
  name: 'ImageEditor',
  components: {
    Previewer,
    bottomControls
  },

  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      states: {
        shapeType: 'rect',
        color: 'red',
        size: 2
      },
      preShape: null,
      historyShapes: [],
      recoverShapes: [],
      text_drawing: ''
    }
  },

  computed: {
    size() {
      return this.states.size
    },

    shapeType() {
      return this.states.shapeType
    },

    color() {
      return this.states.color
    },

    type() {
      switch (this.shapeType) {
        case 'check':
        case 'times':
        case 'arrow':
          return 'polyline'
        default:
          return this.shapeType
      }
    }
  },

  methods: {
    save() {
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

    handleMoveFunc({ start, current }) {
      this.addPreShape(start, current)
    },

    handleEndFunc({ start, current }) {
      this.addPreShape(start, current)
      const shape = {
        ...this.preShape,
        id: `shape-${Date.now()}`
      }
      this.preShape = null
      this.historyShapes.push(shape)
    },

    addPreShape(p1, p2) {
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
  }
</style>

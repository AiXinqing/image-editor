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
    <div class="image-editor__controls image-editor--bottom">
      <div class="shape-controls__container">
        <label
          v-for="shape in allowedShapes"
          :key="shape"
        >
          <input
            v-model="shapeType"
            :value="shape"
            type="radio"
            name="shapeType"
          >
          <span>{{ shape }}</span>
        </label>
      </div>
      <div class="size-controls__container">
        <button @click="save">保存</button>
      </div>
      <div class="color-controls__container">
        <label
          v-for="item in allowedColors"
          :key="item"
        >
          <input
            v-model="color"
            :value="item"
            type="radio"
            name="colorType"
          >
          <span
            class="color-item"
            :style="{ background: item }"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import Previewer from './_previewer'

const SHAPES = ['check', 'times', 'text', 'polyline', 'arrow', 'rect', 'ellipse']
const COLORS = ['red', 'blue', 'green', 'gray', 'white', 'black', 'purple', 'pink']

export default {
  name: 'ImageEditor',

  components: {
    Previewer
  },

  props: {
    value: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      allowedShapes: SHAPES,
      allowedColors: COLORS,
      shapeType: 'rect',
      lineSize: 2,
      fontSize: 14,
      color: 'red',
      preShape: null,
      historyShapes: [],
      recoverShapes: []
    }
  },

  computed: {
    size() {
      switch (this.shapeType) {
        case 'text':
          return this.fontSize
        default:
          return this.lineSize
      }
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
        case 'rect':
          this.preShape.params = {
            x: Math.min(p1[0], p2[0]),
            y: Math.min(p1[1], p2[1]),
            width: Math.abs(p1[0] - p2[0]),
            height: Math.abs(p1[1] - p2[1])
          }
          break
        case 'ellipse':
          this.preShape.params = {
            cx: (p1[0] + p2[0]) / 2,
            cy: (p1[1] + p2[1]) / 2,
            rx: Math.abs(p1[0] - p2[0]) / 2,
            ry: Math.abs(p1[1] - p2[1]) / 2
          }
          break
        case 'polyline':
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
      }
    }
  }
}
</script>

<style lang="less">
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

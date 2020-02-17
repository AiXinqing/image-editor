<template>
  <div class="image-editor">
    <div class="image-editor--top">
      <div class="image-editor__scroll">
        <div class="image-editor__wrappper">
          <img :src="value">
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
      <div class="shape-controls__container" />
      <div class="size-controls__container" />
      <div class="color-controls__container" />
    </div>
  </div>
</template>

<script>
import Previewer from './_previewer'

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
      const imgurl = this.value
      this.$emit('input', imgurl)
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
      this.preShape = {
        type: this.type,
        id: 'preShape',
        params: {},
        style: {}
      }
      switch (this.shapeType) {
        case 'rect':
          this.preShape.params = {
            x: Math.min(p1[0], p2[0]),
            y: Math.min(p1[1], p2[1]),
            width: Math.abs(p1[0] - p2[0]),
            height: Math.abs(p1[1] - p2[1])
          }
          this.preShape.style = {
            fill: 'transparent',
            stroke: this.color,
            'stroke-width': this.lineSize
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

    img {
      display: block;
      width: 100%;
    }
  }
</style>

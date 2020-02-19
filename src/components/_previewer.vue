<template>
  <div
    class="editor-preview"
    @mousedown="handleMousedown"
  >
    <svg
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
    >
      <template v-for="shape in allShapes">
        <component
          :is="shape.type"
          :key="shape.id"
          :style="shape.style"
          v-bind="shape.params"
        />
      </template>
    </svg>
  </div>
</template>

<script>
import MultipleText from './_multiple-text'

export default {
  components: {
    'multiple-text': MultipleText
  },

  inheritAttrs: false,

  props: {
    preShape: {
      type: Object,
      default: null
    },

    viewBox: {
      type: String,
      default: '0 0 300 150'
    },

    shapes: {
      type: Array,
      default: () => []
    },

    scale: {
      type: Number,
      default: 1
    }
  },

  data () {
    return {
      startPoint: [],
      mousemoveFunc: null,
      mouseupFunc: null,
      startClientPoint: []
    }
  },

  computed: {
    allShapes () {
      if (this.preShape) {
        return [...this.shapes, this.preShape]
      }
      return this.shapes
    }
  },

  created () {
    this.mousemoveFunc = (event) => {
      this.handleMousemove(event)
    }
    this.mouseupFunc = (event) => {
      this.handleMouseup(event)
    }
  },

  methods: {
    handleMousedown (event) {
      this.startPoint = this._getPoint(event)
      this.startClientPoint = this._getClientPoint(event)
      this.bindMousemove()
      this.bindMouseup()
    },

    handleMousemove (event) {
      this.$emit('drag-move', {
        start: this.startPoint,
        current: this._getPoint(event),
        originStart: this.startClientPoint,
        originCurrent: this._getClientPoint(event)
      })
    },

    handleMouseup (event) {
      this.$emit('drag-end', {
        start: this.startPoint,
        current: this._getPoint(event),
        originStart: this.startClientPoint,
        originCurrent: this._getClientPoint(event)
      })
      this.unbindEvents()
    },

    _getPoint (event) {
      const { top, left } = this.$el.getBoundingClientRect()
      return [
        (event.clientX - left) / this.scale,
        (event.clientY - top) / this.scale
      ]
    },

    _getClientPoint (event) {
      return [event.clientX, event.clientY]
    },

    bindMousemove () {
      document.documentElement.addEventListener(
        'mousemove',
        this.mousemoveFunc,
        false
      )
    },

    bindMouseup () {
      document.documentElement.addEventListener(
        'mouseup',
        this.mouseupFunc,
        false
      )
    },

    unbindEvents () {
      document.documentElement.removeEventListener(
        'mousemove',
        this.mousemoveFunc,
        false
      )
      document.documentElement.removeEventListener(
        'mouseup',
        this.mouseupFunc,
        false
      )
    }
  }
}
</script>

<style lang="less">
  .editor-preview {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
</style>

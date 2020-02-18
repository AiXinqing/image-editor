<template>
  <div
    class="editor-preview"
    @mousedown="handleMousedown"
  >
    <svg xmls="http://www.w3.org/2000/svg">
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

  props: {
    preShape: {
      type: Object,
      default: null
    },

    shapes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      startPoint: [],
      mousemoveFunc: null,
      mouseupFunc: null
    }
  },

  computed: {
    allShapes() {
      if (this.preShape) {
        return [...this.shapes, this.preShape]
      }
      return this.shapes
    }
  },

  created() {
    this.mousemoveFunc = (event) => {
      this.handleMousemove(event)
    }
    this.mouseupFunc = (event) => {
      this.handleMouseup(event)
    }
  },

  methods: {
    handleMousedown(event) {
      const { top, left } = this.$el.getBoundingClientRect()
      this.startPoint = [event.clientX - left, event.clientY - top]
      this.bindMousemove()
      this.bindMouseup()
    },

    handleMousemove(event) {
      const { top, left } = this.$el.getBoundingClientRect()
      this.$emit('drag-move', {
        start: this.startPoint,
        current: [event.clientX - left, event.clientY - top]
      })
    },

    handleMouseup(event) {
      const { top, left } = this.$el.getBoundingClientRect()
      this.$emit('drag-end', {
        start: this.startPoint,
        current: [event.clientX - left, event.clientY - top]
      })
      this.unbindEvents()
    },

    bindMousemove() {
      document.documentElement.addEventListener(
        'mousemove',
        this.mousemoveFunc,
        false
      )
    },

    bindMouseup() {
      document.documentElement.addEventListener(
        'mouseup',
        this.mouseupFunc,
        false
      )
    },

    unbindEvents() {
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

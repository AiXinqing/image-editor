<template>
  <div class="image-editor__controls--right">
    <div class="controls__container">
      <div
        v-for="action in actions"
        :key="action"
        :class="getActionClass(action)"
        @click="handleOperation(action)"
      />
    </div>
  </div>
</template>

<script>
const ALLOWED_ACTIONS = ['rotate', 'undo', 'redo', 'reset', 'zoomIn', 'zoomOut', 'drag']

export default {
  props: {
    actions: {
      type: Array,
      default: () => ALLOWED_ACTIONS
    },

    historyShapes: {
      type: Array,
      default: () => []
    },

    redoShapes: {
      type: Array,
      default: () => []
    },

    zoomInAble: {
      type: Boolean,
      default: true
    },

    dragAble: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleOperation (type) {
      this.$emit('action-fired', type)
    },

    getActionClass (action) {
      return {
        'operation-item': true,
        [`${action}-item`]: true,
        disabled: this.getActionState(action)
      }
    },

    getActionState (action) {
      switch (action) {
        case 'undo':
        case 'reset':
          return !this.historyShapes.length
        case 'redo':
          return !this.redoShapes.length
        case 'zoomIn':
          return !this.zoomInAble
        case 'drag':
          return !this.dragAble
        default:
          return false
      }
    }
  }
}
</script>

<style lang="less">
  .image-editor__controls--right {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;

    .controls__container {
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 2px 2px 5px #ddd;
      padding: 10px;
      border-radius: 4px;
    }

    .operation-item {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      margin-top: 15px;
      width:30px;
      height: 34px;

      &.disabled {
        cursor: not-allowed;
      }

      &:first-child {
        margin-top: 0;
      }

      &.rotate-item {
        background: url('../assets/rorate.png') no-repeat center center;
        background-size: 75%;
      }

      &.undo-item {
        background: url('../assets/undo.png') no-repeat center center;
        background-size: 75%;

        &.disabled {
          background-image: url('../assets/undo-d.png')
        }
      }

      &.redo-item {
        background: url('../assets/redo.png') no-repeat center center;
        background-size: 75%;

        &.disabled {
          background-image: url('../assets/redo-d.png')
        }
      }

      &.reset-item {
        background: url('../assets/reset.png') no-repeat center center;
        background-size: 70%;

        &.disabled {
          background-image: url('../assets/reset-d.png')
        }
      }

      &.zoomIn-item {
        background: url('../assets/zoomIn.png') no-repeat center center;
        background-size: 70%;

        &.disabled {
          background-image: url('../assets/zoomIn-d.png')
        }
      }

      &.zoomOut-item {
        background: url('../assets/zoomOut.png') no-repeat center center;
        background-size: 70%;

        &.disabled {
          background-image: url('../assets/zoomOut-d.png')
        }
      }

      &.drag-item {
        background: url('../assets/drag.png') no-repeat center center;
        background-size: 70%;

        &.disabled{
          background-image: url('../assets/drag-d.png');
        }
      }
    }
  }
</style>

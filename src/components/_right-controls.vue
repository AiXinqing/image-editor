<template>
  <div class="image-editor__controls--right">
    <div class="controls__container">
      <div
        v-for="action in actions"
        :key="action"
        :class="['operation-item', action + '-item']"
        @click="handleOperation(action)"
      >
      </div>
    </div>
  </div>
</template>

<script>
const ALLOWED_ACTIONS = ['undo', 'redo', 'reset', 'zoomIn', 'zoomOut']

export default {
  props: {
    actions: {
      type: Array,
      default: () => ALLOWED_ACTIONS
    }
  },

  methods: {
    handleOperation(type) {
      this.$emit('action-fired', type)
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

      &:first-child {
        margin-top: 0;
      }

      &.undo-item {
        background: url('../assets/revoke.png') no-repeat center center;
        background-size: 75%;
      }

      &.redo-item {
        background: url('../assets/revoke.png') no-repeat center center;
        background-size: 75%;
      }

      &.reset-item {
        background: url('../assets/reset.png') no-repeat center center;
        background-size: 70%;
      }

      &.zoomIn-item {
        background: url('../assets/amplification.png') no-repeat center center;
        background-size: 70%;
      }

      &.zoomOut-item {
        background: url('../assets/zoomOut.png') no-repeat center center;
        background-size: 70%;
      }
    }
  }
</style>

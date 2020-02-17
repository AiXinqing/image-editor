<template>
  <div class="editor-preview">
    <svg xmls="http://www.w3.org/2000/svg">
      <template v-for="shape in shapes">
        <component
          :is="shape.type"
          :key="shape.id"
          v-bind="shape.params"
        />
      </template>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    preShape: {
      type: Object,
      default: null
    },

    shapes: {
      type: Array,
      default: () => []
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

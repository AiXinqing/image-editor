<template>
  <div class="image-editor">
    <div class="image-editor--top">
      <div class="image-editor__scroll">
        <div class="image-editor__wrappper">
          <img :src="value">
          <Previewer
            :pre-shape="preShape"
            :shapes="historyShapes"
          />
        </div>
      </div>
      <div class="image-editor__controls--right">右侧控件</div>
    </div>
    <div class="image-editor__controls image-editor--bottom">
      底部控件
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
      preShape: null,
      historyShapes: [
        {
          type: 'rect',
          id: Date.now(),
          params: {
            x: 10,
            y: 10,
            width: 160,
            height: 120
          }
        }
      ],
      recoverShapes: []
    }
  },

  methods: {
    save() {
      const imgurl = this.value
      this.$emit('input', imgurl)
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

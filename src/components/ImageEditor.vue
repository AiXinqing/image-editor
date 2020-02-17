<template>
  <div class="image-editor">
    <div class="img-container">
      <img :src="value" />
    </div>
    <canvas>
      你的浏览器不支持canvas
    </canvas>
    <svg></svg>
  </div>
</template>

<script>
export default {
  name: 'ImageEditor',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
}
</script>


<template>
  <g>
    <text
      v-for="(text, index) in texts"
      v-on="$attrs"
      :key="index"
      :x="text.x"
      :y="text.y"
    >
      {{ text.content }}
    </text>
  </g>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    texts: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <g>
    <text
      v-for="(text, index) in texts"
      :key="index"
      :x="text.x"
      :y="text.y"
      v-on="$attrs"
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

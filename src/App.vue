<template>
  <div id="app">
    <ImageEditor v-model="img.url" />
  </div>
</template>

<script>
import ImageEditor from './components/ImageEditor.vue'

export default {
  name: 'App',
  components: {
    ImageEditor,
  },

  data() {
    return {
      img: {
        url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1581956797668&di=2a5f1a3cf4810c8ec54130f9c148dbb7&imgtype=0&src=http%3A%2F%2Ffiles.eduuu.com%2Fimg%2F2012%2F04%2F13%2F104001_4f8792019aafd.jpg',
      },
    }
  },
}
</script>

<template>
  <div id="app">
    <ImageEditor
      ref="imageEditor"
      v-model="img.url"
      @save-fail="handleError"
    />
  </div>
</template>

<script>
import ImageEditor from './components/ImageEditor.vue'

export default {
  name: 'App',
  components: {
    ImageEditor
  },

  data () {
    return {
      img: {
        url: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2990134288,4193360597&fm=11&gp=0.jpg'
      }
    }
  },

  methods: {
    handleError (err) {
      console.log(err)
    },

    getData () {
      this.$refs.imageEditor.getImageData().then((url) => {
        console.log(url)
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="less">
  html,
  body {
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }

  #app {
    width: 100vw;
    height: 100vh;
  }
</style>

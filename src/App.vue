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
        url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582088671628&di=c3939fbd443d58c4b2609efa0a511dc2&imgtype=0&src=http%3A%2F%2Fbbs.jooyoo.net%2Fattachment%2FMon_0905%2F24_65548_2835f8eaa933ff6.jpg'
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

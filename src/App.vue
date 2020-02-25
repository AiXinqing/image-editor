<template>
  <div id="app">
    <div class="editor-container">
      <ImageEditor
        ref="imageEditor"
        v-model="img.url"
        scale-size="cover"
        @save-fail="handleError"
      />
    </div>
    <button @click="switchImage">切换图片</button>
  </div>
</template>

<script>
import ImageEditor from './components/ImageEditor.vue'

const IMAGES = [
  'https://p4-q.mafengwo.net/s12/M00/CA/3B/wKgED1w8fL6ADk16AAXyDaz2bdU61.jpeg',
  'http://118.122.48.24:39308/14/6e4d4ebec20d41969166db157cc389b5.jpg'
]

export default {
  name: 'App',
  components: {
    ImageEditor
  },

  data () {
    return {
      index: 0,
      img: {
        url: IMAGES[0]
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
    },

    switchImage () {
      this.index = (this.index + 1) % IMAGES.length
      this.img.url = IMAGES[this.index]
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

  .editor-container {
    width: 80vw;
    height: 80vh;
  }
</style>

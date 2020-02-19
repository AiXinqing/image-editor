<template>
  <div id="app">
    <div class="editor-container">
      <ImageEditor
        ref="imageEditor"
        v-model="img.url"
        @save-fail="handleError"
      />
    </div>
    <button @click="switchImage">切换图片</button>
  </div>
</template>

<script>
import ImageEditor from './components/ImageEditor.vue'

const IMAGES = [
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1581956797668&di=2a5f1a3cf4810c8ec54130f9c148dbb7&imgtype=0&src=http%3A%2F%2Ffiles.eduuu.com%2Fimg%2F2012%2F04%2F13%2F104001_4f8792019aafd.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582100759167&di=bf0f54f991a19079482b629343ddcb05&imgtype=0&src=http%3A%2F%2Fgbres.dfcfw.com%2FFiles%2Fpicture%2F20200219%2F35F19A53B637D11146908DC6D35FC0AD_w828h1479.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582100759740&di=1bc70564a453c5a59e7151d78c29d89f&imgtype=0&src=http%3A%2F%2Fa0.att.hudong.com%2F43%2F14%2F01300541155006139405143167464.jpg'
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

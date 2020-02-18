<template>
  <div class="image-editor__controls image-editor--bottom">
    <div class="shape-controls__container">
      <div
        v-for="shape in allowedShapes"
        :key="shape"
        :class="{
          'shape-item': true,
          'active': shape === shapeType,
          [shape + '-shape']: true
        }"
        @click="updateShape(shape)"
      />
      <div
        class="shape-item save-btn"
        @click="handleSave"
      >
        保存
      </div>
    </div>
    <div class="size-controls__container">
      <div
        v-if="!isFontSize"
        class="lineSize"
      >
        <span
          v-for="item in sizes"
          :key="item"
          :class="{
            active: item === size
          }"
          @click="updateSize(item)"
        >
          <i
            :style="{
              width: item * 1.5 + 'px',
              height: item * 1.5 + 'px',
              background: color
            }"
          />
        </span>
      </div>
      <div
        v-else
        class="fontSize"
      >
        <select v-model="size">
          <option
            v-for="item in sizes"
            :key="item"
            :value="item"
          >
            {{ item }}px
          </option>
        </select>
      </div>
    </div>
    <div class="color-controls__container">
      <div
        class="color-show"
        :style="'background:' + color"
      />
      <div class="color-change">
        <span
          v-for="item in allowedColors"
          :key="item"
          :class="'color' + item"
          :style="{ background: item }"
          @click="updateColor(item)"
        />
      </div>
    </div>
  </div>
</template>

<script>
const SHAPES = ['check', 'times', 'text', 'polyline', 'arrow', 'rect', 'ellipse']
const COLORS = ['red', 'blue', 'green', 'gray', 'white', 'black', 'purple', 'pink']
const SIZES = [2, 4, 6]
const FONT_BASE = 12
export default {
  props: {
    value: {
      type: Object,
      required: true,
      validator (val) {
        return val.color &&
          val.shapeType &&
          val.size
      }
    }
  },
  data () {
    return {
      allowedShapes: SHAPES,
      allowedSizes: SIZES,
      allowedColors: COLORS,
      color: this.value.color,
      size: this.value.size,
      shapeType: this.value.shapeType
    }
  },

  computed: {
    isFontSize () {
      return this.shapeType === 'text'
    },

    sizes () {
      if (this.isFontSize) {
        return this.allowedSizes.map(size => FONT_BASE + size)
      }
      return this.allowedSizes
    }
  },

  watch: {
    shapeType (old, type) {
      if ((old === 'text') || (type === 'text')) {
        this.size = this.size % FONT_BASE + (this.isFontSize ? FONT_BASE : 0)
      }
    }
  },

  created () {
    this.$watch(() => {
      return this.shapeType + this.color + this.size
    }, () => {
      this.$emit('input', {
        shapeType: this.shapeType,
        size: this.size,
        color: this.color
      })
    })
  },

  methods: {
    updateShape (type) {
      this.shapeType = type
    },

    updateSize (size) {
      this.size = size
    },

    updateColor (color) {
      this.color = color
    },

    handleSave () {
      this.$emit('save-image')
    }
  }
}
</script>

<style lang="less">
  .image-editor__controls{
    padding: 10px 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .shape-controls__container,
    .lineSize,
    .color-controls__container {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .shape-controls__container{
      padding: 5px 10px;
      box-shadow: 2px 2px 5px #ddd;
      border-radius: 4px;
    }

    .size-controls__container {
      margin: 0 10px;
    }

    .shape-item{
      width: 32px;
      height: 32px;
      border: 1px solid #fff;
      margin-left: 15px;
      cursor: pointer;

      &:first-child {
        margin-left: 0;
      }

      &.active {
        border: 1px solid #42b983;
      }
      &.check-shape{
        background: url('../assets/tick.png') no-repeat center;
        background-size: 100%;
      }
      &.times-shape{
        background: url('../assets/cross.png') no-repeat center center;
        background-size: 80%;
      }
      &.text-shape{
        background: url('../assets/A.png') no-repeat center center;
        background-size: 75%;
      }
      &.polyline-shape{
        background: url('../assets/curve.png') no-repeat center center;
        background-size: 100%;
      }
      &.arrow-shape{
        background: url('../assets/arrow.png') no-repeat center center;
        background-size: 80%;
      }
      &.rect-shape{
        background: url('../assets/rectang.png') no-repeat center center;
        background-size: 80%;
      }
      &.ellipse-shape{
        background: url('../assets/round.png') no-repeat center center;
        background-size: 90%;
      }
      &.save-btn{
        width: 60px;
        height: 30px;
        padding: 0 8px;
        border:1px solid #42b983;
        border-radius: 4px;
        line-height: 30px;
        font-size: 14px;
        text-align: center;
        color: #42b983;

        &:hover{
          background: #42b983;
          color: #fff;
        }
      }
    }

    .lineSize {
      span {
        display: inline-flex;
        width: 24px;
        height: 24px;
        justify-content: center;
        align-items: center;
        border:1px solid transparent;
        cursor: pointer;
        margin-left: 10px;
        border-radius: 3px;

        i {
          border-radius: 50%;
        }

        &:first-child {
          margin-left: 0;
        }

        &.active,
        &:hover {
          border:1px solid #42b983;
        }
      }
    }

    .fontSize{
      select{
        width: 92px;
        height: 24px;
        background: #fff;
        outline:0 none !important;
      }
    }

    .color-show {
      width: 30px;
      height: 30px;
      border:1px solid #eee;
      border-radius: 4px;
      background: red;
    }

    .color-change {
      width: 100px;
      margin-left: 5px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;

      span {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin: 2.5px;
        border:1px solid transparent;
        outline: 1px solid #ccc;
        cursor: pointer;

        &:hover {
          border-color: white;
        }
      }
    }
  }
</style>

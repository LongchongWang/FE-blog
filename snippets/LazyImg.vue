<template>
  <div class="lazyImg" :style="[{ 'height': height * 10.8 / width + 'rem' }, exStyle]">
    <img :data-src="src" ref="img">
  </div>
</template>

<script>
import { viewportWidth, viewportHeight } from './dom'

let imgDomList = []
function reset(imgDom) {
  var lazySrc = imgDom.getAttribute('data-src')
  if (!lazySrc) {
    return
  }
  imgDom.setAttribute('src', lazySrc)
  imgDom.removeAttribute('data-src')
}
function onScroll() {
  if (imgDomList.length === 0) {
    window.removeEventListener('scroll', onScroll, false)
    window.removeEventListener('resize', onScroll, false)
    return
  }
  const clientWidth = viewportWidth()
  const clientHeight = viewportHeight()
  imgDomList.forEach(function(imgDom, index) {
    const clientRectObj = imgDom.getBoundingClientRect()
    const topThis = clientRectObj.top
    const leftThis = clientRectObj.left
    if (topThis - clientHeight < 0 && topThis + clientHeight > 0 && leftThis < clientWidth) {
      imgDomList[index] = null
      reset(imgDom)
    }
  })
  imgDomList = imgDomList.filter(item => !!item)
}

export default {
  name: 'LazyImg',
  props: {
    src: String,
    w: String,
    h: String,
    exStyle: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    width: function() {
      return Math.round(this.w)
    },
    height: function() {
      return Math.round(this.h)
    }
  },
  mounted: function() {
    // page-rendered event is used to first render lazy-load img and so on
    imgDomList.push(this.$refs.img)
    if (imgDomList.length === 1) {
      setTimeout(() => {
        onScroll()
        window.addEventListener('scroll', onScroll, false)
        window.addEventListener('resize', onScroll, false)
      }, 300)
    }
    window._lazyImgCount++
  },
  beforeDestroy: function() {
    const ind = imgDomList.indexOf(this.$refs.img)
    if (ind > -1) imgDomList.splice(ind, 1)
  }
}
</script>

<style scoped lang="less">
img {
  width: 100%;
  height: 100%;
}
</style>

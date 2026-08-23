<template>
  <aside class="right-placeholder">
    <slot>占位区域</slot>
  </aside>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less">
// 右侧占位区域：宽 240 ~ 300（用 screen 媒体查询适配，min-width 大的查询写在后面）
.right-placeholder {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 240px;
  min-width: 240px;
  max-width: 300px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  color: #86909c;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

@media screen and (min-width: 1320px) {
  .right-placeholder {
    width: 300px;
  }
}
</style>

<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar />
  </div>

  <el-container style="height: 100%">
    <el-main class="not-found-main">
      <div class="error-container">
        <div class="error-panel">
          <img src="//static.hdslb.com/error/very_sorry.png" alt="" />
          <div style="text-align: center">
            <el-button type="primary" style="width: 120px; height: 40px">
              <router-link to="/" class="back-home-link">返回首页</router-link>
            </el-button>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.body.style.backgroundColor = '#f1f2f3'
})
</script>

<style scoped lang="less">
.error-container {
  background: @white;
  margin: 10px auto 10px;
  border-radius: 10px;
  padding-bottom: 20px;
  width: 980px;
}
</style>

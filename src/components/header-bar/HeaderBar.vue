<template>
  <el-dialog v-model="userStore.showLoginWindow" width="820" style="min-height: 430px" :show-close="false"
    :align-center="true">
    <div class="hiri-login-wrap">
      <!--关闭按钮-->
      <div class="close-btn" @click="userStore.showLoginWindow = !userStore.showLoginWindow">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-close"></use>
        </svg>
      </div>
      <div class="login-scan-wp">
        <div class="login-scan-title">扫描二维码登录</div>
        <img src="@/assets/img/qrcode.png" alt=" " class="login-qrcode" />
        <div class="login-scan-desc">
          <p>请使用hirihiri客户端</p>
          <p>扫码登录或扫码下载APP</p>
        </div>
      </div>
      <el-divider direction="vertical" style="height: 228px" />
      <div class="login-right-wp">
        <div class="login-tab-wp">
          <div>密码登录</div>
        </div>
        <div class="login-pwd-wp">
          <el-form label-width="auto" label-position="right">
            <el-form-item label="用户名" label-position="right">
              <el-input type="text" style="width: 100%; height: 40px" v-model="userStore.user.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" label-position="right">
              <el-input type="password" style="width: 100%; height: 40px" v-model="userStore.password"></el-input>
            </el-form-item>
            <!--这里必须用箭头函数,因为方法返回的是Promise,直接写会出现奇怪问题-->
            <el-button class="register" @click="() => userStore.register()"> 注册</el-button>
            <!--这里必须用箭头函数,因为方法返回的是Promise,直接写会出现奇怪问题-->
            <el-button class="login" type="primary" @click="() => userStore.login()">
              登录
            </el-button>
          </el-form>
        </div>
        <div class="login-sns-wp">
          <div class="login-sns-title">其他方式登录</div>
          <div class="login-sns-content">
            <div class="login-sns-item">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAgVBMVEUAAABXu0BYt0BQt0BXu0BWu0BXu0BXu0BXu0BWukBWukBXvEBXu0BXvEBXvEBYukBVukBXu0BWt0BXukBXuEBXu0D////1+/Pq9+fV7s/A5rer3aBsw1jg89uBzHBiwEy14auL0Xug2ZOW1YeBzG93yGSW1YjL6sO14azL6cN2yGP3XpzOAAAAFXRSTlMA3yAQ78+/r5+AUI9w74BgYEBAkHDBb56KAAACF0lEQVRIx52W6XKDIBRGwT3GZmsRUXFP0vb9H7AKGS8aiCXnR0TCmU/gOoh0uJck8jEZwUGYXND/cOPggyz4CE//0HZgKeDIsdSA3Qs1Bk2XejLF7ckGe1fnOT7ZBDsaDxNiZ4Jna4Jnb7rgbeKrK7QnFuzBOxIrYrsJAth9iIdl/9CwLE0pv/elqfoegWpfXdAUYINW9GRkRIBWakBemiOVGRbpE1lpijwaPDANCxvCc8qBbcVF47vq5EQ1YjCK3nyXiXE3QqrpSseeu+jptc96XgWmHSGDEGtCmDHygpK5nUuRdr2MvvfNdMvzXCN+KVNk6RO0qOpr37fXJzFCwdzmT9532THZovmqFHxlF3/WcdWQGUsBI2g3K/G3WG3o4oEVsVqOK4RHaTpfaKkXCVsWzPTL65pPN7X4kxnEX6qIXS4mJqfOH5tVKSJWzJsiXqlcklxe5AI0yuL4RDUpiKkGphRrRFRK+lLk88AQSg4KXVC9TvwSRQ4MU5m1xZ2xlmnEm1LkrqeKTVbU5rcaNtJDCAWqCOutq90CpjiKMTFQZuuah/9Oo+h6ZtPkYTSxI0YKReWLtxFBpJ5bzjOasWYsoBp6HQSRW5R5tz4C4HS0PltjO/H05sH6iQDXtz0d3/94ANPes/9Asjd9572PwE8X6Tm+DPViZMQ5mLUDxGnVCFtqwDH0VlYQS22bcxIGIhn7UXLWWn+10s6FZo+4YQAAAABJRU5ErkJggg=="
                class="login-sns-item-icon" alt="" /><span class="login-sns-name">微信登录</span>
            </div>
            <div class="login-sns-item">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAh1BMVEUAAADXQDjTQDzaQzfcRTfbRDfcRDbcQzbbRDbbRDfcQzbaQzbbRDbbRDbaRDfcQzbbRDfaQjjaQjXcQzfYRDfbRDTbRDf////gW1D99PPtoZvyubT76Ob20M3pioLdT0Tvrajkc2n20c3rlo7mfnb0xcD43NrrlY7kcmniZ1343driZ1z0xMEgvW1iAAAAFnRSTlMAIBDf34Dv78+/n1BAj7CvcGBgkHBwDUc+aAAAAmpJREFUSMeVlueCqjAQRgOI0qy7m0YVsN297/98OwEdCUQ05w8WDt/MkIjEhJv8RIFHAS/c/CTkM9w4XFKN5ebwgeaDNWURObYa4s+oMWrG1MOruDV9w9o1eU5A37JwDN6CUksTPWsTPXvTRe89wXBCa2rB+ukd6By3K6ca8WcNVoyxLB26i0ex/mxgzRTiMlx990A6C09PZ6XKwXbpIyP6Fn4C8zKONHVYFrJ4tJWfoUMJ5k2PPBi0igHZrX8j4HVLITPXB7udeK1gHem9ziJjouTwQYmnhCCuxh5UhSJO9qKmWwxrTcZeyh5UpcyFyOH0Bi5SaYNNyG7qYeK95CttWUWlJn6PW5RsSgVtlyqxoEhEQs1rNEPrldf5cI8Qb+hxYRKlaVsSY4NZKqU81aynpQY0kTNF3pS4fsDFvTESx4Gi0b4vMqWKdl4UcHWukmSeZXnRV9Gb5VgcDucIJ3B11JbckSmKyXAC7V7I52hxI2WmyYYk0m7+Dbd8JR7boTYlbshOE9WBsYb+MglBZ6r4p8TxXL+Hi7zov2dCnY1N8v7ViIS4z21V9q3U7Ap9YkzOulnrLAkZLtYTA4f+CpYLHEjFgCMdtwhiTBGedT+D/NwtIHU2V3li4tE9iO5qaILQwvF4LNUtTLsr8InnTX6Pebfq8qopmup/V29W0CkRIaNISDmxJwLqNeEYHwG8repzltVpA/Ua8UmP61ErPHy2xnbiniBflg9WxA0sCnXJAMezadDSRM/aRM/eDMCb4n7Z/glE9rOhq5i8xPFfaz7GmdXIs9aw4O1qZIUxam9IdtuwS/aCaJcYrT+uh9kYccQkXQAAAABJRU5ErkJggg=="
                class="login-sns-item-icon" alt="" /><span class="login-sns-name">微博登录</span>
            </div>
            <div class="login-sns-item">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAb1BMVEUAAABMouVIn+NEn99MouVMouVMo+ZMouVKouRKouJMn+NMouZLouRLo+VMoeNMouZLoeVLoeVNn+RMouX///+83Pal0PL0+v6x1vRireiay/FXqOfS6Pl5uevH4vePxe+Ev+1utOrp9Pzp8/yEv+7XzqLPAAAAE3RSTlMA3yAQ74C/n2BQQK9wz5CPz7BwJ8NfpgAAAbNJREFUSMe1lutygjAQhTeEOyi2AQIC3t//GcvYqk3OYsh0+v1yMN+czc4mQBwyL5ONUDMiLsqc1iGzOFQGYZGu0KLZQkQSrNSQ6I2aGRqkpktxlXJQSc4LNsqJCBhPOCQwwXOa6PmbErxlNpJeVMqD6uWliqOfprPiyN5tcOp0PaObntnmo9hIAV39pFNA9BOogKb+RQN/h9+RCfzR1gbtQqSArtQmemAjUy4QI7GxBTy92qKGJfEshlgp0DO15srmhuIRFuX0Cc/2KO5hUUkF1xt3dxKKuUS3uCPBjA0w4rySwqYyDLCM+EqxVrd45UTtFm81ywlEuzkHXhyhOfY1DArfntg+jRMY/PB80CeODaLhHigpt7fYNSgeuvpgD7k0j9V4Gfbc6RjN7oRE1rCeejVo27vMD4/WFokynB33qUpnUYb+t5zg7+OhNYrVxx5PIzGRJ9ijniwxIC7y3DV3urZ9/DrDfQxvR793a+YnpvRk6+Nt6YXceRQq//rxgKb/h87/fVrtAmKQW2c/JfGkb0PDjBYJomUtMuJQTcRKDUmL0LLiDDWevCzie7LYJGXOWl/BnLhvbq/sWgAAAABJRU5ErkJggg=="
                class="login-sns-item-icon" alt="" /><span class="login-sns-name">QQ登录</span>
            </div>
          </div>
        </div>
        <div class="login-agreement-wp">
          <p>未注册过hirihiri的手机号，我们将自动帮你注册账号</p>
          <p>登录或完成注册即代表你同意用户协议和隐私政策</p>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 头部 -->
  <div class="hiri-header__bar">
    <!-- 头部左边 -->
    <ul class="left-entry">
      <li>
        <router-link to="/" class="entry-title">
          <el-icon class="left-icon left-entry-text">
            <SwitchFilled />
          </el-icon>
          <span class="left-entry-text">首页</span>
        </router-link>
      </li>
      <li>
        <a href="https://www.bilibili.com/anime" class="left-default-entry"><span class="left-entry-text">番剧</span></a>
      </li>
      <li>
        <a href="https://live.bilibili.com" class="left-default-entry"><span class="left-entry-text">直播</span></a>
      </li>
      <li>
        <a href="https://game.bilibili.com/platform" class="left-default-entry"><span
            class="left-entry-text">游戏中心</span></a>
      </li>
      <li>
        <a href="https://show.bilibili.com/platform/home.html" class="left-default-entry"><span
            class="left-entry-text">会员购</span></a>
      </li>
      <li>
        <a href="https://manga.bilibili.com" class="left-default-entry"><span class="left-entry-text">漫画</span></a>
      </li>
      <li>
        <a href="https://www.bilibili.com/match/home" class="left-default-entry"><span
            class="left-entry-text">赛事</span></a>
      </li>
      <li>
        <a href="#" class="entry-title">
          <!--          <svg class="icon" aria-hidden="true">-->
          <!--            <use xlink:href="#icon-download"></use>-->
          <!--          </svg>-->
          <el-icon class="left-icon left-entry-text">
            <Download />
          </el-icon>
          <span class="left-entry-text">下载客户端</span></a>
      </li>
    </ul>
    <!-- 头部中间搜索框 -->
    <div class="center-search-container">
      <SearchBox placeholder="请输入内容" />
    </div>
    <!-- 头部右边 -->
    <ul class="right-entry">
      <!--登录后显示的头像-->
      <MyPopover class="avatar-popover-login" v-if="userStore.isLogin">
        <template #content>
          <div class="header-entry-large">
            <router-link v-if="userStore.user.uid" :to="`/space/${userStore.user.uid}`" class="nickname-item">{{ userStore.user.username }}</router-link>
            <div class="vip-item">
              <a class="vip-item__label">
                <img src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png"
                  alt="" />
              </a>

              <a class="level-max">
                <img
                  class="level-icon-img"
                  :src="getLevelIconUrl(getLevelByExp(userStore.user.exp))"
                  :alt="`Lv${getLevelByExp(userStore.user.exp)}`"
                />
              </a>
            </div>
            <div class="coins-item">
              <a href="#">
                <span class="coin-item__text">硬币:</span><span class="coin-item__num">{{ userStore.user.coin }}</span>
              </a>
              <a href="#">
                <span class="coin-item__text">H币:</span><span class="coin-item__num">9999</span>
              </a>
            </div>
            <div class="counts-item">
              <a class="single-count-item" @click.prevent="goMySpace('followings')">
                <span class="counts-item__num">{{ formatNumber(userStore.currentUserFollow.followings) }}</span><span class="counts-item__text">关注</span>
              </a>
              <a class="single-count-item" @click.prevent="goMySpace('followers')">
                <span class="counts-item__num">{{ formatNumber(userStore.currentUserFollow.followers) }}</span><span class="counts-item__text">粉丝</span>
              </a>
              <a class="single-count-item" @click.prevent="goMySpace('video')">
                <span class="counts-item__num">9999</span><span class="counts-item__text">动态</span>
              </a>
            </div>
            <div class="vip-entry-container">
              <div class="vip-entry-desc">
                <p class="vip-entry-desc-title">您有待使用的特惠补贴</p>
                <p class="vip-entry-desc-subtitle">联合会员双年卡低至3.4折</p>
              </div>
              <div class="vip-entry-btn">会员中心</div>
            </div>
            <div class="links-item">
              <router-link v-if="userStore.user.uid" :to="`/space/${userStore.user.uid}`" class="single-link-item">
                <div class="link-title">
                  <el-icon :size="20" style="margin-right: 16px">
                    <User />
                  </el-icon>
                  <span>个人中心</span>
                </div>
              </router-link>
              <router-link to="/platform/upload-manager/article" class="single-link-item">
                <div class="link-title">
                  <el-icon :size="20" style="margin-right: 16px">
                    <Edit />
                  </el-icon>
                  <span>投稿管理</span>
                </div>
              </router-link>
              <a href="#" class="single-link-item">
                <div class="link-title">
                  <el-icon :size="20" style="margin-right: 16px">
                    <Star />
                  </el-icon>
                  <span>推荐服务</span>
                </div>
              </a>
            </div>
            <el-divider style="margin: 10px 0" />
            <div class="logout-item" @click="userStore.logout()">
              <el-icon :size="20" style="margin-right: 16px">
                <CloseBold />
              </el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </template>
        <template #reference>
          <li>
            <!--头像-->
            <div>
              <router-link v-if="userStore.user.uid" :to="`/space/${userStore.user.uid}`" class="header-entry-mini">
                <img class="hiri-avatar-img" :src="userStore.user.avatar" alt="" />
              </router-link>
            </div>
          </li>
        </template>
      </MyPopover>
      <!--未登录显示的默认头像-->
      <li v-else>
        <div class="avatar-logout" @click="userStore.showLoginWindow = !userStore.showLoginWindow">
          <span>登录</span>
        </div>
      </li>

      <li @click="handleRightEntryClick">
        <a href="#" class="right-default-entry v-popover-wrap">
          <svg class="icon right-icon" aria-hidden="true">
            <use xlink:href="#icon-dahuiyuanlogo"></use>
          </svg>
          <span class="right-entry-text">大会员</span>
        </a>
      </li>
      <li @click="handleRightEntryClick">
        <a href="#" class="right-default-entry v-popover-wrap">
          <el-icon class="right-icon">
            <Message />
          </el-icon>
          <span class="right-entry-text">消息</span>
        </a>
      </li>
      <li @click="handleRightEntryClick">
        <a href="#" class="right-default-entry v-popover-wrap">
          <el-icon class="right-icon">
            <ChromeFilled />
          </el-icon>
          <span class="right-entry-text">动态</span>
        </a>
      </li>
      <li @click="handleRightEntryClick">
        <router-link :to="`/space/${userStore.user.uid}?tab=favorites`" class="right-default-entry v-popover-wrap">
          <el-icon class="right-icon">
            <Star />
          </el-icon>
          <span class="right-entry-text">收藏</span>
        </router-link>
      </li>
      <li @click="handleRightEntryClick">
        <router-link to="/history" class="right-default-entry v-popover-wrap" target="_blank">
          <el-icon class="right-icon">
            <Clock />
          </el-icon>
          <span class="right-entry-text">历史</span>
        </router-link>
      </li>
      <li @click="handleRightEntryClick">
        <router-link to="/platform/home" class="right-default-entry v-popover-wrap">
          <el-icon class="right-icon">
            <EditPen />
          </el-icon>
          <span class="right-entry-text">创作中心</span>
        </router-link>
      </li>
      <li>
        <div @click="handleUploadClick" class="right-default-entry v-popover-wrap">
          <el-button type="primary" color="#fb7299">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-upload"></use>
            </svg>
            <span class="right-entry-text upload">投稿</span>
          </el-button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import MyPopover from '@/components/my-popover/MyPopover.vue'
import SearchBox from '@/components/search/SearchBox.vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useRouter } from 'vue-router'
import { formatNumber, getLevelByExp, getLevelIconUrl } from '@/utils/utils'

const router = useRouter()
const userStore = useUserStore()

const goMySpace = (tab: string) => {
  if (!userStore.user.uid) return
  router.push({ path: `/space/${userStore.user.uid}`, query: { tab } })
}

const ensureLogin = () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return false
  }
  return true
}

const handleUploadClick = () => {
  if (!ensureLogin()) return
  const route = router.resolve({ path: '/platform/upload' })
  window.open(route.href, '_blank')
}

const handleRightEntryClick = (event: Event) => {
  if (!userStore.isLogin) {
    event.preventDefault()
    userStore.showLoginWindow = true
    return
  }
}
</script>

<style lang="less" scoped>
.hiri-login-wrap {
  display: flex;
  justify-content: space-around;
  padding: 20px 49px 13px 66px;
  position: relative;

  .close-btn {
    position: absolute;
    right: 0;
    top: 0;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  .login-scan-wp {
    display: flex;
    flex-direction: column;
    align-items: center;

    .login-scan-title {
      font-size: 18px;
    }

    .login-qrcode {
      margin-top: 26px;
    }

    .login-scan-desc {
      margin-top: 18px;
      font-size: 13px;
      text-align: center;
    }
  }

  .login-right-wp {
    display: flex;
    flex-direction: column;
    align-items: center;

    .login-tab-wp {
      font-size: 18px;
    }

    .login-pwd-wp {
      margin-top: 18px;

      .el-form-item {
        align-items: center;
      }

      .register,
      .login {
        width: 194px;
        height: 40px;
        border-radius: 8px;
        border: 1px solid #e3e5e7;
      }
    }

    .login-sns-wp {
      margin-top: 20px;
      font-size: 13px;
      color: #9499a0;

      .login-sns-title {
        text-align: center;
      }

      .login-sns-content {
        display: flex;
        margin-top: 10px;

        .login-sns-item {
          display: flex;
          align-items: center;
          margin-right: 30px;
          cursor: pointer;

          img {
            width: 28px;
            height: 28px;
            margin-right: 8px;
          }
        }
      }
    }

    .login-agreement-wp {
      position: absolute;
      font-size: 13px;
      color: #999;
      text-align: center;
      line-height: 19px;
      bottom: -60px;
      left: 32%;
    }
  }
}

//}

// 头部
.hiri-header__bar {
  position: var(--position);
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  width: 100%;
  padding: 0 24px;
  box-shadow: var(--header-shadow);
  background: var(--bg-color);
  z-index: 100;

  // 左边
  .left-entry {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin-right: 30px;

    .entry-title {
      .left-icon {
        font-size: 18px;
        margin-right: 6px;
      }
    }

    .entry-title,
    .left-default-entry {
      display: flex;
      align-items: center;
      height: 64px;
      line-height: 64px;
      font-size: 14px;

      .left-entry-text {
        color: var(--text-color);
      }
    }

    .left-default-entry:hover {
      animation: jump 0.3s;
    }
  }

  // 搜索框
  .center-search-container {
    flex: 1 auto;
    display: var(--search-display);

    .nav-searchform {
      display: flex;
      height: 40px;
      margin: 0 auto;
      min-width: 181px;
      max-width: 500px;
      position: relative;
      border-radius: 8px;
      border: 1px solid #e3e5e7;
      background: #f1f2f3;
      transition: all 0.3s ease;

      &--focus {
        background: #fff;
        border-color: #e3e5e7;
        border-radius: 8px 8px 0 0;
      }

      &__input {
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        padding: 0 16px;
        font-size: 14px;
        color: #18191c;
        min-width: 0;

        &::placeholder {
          color: #9499a0;
        }
      }

      &__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #c0c4cc;
        flex-shrink: 0;
        transition: color 0.2s;

        &:hover {
          color: #9499a0;
        }
      }

      &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 100%;
        border: none;
        border-left: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        color: #9499a0;
        transition: all 0.3s ease;
        flex-shrink: 0;

        &:hover {
          color: #00aeec;
        }
      }

      &--focus &__btn {
        border-left-color: #e3e5e7;
        background: #fff;

        &:hover {
          background: #f1f2f3;
        }
      }

      .search-panel {
        padding: 13px 0 16px;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        max-height: 480px;
        overflow-y: auto;

        &__section {
          margin-bottom: 0;
          padding: 0 16px;
        }

        &__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        &__title {
          font-size: 14px;
          font-weight: 600;
          color: #18191c;
        }

        &__clear {
          font-size: 12px;
          color: #9499a0;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #fb7299;
          }
        }

        &__divider {
          height: 1px;
          background: #e3e5e7;
          margin: 16px 0;
        }

        &__expand {
          font-size: 12px;
          color: #9499a0;
          text-align: center;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 15px;
          transition: color 0.2s;

          &:hover {
            color: #00aeec;
          }
        }
      }

      .suggest-item {
        height: 36px;
        padding: 0 16px;
        line-height: 36px;
        font-size: 14px;
        color: #18191c;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background-color 0.2s;

        &:hover {
          background: #e9e9eb;
        }

        :deep(.suggest-item__highlight) {
          color: #fb7299;
          font-weight: 500;
        }
      }

      .search-history-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 6px 6px 0 6px;
        margin-bottom: 15px;
        max-height: 62px;
        overflow: hidden;
        transition: max-height 0.3s ease;

        &--expanded {
          max-height: 126px;
        }
      }

      .search-history-item {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding: 0 8px;
        background: #f4f4f5;
        border: 1px solid #e9e9eb;
        border-radius: 4px;
        font-size: 12px;
        color: #606266;
        cursor: pointer;
        box-sizing: border-box;
        transition: all 0.2s;

        &:hover {
          background: #ecf5ff;
          border-color: #d9ecff;
          color: #409eff;
        }

        .search-history-item__text {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-history-item__close {
          position: absolute;
          top: -6px;
          right: -6px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          font-size: 10px;
          line-height: 1;
          color: #fff;
          background: #c0c4cc;
          border: 1px solid #c0c4cc;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover .search-history-item__close {
          opacity: 1;
        }
      }

      .hot-search-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 16px;

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }

      .hot-search-item {
        display: flex;
        align-items: center;
        min-width: 0;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #e9e9eb;
        }

        .hot-search-item__rank {
          width: 20px;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 600;
          color: #9499a0;
          text-align: center;
          margin-right: 8px;

          &.hot-search-item__rank--top {
            color: #fb7299;
          }
        }

        .hot-search-item__text {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          color: #18191c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // 右边
  .right-entry {
    display: flex;
    //flex-shrink: 1;
    align-items: center;
    margin-left: 30px;

    :deep(.v-popover.to-bottom) {
      top: 130%;
      left: 10%;
    }

    .el-icon--right {
      margin: 0;
    }

    .avatar-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #00aeec;
      font-size: 14px;
      color: #ffffff;
      cursor: pointer;
    }

    .avatar-popover-login,
    .avatar-logout {
      margin-right: 15px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      margin-top: -3px;

      &:hover .hiri-avatar-img {
        transform: scale(2.5, 2.5) translate(-6px, 12px);
        z-index: 2;
        position: relative;
        transition: transform 0.5s ease;
      }

      .hiri-avatar-img {
        border: 2px solid #fff;
        display: block;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        margin-right: 10px;
        transition: transform 0.5s ease;
      }
    }

    .header-entry-large {
      z-index: 1;
      width: 300px;
      padding: 0 20px 18px;

      .nickname-item {
        display: block;
        text-align: center;
        margin-top: 45px;
        font-size: 18px;
        color: rgb(251, 114, 153);
      }

      .vip-item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 4px 0;

        .vip-item__label {
          width: 60px;
          height: 20px;
          display: block;

          img {
            width: 100%;
          }
        }

        .level-max {
          display: flex;
          align-items: center;
          padding-left: 5px;

          .level-icon-img {
            width: 40px;
            height: 14px;
          }
        }
      }

      .coins-item {
        display: flex;
        justify-content: center;
        font-size: 12px;

        .coin-item__text {
          padding-right: 5px;
          color: #9499a0;
        }

        .coin-item__num {
          padding-right: 10px;
          color: #18191c;
        }
      }

      .counts-item {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-top: 10px;

        .single-count-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #ffecf1;

            .counts-item__num,
            .counts-item__text {
              color: #ff6699;
            }
          }

          .counts-item__num {
            color: #18191c;
            font-size: 18px;
          }

          .counts-item__text {
            font-size: 12px;
            color: #9499a0;
          }
        }
      }

      .vip-entry-container {
        cursor: pointer;
        background-image: url(https://hirihiri.oss-cn-nanjing.aliyuncs.com/eAwhtOhoSo.png);
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-top: 10px;
        padding: 9px 12px;
        border-radius: 6px;

        .vip-entry-desc {
          .vip-entry-desc-title {
            color: rgb(255, 102, 153);
            font-size: 14px;
          }

          .vip-entry-desc-subtitle {
            color: rgb(97, 102, 109);
            font-size: 12px;
          }
        }

        .vip-entry-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(72 104 195);
          background: rgb(255, 255, 255);
          font-size: 12px;
          height: 30px;
          width: 65px;
          border-radius: 6px;
        }
      }

      .links-item {
        margin-top: 10px;

        .single-link-item {
          display: flex;
          align-items: center;
          height: 38px;
          border-radius: 6px;
          color: #61666d;
          font-size: 14px;
          transition: background-color 0.3s;
          padding: 0 14px;

          &:hover {
            background-color: #e3e5e7;
          }

          .link-title {
            display: flex;
          }
        }
      }

      .logout-item {
        display: flex;
        align-items: center;
        height: 38px;
        border-radius: 6px;
        color: #61666d;
        font-size: 14px;
        transition: background-color 0.3s;
        cursor: pointer;
        padding: 0 14px;

        &:hover {
          background-color: #e3e5e7;
        }
      }
    }

    .right-default-entry {
      color: var(--text-color);
      height: 64px;
      margin-right: 15px;
      font-size: 14px;
    }

    .v-popover-wrap {
      display: flex;
      flex-direction: column;
      line-height: normal;
      align-items: center;
      justify-content: center;

      .el-button--primary {
        color: #fff;
        border-radius: 8px;

        .right-entry-text.upload {
          margin-left: 5px;
        }
      }
    }

    .right-icon {
      font-size: 20px;
    }

    .v-popover-wrap:hover .right-icon {
      animation: jump 0.3s;
    }
  }
}

@keyframes jump {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
    /* 跳跃的高度可以根据需要调整 */
  }
}

@media (max-width: 1099.9px) {

  .hiri-header .left-entry,
  .left-default-entry,
  .entry-title {
    margin-right: 10px !important;
  }
}

@media (min-width: 1100px) and (max-width: 1366.9px) {

  .hiri-header .left-entry,
  .left-default-entry,
  .entry-title {
    margin-right: 10px !important;
  }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {

  .left-default-entry,
  .entry-title {
    margin-right: 15px !important;
  }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {

  .left-default-entry,
  .entry-title {
    margin-right: 20px !important;
  }
}

@media (min-width: 2200px) {

  .left-default-entry,
  .entry-title {
    margin-right: 20px !important;
  }
}

@media (max-width: 1330px) {
  .right-entry-text {
    display: none;
  }
}
</style>

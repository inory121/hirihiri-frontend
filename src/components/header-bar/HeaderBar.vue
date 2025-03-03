<template>
  <el-dialog
    v-model="userStore.showLoginWindow"
    width="820"
    style="min-height: 430px"
    :show-close="false"
    :align-center="true"
  >
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
              <el-input
                type="text"
                style="width: 100%; height: 40px"
                v-model="userStore.user.username"
              ></el-input>
            </el-form-item>
            <el-form-item label="密码" label-position="right">
              <el-input
                type="password"
                style="width: 100%; height: 40px"
                v-model="userStore.password"
              ></el-input>
            </el-form-item>
            <!--这里必须用箭头函数,因为方法返回的是Promise,直接写会出现奇怪问题-->
            <el-button class="register" color="#fff" @click="() => userStore.register()">
              注册
            </el-button>
            <!--这里必须用箭头函数,因为方法返回的是Promise,直接写会出现奇怪问题-->
            <el-button class="login" color="#00aeec" @click="() => userStore.login()">
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
                class="login-sns-item-icon"
                alt=""
              /><span class="login-sns-name">微信登录</span>
            </div>
            <div class="login-sns-item">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAh1BMVEUAAADXQDjTQDzaQzfcRTfbRDfcRDbcQzbbRDbbRDfcQzbaQzbbRDbbRDbaRDfcQzbbRDfaQjjaQjXcQzfYRDfbRDTbRDf////gW1D99PPtoZvyubT76Ob20M3pioLdT0Tvrajkc2n20c3rlo7mfnb0xcD43NrrlY7kcmniZ1343driZ1z0xMEgvW1iAAAAFnRSTlMAIBDf34Dv78+/n1BAj7CvcGBgkHBwDUc+aAAAAmpJREFUSMeVlueCqjAQRgOI0qy7m0YVsN297/98OwEdCUQ05w8WDt/MkIjEhJv8RIFHAS/c/CTkM9w4XFKN5ebwgeaDNWURObYa4s+oMWrG1MOruDV9w9o1eU5A37JwDN6CUksTPWsTPXvTRe89wXBCa2rB+ukd6By3K6ca8WcNVoyxLB26i0ex/mxgzRTiMlx990A6C09PZ6XKwXbpIyP6Fn4C8zKONHVYFrJ4tJWfoUMJ5k2PPBi0igHZrX8j4HVLITPXB7udeK1gHem9ziJjouTwQYmnhCCuxh5UhSJO9qKmWwxrTcZeyh5UpcyFyOH0Bi5SaYNNyG7qYeK95CttWUWlJn6PW5RsSgVtlyqxoEhEQs1rNEPrldf5cI8Qb+hxYRKlaVsSY4NZKqU81aynpQY0kTNF3pS4fsDFvTESx4Gi0b4vMqWKdl4UcHWukmSeZXnRV9Gb5VgcDucIJ3B11JbckSmKyXAC7V7I52hxI2WmyYYk0m7+Dbd8JR7boTYlbshOE9WBsYb+MglBZ6r4p8TxXL+Hi7zov2dCnY1N8v7ViIS4z21V9q3U7Ap9YkzOulnrLAkZLtYTA4f+CpYLHEjFgCMdtwhiTBGedT+D/NwtIHU2V3li4tE9iO5qaILQwvF4LNUtTLsr8InnTX6Pebfq8qopmup/V29W0CkRIaNISDmxJwLqNeEYHwG8repzltVpA/Ua8UmP61ErPHy2xnbiniBflg9WxA0sCnXJAMezadDSRM/aRM/eDMCb4n7Z/glE9rOhq5i8xPFfaz7GmdXIs9aw4O1qZIUxam9IdtuwS/aCaJcYrT+uh9kYccQkXQAAAABJRU5ErkJggg=="
                class="login-sns-item-icon"
                alt=""
              /><span class="login-sns-name">微博登录</span>
            </div>
            <div class="login-sns-item">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAb1BMVEUAAABMouVIn+NEn99MouVMouVMo+ZMouVKouRKouJMn+NMouZLouRLo+VMoeNMouZLoeVLoeVNn+RMouX///+83Pal0PL0+v6x1vRireiay/FXqOfS6Pl5uevH4vePxe+Ev+1utOrp9Pzp8/yEv+7XzqLPAAAAE3RSTlMA3yAQ74C/n2BQQK9wz5CPz7BwJ8NfpgAAAbNJREFUSMe1lutygjAQhTeEOyi2AQIC3t//GcvYqk3OYsh0+v1yMN+czc4mQBwyL5ONUDMiLsqc1iGzOFQGYZGu0KLZQkQSrNSQ6I2aGRqkpktxlXJQSc4LNsqJCBhPOCQwwXOa6PmbErxlNpJeVMqD6uWliqOfprPiyN5tcOp0PaObntnmo9hIAV39pFNA9BOogKb+RQN/h9+RCfzR1gbtQqSArtQmemAjUy4QI7GxBTy92qKGJfEshlgp0DO15srmhuIRFuX0Cc/2KO5hUUkF1xt3dxKKuUS3uCPBjA0w4rySwqYyDLCM+EqxVrd45UTtFm81ywlEuzkHXhyhOfY1DArfntg+jRMY/PB80CeODaLhHigpt7fYNSgeuvpgD7k0j9V4Gfbc6RjN7oRE1rCeejVo27vMD4/WFokynB33qUpnUYb+t5zg7+OhNYrVxx5PIzGRJ9ijniwxIC7y3DV3urZ9/DrDfQxvR793a+YnpvRk6+Nt6YXceRQq//rxgKb/h87/fVrtAmKQW2c/JfGkb0PDjBYJomUtMuJQTcRKDUmL0LLiDDWevCzie7LYJGXOWl/BnLhvbq/sWgAAAABJRU5ErkJggg=="
                class="login-sns-item-icon"
                alt=""
              /><span class="login-sns-name">QQ登录</span>
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
        <a href="/" class="entry-title">
          <el-icon class="left-icon left-entry-text">
            <SwitchFilled />
          </el-icon>
          <span class="left-entry-text">首页</span>
        </a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">番剧</span></a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">直播</span></a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">游戏中心</span></a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">会员购</span></a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">漫画</span></a>
      </li>
      <li>
        <a href="#" class="left-default-entry"><span class="left-entry-text">赛事</span></a>
      </li>
      <li>
        <a href="#" class="entry-title">
<!--          <svg class="icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-download"></use>-->
<!--          </svg>-->
          <el-icon class="left-icon left-entry-text"><Download /></el-icon>
          <span class="left-entry-text">下载客户端</span></a
        >
      </li>
    </ul>
    <!-- 头部中间搜索框 -->
    <div class="center-search-container">
      <div>
        <form action="#" class="nav-searchform">
          <el-input v-model="input" placeholder="请输入内容" :prefix-icon="Search" />
        </form>
      </div>
    </div>
    <!-- 头部右边 -->
    <ul class="right-entry">
      <!--登录后显示的头像-->
      <MyPopover class="avatar-popover-login" v-if="userStore.isLogin">
        <template #content>
          <div class="header-entry-large">
            <a href="#" class="nickname-item">{{ userStore.user.username }}</a>
            <div class="vip-item">
              <a class="vip-item__label">
                <img
                  src="https://i1.hdslb.com/bfs/vip/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png@800w_40h_0e"
                  alt=""
                />
              </a>

              <a class="level-max">
                <svg
                  class="icon"
                  viewBox="0 0 2633 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  width="200"
                  height="200"
                >
                  <path
                    d="M169.545143 163.181714h2248.923428v707.364572H169.545143z"
                    fill="#FFFFFF"
                  ></path>
                  <path
                    class="level-bg"
                    d="M2510.994286 73.142857c22.747429 0 45.494857 20.772571 44.397714 43.300572l-0.950857 6.144v747.446857c0 22.381714-15.36 44.909714-41.472 48.786285l-8.118857 0.585143H144.676571a48.859429 48.859429 0 0 1-49.005714-41.252571l-0.512-8.118857V209.042286c0-22.454857 15.36-44.982857 41.398857-48.859429l8.118857-0.585143h1021.805715v-37.010285c0-22.454857 15.36-44.982857 41.472-48.859429l8.045714-0.585143h1295.067429zM2170.88 174.518857l-272.310857 370.614857a27.867429 27.867429 0 0 0 22.528 44.397715h176.713143l-30.427429 210.944c-4.169143 28.745143 32.914286 43.958857 50.176 20.48l272.237714-370.541715a27.940571 27.940571 0 0 0-22.528-44.470857h-176.713142l30.427428-210.870857c4.169143-28.818286-32.914286-43.958857-50.102857-20.553143z m-484.059429 3.584h-384c-18.505143 0-37.010286 18.578286-37.010285 37.083429v574.464c0 18.578286 18.505143 37.083429 37.083428 37.083428h384c18.505143 0 37.083429-18.505143 37.083429-37.083428V474.624c0-18.505143-18.578286-37.010286-37.156572-37.010286h-297.179428V301.714286h297.179428c18.578286 0 37.156571-18.578286 37.156572-37.083429v-49.444571c0-18.505143-18.578286-37.083429-37.156572-37.083429zM733.037714 264.630857h-49.517714c-18.578286 0-37.156571 18.505143-37.156571 37.083429v302.665143c0 16.822857 0 31.817143 6.217142 37.083428l173.348572 172.909714c12.434286 12.361143 43.373714 12.361143 43.373714 12.361143s30.939429 0 43.373714-12.361143l185.782858-172.909714c6.144-6.217143 6.144-18.578286 6.144-30.866286V307.858286c0-18.505143-18.578286-37.010286-37.156572-37.010286h-49.444571c-18.651429 0-37.229714 18.505143-37.229715 37.010286V585.874286l-105.325714 104.96L770.194286 585.874286V301.714286c0-18.578286-18.578286-37.083429-37.156572-37.083429z m-445.878857 0h-49.590857c-16.530286 0-32.987429 14.628571-36.498286 30.939429l-0.658285 6.144v488.009143c0 16.457143 14.628571 32.914286 31.012571 36.352l6.144 0.658285h297.252571c16.530286 0 33.060571-14.628571 36.571429-30.866285l0.585143-6.144v-49.444572c0-16.530286-14.628571-32.914286-30.939429-36.425143l-6.217143-0.658285H324.315429V301.714286c0-18.578286-18.578286-37.083429-37.156572-37.083429z m1312.914286 296.521143v142.043429h-210.505143V561.152h210.432z"
                    fill="#FF0000"
                  ></path>
                </svg>
              </a>
            </div>
            <div class="coins-item">
              <a href="#">
                <span class="coin-item__text">硬币:</span
                ><span class="coin-item__num">{{ userStore.user.coin }}</span>
              </a>
              <a href="#">
                <span class="coin-item__text">H币:</span><span class="coin-item__num">9999</span>
              </a>
            </div>
            <div class="counts-item">
              <a href="#" class="single-count-item">
                <span class="counts-item__num">9999</span
                ><span class="counts-item__text">关注</span>
              </a>
              <a href="#" class="single-count-item">
                <span class="counts-item__num">9999</span
                ><span class="counts-item__text">粉丝</span>
              </a>
              <a href="#" class="single-count-item">
                <span class="counts-item__num">9999</span
                ><span class="counts-item__text">动态</span>
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
              <a href="#" class="single-link-item">
                <div class="link-title">
                  <span>个人中心</span>
                </div>
              </a>
              <a href="#" class="single-link-item">
                <div class="link-title">
                  <span>投稿管理</span>
                </div>
              </a>
              <a href="#" class="single-link-item">
                <div class="link-title">
                  <span>推荐服务</span>
                </div>
              </a>
            </div>
            <el-divider style="margin: 10px 0" />
            <div class="logout-item" @click="userStore.logout()">
              <span>退出登录</span>
            </div>
          </div>
        </template>
        <template #reference>
          <li>
            <!--头像-->
            <div>
              <a href="#" class="header-entry-mini">
                <img
                  class="hiri-avatar-img"
                  src="https://i0.hdslb.com/bfs/baselabs/05b340832a490209f185542bb9690fc748bc08f7.png@240w_240h_1c"
                  alt=""
                />
              </a>
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

      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
          <svg class="icon right-icon" aria-hidden="true">
            <use xlink:href="#icon-dahuiyuanlogo"></use>
          </svg>
          <span class="right-entry-text">大会员</span>
        </a>
      </li>
      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
<!--          <svg class="icon right-icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-xiaoxi"></use>-->
<!--          </svg>-->
          <el-icon class="right-icon"><Message /></el-icon>
          <span class="right-entry-text">消息</span>
        </a>
      </li>
      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
<!--          <svg class="icon right-icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-dongtai"></use>-->
<!--          </svg>-->
          <el-icon class="right-icon"><ChromeFilled /></el-icon>
          <span class="right-entry-text">动态</span>
        </a>
      </li>
      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
<!--          <svg class="icon right-icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-shoucang"></use>-->
<!--          </svg>-->
          <el-icon class="right-icon"><Star /></el-icon>
          <span class="right-entry-text">收藏</span>
        </a>
      </li>
      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
<!--          <svg class="icon right-icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-history"></use>-->
<!--          </svg>-->
          <el-icon class="right-icon"><Clock /></el-icon>
          <span class="right-entry-text">历史</span>
        </a>
      </li>
      <li>
        <a href="#" class="right-default-entry v-popover-wrap">
<!--          <svg class="icon right-icon" aria-hidden="true">-->
<!--            <use xlink:href="#icon-Idea"></use>-->
<!--          </svg>-->
          <el-icon class="right-icon"><EditPen /></el-icon>
          <span class="right-entry-text">创作中心</span>
        </a>
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
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import MyPopover from '@/components/my-popover/MyPopover.vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useRouter } from 'vue-router'

const { textColor,headerShadow,bgColor } = defineProps({
  textColor: {
    type: String,
    default: '#fff', // 默认颜色为白色
  },
  headerShadow : {
    type: String,
    default: '', // 默认没有
  },
  bgColor: {
    type: String,
    default: 'transparent', // 默认颜色透明
  },
  position : {
    type: String,
    default: 'absolute',
  },
})
const router = useRouter()
const userStore = useUserStore()
const input = ref('')
const handleUploadClick = () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  // 获取路由的完整路径
  const route = router.resolve({ path: '/platform/upload' })
  // 新标签页打开
  window.open(route.href, '_blank')
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
        color: #fff;
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
  position: v-bind(position);
  top: 0;
  display: flex;
  align-items: center;
  height: 64px;
  width: 100%;
  padding: 0 24px;
  box-shadow: v-bind(headerShadow);
  background: v-bind(bgColor);
  z-index: 1;
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
        color: v-bind(textColor);
      }
    }

    .left-default-entry:hover {
      animation: jump 0.3s;
    }
  }

  // 搜索框
  .center-search-container {
    flex: 1 auto;
    height: 40px;

    .nav-searchform {
      display: flex;

      .el-input--prefix {
        justify-content: center;

        :deep(.el-input__wrapper) {
          border-radius: 8px;
          height: 40px;
          min-width: 268px;
          max-width: 500px;

          .el-input__inner:focus {
            background-color: #e3e5e7;
            border-radius: 8px;
            padding: 8px;
          }
        }
      }
    }
  }

  // 右边
  .right-entry {
    display: flex;
    flex-shrink: 1;
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
          width: 40px;
          height: 14px;
          padding-left: 5px;

          svg {
            width: 100%;
            height: 100%;
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
        background-image: url(https://i0.hdslb.com/bfs/activity-plat/static/20240724/e803d998c2d355f34ad8c36a6a729045/eAwhtOhoSo.png);
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

          &:hover {
            background-color: #e3e5e7;
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

        &:hover {
          background-color: #e3e5e7;
        }
      }
    }

    .right-default-entry {
      color: v-bind(textColor);
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

@media (max-width: 1279.9px) {
  .right-entry-text {
    display: none;
  }
}
</style>

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
            <a v-if="userStore.user.uid" :href="`/space/${userStore.user.uid}`" class="nickname-item" target="_blank">{{ userStore.user.username }}</a>
            <div class="vip-item">
              <a class="vip-item__label">
                <img src="https://hirihiri2.oss-cn-shanghai.aliyuncs.com/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png"
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
              <a v-if="userStore.user.uid" :href="`/space/${userStore.user.uid}`" class="single-link-item" target="_blank">
                <div class="link-title">
                  <el-icon :size="20" style="margin-right: 16px">
                    <User />
                  </el-icon>
                  <span>个人中心</span>
                </div>
              </a>
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
              <a v-if="userStore.user.uid" :href="`/space/${userStore.user.uid}`" class="header-entry-mini" target="_blank">
                <img class="hiri-avatar-img" :src="userStore.user.avatar" alt="" />
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

      <li @click="handleRightEntryClick">
        <a href="#" class="right-default-entry v-popover-wrap">
          <svg class="icon right-icon" aria-hidden="true">
            <use xlink:href="#icon-dahuiyuanlogo"></use>
          </svg>
          <span class="right-entry-text">大会员</span>
        </a>
      </li>
      <li>
        <el-popover
          placement="bottom"
          trigger="hover"
          :show-arrow="false"
          popper-class="message-popover"
          :offset="8"
        >
          <template #reference>
            <a href="/message" class="right-default-entry v-popover-wrap" target="_blank" @click="handleRightEntryClick">
              <el-badge :value="totalUnreadCount" :hidden="totalUnreadCount === 0" :max="99" class="message-badge">
                <el-icon class="right-icon">
                  <Message />
                </el-icon>
              </el-badge>
              <span class="right-entry-text">消息</span>
            </a>
          </template>
          <div class="message-popover-menu">
            <a :href="resolvePath('/message')" target="_blank" class="message-popover-item">
              <span class="message-popover-item__label">我的消息</span>
              <el-badge
                :value="messageUnread.privateUnread + messageUnread.strangerUnread"
                :hidden="messageUnread.privateUnread + messageUnread.strangerUnread === 0"
                :max="99"
                class="message-popover-item__badge"
              />
            </a>
            <a :href="resolvePath('/reply')" target="_blank" class="message-popover-item">
              <span class="message-popover-item__label">回复我的</span>
              <el-badge
                :value="messageUnread.replyUnread"
                :hidden="messageUnread.replyUnread === 0"
                :max="99"
                class="message-popover-item__badge"
              />
            </a>
            <a :href="resolvePath('/at')" target="_blank" class="message-popover-item">
              <span class="message-popover-item__label">@我的</span>
              <el-badge
                :value="messageUnread.atUnread"
                :hidden="messageUnread.atUnread === 0"
                :max="99"
                class="message-popover-item__badge"
              />
            </a>
            <a :href="resolvePath('/like')" target="_blank" class="message-popover-item">
              <span class="message-popover-item__label">收到的赞</span>
              <el-badge
                :value="messageUnread.likeUnread"
                :hidden="messageUnread.likeUnread === 0"
                :max="99"
                class="message-popover-item__badge"
              />
            </a>
            <a :href="resolvePath('/system')" target="_blank" class="message-popover-item">
              <span class="message-popover-item__label">系统消息</span>
              <el-badge
                :value="messageUnread.systemUnread"
                :hidden="messageUnread.systemUnread === 0"
                :max="99"
                class="message-popover-item__badge"
              />
            </a>
          </div>
        </el-popover>
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
        <el-popover
          placement="bottom"
          trigger="hover"
          :show-arrow="false"
          popper-class="favorite-popover"
          :offset="8"
          @show="fetchFavoritePreview"
        >
          <template #reference>
            <a :href="resolvePath(`/space/${userStore.user.uid}?tab=favorites`)" target="_blank" class="right-default-entry v-popover-wrap" @click.stop>
              <el-icon class="right-icon">
                <Star />
              </el-icon>
              <span class="right-entry-text">收藏</span>
            </a>
          </template>
          <div class="favorite-popover-wrap">
            <div v-if="favoriteLoading && favoriteFolderList.length === 0" class="favorite-popover-empty">
              <div class="history-popover-spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="favoriteFolderList.length === 0" class="favorite-popover-empty">
              暂无收藏夹
            </div>
            <template v-else>
              <div class="favorite-popover-main">
                <div class="favorite-popover-sidebar">
                  <div
                    v-for="folder in favoriteFolderList"
                    :key="folder.id"
                    class="favorite-popover-folder-item"
                    :class="{ 'is-active': activeFolderId === folder.id }"
                    @click="selectFavoriteFolder(folder.id)"
                  >
                    <span class="favorite-popover-folder-name" :title="folder.name">{{
                      folder.name
                    }}</span>
                    <span class="favorite-popover-folder-count">{{ folder.videoCount }}</span>
                  </div>
                </div>
                <div class="favorite-popover-content">
                  <div class="favorite-popover-content-scroll">
                    <div v-if="folderVideoLoading && folderVideoList.length === 0" class="favorite-popover-empty favorite-popover-empty--inner">
                      <div class="history-popover-spinner"></div>
                      <span>加载中...</span>
                    </div>
                    <div v-else-if="folderVideoList.length === 0" class="favorite-popover-empty favorite-popover-empty--inner">
                      这个文件夹还是空的～
                    </div>
                    <template v-else>
                      <a
                        v-for="video in folderVideoList"
                        :key="video.video.vid"
                        :href="resolvePath(`/video/${video.video.vid}`)"
                        target="_blank"
                        class="favorite-popover-item"
                      >
                        <div class="favorite-popover-cover">
                          <img :src="video.video.coverUrl" :alt="video.video.title" />
                          <span class="favorite-popover-duration">{{
                            formatDuration(video.video.duration)
                          }}</span>
                        </div>
                        <div class="favorite-popover-info">
                          <h3 class="favorite-popover-title" :title="video.video.title">
                            {{ video.video.title }}
                          </h3>
                          <a
                            class="favorite-popover-up"
                            :href="resolvePath(`/space/${video.video.uid}`)"
                            target="_blank"
                            @click.stop
                          >
                            <img
                              src="https://hirihiri2.oss-cn-shanghai.aliyuncs.com/up_pb.svg"
                              class="favorite-popover-up-icon"
                              alt=""
                            />
                            <span>{{ video.user.username }}</span>
                          </a>
                        </div>
                      </a>
                    </template>
                  </div>
                  <!-- 始终固定在右栏（favorite-popover-content）底部：有视频才显示 -->
                  <div v-if="folderVideoList.length > 0" class="favorite-popover-footer">
                    <a
                      :href="activeFolderId ? resolvePath(`/space/${userStore.user.uid}?tab=favorites&folder=${activeFolderId}`) : resolvePath(`/space/${userStore.user.uid}?tab=favorites`)"
                      target="_blank"
                      class="favorite-popover-btn"
                    >
                      查看全部
                    </a>
                    <a
                      :href="activeFolderId ? resolvePath(`/space/${userStore.user.uid}?tab=favorites&folder=${activeFolderId}`) : resolvePath(`/space/${userStore.user.uid}?tab=favorites`)"
                      target="_blank"
                      class="favorite-popover-btn favorite-popover-btn--primary"
                    >
                      <el-icon class="favorite-popover-play-icon">
                        <VideoPlay />
                      </el-icon>
                      <span>播放全部</span>
                    </a>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </el-popover>
      </li>
      <li @click="handleRightEntryClick">
        <el-popover
          placement="bottom"
          trigger="hover"
          :show-arrow="false"
          popper-class="history-popover"
          :offset="8"
          @show="fetchHistoryPreview"
        >
          <template #reference>
            <a href="/history" class="right-default-entry v-popover-wrap" target="_blank">
              <el-icon class="right-icon">
                <Clock />
              </el-icon>
              <span class="right-entry-text">历史</span>
            </a>
          </template>
          <div class="history-popover-wrap">
            <div v-if="historyStore.loading && groupedHistoryPreview.length === 0" class="history-popover-empty">
              <div class="history-popover-spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="groupedHistoryPreview.length === 0" class="history-popover-empty">
              暂无浏览历史
            </div>
            <div v-else class="history-popover-list">
              <template v-for="group in groupedHistoryPreview" :key="group.label">
                <div class="history-popover-group-label">{{ group.label }}</div>
                <a
                  v-for="item in group.items"
                  :key="item.id"
                  :href="resolvePath(`/video/${item.vid}`)"
                  target="_blank"
                  class="history-popover-item"
                >
                  <div class="history-popover-cover">
                    <img :src="item.coverUrl" :alt="item.title" />
                    <div class="history-popover-cover__bottom">
                      <span class="history-popover-progress">{{ formatDuration(item.progress) }}/{{ formatDuration(item.duration) }}</span>
                      <div
                        class="history-popover-progressbar"
                        :style="{ width: (item.progress / item.duration) * 100 + '%' }"
                      ></div>
                    </div>
                  </div>
                  <div class="history-popover-info">
                    <div class="history-popover-title" :title="item.title">{{ item.title }}</div>
                    <div class="history-popover-time">{{ formatBrowseTime(item.browseTime) }}</div>
                    <div class="history-popover-author">
                      <img
                        src="https://hirihiri2.oss-cn-shanghai.aliyuncs.com/up_pb.svg"
                        class="history-popover-up-icon"
                        alt=""
                      />
                      {{ item.authorUsername }}
                    </div>
                  </div>
                </a>
              </template>
            </div>
            <div class="history-popover-footer">
              <a :href="resolvePath('/history')" target="_blank" class="history-popover-btn">
                查看全部
              </a>
            </div>
          </div>
        </el-popover>
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
import { computed, ref } from 'vue'
import MyPopover from '@/components/my-popover/MyPopover.vue'
import SearchBox from '@/components/search/SearchBox.vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useMessageStore } from '@/stores/messageStore.ts'
import { useHistoryStore } from '@/stores/historyStore.ts'
import { useVideoStore } from '@/stores/videoStore.ts'
import { useRouter } from 'vue-router'
import type { FavoriteFolder, HistoryVideoDTO, VideoInfo } from '@/types/api.ts'
import { formatNumber, formatDuration, getLevelByExp, getLevelIconUrl } from '@/utils/utils'
import { VideoPlay } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()
const historyStore = useHistoryStore()
const videoStore = useVideoStore()

const totalUnreadCount = computed(() => messageStore.unread.totalUnread)
const messageUnread = computed(() => messageStore.unread)
const resolvePath = (path: string, query?: Record<string, string | number | null | undefined>) => {
  let realPath = path
  const realQuery: Record<string, any> = {}
  // 支持 path 中带 "?a=1&b=2" 的写法，自动拆分出来单独传给 query
  if (realPath.includes('?')) {
    const [p, qs] = realPath.split('?')
    realPath = p
    if (qs) {
      new URLSearchParams(qs).forEach((v, k) => {
        realQuery[k] = v
      })
    }
  }
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) realQuery[k] = String(v)
    }
  }
  return Object.keys(realQuery).length > 0
    ? router.resolve({ path: realPath, query: realQuery }).href
    : router.resolve({ path: realPath }).href
}

// ===== 收藏夹弹窗 =====
const favoriteLoading = ref(false)
const folderVideoLoading = ref(false)
const favoriteFolderList = ref<FavoriteFolder[]>([])
const activeFolderId = ref<number | null>(null)
const folderVideoList = ref<VideoInfo[]>([])

const fetchFavoritePreview = async () => {
  if (!userStore.isLogin) return
  favoriteLoading.value = true
  try {
    const list = await videoStore.getUserFavoriteFolders()
    favoriteFolderList.value = list
    if (list.length > 0) {
      const defaultFolder = list.find((f) => f.isDefault) || list[0]
      await selectFavoriteFolder(defaultFolder.id)
    }
  } catch (e) {
    console.error('加载收藏夹列表失败', e)
    favoriteFolderList.value = []
  } finally {
    favoriteLoading.value = false
  }
}

const selectFavoriteFolder = async (folderId: number) => {
  activeFolderId.value = folderId
  folderVideoLoading.value = true
  try {
    const list = await videoStore.getFolderVideos(folderId, 1, 20)
    folderVideoList.value = list
  } catch (e) {
    console.error('加载收藏夹视频失败', e)
    folderVideoList.value = []
  } finally {
    folderVideoLoading.value = false
  }
}

// ===== 历史弹窗 =====
const fetchHistoryPreview = async () => {
  await historyStore.getHistoryList(1, 20)
}

const groupedHistoryPreview = computed(() => {
  const groups: { label: string; items: HistoryVideoDTO[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ]
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 24 * 60 * 60 * 1000
  historyStore.historyList.slice(0, 20).forEach((item) => {
    const browseTime = new Date(item.browseTime).getTime()
    if (browseTime >= today) groups[0].items.push(item)
    else if (browseTime >= yesterday) groups[1].items.push(item)
    else groups[2].items.push(item)
  })
  return groups.filter((g) => g.items.length > 0)
})

const formatBrowseTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = date.getTime() - today.getTime()
  if (diff >= 0) {
    return `今天${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  if (diff >= -24 * 60 * 60 * 1000) {
    return `昨天${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

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
        border: 1px solid @border-color;
      }
    }

    .login-sns-wp {
      margin-top: 20px;
      font-size: 13px;
      color: @text-3;

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
      border: 1px solid @border-color;
      background: #f1f2f3;
      transition: all 0.3s ease;

      &--focus {
        background: #fff;
        border-color: @border-color;
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
        color: @text-1;
        min-width: 0;

        &::placeholder {
          color: @text-3;
        }
      }

      &__clear {
        .flex-center();
        width: 28px;
        height: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #c0c4cc;
        flex-shrink: 0;
        transition: color 0.2s;

        &:hover {
          color: @text-3;
        }
      }

      &__btn {
        .flex-center();
        width: 48px;
        height: 100%;
        border: none;
        border-left: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        color: @text-3;
        transition: all 0.3s ease;
        flex-shrink: 0;

        &:hover {
          color: @blue;
        }
      }

      &--focus &__btn {
        border-left-color: @border-color;
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
          color: @text-1;
        }

        &__clear {
          font-size: 12px;
          color: @text-3;
          cursor: pointer;
          transition: color 0.2s;

        &:hover {
          color: @pink;
        }
        }

        &__divider {
          height: 1px;
          background: @border-color;
          margin: 16px 0;
        }

        &__expand {
          font-size: 12px;
          color: @text-3;
          text-align: center;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 15px;
          transition: color 0.2s;

          &:hover {
            color: @blue;
          }
        }
      }

      .suggest-item {
        height: 36px;
        padding: 0 16px;
        line-height: 36px;
        font-size: 14px;
        color: @text-1;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background-color 0.2s;

        &:hover {
          background: #e9e9eb;
        }

        :deep(.suggest-item__highlight) {
          color: @pink;
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
          .ellipsis();
        }

        .search-history-item__close {
          position: absolute;
          top: -6px;
          right: -6px;
          .flex-center();
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
          color: @text-3;
          text-align: center;
          margin-right: 8px;

          &.hot-search-item__rank--top {
            color: @pink;
          }
        }

        .hot-search-item__text {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          color: @text-1;
          .ellipsis();
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
      .flex-center();
      background-color: @blue;
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
        .flex-center();
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
            // 等级图标 SVG 为 1:1 正方形（viewBox 0 0 30 30），按方形显示以免被压成扁条
            width: 30px;
            height: 30px;
            object-fit: contain;
          }
        }
      }

      .coins-item {
        display: flex;
        justify-content: center;
        font-size: 12px;

        .coin-item__text {
          padding-right: 5px;
          color: @text-3;
        }

        .coin-item__num {
          padding-right: 10px;
          color: @text-1;
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
            color: @text-1;
            font-size: 18px;
          }

          .counts-item__text {
            font-size: 12px;
            color: @text-3;
          }
        }
      }

      .vip-entry-container {
        cursor: pointer;
        background-image: url(https://hirihiri2.oss-cn-shanghai.aliyuncs.com/eAwhtOhoSo.png);
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
          .flex-center();
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
          color: @text-2;
          font-size: 14px;
          transition: background-color 0.3s;
          padding: 0 14px;

          &:hover {
            background-color: @border-color;
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
        color: @text-2;
        font-size: 14px;
        transition: background-color 0.3s;
        cursor: pointer;
        padding: 0 14px;

        &:hover {
          background-color: @border-color;
        }
      }
    }

    .right-default-entry {
      color: var(--text-color);
      height: 64px;
      margin-right: 15px;
      font-size: 14px;
      flex-shrink: 0;
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

    .right-entry-text {
      display: block;
      white-space: nowrap;
      word-break: keep-all;
      overflow-wrap: normal;
    }

    .v-popover-wrap:hover .right-icon {
      animation: jump 0.3s;
    }

    .message-badge {
      display: inline-flex;
      align-items: center;

      :deep(.el-badge__content) {
        font-size: 10px;
        height: 16px;
        line-height: 16px;
        padding: 0 4px;
      }
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
  .hiri-header__bar .right-entry .right-entry-text {
    display: none !important;
  }
}
</style>

<style lang="less">
// 消息弹窗 el-popover 样式（popper 渲染到 body，需非 scoped）
.message-popover {
  padding: 0 !important;
  min-width: 160px;
  border-radius: 8px !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, .1) !important;
  border: 1px solid @border-color;

  .message-popover-menu {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
  }

  .message-popover-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    color: @text-2;
    text-decoration: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: @border-color;
      color: @text-1;
    }

    &__badge {
      .el-badge__content {
        font-size: 10px;
        height: 16px;
        line-height: 16px;
        padding: 0 4px;
      }
    }
  }
}

// 历史弹窗 el-popover 样式（popper 渲染到 body，需非 scoped）
.history-popover {
  padding: 0 !important;
  width: 370px !important;
  max-width: 370px !important;
  border-radius: 8px !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, .1) !important;
  border: 1px solid @border-color;

  .history-popover-wrap {
    display: flex;
    flex-direction: column;
    max-height: 540px;
    min-height: 0;
  }

  .history-popover-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    color: @text-3;
    font-size: 14px;
  }

  .history-popover-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid @pink;
    border-radius: 50%;
    animation: hiri-spin 1s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes hiri-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .history-popover-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0;
    overscroll-behavior: none;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.35);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .history-popover-group-label {
    padding: 8px 14px 4px;
    font-size: 12px;
    color: @text-3;
    font-weight: 500;
  }

  .history-popover-item {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 14px;
    text-decoration: none;
    color: @text-2;
    transition: background-color 0.2s;

    &:hover {
      background-color: @border-color;
    }
  }

  .history-popover-cover {
    position: relative;
    width: 140px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &__bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
      padding: 12px 6px 4px;
    }
  }

  .history-popover-progress {
    display: flex;
    justify-content: flex-end;
    color: #fff;
    font-size: 11px;
    line-height: 1.2;
  }

  .history-popover-progressbar {
    margin-top: 4px;
    height: 2px;
    background-color: @pink;
    border-radius: 1px;
  }

  .history-popover-info {
    flex: 1;
    min-width: 0;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 4px;
    padding: 2px 0;
  }

  .history-popover-title {
    font-size: 13px;
    color: @text-1;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  .history-popover-time {
    font-size: 11px;
    color: @text-3;
    line-height: 1.4;
  }

  .history-popover-author {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: @text-3;
    line-height: 1.4;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: @blue;
    }
  }

  .history-popover-up-icon {
    width: 12px;
    height: 12px;
    vertical-align: middle;
    margin-right: 2px;
  }

  .history-popover-footer {
    flex-shrink: 0;
    border-top: 1px solid @border-color;
    padding: 8px 12px;
  }

  .history-popover-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 32px;
    border-radius: 4px;
    font-size: 13px;
    color: @text-2;
    background-color: @border-color;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: @blue;
    }
  }
}

// 收藏夹弹窗 el-popover 样式（popper 渲染到 body，需非 scoped）
.favorite-popover {
  padding: 0 !important;
  width: 520px !important;
  max-width: 520px !important;
  height: 540px !important;
  max-height: 540px !important;
  border-radius: 8px !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, .1) !important;
  border: 1px solid @border-color;

  .favorite-popover-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 540px;
    min-height: 0;
    box-sizing: border-box;
  }

  .favorite-popover-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    color: @text-3;
    font-size: 14px;

    &--inner {
      padding: 40px 12px;
    }
  }

  .favorite-popover-main {
    display: flex;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .favorite-popover-sidebar {
    width: 150px;
    flex-shrink: 0;
    border-right: 1px solid @border-color;
    overflow-y: auto;
    min-height: 0;
    padding: 6px 0;
    overscroll-behavior: none;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.35);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .favorite-popover-folder-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    height: 40px;
    font-size: 13px;
    color: @text-2;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background-color: @border-color;
    }

    &.is-active {
      background-color: @blue;
      color: #fff;

      .favorite-popover-folder-count {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .favorite-popover-folder-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
  }

  .favorite-popover-folder-count {
    flex-shrink: 0;
    font-size: 12px;
    color: @blue;
    font-weight: 500;
  }

  .favorite-popover-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0;
  }

  .favorite-popover-content-scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0;
    overscroll-behavior: none;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.35);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .favorite-popover-item {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 14px;
    text-decoration: none;
    color: @text-2;
    transition: background-color 0.2s;

    &:hover {
      background-color: @border-color;

      .favorite-popover-title {
        color: @blue;
      }
    }
  }

  .favorite-popover-cover {
    position: relative;
    width: 120px;
    height: 68px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .favorite-popover-duration {
    position: absolute;
    right: 4px;
    bottom: 4px;
    padding: 1px 5px;
    background-color: rgba(0, 0, 0, 0.65);
    color: #fff;
    font-size: 11px;
    line-height: 1.4;
    border-radius: 2px;
  }

  .favorite-popover-info {
    flex: 1;
    min-width: 0;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0;
  }

  .favorite-popover-title {
    margin: 0;
    font-size: 13px;
    color: @text-1;
    line-height: 1.4;
    font-weight: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    transition: color 0.2s;
  }

  .favorite-popover-up {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: @text-3;
    text-decoration: none;
    margin-top: 4px;
    transition: color 0.2s;

    &:hover {
      color: @blue;
    }
  }

  .favorite-popover-up-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    margin-right: 3px;
  }

  .favorite-popover-footer {
    flex-shrink: 0;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    align-items: center;
    gap: 10px;
    border-top: 1px solid @border-color;
    padding: 8px 14px;
    background-color: #fff;
  }

  .favorite-popover-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border-radius: 4px;
    font-size: 13px;
    color: @text-2;
    text-decoration: none;
    background-color: @border-color;
    transition: all 0.2s;

    &:hover {
      background-color: #e1e3e6;
      color: @blue;
    }

    &--primary {
      background-color: @blue;
      color: #fff;

      &:hover {
        background-color: #1b85d8;
        color: #fff;
      }
    }
  }

  .favorite-popover-play-icon {
    font-size: 14px;
    margin-right: 4px;
  }
}
</style>

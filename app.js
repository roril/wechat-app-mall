//app.js
const api = require('./utils/request.js')
App({
  onLaunch: function() {
    var that = this;
    that.globalData.path = that.globalData._path
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartIndexPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });
    //  获取商城名称
    api.fetchRequest('/config/get-value', {
      key: 'mallName'
    }).then(function(res) {
      if (res.data.code == 0) {
        wx.setStorageSync('mallName', res.data.data.value);
      }
    })
    api.fetchRequest('/score/send/rule', {
      code: 'goodReputation'
    }).then(function(res) {
      if (res.data.code == 0) {
        that.globalData.order_reputation_score = res.data.data[0].score;
      }
    })
    api.fetchRequest('/config/get-value', {
      key: 'recharge_amount_min'
    }).then(function(res) {
      if (res.data.code == 0) {
        that.globalData.recharge_amount_min = res.data.data.value;
      }
    })
    // 获取砍价设置
    api.fetchRequest('/shop/goods/kanjia/list').then(function(res) {
      if (res.data.code == 0) {
        that.globalData.kanjiaList = res.data.data.result;
      }
    })
    // 判断是否登录
    let token = wx.getStorageSync('token');
    if (!token) {
      that.goLoginPageTimeOut()
      return
    }
    api.fetchRequest('/user/check-token', {
      token: token
    }).then(function(res) {
      if (res.data.code != 0) {
        wx.removeStorageSync('token')
        that.goLoginPageTimeOut()
      }
    })
  },
  sendTempleMsg: function(orderId, trigger, template_id, form_id, page, postJsonString) {
    var that = this;
    api.fetchRequest('/template-msg/put', {
      token: wx.getStorageSync('token'),
      type: 0,
      module: 'order',
      business_id: orderId,
      trigger: trigger,
      template_id: template_id,
      form_id: form_id,
      url: page,
      postJsonString: postJsonString
    }, 'POST', 0, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(function(res) {})
  },
  sendTempleMsgImmediately: function(template_id, form_id, page, postJsonString) {
    var that = this;
    api.fetchRequest('/template-msg/put', {
      token: wx.getStorageSync('token'),
      type: 0,
      module: 'immediately',
      template_id: template_id,
      form_id: form_id,
      url: page,
      postJsonString: postJsonString
    }, 'POST', 0, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(function(res) {})
  },
  goLoginPageTimeOut: function() {
    setTimeout(function() {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)
  },
  goStartIndexPage: function() {
    setTimeout(function() {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 1000)
  },
  globalData: {
    userInfo: null,
    subDomain: "tz", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "4.1.0",
    note: '增加小程序购物单支持',
    appid: "wxa46b09d413fbcaff", // 您的小程序的appid
    shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
    isConnected: true, // 网络是否连接
    // _path: 'https://api.it120.cc/1eb0acd21084de279938189ba06492af', // 原项目路由配置在页面中，改为配置项
    header: {
      Authorization: wx.getStorageSync('token')
    },
  }
  /*
  根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
  1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
  2、/pages/order-details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
  3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。  
   */
})
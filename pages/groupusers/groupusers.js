const http = require('../../utils/request')
const util = require('../../utils/util')
const app = getApp()
Page({
  data: {
    list: [],
    hideModal: true,
    animationData: {},
    nicknameArr_sub:[],
    nicknameArr_unsub:[],
    sub:'',
    unsub:'',
    identity: '',
    p_docid: '', // 群组文件夹的docid
    userids: '', // 群组文件夹tag，学生userid集合
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      identity: wx.getStorageSync('identity'),
      p_docid: options.docid
    })
    http.request('/api/v1/dir/list', JSON.stringify({
      docid: options.docid
    })).then(res => {
      function compare(propertyName) {
        return function (object1, object2) {
          var value1 = object1[propertyName];
          var value2 = object2[propertyName];
          if (value2 < value1) {
            return -1;
          } else if (value2 > value1) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      //使用方法    
      res.dirs.sort(compare("modified")); //isHot比较的值，根据自己需求
      res.dirs.map(item => {
        item.modified = this.formatTime(item.modified)
        return item
      })
      this.setData({
        list: res.dirs,
      })
      let index = this.data.list.length - 1
      this.setData({
        last_list_docid: this.data.list[index].docid
      })
    })
    
  },
  jump(e) {
    console.log(e);
    let docid = e.currentTarget.dataset.docid
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/groupusersitem/groupusersitem?docid=' + docid + "&name=" + name,
    })
  },
  formatTime(time) {
    let str = time.toString()
    let substr = str.substr(0, 13)
    return util.formatTime(new Date(parseInt(substr)))
  },
  sendmsg() {
    // 发送消息给未提交作业的学生
    if (wx.getStorageSync('identity') == '老师') {
      http.request('/api/v1/file/attribute', JSON.stringify({
        docid: that.data.last_list_docid
      })).then(res => {
        let userids = res.tags[0].split(',')
        wx.request({
          url: app.globalData.BaseUrlH + 'getUnSubUser',
          data: {
            teacher_openid: wx.getStorageSync('openid'),
            task: wx.getStorageSync('group_name'),
            user_ids: userids
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            let arr = res.data.data
            for (const i in arr) {
              wx.request({
                url: app.globalData.BaseUrlH + 'sendMsgToStudent',
                data: {
                  nickname: wx.getStorageSync('nickName'),
                  openid: arr[i].openid,
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  console.log('成功向未提交作业的学生发送通知');
                  console.log(res);
                  wx.showToast({
                    title: '发送成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
  
              })
            }
  
          }
        })
      })

    }
  },
  seemsg() {
    let that = this
    // 展示未提交作业的学生
    if (wx.getStorageSync('identity') == '老师') {
      http.request('/api/v1/file/attribute', JSON.stringify({
        docid: that.data.last_list_docid
      })).then(res => {
        // let userids = res.tags[2].split(',')
        let userids = res.tags[0].split(',')
        wx.request({
          url: app.globalData.BaseUrlH + 'statistics',
          data: {
            teacher_openid: wx.getStorageSync('openid'),
            task: wx.getStorageSync('group_name'),
            user_ids: userids
          },
          header: {
            'content-type': 'application/json'
          },
          success: (res) => {
            console.log(res);
            let arr_sub = res.data.data.sub
            let arr_unsub = res.data.data.unsub
            let sub = res.data.data.sub.length
            let unsub = res.data.data.unsub.length
     
            let nicknameArr_sub = []
            let nicknameArr_unsub = []
            for (const i in arr_sub) {
              nicknameArr_sub.push(arr_unsub[i].nickname)
            }
            for (const i in arr_unsub) {
              nicknameArr_unsub.push(arr_unsub[i].nickname)
            }
            this.setData({
              nicknameArr_sub: nicknameArr_sub,
              nicknameArr_unsub: nicknameArr_unsub,
              sub:sub,
              unsub:unsub
            })
          }
        })
      
      })
    }
  },
   // 显示遮罩层
   showModal: function () {
    this.seemsg();
    var that = this;
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();
    }, 200)
  },
 
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown();
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 720)
 
  },
 
  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
})
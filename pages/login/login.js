const http = require('../../utils/request')
const Encrypt = require('../../utils/jsencrypt');
const app = getApp()

let pubKey =
  `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7JL0DcaMUHumSdhxXTxqiABBC
DERhRJIsAPB++zx1INgSEKPGbexDt1ojcNAc0fI+G/yTuQcgH1EW8posgUni0mcT
E6CnjkVbv8ILgCuhy+4eu+2lApDwQPD9Tr6J8k21Ruu2sWV5Z1VRuQFqGm/c5vaT
OQE5VFOIXPVTaa25mQIDAQAB
-----END PUBLIC KEY-----`; // ES6 模板字符串 引用 rsa 公钥
let cryptFirst = new Encrypt.JSEncrypt();
cryptFirst.setPublicKey(pubKey)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titles: ['老师账号', '学生账号'],
    array: [], // 老师名称
    activeindex: 0,
    name: '',
    pwd: '',
    teacher_openid_arr: [], // 老师id
    teacher_openid: '', // 选择后的老师id
    index: 0, // 选择后的老师名称索引
    userCode: '',
    authUserInfo: false,
  },
  onLoad: function (options) {
    let tokenid = wx.getStorageSync('tokenid')
    if (tokenid) {
      wx.switchTab({
        url: '/pages/group/group',
      })
    }
    // 老师列表
    wx.request({
      url: app.globalData.BaseUrlH + 'getTeacher',
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        let arr = res.data.data
        let nicknameArr = []
        let teacherOpenidArr = []
        for (const i in arr) {
          nicknameArr.push(arr[i].nickname)
          teacherOpenidArr.push(arr[i].openid)
        }
        this.setData({
          array: nicknameArr,
          teacher_openid_arr: teacherOpenidArr,
          teacher_openid: arr[0].openid
        })
      }
    })

    wx.login({
      success: res => {
        
        this.setData({ userCode: res.code })
      }
    })

    // wx.getSetting({
    //   success: res => {
    //     console.log(res);
    //     if (res.authSetting['scope.userInfo']) {
    //       this.setData({ authUserInfo: true })
    //     }
    //   }
    // })
  },
  headelcilck(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      activeindex: index
    })
  },
  nameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },
  pwdInput(e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  teacherInput(e) {
    let index = parseInt(e.detail.value)
    this.setData({
      teacher_openid: this.data.teacher_openid_arr[index],
      index: e.detail.value
    })
  },
  submit() {
    let that = this;
    let params = {};
    params['account'] = this.data.name;
    params['password'] = cryptFirst.encrypt(this.data.pwd);
    http.request('/api/v1/auth1/getnew', params).then(getnewRes => {
      let user_id = getnewRes.userid;
      wx.setStorageSync('tokenid', getnewRes.tokenid)
      wx.setStorageSync('userid', getnewRes.userid)
      // if (!this.data.authUserInfo) {
        wx.getUserInfo({
          success: function (userInfoRes) {
            var userNick = userInfoRes.userInfo.nickName; //用户昵称
            var avataUrl = userInfoRes.userInfo.avatarUrl; //用户头像地址
            var gender = userInfoRes.userInfo.gender; //用户性别
            wx.setStorageSync('nickName', userNick)
            wx.request({
              url: app.globalData.BaseUrlH + 'login',
              data:{
                code: that.data.userCode,
                user_id,
                nickname: userNick,
                avaurl: avataUrl,
                sex: gender,
                type: that.data.activeindex == 1 ? 1 : 2,
                teacher_openid: that.data.teacher_openid
              },
              header: {
                'content-type': 'application/json'
              },
              success: (res)=> {
                console.log(res);
                wx.setStorageSync('openid', res.data.data.openid)
                wx.setStorageSync('teacher_openid', that.data.teacher_openid)
                if (that.data.activeindex == 0) {
                  wx.setStorageSync('identity', '老师')
                } else {
                  wx.setStorageSync('identity', '学生')
                }
                wx.switchTab({
                  url: '/pages/group/group'
                })
              }
            })
          },
          fail: function (error) {
            wx.removeStorageSync('tokenid')
            wx.removeStorageSync('userid')
          }
        })
      // }
    })
  }
})
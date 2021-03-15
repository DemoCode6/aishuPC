const http = require('../../utils/request')
const util = require('../../utils/util')

Page({
  data: {
    img: '../assets/img/down.png',
    img1: '../assets/img/up.png',
    group_file: [],
    bool: 'true',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.haha()
    let that = this;
    let isidentity = wx.getStorageSync('identity');
    let params = {};
    if (isidentity == '老师') {
      params['doctype'] = 2;
    } else if (isidentity != '老师') {
      params['doctype'] = 6;
    }
    console.log(isidentity);
    http.request('/api/v1/entrydoc2/get', params).then(res => {
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
      res.docinfos.sort(compare("modified")); //isHot比较的值，根据自己需求
      res.docinfos.map(item => {
        item.modified = this.formatTime(item.modified)
        return item
      })
      this.setData({
        group_file: res.docinfos
      })
    })
  },
  haha(){
    wx.requestSubscribeMessage({
      tmplIds: ['trA0kq5RGq-bba6OLUaTEPekh4niSrPnNfu7cOUQDOo'],
      success(res) {
        console.log('订阅消息 成功 ');
        console.log(res);
      },
      fail(er) {
        console.log(er);
      }
    })
  },
  ishowClick() {
    this.setData({
      bool: !this.data.bool
    })
  },
  subscribe() {
    this.haha()
  },
  jump(e) {
    let docid = e.currentTarget.dataset.docid
    wx.setStorageSync('group_name', e.currentTarget.dataset.docname)
    wx.navigateTo({
      url: '/pages/groupusers/groupusers?docid=' + docid,
    })
  },

  formatTime(time) {
    let str = time.toString()
    let substr = str.substr(0, 13)
    return util.formatTime(new Date(parseInt(substr)))
  }
})
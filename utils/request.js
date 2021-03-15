var app = getApp();
const baseUrl  = 'https://exam.infohill.cn:4646';
// const baseIP  = '110.177.76.50:4646';
const baseIP  = '110.177.76.28:4646';
/**
 * POST请求，
 * URL：接口
 * postData：参数，json类型
 */
function request(url, Data) {
  return new Promise((resolve, reject) => {
    // if (loading) {
      
    // }
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      //项目的真正接口，通过字符串拼接方式实现
      url: baseUrl + url,
      header: {
        "content-type": "application/json;charset=UTF-8",
        'Authorization': wx.getStorageSync('tokenid') ? 'Bearer ' + wx.getStorageSync('tokenid')  : ''
      },
      data: Data,
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        wx.hideLoading() // 结束加载

        if (res.statusCode == 401) {
          if (res.data.errcode == 401001) {
            wx.showToast({
              title: res.data.errmsg,
            })
          }
          // wx.setStorageSync('tokenid', '')
          wx.setStorage({
            key: 'tokenid',
            data: '',
            success: function () {
              wx.switchTab({
                url: '/pages/login/login'
              })
            }
          })
          
        }
        if (res.statusCode === 403) {
          if (res.data.errcode == 403010) {
            wx.showToast({
              title: res.data.errmsg,
            })
          }
        }
        if (res.statusCode === 403) {
          if (res.data.errcode == 403001) {
            wx.showToast({
              title: res.data.errmsg,
            })
          }
        }
        // if(res.statusCode == 401){
        //   if(res.data.errcode == 401003){
        //     wx.showToast({
        //       title: res.data.errmsg,
        //     })
        //   }
        // }

        if (res.statusCode === 200) {
          resolve(res.data) // 接收res并传到then的参数中去
        } else {
          reject()
        }
      },
      error: function (error) {
        console.log('error');
        console.log(error);
        
      },
      fail: function (err) {
        console.log('fail');
        console.log(err);
        wx.hideLoading()
        reject(err);
      }
    })
  }).catch((err) => {
    wx.hideLoading()
    // console.log(err)
  })
}

//GET请求，
function get(url, Data) {
  wx.showLoading({
    title: '加载中'
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      data: Data,
      header: {
        "content-type": "application/json;charset=UTF-8"
      },
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        wx.hideLoading() // 结束加载
        //参数值为res.data,直接将返回的数据传入
        console.log(res)
        if (res.statusCode === 200) {
          resolve(res.data) // 接收res并传到then的参数中去
        } else {
          reject()
        }
      },
      fail: function (err) {
        wx.hideLoading()
        reject(err);
      }
    })
  }).catch((err) => {
    wx.hideLoading()
    console.log(err)
  })
}

/**
 * module.exports用来导出代码
 * js文件中通过const http = require("../util/request.js")  加载
 */
module.exports = {
  request,
  get
};
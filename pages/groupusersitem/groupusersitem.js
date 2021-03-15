const http = require('../../utils/request')
const util = require('../../utils/util')
const app = getApp()
Page({
  data: {
    list: [],
    docid: '',
    file_name: '',
    name_date: ''
  },

  onLoad: function (options) {
    this.setData({
      docid: options.docid,
      file_name: options.name
    })
    this.getList()
  },
  getList() {
    http.request('/api/v1/dir/list', JSON.stringify({
      docid: this.data.docid
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
      res.files.sort(compare("modified")); //isHot比较的值，根据自己需求
      res.files.map(item => {
        item.modified = this.formatTime(item.modified)
        return item
      })
      this.setData({
        list: res.files
      })
    })
  },
  formatTime(time) {
    let str = time.toString()
    let substr = str.substr(0, 13)
    return util.formatTime(new Date(parseInt(substr)))
  },
  indexOf(str) {
    let index = str.indexOf(":")
    let string = str.substring(index + 2, str.length);
    return string;
  },
  // 文件上传
  uploadFileClick() {
    var that = this;
    wx.chooseMessageFile({
      count: 3,
      success: function (res) {
        console.log(res);
        // console.log(res.tempFiles[0].size);
        if(res.tempFiles[0].size > 1048576){
        var tempFiles = res.tempFiles;
        //启动上传等待中...  
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        var uploadImgCount = tempFiles.length
        for (const i in tempFiles) {
          let params = JSON.stringify({
            docid: that.data.docid,
            length: tempFiles[i].size,
            name: tempFiles[i].name,
            reqmethod: "POST",
            usehttps: false,
            reqhost: http.baseIP,
            ondup: 1
          })
          http.request('/api/v1/file/osbeginupload', params).then(res => {
            let uploadDocid = res.docid
            let rev = res.rev
            var ycjg = JSON.stringify({
              csflevel: 0,
              docid: uploadDocid,
              rev
            });
            wx.uploadFile({
              // url: 'http://143.24.1.19:10001/asbuk',
              url: 'https://exam.infohill.cn:9029',
              header: {
                'content-type': 'multipart/form-data'
              },
              filePath: tempFiles[i].path,
              name: 'file',
              formData: {
                key: that.indexOf(res.authrequest[2]),
                bucket: that.indexOf(res.authrequest[3]),
                userid: that.indexOf(res.authrequest[4]),
                policy: that.indexOf(res.authrequest[5]),
                signature: that.indexOf(res.authrequest[6]),
                // 'Content-Type': that.indexOf(res.authrequest[6]),
              },
              success: function (res) {
                console.log(res);
                http.request("/api/v1/file/osendupload?tokenid=" + wx.getStorageSync('tokenid'), ycjg).then(res => {
                  if (uploadImgCount == parseInt(i) + 1) {
                    that.getList()
                    wx.hideToast();
                    // 学生提交记录接口
                    wx.request({
                      url: app.globalData.BaseUrlH + 'submitRecord',
                      data: {
                        user_id: wx.getStorageSync('userid'),
                        task: wx.getStorageSync('group_name')
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
                        console.log('学生提交记录接口回调');
                        console.log(res);
                      }
                    })
                  }
                })
              }
            })
          })
        }
      }else{
        wx.showToast({
          title: '文件不能小于1M',
          icon: 'error',
          mask: true,
          duration: 2000
        })
      }
      }
    });
  },
  // 获取当前时间
  updatetime() {
    let timestamp = Date.parse(new Date());
    let date = new Date(timestamp);
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    let namedate = Y + M + D + hour + minute + second
    this.setData({
      name_date: namedate
    })
  },
  // 上传图片
  uploadImgClick() {
    this.updatetime()
    var that = this;
    wx.chooseImage({
      count: 3,
      success: function (res) {
        var tempFiles = res.tempFiles;
        //启动上传等待中...  
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        var uploadImgCount = tempFiles.length
        for (const i in tempFiles) {
          let params = JSON.stringify({
            docid: that.data.docid,
            length: tempFiles[i].size,
            name: that.data.file_name + that.data.name_date + '.png',
            reqmethod: "POST",
            usehttps: false,
            reqhost: http.baseIP,
            ondup: 1
          })
          http.request('/api/v1/file/osbeginupload', params).then(res => {
            let uploadDocid = res.docid
            let rev = res.rev
            var ycjg = JSON.stringify({
              csflevel: 0,
              docid: uploadDocid,
              rev
            });
            wx.uploadFile({
              url: 'https://exam.infohill.cn:9029',
              header: {
                'content-type': 'multipart/form-data'
              },
              filePath: tempFiles[i].path,
              name: 'file',
              formData: {
                key: that.indexOf(res.authrequest[2]),
                bucket: that.indexOf(res.authrequest[3]),
                userid: that.indexOf(res.authrequest[4]),
                policy: that.indexOf(res.authrequest[5]),
                signature: that.indexOf(res.authrequest[6]),
                // 'Content-Type': that.indexOf(res.authrequest[6]),
              },
              success: function (res) {
                console.log(res);
                http.request("/api/v1/file/osendupload?tokenid=" + wx.getStorageSync('tokenid'), ycjg).then(res => {
                  if (uploadImgCount == parseInt(i) + 1) {
                    that.getList()
                    wx.hideToast();
                    // 学生提交记录接口
                    wx.request({
                      url: app.globalData.BaseUrlH + 'submitRecord',
                      data: {
                        user_id: wx.getStorageSync('userid'),
                        task: wx.getStorageSync('group_name')
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
                        console.log('学生提交记录接口回调');
                        console.log(res);
                      }
                    })
                  }
                })
              }
            })
          })
        }
      }
    });
  },
  // 文件和图片 预览功能
  previewClick(event) {
    let docid = event.currentTarget.dataset.docid
    let name = event.currentTarget.dataset.name
    let fileType = name.split('.')[1]
    // docid = docid.split('gns://')[1]
    http.request('/api/v1/file/osdownload', {
      authtype: "QUERY_STRING",
      docid: docid,
      rev: "",
      usehttps: true
    }).then(res => {
      let durl = res.authrequest[1]
      wx.downloadFile({
        url: durl, // 后台提供的下载预览文件的地址
        success: function (res) {
          const filePath = res.tempFilePath
          if (fileType === 'jpg' || fileType === 'png') { //  jpg和png格式
            const imgList = []
            imgList.push(filePath)
            wx.previewImage({
              current: filePath, // 当前显示图片的http链接
              urls: imgList // 需要预览的图片http链接列表
            })
          } else {
            wx.openDocument({
              filePath: filePath,
              showMenu: true,
              fileType: fileType,
              success: function (res) {
                console.log('打开文档成功')
              },
              fail: function (params) {
                wx.showToast({
                  title: '文件类型不支持',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }
        },
        fail: function (params) {
          wx.showToast({
            title: '文件下载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }).catch((err) => {
      console.log(err);
      console.log(123);
    })
  },
})
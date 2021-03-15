const http = require('../../utils/request')
const util = require('../../utils/util')
Page({
  data: {
    list:[],
    titles: ['系统消息', '学生上传消息'],
    activeindex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = {stamp: 0}
    let that = this
    http.request('/api/v1/message/get',JSON.stringify(params)).then(res =>{
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
      res.msgs.sort(compare("time"));  //isHot比较的值，根据自己需求
      // 时间戳转换
      res.msgs.map(item => {
        if(item.end == -1){
          item.end = '永久有效'
          return item
        }else{
          item.end = this.formatTime(item.end)
          return item
        };
      })
      res.msgs.map(item =>{
        if(item.type == 1){
          item.type = '开启共享'
          return item
        }
        if(item.type == 2){
          item.type = '关闭共享'
          return item
        }
        if(item.type == 3){
          item.type = '设置所有者'
          return item
        }
        if(item.type == 4){
          item.type = '取消所有者'
          return item
        }
        if(item.type == 5){
          item.type = '开启共享申请'
          return item
        }
        if(item.type == 6){
          item.type = '关闭共享申请'
          return item
        }
        if(item.type == 7){
          item.type = '设置所有者申请'
          return item
        }
        if(item.type == 8){
          item.type = '取消所有者申请'
          return item
        }
        if(item.type == 9){
          item.type = '开启外链申请'
          return item
        }
        if(item.type == 10){
          item.type = '开启共享审核结果'
          return item
        }
      })
      res.msgs.map(item =>{
        if(item.allowvalue == 1){
          item.allowvalue = '允许权限: 显示'
          return item
        }
        if(item.allowvalue == 3){
          item.allowvalue = '允许权限: 显示/预览'
          return item
        }
        if(item.allowvalue == 71){
          item.allowvalue = '允许权限: 显示/预览/下载/复制'
          return item
        }
        if(item.allowvalue == 31){
          item.allowvalue = '允许权限: 显示/预览/下载/修改/新建'
          return item
        }
        if(item.allowvalue == 95){
          item.allowvalue = '审核状态：驳回'
          return item
        }
        if(item.allowvalue == 127){
          item.allowvalue = '允许权限: 显示/预览/下载/复制/修改/新建/删除'
          return item
        }
        if(item.allowvalue == 7){
          item.allowvalue = '允许权限: 显示/预览/下载'
          return item
        }
        if(item.allowvalue == 9){
          item.allowvalue = '允许权限: 显示/新建'
          return item
        }
      })
      this.setData({
        list: res.msgs
      })
    })
  },
  formatTime(time){
    let str = time.toString()
    let substr = str.substr(0, 13)
    return util.formatTime(new Date(parseInt(substr)))
  },
  headelcilck(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      activeindex: index
    })
  },
  sendClick(){
    console.log(1);
  }
})
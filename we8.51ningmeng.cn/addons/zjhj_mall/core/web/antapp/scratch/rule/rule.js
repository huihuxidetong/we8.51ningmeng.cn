if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var page = this;
      app.pageOnLoad(this, options);
      app.request({
          url: api.scratch.setting,
          success: function (res) {
            if(res.code==0){
              page.setData({
                rule:res.data.setting.rule
              })
            }
          },
      });
  },

})
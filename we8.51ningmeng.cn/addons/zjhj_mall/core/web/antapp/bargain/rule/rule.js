if (typeof wx === 'undefined') var wx = getApp().hj;
// bargain/rule/rule.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var page = this;
        app.pageOnLoad(this, options);
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.bargain.setting,
            success: function(res) {
                if (res.code == 0) {
                    page.setData(res.data);
                } else {
                    page.showLoading({
                        title: res.msg
                    });
                }
            },
            complete:function(res){
                wx.hideLoading();
            }
        });
    },
})
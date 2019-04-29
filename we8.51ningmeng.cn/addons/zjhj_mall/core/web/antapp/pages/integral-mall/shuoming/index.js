if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/shuoming/index.js
var api = require('../../../api.js');
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

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        getApp().pageOnShow(this);
        var page = this;
        app.request({
            url: api.integral.explain,
            data: {
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        integral_shuoming: res.data.setting.integral_shuoming,
                    });
                }
            },
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
})
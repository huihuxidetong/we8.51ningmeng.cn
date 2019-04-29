if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        qrcode_pic: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        app.request({
            url: api.mch.user.shop_qrcode,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        header_bg: res.data.header_bg,
                        shop_logo: res.data.shop_logo,
                        shop_name: res.data.shop_name,
                        qrcode_pic: res.data.qrcode_pic,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        success: function () {

                        }
                    });
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        app.pageOnReady(this);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        app.pageOnHide(this);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        app.pageOnUnload(this);
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
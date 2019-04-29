if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/web/web.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        if (!wx.canIUse("web-view")) {
            wx.showModal({
                title: "提示",
                content: "您的版本过低，无法打开本页面，请升级至最新版。",
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        wx.navigateBack({
                            delta: 1,
                        });
                    }
                }
            });
            return;
        }
        this.setData({
            url: decodeURIComponent(options.url),
        });
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        return {
            path: 'pages/web/web?url=' + encodeURIComponent(options.webViewUrl)
        };
    }
});
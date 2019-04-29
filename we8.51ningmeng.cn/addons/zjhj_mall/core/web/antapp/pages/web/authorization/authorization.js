if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/web/authorization/authorization.js
var api = require('../../../api.js');
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user: {},
        is_bind: '',// is_bind 1.已绑定|2.未绑定
        app: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        this.checkBind();
        var user = wx.getStorageSync('user_info');
        this.setData({
            user: user
        })
    },

    checkBind: function () {
        var self = this;
        wx.showLoading({
            title: '加载中',
        })
        app.request({
            url: api.user.check_bind,
            success: function (res) {
                wx.hideLoading()
                if (res.code === 0) {
                    self.setData({
                        is_bind: res.data.is_bind,
                        app: res.data.app
                    })
                }
            }
        })
    },

    getUserInfo: function (res) {
        wx.showLoading({
            title: '加载中',
        })
        var self = this
        wx.login({
            success: function (login_res) {
                var code = login_res.code;
                getApp().request({
                    url: api.passport.login,
                    method: 'POST',
                    data: {
                        code: code,
                        user_info: res.detail.rawData,
                        encrypted_data: res.detail.encryptedData,
                        iv: res.detail.iv,
                        signature: res.detail.signature
                    },
                    success: function (res) {
                        wx.hideLoading()
                        if (res.code === 0) {
                            wx.showToast({
                                title: '登录成功,请稍等...',
                                icon: 'none'
                            })
                            self.bind()
                        } else {
                            wx.showToast({
                                title: '服务器出错，请再次点击绑定',
                                icon: 'none'
                            })
                        }
                    }

                })
            }
        })
    },

    bind: function () {
        app.request({
            url: api.user.authorization_bind,
            data: {},
            success: function (res) {
                if (res.code === 0) {
                    var bind_url = encodeURIComponent(res.data.bind_url);
                    wx.redirectTo({
                        url: '/pages/web/web?url=' + bind_url,
                    })
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none'
                    })
                }
            }
        })
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
})
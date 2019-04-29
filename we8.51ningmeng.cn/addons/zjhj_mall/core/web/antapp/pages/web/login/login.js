if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
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

    loginSubmit: function () {
        var page = this;
        var token = page.options.scene || false;
        if(typeof my !== 'undefined'){
            if (app.query !== null) {
                var query = app.query;
                app.query = null;
                token = query.token;
            }
        }
        if (!token) {
            wx.showModal({
                title: '提示',
                content: '无效的Token，请刷新页面后重新扫码登录',
                showCancel: false,
                success: function (e) {
                    if (e.confirm) {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        });
                        //wx.navigateBack({delta: 1});
                    }
                }
            });
            return false;
        }
        wx.showLoading({
            title: '正在处理',
            mask: true,
        });
        app.request({
            url: api.user.web_login + "&token=" + token,
            success: function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (e.confirm) {
                            wx.redirectTo({
                                url: '/pages/index/index',
                            });
                            //wx.navigateBack({delta: 1});
                        }
                    }
                });
            }
        });
    },
});
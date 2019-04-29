if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        is_show: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        wx.showLoading({
            title: '加载中',
        });

        app.request({
            url: api.mch.user.myshop,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    if (res.data.mch.is_open === 0) {
                        wx.showModal({
                            title: '提示',
                            content: '店铺已被关闭！请联系管理员',
                            showCancel: false,
                            success: function (e) {
                                if (e.confirm) {
                                    wx.navigateBack();
                                }
                            }
                        });
                    }
                    page.setData(res.data);
                    page.setData({
                        is_show: true
                    })
                }
                //未申请入驻
                if (res.code == 1) {
                    wx.redirectTo({
                        url: '/mch/apply/apply',
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

    navigatorSubmit: function (e) {
        app.request({
            url: api.user.save_form_id + "&form_id=" + e.detail.formId,
        });
        wx.navigateTo({
            url: e.detail.value.url,
        });
    },

    showPcUrl: function () {
        var page = this;
        page.setData({
            show_pc_url: true,
        });
    },

    hidePcUrl: function () {
        var page = this;
        page.setData({
            show_pc_url: false,
        });
    },

    copyPcUrl: function () {
        var page = this;
        wx.setClipboardData({
            data: page.data.pc_url,
            success: function (res) {
                page.showToast({
                    title: '内容已复制',
                });
            },
        });
    },

});
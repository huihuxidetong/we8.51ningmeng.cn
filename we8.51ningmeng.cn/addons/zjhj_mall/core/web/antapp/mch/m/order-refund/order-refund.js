if (typeof wx === 'undefined') var wx = getApp().hj;
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
        app.pageOnLoad(this, options);
        var page = this;
        page.setData({
            id: options.id || 0,
        });
        wx.showLoading({
            title: '加载中',
            mask: true,
        });
        app.request({
            url: api.mch.order.refund_detail,
            data: {
                id: page.data.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData(res.data);
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                    });
                }
            },
            complete: function (res) {
                wx.hideLoading();
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


    showPicList: function (e) {
        var page = this;
        wx.previewImage({
            urls: page.data.pic_list,
            current: page.data.pic_list[e.currentTarget.dataset.pindex],
        });
    },

    refundPass: function (e) {
        var page = this;
        var id = page.data.id;
        var type = page.data.type;
        wx.showModal({
            title: '提示',
            content: '确认同意' + (type == 1 ? '退款？资金将原路返回！' : '换货？'),
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在处理',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.order.refund,
                        method: 'post',
                        data: {
                            id: id,
                            action: 'pass',
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                                success: function (e) {
                                    wx.redirectTo({
                                        url: '/' + page.route + '?' + getApp().utils.objectToUrlParams(page.options),
                                    });
                                }
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                        },
                    });
                }
            }
        });
    },

    refundDeny: function (e) {
        var page = this;
        var id = page.data.id;
        wx.showModal({
            title: '提示',
            content: '确认拒绝？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在处理',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.order.refund,
                        method: 'post',
                        data: {
                            id: id,
                            action: 'deny',
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                                success: function (e) {
                                    wx.redirectTo({
                                        url: '/' + page.route + '?' + getApp().utils.objectToUrlParams(page.options),
                                    });
                                }
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                        },
                    });
                }
            }
        });
    },

});
if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        wx.showLoading({
            title: '正在加载',
            mask: true,
        });
        app.request({
            url: api.mch.order.detail,
            data: {
                'id': options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order: res.data.order,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }
            },
            complete: function () {
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

    expressChange: function (e) {
        var page = this;
        page.data.order.default_express = page.data.order.express_list[e.detail.value].express;
        page.setData({
            order: page.data.order,
        });
    },

    expressInput: function (e) {
        var page = this;
        page.data.order.default_express = e.detail.value;
    },

    expressNoInput: function (e) {
        var page = this;
        page.data.order.express_no = e.detail.value;
    },

    wordsInput: function (e) {
        var page = this;
        page.data.order.words = e.detail.value;
    },

    formSubmit: function (e) {
        var page = this;
        wx.showLoading({
            title: '正在提交',
            mask: true,
        });
        app.request({
            url: api.mch.order.send,
            method: 'post',
            data: {
                send_type: 'express',
                order_id: page.data.order.id,
                express: e.detail.value.express,
                express_no: e.detail.value.express_no,
                words: e.detail.value.words,
            },
            success: function (res) {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (e.confirm) {
                            if (res.code == 0) {
                                wx.navigateBack();
                            }
                        }
                    }
                });
            },
            complete: function (res) {
                wx.hideLoading();
            }
        });
    },

});
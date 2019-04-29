if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cash_val: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        var cache_key = 'mch_account_data';
        var data = wx.getStorageSync(cache_key);
        if (data) {
            page.setData(data);
        }
        wx.showNavigationBarLoading();
        app.request({
            url: api.mch.user.account,
            success: function (res) {
                if (res.code == 0) {
                    page.setData(res.data);
                    wx.setStorageSync(cache_key, res.data);
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        success: function () {

                        },
                    });
                }
            },
            complete: function () {
                wx.hideNavigationBarLoading();
            },
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

    showDesc: function () {
        var page = this;
        wx.showModal({
            title: '交易手续费说明',
            content: page.data.desc,
            showCancel: false,
        });
    },

    showCash: function () {
        wx.navigateTo({
            url: '/mch/m/cash/cash',
        });
        return;
        var page = this;
        if (page.data.account_money < 1) {
            page.showToast({
                title: '账户余额低于1元，无法提现。',
            });
            return;
        }
        page.setData({
            show_cash: true,
            cash_val: '',
        });
    },

    hideCash: function () {
        var page = this;
        page.setData({
            show_cash: false,
        });
    },

    cashInput: function (e) {
        var page = this;
        var val = e.detail.value;
        val = parseFloat(val);
        if (isNaN(val))
            val = 0;
        val = val.toFixed(2);
        page.setData({
            cash_val: val ? val : '',
        });
    },

    cashSubmit: function (e) {
        var page = this;
        if (!page.data.cash_val) {
            page.showToast({
                title: '请输入提现金额。',
            });
            return;
        }
        if (page.data.cash_val <= 0) {
            page.showToast({
                title: '请输入提现金额。',
            });
            return;
        }
        wx.showLoading({
            title: '正在提交',
            mask: true,
        });
        app.request({
            url: api.mch.user.cash,
            method: 'POST',
            data: {
                cash_val: page.data.cash_val,
            },
            success: function (res) {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success: function () {
                        if (res.code == 0) {
                            wx.redirectTo({
                                url: '/mch/m/account/account',
                            });
                        }
                    },
                });
            },
            complete: function (res) {
                wx.hideLoading();
            },
        });
    },

});
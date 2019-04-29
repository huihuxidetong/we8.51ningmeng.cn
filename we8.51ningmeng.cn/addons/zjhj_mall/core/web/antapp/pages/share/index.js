if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/share/index.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_price: 0,
        price: 0,
        cash_price: 0,
        total_cash: 0,
        team_count: 0,
        order_money: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        page.setData({
            custom: wx.getStorageSync('custom')
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
        app.pageOnShow(this);
        var page = this;
        var share_setting = wx.getStorageSync("share_setting");
        var __user_info = page.data.__user_info;
        page.setData({
            share_setting: share_setting,
        });
        if (!__user_info || __user_info.is_distributor != 1) {
            page.loadData();
        } else {
            page.checkUser();
        }
    },

    checkUser:function(){
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.share.get_info,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        total_price: res.data.price.total_price,
                        price: res.data.price.price,
                        cash_price: res.data.price.cash_price,
                        total_cash: res.data.price.total_cash,
                        team_count: res.data.team_count,
                        order_money: res.data.order_money,
                        custom: res.data.custom,
                        order_money_un: res.data.order_money_un
                    });
                    wx.setStorageSync('custom', res.data.custom);
                    page.loadData();
                }
                if (res.code == 1) {
                    __user_info.is_distributor = res.data.is_distributor;
                    page.setData({
                        __user_info: __user_info
                    });
                    wx.setStorageSync('user_info', __user_info);
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });

    },

    loadData:function(){
        var page = this;
        wx.showLoading({
            title: '正在加载',
            mask: true,
        });
        app.request({
            url: api.share.index,
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.share_setting) {
                        var share_setting = res.data.share_setting;
                    } else {
                        var share_setting = res.data;
                    }
                    wx.setStorageSync("share_setting", share_setting);
                    page.setData({
                        share_setting: share_setting
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
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

    apply: function (e) {
        var page = this;
        var share_setting = wx.getStorageSync("share_setting");
        var user_info = wx.getStorageSync("user_info");
        if (share_setting.share_condition == 1) {
            wx.navigateTo({
                url: '/pages/add-share/index',
            })
        } else if (share_setting.share_condition == 0 || share_setting.share_condition == 2) {
            if (user_info.is_distributor == 0) {
                wx.showModal({
                    title: "申请成为分销商",
                    content: "是否申请？",
                    success: function (r) {
                        if (r.confirm) {
                            wx.showLoading({
                                title: "正在加载",
                                mask: true,
                            });
                            app.request({
                                url: api.share.join,
                                method: "POST",
                                data: {
                                    form_id: e.detail.formId
                                },
                                success: function (res) {
                                    if (res.code == 0) {
                                        if (share_setting.share_condition == 0) {
                                            user_info.is_distributor = 2;
                                            wx.navigateTo({
                                                url: '/pages/add-share/index',
                                            })
                                        } else {
                                            user_info.is_distributor = 1;
                                            wx.redirectTo({
                                                url: '/pages/share/index',
                                            })
                                        }
                                        wx.setStorageSync("user_info", user_info);
                                    }
                                },
                                complete: function () {
                                    wx.hideLoading();
                                }
                            });
                        }
                    },
                })
            } else {
                wx.navigateTo({
                    url: '/pages/add-share/index',
                })
            }
        }
    },

})
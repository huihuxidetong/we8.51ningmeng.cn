if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        current_page: 0,
        loading: false,
        no_more: false,
    },

    getList: function () {
        var page = this;
        if (page.data.loading) {
            return;
        }
        if (page.data.no_more) {
            return;
        }
        page.setData({
            loading: true,
        });
        var target_page = page.data.current_page + 1;
        app.request({
            url: api.mch.user.cash_log,
            data: {
                page: target_page,
                year: '',
                month: '',
            },
            success: function (res) {
                if (res.code == 0) {
                    if (!res.data.list || !res.data.list.length) {
                        page.setData({
                            no_more: true,
                        });
                    } else {
                        page.data.list = page.data.list.concat(res.data.list);
                        page.setData({
                            list: page.data.list,
                            current_page: target_page,
                        });
                    }
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
                page.setData({
                    loading: false,
                });
            },
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        this.getList();
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
        this.getList();
    },
});
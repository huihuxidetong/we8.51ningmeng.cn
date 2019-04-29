if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/share-team/share-team.js
var api = require('../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading = false;
var p = 2;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: 1,
        first_count: 0,
        second_count: 0,
        third_count: 0,
        list: Array,
        no_more: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        var share_setting = wx.getStorageSync("share_setting");
        page.setData({
            share_setting: share_setting,
        });
        is_loading = false;
        is_no_more = false;
        p = 2;
        page.GetList(options.status || 1);
    },
    GetList: function (status) {
        var page = this;
        if (is_loading) {
            return;
        }
        is_loading = true;
        page.setData({
            status: parseInt(status || 1),
        });
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.share.get_team,
            data: {
                status: page.data.status,
                page: 1
            },
            success: function (res) {
                page.setData({
                    first_count: res.data.first,
                    second_count: res.data.second,
                    third_count: res.data.third,
                    list: res.data.list,
                });
                if (res.data.list.length == 0) {
                    is_no_more = true;
                    page.setData({
                        no_more: true
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
                is_loading = false;
            }
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (is_no_more) {
            return;
        }
        this.loadData();
    },

    loadData: function () {
        if (is_loading) {
            return;
        }
        is_loading = true;
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.share.get_team,
            data: {
                status: page.data.status,
                page: p
            },
            success: function (res) {
                page.setData({
                    first_count: res.data.first,
                    second_count: res.data.second,
                    third_count: res.data.third,
                    list: page.data.list.concat(res.data.list),
                });
                if (res.data.list.length == 0) {
                    is_no_more = true;
                    page.setData({
                        no_more: true
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
                is_loading = false;
                p++;
            }
        });
    }
})
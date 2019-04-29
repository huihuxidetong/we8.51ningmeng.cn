if (typeof wx === 'undefined') var wx = getApp().hj;
// bargain/order_list/order_list.js
var api = require('../../api.js');
var app = getApp();
var is_loading = false;
var is_no_more = true;
var intval = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        naver: 'order',
        status: -1,
        intval: [],
        p: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        var page = this;
        if (options.status == undefined) {
            options.status = -1;
        }
        page.setData(options);
        page.getList();
    },

    getList: function() {
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.bargain.order_list,
            data: {
                status: page.data.status || -1
            },
            success: function(res) {
                if (res.code == 0) {
                    page.setData(res.data);
                    page.setData({
                        p: 1
                    });
                    page.getTimeList();
                } else {
                    page.showLoading({
                        title: res.msg
                    });
                }
            },
            complete: function(res) {
                wx.hideLoading();
                is_no_more = false;
            }
        });
    },

    // 批量设置定时
    getTimeList: function() {
        clearInterval(intval);
        var page = this;
        var list = page.data.list;
        intval = setInterval(function() {
            for (var i in list) {
                if (list[i].reset_time > 0) {
                    var reset_time = list[i].reset_time - 1;
                    var time_list = page.setTimeList(reset_time);
                    list[i].reset_time = reset_time;
                    list[i].time_list = time_list;
                }
            }
            page.setData({
                list: list
            });
        }, 1000);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        app.pageOnReady(this);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        app.pageOnShow(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        app.pageOnHide(this);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        app.pageOnUnload(this);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var page = this;
        if (is_no_more) {
            return;
        }
        page.loadData();
    },

    loadData: function() {
        var page = this;
        if (is_loading) {
            return;
        }
        is_loading = true;
        wx.showLoading({
            title: '加载中',
        });
        var p = page.data.p + 1;
        app.request({
            url: api.bargain.order_list,
            data: {
                status: page.data.status,
                page: p
            },
            success: function(res) {
                if (res.code == 0) {
                    var list = page.data.list.concat(res.data.list);
                    page.setData({
                        list: list,
                        p: p
                    });
                    if (res.data.list.length == 0) {
                        is_no_more = true;
                    }
                    page.getTimeList();
                } else {
                    page.showLoading({
                        title: res.msg
                    });
                }
            },
            complete: function(res) {
                wx.hideLoading();
                is_loading = true;
            }
        });
    },
    submit: function (e) {
        var page = this;
        var mch_list = [];
        var goods_list = [];
        goods_list.push({
            bargain_order_id: e.currentTarget.dataset.index
        });
        mch_list.push({
            mch_id: 0,
            goods_list: goods_list
        });
        wx.navigateTo({
            url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
        })
    }
})
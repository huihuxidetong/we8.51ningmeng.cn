if (typeof wx === 'undefined') var wx = getApp().hj;
// bargain/list/list.js
var api = require('../../api.js');
var app = getApp();
var is_loading = false;
var is_no_more = true;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        p: 1,
        naver: 'list'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        var page = this;
        if (typeof options.order_id !== 'undefined') {
            wx.navigateTo({
                url: '/bargain/activity/activity?order_id=' + options.order_id + '&user_id=' + options.user_id,
            });
        }
        if (typeof options.goods_id !== 'undefined') {
            wx.navigateTo({
                url: '/bargain/goods/goods?goods_id=' + options.goods_id + '&user_id=' + options.user_id,
            });
        }
        page.loadDataFirst(options);
    },

    loadDataFirst:function(options){
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.bargain.index,
            type: 'get',
            success: function (res) {
                if (res.code == 0) {
                    page.setData(res.data);
                    page.setData({
                        p: 2
                    });
                    if (res.data.goods_list.length > 0) {
                        is_no_more = false;
                    }
                }
            },
            complete: function (res) {
                if (options.order_id == 'undefined') {
                    wx.hideLoading();
                }
                wx.stopPullDownRefresh();
            }
        });
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadDataFirst({});
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (is_no_more) {
            return;
        }
        this.loadData();
    },

    // 上拉加载数据
    loadData: function() {
        if (is_loading) {
            return;
        }
        is_loading = true;
        wx.showLoading({
            title: '加载中',
        });
        var page = this;
        var p = page.data.p;
        app.request({
            url: api.bargain.index,
            data: {
                page: p
            },
            success: function(res) {
                if (res.code == 0) {
                    var goods_list = page.data.goods_list;
                    if (res.data.goods_list.length == 0) {
                        is_no_more = true;
                    }
                    goods_list = goods_list.concat(res.data.goods_list);
                    page.setData({
                        goods_list: goods_list,
                        p: p + 1
                    });
                } else {
                    page.showToast({
                        title: res.msg,
                    });
                }
            },
            complete: function (res) {
                wx.hideLoading();
                is_loading = false;
            }
        });

    },

    // 跳转到商品详情
    goToGoods: function(e) {
        var goods_id = e.currentTarget.dataset.index;
        wx.navigateTo({
            url: '/bargain/goods/goods?goods_id=' + goods_id,
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        var res = {
            path: "/bargain/list/list?user_id=" + page.data.__user_info.id,
            success: function (e) { },
        };
        return res;
    },
})
if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/detail/index.js
var api = require('../../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        gain: true,
        p: 1,
        status: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().pageOnLoad(this, options);
        is_no_more = false;
        is_loading = false;
        var page = this;
        if (options.status) {
            page.setData({
                status: options.status
            });
        }
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
        getApp().pageOnShow(this);
        var page = this;
        page.loadData();
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
        var page = this;
        if (is_no_more) {
            return;
        }
        page.loadData();
    },
    income: function () {
        wx.redirectTo({
            url: '/pages/integral-mall/detail/index?status=1',
        })
    },
    expenditure: function () {
        wx.redirectTo({
            url: '/pages/integral-mall/detail/index?status=2',
        })
    },
    loadData: function () {
        var page = this;
        if (is_loading) {
            return
        }
        is_loading = true;
        wx.showLoading({
            title: '加载中',
        })
        var p = page.data.p;
        app.request({
            url: api.integral.integral_detail,
            data: {
                page: p,
                status: page.data.status
            },
            success: function (res) {
                if (res.code == 0) {
                    var list = page.data.list
                    if (list) {
                        list = list.concat(res.data.list)
                    } else {
                        list = res.data.list
                    }
                    if (res.data.list.length <= 0) {
                        is_no_more = true;
                    }
                    page.setData({
                        list: list,
                        is_no_more: is_no_more,
                        p: (p + 1),
                    });
                }
            },
            complete: function (res) {
                is_loading = false;
                wx.hideLoading();
            }
        });
    }
})
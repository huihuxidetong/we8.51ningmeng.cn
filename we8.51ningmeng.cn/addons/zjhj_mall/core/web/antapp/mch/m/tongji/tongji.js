if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current_year: '',
        current_month: '',
        month_scroll_x: 100000,
        year_list: [],
        daily_avg: '-',
        month_count: '-',
        up_rate: '-',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        wx.showNavigationBarLoading();
        app.request({
            url: api.mch.user.tongji_year_list,
            success: function (res) {
                page.setData({
                    year_list: res.data.year_list,
                    current_year: res.data.current_year,
                    current_month: res.data.current_month,
                });
                page.setMonthScroll();
                page.getMonthData();
            },
            complete: function () {
                wx.hideNavigationBarLoading();
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

    changeMonth: function (e) {
        var page = this;
        var y_index = e.currentTarget.dataset.yearIndex;
        var m_index = e.currentTarget.dataset.monthIndex;
        for (var i in page.data.year_list) {
            if (i == y_index) {
                page.data.year_list[i].active = true;
                page.data.current_year = page.data.year_list[i].year;
            } else {
                page.data.year_list[i].active = false;
            }
            for (var j in page.data.year_list[i].month_list) {
                if (i == y_index && j == m_index) {
                    page.data.year_list[i].month_list[j].active = true;
                    page.data.current_month = page.data.year_list[i].month_list[j].month;
                } else {
                    page.data.year_list[i].month_list[j].active = false;
                }
            }
        }
        page.setData({
            year_list: page.data.year_list,
            current_year: page.data.current_year,
        });
        page.setMonthScroll();
        page.getMonthData();
    },

    setMonthScroll: function () {
        var page = this;
        var device_info = wx.getSystemInfoSync();
        var item_width = device_info.screenWidth / 5;
        var left_count = 0;
        for (var i in page.data.year_list) {
            var is_active = false;
            for (var j in page.data.year_list[i].month_list) {
                if (page.data.year_list[i].month_list[j].active) {
                    is_active = true;
                    break;
                } else {
                    left_count++;
                }
            }
            if (is_active)
                break;
        }
        page.setData({
            month_scroll_x: (left_count - 0) * item_width,
        });
    },

    setCurrentYear: function () {
        var page = this;
        for (var i in page.data.year_list) {
            if (page.data.year_list[i].active) {
                page.data.current_year = page.data.year_list[i].year;
                break;
            }
        }
        page.setData({
            current_year: page.data.current_year,
        });
    },

    getMonthData: function () {
        var page = this;
        wx.showNavigationBarLoading();
        page.setData({
            daily_avg: '-',
            month_count: '-',
            up_rate: '-',
        });
        app.request({
            url: api.mch.user.tongji_month_data,
            data: {
                year: page.data.current_year,
                month: page.data.current_month,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        daily_avg: res.data.daily_avg,
                        month_count: res.data.month_count,
                        up_rate: res.data.up_rate,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                    });
                }
            },
            complete: function () {
                wx.hideNavigationBarLoading();
            },
        });
    },

});
if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [
            {
                id: 1,
                name: '上衣',
            },
            {
                id: 2,
                name: '下装',
                list: [
                    {
                        id: 3,
                        name: '长裤',
                    },
                    {
                        id: 4,
                        name: '长裤',
                    },
                    {
                        id: 5,
                        name: '九分裤',
                    },
                    {
                        id: 6,
                        name: '短裤',
                    },
                ],
            },
            {
                id: 7,
                name: '帽子',
            },
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        page.setData({
            mch_id: options.mch_id,
            cat_id: options.cat_id || '',
        });
        var cache_key = 'shop_cat_list_mch_id_' + page.data.mch_id;
        var list = wx.getStorageSync(cache_key);
        if (list) {
            page.setData({
                list: list,
            });
        }
        wx.showNavigationBarLoading();
        app.request({
            url: api.mch.shop_cat,
            data: {
                mch_id: page.data.mch_id
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        list: res.data.list,
                    });
                    wx.setStorageSync(cache_key, res.data.list);
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
});
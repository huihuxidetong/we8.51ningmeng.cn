if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cat_id: '',
        keyword: '',
        list: [],
        page: 1,
        no_more: false,
        loading: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        if (options.cat_id) {
            this.data.cat_id = options.cat_id;
        }
        this.loadShopList();
    },

    loadShopList: function (cb) {
        var page = this;
        if (page.data.no_more) {
            if (typeof cb === 'function')
                cb();
            return;
        }
        if (page.data.loading) {
            return;
        }
        page.setData({
            loading: true,
        });
        app.request({
            url: api.mch.shop_list,
            data: {
                keyword: page.data.keyword,
                cat_id: page.data.cat_id,
                page: page.data.page,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (!res.data.list || !res.data.list.length) {
                        page.setData({
                            no_more: true,
                            cat_list: res.data.cat_list,
                        });
                        return;
                    }
                    if (!page.data.list)
                        page.data.list = [];
                    page.data.list = page.data.list.concat(res.data.list);
                    page.setData({
                        list: page.data.list,
                        page: page.data.page + 1,
                        cat_list: res.data.cat_list,
                    });
                }
            },
            complete: function () {
                page.setData({
                    loading: false,
                });
                if (typeof cb === 'function')
                    cb();
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
        var page = this;
        page.loadShopList();
    },

    searchSubmit: function (e) {
        var page = this;
        var keyword = e.detail.value;
        page.setData({
            list: [],
            keyword: keyword,
            page: 1,
            no_more: false,
        });
        page.loadShopList(function () {

        });
    },

    showCatList: function () {
        var page = this;
        page.setData({
            show_cat_list: true,
        });
    },
    hideCatList: function () {
        var page = this;
        page.setData({
            show_cat_list: false,
        });
    },

});
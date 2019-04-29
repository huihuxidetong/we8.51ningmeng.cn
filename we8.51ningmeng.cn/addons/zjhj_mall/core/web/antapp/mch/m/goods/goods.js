if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: 1,
        goods_list: [],
        no_goods: false,
        no_more_goods: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        page.setData({
            status: parseInt(options.status || 1),
            loading_more: true,
        });
        page.loadGoodsList(function () {
            page.setData({
                loading_more: false,
            });
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
    onReachBottom: function (e) {
        var page = this;
        if (page.data.loading_more) {
            return;
        }
        page.setData({
            loading_more: true,
        });
        page.loadGoodsList(function () {
            page.setData({
                loading_more: false,
            });
        });
    },

    searchSubmit: function (e) {
        var page = this;
        var keyword = e.detail.value;
        page.setData({
            keyword: keyword,
            loading_more: true,
            goods_list: [],
            current_page: 0,
        });
        page.loadGoodsList(function () {
            page.setData({
                loading_more: false,
            });
        });

    },

    loadGoodsList: function (callback) {
        var page = this;
        if (page.data.no_goods || page.data.no_more_goods) {
            if (typeof callback == 'function')
                callback();
            return;
        }
        var current_page = page.data.current_page || 0;
        var target_page = current_page + 1;
        app.request({
            url: api.mch.goods.list,
            data: {
                page: target_page,
                status: page.data.status,
                keyword: page.data.keyword || '',
            },
            success: function (res) {
                if (res.code == 0) {
                    if (target_page == 1 && (!res.data.list || !res.data.list.length)) {
                        page.setData({
                            no_goods: true,
                        });
                    }
                    if (!res.data.list || !res.data.list.length) {
                        page.setData({
                            no_more_goods: true,
                        });
                    } else {
                        page.data.goods_list = page.data.goods_list || [];
                        page.data.goods_list = page.data.goods_list.concat(res.data.list);
                        page.setData({
                            goods_list: page.data.goods_list,
                            current_page: target_page,
                        });
                    }
                }
            },
            complete: function () {
                if (typeof callback == 'function')
                    callback();
            },
        });

    },

    showMoreAlert: function (e) {
        var page = this;
        setTimeout(function () {
            var index = e.currentTarget.dataset.index;
            page.data.goods_list[index].show_alert = true;
            page.setData({
                goods_list: page.data.goods_list,
            });
        }, 50);
    },

    hideMoreAlert: function (e) {
        var page = this;
        var has_show = false;
        for (var i in page.data.goods_list) {
            if (page.data.goods_list[i].show_alert) {
                page.data.goods_list[i].show_alert = false;
                has_show = true;
            }
        }
        if (has_show) {
            setTimeout(function () {
                page.setData({
                    goods_list: page.data.goods_list,
                });
            }, 100);
        }
    },

    setGoodsStatus: function (e) {
        var page = this;
        var status = e.currentTarget.dataset.targetStatus;
        var index = e.currentTarget.dataset.index;
        wx.showLoading({
            title: '正在处理',
            mask: true,
        });
        app.request({
            url: api.mch.goods.set_status,
            data: {
                id: page.data.goods_list[index].id,
                status: status,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.data.goods_list[index].status = status;
                    page.setData({goods_list: page.data.goods_list});
                }
                page.showToast({
                    title: res.msg,
                    duration: 1500,
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

    goodsDelete: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        wx.showModal({
            title: '警告',
            content: '确认删除该商品？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在处理',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.goods.delete,
                        data: {
                            id: page.data.goods_list[index].id,
                        },
                        success: function (res) {
                            page.showToast({
                                title: res.msg,
                            });
                            if (res.code == 0) {
                                page.data.goods_list.splice(index, 1);
                                page.setData({
                                    goods_list: page.data.goods_list,
                                });
                            }
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                }
            }
        });
    },

});
if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/book/index/index.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cid: 0,
        scrollLeft: 600,
        scrollTop: 0,
        emptyGoods: 0,
        page: 1,
        pageCount: 0,
        cat_show: 1,
        cid_url: false,
        quick_icon: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        self.systemInfo = wx.getSystemInfoSync();
        app.pageOnLoad(self, options);

        if (options.cid) {
            var cid = options.cid;
            this.setData({
                cid_url: false
            })
            this.switchNav({ 'currentTarget': { 'dataset': { 'id': options.cid } } });
            return;
        } else {
            this.setData({
                cid_url: true
            })
        }
        this.loadIndexInfo(this);

    },
    quickNavigation: function () {
        var status = 0;
        this.setData({
            quick_icon: !this.data.quick_icon
        })
        var store = this.data.store;
        var animationPlus = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease-out',
        });

        var x = -55;
        if (!this.data.quick_icon) {
            animationPlus.translateY(x).opacity(1).step();
        } else {
            animationPlus.opacity(0).step();
        }
        this.setData({
            animationPlus: animationPlus.export(),
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /**
     * 预约首页加载
     */
    loadIndexInfo: function () {
        var self = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.book.index,
            method: "get",
            success: function (res) {
                if (res.code == 0) {
                    wx.hideLoading();
                    self.setData({
                        cat: res.data.cat,
                        goods: res.data.goods.list,
                        cat_show: res.data.cat_show,
                        page:res.data.goods.page,
                        pageCount: res.data.goods.page_count,
                    });

                    if (!res.data.goods.list.length > 0) {
                        self.setData({
                            emptyGoods: 1
                        })
                    }
                }
            }
        });
    },
    /**
     * 顶部导航事件
     */
    switchNav: function (e) {
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });

        var cid = 0;
        if (cid == e.currentTarget.dataset.id && e.currentTarget.dataset.id != 0) return;
        cid = e.currentTarget.dataset.id;

        if(this.data.__platform == 'wx'){
            var windowWidth = page.systemInfo.windowWidth
            var offsetLeft = e.currentTarget.offsetLeft
            var scrollLeft = page.data.scrollLeft;

            if (offsetLeft > windowWidth / 2) {
                scrollLeft = offsetLeft
            } else {
                scrollLeft = 0
            }
            page.setData({
                scrollLeft: scrollLeft,
            });    
        }
        if(this.data.__platform == 'my'){
            var cat = page.data.cat;
            var st = true;
            for (var i = 0; i < cat.length; ++i) {
                if (cat[i].id === e.currentTarget.id) {
                    st = false;
                    if (i >= 1) {
                        page.setData({
                            toView: cat[i - 1].id
                        })
                    } else {
                        page.setData({
                            toView: '0'
                        })
                    }
                    break;
                }
            }
            if (st) {
                page.setData({
                    toView: '0'
                })
            }
        }

        page.setData({
            cid: cid,
            page: 1,
            scrollTop: 0,
            emptyGoods: 0,
            goods: [],
            show_loading_bar: 1,
        })

        app.request({
            url: api.book.list,
            method: "get",
            data: { cid: cid },
            success: function (res) {
                if (res.code == 0) {
                    wx.hideLoading();
                    var goods = res.data.list;
                    if (res.data.page_count >= res.data.page) {
                        page.setData({
                            goods: goods,
                            page: res.data.page,
                            pageCount: res.data.page_count,
                            show_loading_bar: 0,
                        });
                    } else {
                        page.setData({
                            emptyGoods: 1,
                        });
                    }
                }
            }
        });
    },
    /**
     * 上拉加载
     */
    onReachBottom: function (e) {
        var self = this;
        var page = self.data.page;
        var pageCount = self.data.pageCount;
        var cid = self.data.cid;

        self.setData({
            show_loading_bar: 1
        });

        if (++page > pageCount) {
            self.setData({
                emptyGoods: 1,
                show_loading_bar: 0
            })
            return;
        }

        app.request({
            url: api.book.list,
            method: "get",
            data: { page: page, cid: cid },
            success: function (res) {
                if (res.code == 0) {
                    var goods = self.data.goods;
                    Array.prototype.push.apply(goods, res.data.list);

                    self.setData({
                        show_loading_bar: 0,
                        goods: goods,
                        page: res.data.page,
                        pageCount: res.data.page_count,
                        emptyGoods: 0
                    })
                }
            }
        });
    }
})
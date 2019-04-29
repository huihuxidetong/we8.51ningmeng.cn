if (typeof wx === 'undefined') var wx = getApp().hj;
// bargain/activity/activity.js
var api = require('../../api.js');
var time = require('../commons/time.js');
var app = getApp();
var setIntval = null;
var is_loading = false;
var is_no_more = true;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_more: true,
        p: 1,
        show_modal: false,
        show: false,
        show_more_btn: true,
        animationData: null,
        show_modal_a: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        var page = this;
        // wx.showLoading({
        //     title: '加载中',
        // })
        page.setData({
            order_id: options.order_id
        })
        page.joinBargain();
        time.init(page);
    },

    joinBargain: function() {
        var page = this;
        app.request({
            url: api.bargain.bargain,
            data: {
                order_id: page.data.order_id,
            },
            success: function(res) {
                if (res.code == 0) {
                    page.getOrderInfo();
                    page.setData(res.data);
                } else {
                    page.showToast({
                        title: res.msg
                    });
                    wx.hideLoading();
                }
            }
        });
    },

    getOrderInfo: function() {
        var page = this;
        app.request({
            url: api.bargain.activity,
            data: {
                order_id: page.data.order_id,
                page: 1
            },
            success: function(res) {
                if (res.code == 0) {
                    page.setData(res.data);
                    page.setData({
                        time_list: page.setTimeList(res.data.reset_time),
                        show: true
                    });
                    if (page.data.bargain_status) {
                        page.setData({
                            show_modal: true,
                        });
                    }
                    page.setTimeOver();
                    is_no_more = false;
                    page.animationCr();
                } else {
                    page.showToast({
                        title: res.msg
                    });
                }
            },
            complete: function(res) {
                wx.hideLoading();
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
        clearInterval(setIntval);
        setIntval = null;
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var page = this;
        var res = {
            path: "/bargain/activity/activity?order_id=" + page.data.order_id + "&user_id=" + page.data.__user_info.id,
            success: function(e) {},
        };
        return res;
    },

    loadData: function() {
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        if (is_loading) {
            return;
        }
        is_loading = true;
        wx.showNavigationBarLoading();
        var p = page.data.p + 1;
        app.request({
            url: api.bargain.activity,
            data: {
                order_id: page.data.order_id,
                page: p
            },
            success: function(res) {
                if (res.code == 0) {
                    var bargain_info = page.data.bargain_info;
                    bargain_info = bargain_info.concat(res.data.bargain_info);
                    page.setData(res.data);
                    page.setData({
                        bargain_info: bargain_info,
                        p: p
                    });
                    if (res.data.bargain_info.length == 0) {
                        is_no_more = true;
                        page.setData({
                            show_more_btn: false,
                            show_more: true
                        });
                    }
                } else {
                    page.showToast({
                        title: res.msg
                    });
                }
            },
            complete: function(res) {
                wx.hideLoading();
                wx.hideNavigationBarLoading();
                is_loading = false;
            }
        });
    },

    showMore: function(res) {
        var page = this;
        if (page.data.show_more_btn) {
            is_no_more = false;
        }
        if (is_no_more) {
            return;
        }
        page.loadData();
    },

    hideMore: function() {
        var page = this;
        page.setData({
            show_more_btn: true,
            show_more: false
        });
    },

    orderSubmit: function() {
        var page = this;
        wx.showLoading({
            title: '加载中',
        })
        wx.redirectTo({
            url: '/bargain/goods/goods?goods_id=' + page.data.goods_id,
        })
        return ;
        app.request({
            url: api.bargain.bargain_submit,
            method: "POST",
            data: {
                goods_id: page.data.goods_id,
            },
            success: function(res) {
                if (res.code == 0) {
                    wx.redirectTo({
                        url: '/bargain/activity/activity?order_id=' + res.data.order_id,
                    })
                } else {
                    page.showToast({
                        title: res.msg
                    });
                }
            },
            complete: function(res) {
                wx.hideLoading();
            }
        });
    },

    close: function() {
        this.setData({
            show_modal: false
        });
    },

    buyNow: function() {
        var page = this;
        var mch_list = [];
        var goods_list = [];
        goods_list.push({
            bargain_order_id: page.data.order_id
        });
        mch_list.push({
            mch_id: 0,
            goods_list: goods_list
        });
        wx.showModal({
            title: '提示',
            content: '是否确认购买？',
            success: function(e) {
                if (e.confirm) {
                    wx.redirectTo({
                        url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
                    });
                }
            }
        });
    },

    goToList: function() {
        wx.redirectTo({
            url: '/bargain/list/list',
        })
    },

    animationCr: function() {
        var page = this;
        page.animationT();
        setTimeout(function() {
            page.setData({
                show_modal_a: true
            });
            page.animationBig();
            page.animationS();
        }, 800);
    },

    animationBig: function() {
        var animation = wx.createAnimation({
            duration: 500,
            transformOrigin: '50% 50%',
        });
        var page = this;

        var circleCount = 0;
        setInterval(function() {
            if (circleCount % 2 == 0) {
                animation.scale(0.9).step();
            } else {
                animation.scale(1.0).step();
            }

            page.setData({
                animationData: animation.export()
            });

            circleCount++;
            if (circleCount == 500) {
                circleCount = 0;
            }
        }, 500)
    },

    animationS: function() {
        var animation = wx.createAnimation({
            duration: 500,
        });
        var page = this;
        animation.width('512rpx').height('264rpx').step();
        animation.rotate(-2).step();
        animation.rotate(4).step();
        animation.rotate(-2).step();
        animation.rotate(0).step();
        page.setData({
            animationDataHead: animation.export()
        })
    },

    animationT: function() {
        var animation = wx.createAnimation({
            duration: 200,
        });
        var page = this;
        animation.width('500rpx').height('500rpx').step();
        page.setData({
            animationDataT: animation.export()
        })
    }
})
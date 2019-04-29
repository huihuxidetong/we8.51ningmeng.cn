if (typeof wx === 'undefined') var wx = getApp().hj;
// bargain/goods/goods.js
var api = require('../../api.js');
var utils = require('../../utils.js');
var app = getApp();
var videoContext = '';
var setIntval = null;
var WxParse = require('../../wxParse/wxParse.js');
var userIntval = null;
var scrollIntval = null;
var is_loading = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hide: "hide",
        time_list: {
            day: 0,
            hour: '00',
            minute: '00',
            second: '00'
        },
        p: 1,
        user_index: 0,
        show_content: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        if (typeof my === 'undefined') {
            var scene = decodeURIComponent(options.scene);
            if (typeof scene !== 'undefined') {
                var scene_obj = utils.scene_decode(scene);
                if (scene_obj.gid) {
                    options.goods_id = scene_obj.gid;
                }
            }
        } else {
            if (app.query !== null) {
                var query = app.query;
                app.query = null;
                options.goods_id = query.gid;
            }
        }
        this.getGoods(options.goods_id);
    },

    getGoods: function(goods_id) {
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.bargain.goods,
            data: {
                goods_id: goods_id,
                page: 1
            },
            success: function(res) {
                if (res.code == 0) {
                    var detail = res.data.goods.detail;
                    WxParse.wxParse("detail", "html", detail, page);
                    page.setData(res.data);
                    page.setData({
                        reset_time: page.data.goods.reset_time,
                        time_list: page.setTimeList(res.data.goods.reset_time),
                        p: 1
                    });
                    page.setTimeOver();
                    if (res.data.bargain_info) {
                        page.getUserTime();
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function(e) {
                            if (e.confirm) {
                                wx.navigateBack({
                                    delta: -1
                                })
                            }
                        }
                    })
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
        clearInterval(userIntval);
        userIntval = null;
        clearInterval(scrollIntval);
        scrollIntval = null;
    },

    play: function(e) {
        var url = e.target.dataset.url; //获取视频链接
        this.setData({
            url: url,
            hide: '',
            show: true,
        });
        videoContext = wx.createVideoContext('video');
        videoContext.play();
    },

    close: function(e) {
        if (e.target.id == 'video') {
            return true;
        }
        this.setData({
            hide: "hide",
            show: false
        });
        videoContext.pause();
    },

    onGoodsImageClick: function(e) {
        var page = this;
        var urls = [];
        var index = e.currentTarget.dataset.index;
        //console.log(page.data.goods.pic_list);
        for (var i in page.data.goods.pic_list) {
            urls.push(page.data.goods.pic_list[i].pic_url);
        }
        wx.previewImage({
            urls: urls, // 需要预览的图片http链接列表
            current: urls[index],
        });
    },

    hide: function(e) {
        if (e.detail.current == 0) {
            this.setData({
                img_hide: ""
            });
        } else {
            this.setData({
                img_hide: "hide"
            });
        }
    },

    // 设置定时器
    setTimeOver: function() {
        var page = this;

        setIntval = setInterval(function() {
            if (page.data.resset_time <= 0) {
                clearInterval(setIntval);
            }
            var reset_time = page.data.reset_time - 1;
            var time_list = page.setTimeList(reset_time);
            page.setData({
                reset_time: reset_time,
                time_list: time_list
            });
        }, 1000);
    },

    orderSubmit: function() {
        var page = this;
        wx.showLoading({
            title: '加载中',
        })
        app.request({
            url: api.bargain.bargain_submit,
            method: "POST",
            data: {
                goods_id: page.data.goods.id,
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
    buyNow: function() {
        var page = this;
        var mch_list = [];
        var goods_list = [];
        var bargain_info = page.data.bargain_info;
        if (!bargain_info) {
            return;
        }
        goods_list.push({
            bargain_order_id: bargain_info.order_id
        });
        mch_list.push({
            mch_id: 0,
            goods_list: goods_list
        });
        wx.redirectTo({
            url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
        });
    },

    getUserTime: function() {
        var page = this;
        userIntval = setInterval(function() {
            page.loadData()
        }, 1000);
        scrollIntval = setInterval(function() {
            var user_index = page.data.user_index;
            var count = page.data.bargain_info.bargain_info.length;
            if (count - user_index > 3) {
                user_index = user_index + 3;
            } else {
                user_index = 0;
            }
            page.setData({
                user_index: user_index
            });
        }, 3000);
    },

    loadData: function() {
        var page = this;
        var p = page.data.p;
        if (is_loading) {
            return;
        }
        is_loading = true;
        app.request({
            url: api.bargain.goods_user,
            data: {
                page: p + 1,
                goods_id: page.data.goods.id
            },
            success: function(res) {
                if (res.code == 0) {
                    var bargain_info_user = page.data.bargain_info.bargain_info;
                    var bargain_info = res.data.bargain_info
                    if (bargain_info.bargain_info.length == 0) {
                        clearInterval(userIntval);
                        userIntval = null;
                    }
                    bargain_info.bargain_info = bargain_info_user.concat(bargain_info.bargain_info);
                    page.setData({
                        bargain_info: bargain_info,
                        p: p + 1
                    });
                } else {
                    page.showToast({
                        title: res.msg
                    });
                }
            },
            complete: function() {
                is_loading = false;
            }
        });
    },

    contentClose: function() {
        var page = this;
        page.setData({
            show_content: false
        });
    },
    contentOpen: function() {
        var page = this;
        page.setData({
            show_content: true
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        var res = {
            path: "/bargain/list/list?goods_id=" + page.data.goods.id + "&user_id=" + page.data.__user_info.id,
            success: function (e) { },
        };
        return res;
    },
})
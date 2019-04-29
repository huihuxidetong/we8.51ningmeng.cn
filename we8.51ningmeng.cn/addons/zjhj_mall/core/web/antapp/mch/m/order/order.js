if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: 1,
        show_menu: false,
        order_list: [],
        no_orders: false,
        no_more_orders: false,
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
        page.loadOrderList(function () {
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
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    showMenu: function (e) {
        var page = this;
        page.setData({
            show_menu: page.data.show_menu ? false : true,
        });
    },

    loadOrderList: function (callback) {
        var page = this;
        var status = page.data.status;
        var current_page = page.data.current_page || 0;
        var target_page = current_page + 1;
        var keyword = page.data.keyword || '';
        app.request({
            url: api.mch.order.list,
            data: {
                status: status,
                page: target_page,
                keyword: keyword,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (target_page == 1 && (!res.data.list || !res.data.list.length)) {
                        page.setData({
                            no_orders: true,
                        });
                    }
                    if (!res.data.list || !res.data.list.length) {
                        page.setData({
                            no_more_orders: true,
                        });
                    } else {
                        page.data.order_list = page.data.order_list || [];
                        page.data.order_list = page.data.order_list.concat(res.data.list);
                        page.setData({
                            order_list: page.data.order_list,
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

    showSendModal: function (e) {
        var page = this;
        page.setData({
            show_send_modal: true,
            send_type: 'express',
            order_index: e.currentTarget.dataset.index,
        });
    },

    hideSendModal: function () {
        var page = this;
        page.setData({
            show_send_modal: false,
        });
    },

    switchSendType: function (e) {
        var page = this;
        var type = e.currentTarget.dataset.type;
        page.setData({
            send_type: type,
        });
    },

    sendSubmit: function () {
        var page = this;
        if (page.data.send_type == 'express') {
            page.hideSendModal();
            wx.navigateTo({
                url: '/mch/m/order-send/order-send?id=' + page.data.order_list[page.data.order_index].id,
            });
            return;
        }
        wx.showModal({
            title: '提示',
            content: '无需物流方式订单将直接标记成已发货，确认操作？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在提交',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.order.send,
                        method: 'post',
                        data: {
                            send_type: 'none',
                            order_id: page.data.order_list[page.data.order_index].id,
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                success: function (e) {
                                    if (e.confirm) {
                                        if (res.code == 0) {
                                            wx.redirectTo({
                                                url: '/mch/m/order/order?status=2',
                                            });
                                        }
                                    }
                                }
                            });
                        },
                        complete: function () {
                            wx.hideLoading({
                                title: '正在提交',
                                mask: true,
                            });
                        }
                    });
                }
            }
        });
    },

    showPicList: function (e) {
        var page = this;
        wx.previewImage({
            urls: page.data.order_list[e.currentTarget.dataset.index].pic_list,
            current: page.data.order_list[e.currentTarget.dataset.index].pic_list[e.currentTarget.dataset.pindex],
        });
    },

    refundPass: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var id = page.data.order_list[index].id;
        var type = page.data.order_list[index].type;
        wx.showModal({
            title: '提示',
            content: '确认同意' + (type == 1 ? '退款？资金将原路返回！' : '换货？'),
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在处理',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.order.refund,
                        method: 'post',
                        data: {
                            id: id,
                            action: 'pass',
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                                success: function (e) {
                                    wx.redirectTo({
                                        url: '/' + page.route + '?' + getApp().utils.objectToUrlParams(page.options),
                                    });
                                }
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                        },
                    });
                }
            }
        });
    },

    refundDeny: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var id = page.data.order_list[index].id;
        var type = page.data.order_list[index].type;
        wx.showModal({
            title: '提示',
            content: '确认拒绝？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '正在处理',
                        mask: true,
                    });
                    app.request({
                        url: api.mch.order.refund,
                        method: 'post',
                        data: {
                            id: id,
                            action: 'deny',
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                                success: function (e) {
                                    wx.redirectTo({
                                        url: '/' + page.route + '?' + getApp().utils.objectToUrlParams(page.options),
                                    });
                                }
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                        },
                    });
                }
            }
        });
    },

});
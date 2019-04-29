if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_edit_modal: false,
        order_sub_price: '',
        order_sub_price_mode: true,
        order_add_price: '',
        order_add_price_mode: false,
        show_send_modal: false,
        send_type: 'express',
        order: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        wx.showLoading({
            title: '正在加载',
            mask: true,
        });
        app.request({
            url: api.mch.order.detail,
            data: {
                'id': options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order: res.data.order,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
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

    //复制收货人信息到剪切板
    copyUserAddress: function () {
        var page = this;
        wx.setClipboardData({
            data: '收货人:' + page.data.order.username + ',联系电话:' + page.data.order.mobile + ',收货地址:' + page.data.order.address,
            success: function (res) {
                wx.getClipboardData({
                    success: function (res) {
                        page.showToast({
                            title: '已复制收货信息'
                        });
                    }
                });
            }
        });
    },

    //弹出修改价格窗
    showEditModal: function (e) {
        var page = this;
        page.setData({
            show_edit_modal: true,
            order_sub_price: '',
            order_add_price: '',
            order_sub_price_mode: true,
            order_add_price_mode: false,
        });
    },

    //关闭修改价格窗
    hideEditModal: function (e) {
        var page = this;
        page.setData({
            show_edit_modal: false,
        });
    },

    tabSwitch: function (e) {
        var page = this;
        var tab = e.currentTarget.dataset.tab;
        if (tab == 'order_sub_price_mode') {
            page.setData({
                order_sub_price_mode: true,
                order_add_price_mode: false,
            });
        }
        if (tab == 'order_add_price_mode') {
            page.setData({
                order_sub_price_mode: false,
                order_add_price_mode: true,
            });
        }
    },

    //优惠价格输入框输入事件
    subPriceInput: function (e) {
        var page = this;
        page.setData({
            order_sub_price: e.detail.value,
        });
    },

    //优惠价格输入框完成事件
    subPriceBlur: function (e) {
        var page = this;
        var val = parseFloat(e.detail.value);
        if (isNaN(val)) {
            val = '';
        } else {
            if (val <= 0) {
                val = '';
            } else {
                val = val.toFixed(2);
            }
        }
        page.setData({
            order_sub_price: val,
        });
    },

    //加价价格输入框输入事件
    addPriceInput: function (e) {
        var page = this;
        page.setData({
            order_add_price: e.detail.value,
        });
    },

    //加价价格输入框完成事件
    addPriceBlur: function (e) {
        var page = this;
        var val = parseFloat(e.detail.value);
        if (isNaN(val)) {
            val = '';
        } else {
            if (val <= 0) {
                val = '';
            } else {
                val = val.toFixed(2);
            }
        }
        page.setData({
            order_add_price: val,
        });
    },

    //修改价格提交
    editPriceSubmit: function () {
        var page = this;
        var type = page.data.order_sub_price_mode ? 'sub' : 'add';
        wx.showLoading({
            mask: true,
            title: '正在处理'
        });
        app.request({
            url: api.mch.order.edit_price,
            method: 'post',
            data: {
                order_id: page.data.order.id,
                type: type,
                price: (type == 'sub') ? page.data.order_sub_price : page.data.order_add_price,
            },
            success: function (res) {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (e.confirm) {
                            if (res.code == 0)
                                wx.redirectTo({
                                    url: '/mch/m/order-detail/order-detail?id=' + page.data.order.id,
                                });
                        }
                    }
                });
            },
            complete: function () {
                wx.hideLoading();
            },
        });
    },

    showSendModal: function () {
        var page = this;
        page.setData({
            show_send_modal: true,
            send_type: 'express',
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
                url: '/mch/m/order-send/order-send?id=' + page.data.order.id,
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
                            order_id: page.data.order.id,
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                success: function (e) {
                                    if (e.confirm) {
                                        if (res.code == 0) {
                                            wx.redirectTo({
                                                url: '/mch/m/order-detail/order-detail?id=' + page.data.order.id,
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


});
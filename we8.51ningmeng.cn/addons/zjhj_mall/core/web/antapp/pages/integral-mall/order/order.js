if (typeof wx === 'undefined') var wx = getApp().hj;
// order.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hide:1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().pageOnLoad(this, options);
        var page = this;
        page.loadOrderList(options.status || 0);
    },

    loadOrderList: function (status) {
        var page = this;    
        if (status == undefined){
            status = -1;
        }
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.integral.list,
            data: {
                status: status,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order_list: res.data.list,
                        status: status
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },


    orderSubmitPay: function (e) {
        var page = this;
        var data = e.currentTarget.dataset;
        wx.showLoading({
            title: "提交中",
            mask: true,
        });
        app.request({
            url: api.integral.order_submit,
            data: { 
                id: data.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    wx.hideLoading();
                    wx.requestPayment({
                        _res: res,
                        timeStamp: res.data.timeStamp,
                        nonceStr: res.data.nonceStr,
                        package: res.data.package,
                        signType: res.data.signType,
                        paySign: res.data.paySign,
                        complete: function (e) {
                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {
                                wx.showModal({
                                    title: "提示",
                                    content: "订单尚未支付",
                                    showCancel: false,
                                    confirmText: "确认",
                                });
                                return;
                            }
                            if (e.errMsg == "requestPayment:ok") {
                                
                                wx.redirectTo({
                                    url: "/pages/integral-mall/order/order?status=1",
                                });
                            }
                        },
                    });
                }else{
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        confirmText: "确认",
                    });
                }
            }
        });
    },


    orderRevoke: function (e) {
        var page = this;
        wx.showModal({
            title: "提示",
            content: "是否取消该订单？",
            cancelText: "否",
            confirmText: "是",
            success: function (res) {
                if (res.cancel)
                    return true;
                if (res.confirm) {
                    wx.showLoading({
                        title: "操作中",
                    });
                    app.request({
                        url: api.integral.revoke,
                        data: {
                            order_id: e.currentTarget.dataset.id,
                        },
                        success: function (res) {
                            wx.hideLoading();
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        page.loadOrderList(page.data.status);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    },

    orderConfirm: function (e) {
        var page = this;
        wx.showModal({
            title: "提示",
            content: "是否确认已收到货？",
            cancelText: "否",
            confirmText: "是",
            success: function (res) {
                if (res.cancel)
                    return true;
                if (res.confirm) {
                    wx.showLoading({
                        title: "操作中",
                    });
                    app.request({
                        url: api.integral.confirm,
                        data: {
                            order_id: e.currentTarget.dataset.id,
                        },
                        success: function (res) {
                            wx.hideLoading();
                            wx.showToast({
                                title: res.msg,
                            });
                            if (res.code == 0) {
                                page.loadOrderList(3);
                            }
                        }
                    });
                }
            }
        });
    },


    orderQrcode: function (e) {
        var page = this;
        var order_list = page.data.order_list;
        var index = e.target.dataset.index;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.integral.get_qrcode,
            data: {
                order_no: order_list[index].order_no
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        hide: 0,
                        qrcode: res.data.url
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                    })
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

    hide: function (e) {
        this.setData({
            hide: 1
        });
    }

});
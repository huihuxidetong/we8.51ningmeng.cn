if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/order-refund-detail/order-refund-detail.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_refund: null,
        express_index: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);

        var page = this;

        wx.showLoading({
            title: "正在加载",
        });
        app.request({
            url: api.order.refund_detail,
            data: {
                order_refund_id: options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order_refund: res.data,
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    viewImage: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: page.data.order_refund.refund_pic_list[index],
            urls: page.data.order_refund.refund_pic_list,
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
    copyinfo: function (e) {
        var that = this;
        wx.setClipboardData({
          data: e.target.dataset.info,
          success: function (res) {
            wx.showToast({
              title: '复制成功！',
              icon: 'success',
              duration: 2000,
              mask: true
            })
          }
        });
    },
    bindExpressPickerChange: function (e) {
        var page = this;
        page.setData({
            express_index: e.detail.value,
        });
    },

    sendFormSubmit: function (e) {
        var page = this;
        wx.showLoading({
            title: '正在提交',
            mask: true,
        });
        getApp().request({
            url: api.order.refund_send,
            method: 'POST',
            data: {
                order_refund_id: page.data.order_refund.order_refund_id,
                express: page.data.express_index !== null ? (page.data.order_refund.express_list[page.data.express_index].name) : '',
                express_no: e.detail.value.express_no,
            },
            success: function (res) {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (res.code == 0) {
                            wx.redirectTo({
                                url: '/pages/order-refund-detail/order-refund-detail?id=' + page.data.order_refund.order_refund_id,
                            });
                        }
                    },
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

});
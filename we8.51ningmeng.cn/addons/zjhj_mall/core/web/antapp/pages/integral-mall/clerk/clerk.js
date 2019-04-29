if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/pt/order-details/order-details.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().pageOnLoad(this, options);
        var page = this;
        if (options.scene){
        } else if (options.type){
            page.setData({
                type: options.type,
                status:1
            });
            var oid = options.id
        }else{
            var oid = options.id;
            page.setData({
                status: 1,
                type:''
            });
        }
        if (typeof my === undefined) {
            var oid = options.scene;
            page.setData({
                type: ''
            });
        }else{
            page.setData({
                type: ''
            });
            if (app.query !== null) {
                var query = app.query;
                app.query = null;
                var oid = query.order_no;
            }
        }
        if (oid){
            page.setData({
                order_id: oid,
            });
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            app.request({
                url: api.integral.clerk_order_details,
                data: {
                    id: oid,
                    type: page.data.type
                },
                success: function (res) {
                    if (res.code == 0) {
                        page.setData({
                            order_info: res.data,
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.msg,
                            showCancel: false,
                            success: function (res) {
                                if (res.confirm) {
                                    wx.redirectTo({
                                        url: '/pages/integral-mall/order/order?status=2'
                                    })
                                }
                            }
                        })
                    }
                },
                complete: function () {
                    wx.hideLoading();
                }
            });
        }
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
        var page = this;
        var path = '/pages/pt/group/details?oid=' + page.data.order_info.order_id
        return {
            title: page.data.order_info.goods_list[0].name,
            path: path,
            imageUrl: page.data.order_info.goods_list[0].goods_pic,
            success: function (res) {
            }
        }
    },
    /**
     * 核销订单
     */
    clerkOrder: function (e) {
        var page = this;
        wx.showModal({
            title: '提示',
            content: '是否确认核销？',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: "正在加载",
                    });
                    app.request({
                        url: api.integral.clerk,
                        data: {
                            order_id: page.data.order_id
                        },
                        success: function (res) {
                            if (res.code == 0) {
                                wx.showModal({
                                    showCancel: false,
                                    content: res.msg,
                                    confirmText: '确认',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: '/pages/index/index',
                                            })
                                        }
                                    }
                                });
                            } else {
                                wx.showModal({
                                    title: '警告！',
                                    showCancel: false,
                                    content: res.msg,
                                    confirmText: '确认',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: '/pages/index/index',
                                            })
                                        }
                                    }
                                });
                            }
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                } else if (res.cancel) {
                }
            }
        })
    },

    /**
     * 导航到店
     */
    location: function () {
        var page = this;
        var shop = page.data.order_info.shop;
        wx.openLocation({
            latitude: parseFloat(shop.latitude),
            longitude: parseFloat(shop.longitude),
            address: shop.address,
            name: shop.name
        });
    },
    copyText: function (e) {
        var page = this;
        var text = e.currentTarget.dataset.text;
        wx.setClipboardData({
            data: text,
            success: function () {
                wx.showToast({
                    title: "已复制"
                });
            }
        });
    },
});
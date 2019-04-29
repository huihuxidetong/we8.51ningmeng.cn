if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/coupon-info/index.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModel: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().pageOnLoad(this, options);
        if (options.coupon_id) {
            var id = options.coupon_id
            var page = this;
            app.request({
                url: api.integral.coupon_info,
                data: {
                    coupon_id: id
                },
                success: function (res) {
                    if (res.code == 0) {
                        page.setData({
                            coupon: res.data.coupon,
                            info: res.data.info,
                        });
                    }
                },
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

    exchangeCoupon: function (e) {
        var page = this;
        var coupon = page.data.coupon;
        var integral = page.data.__user_info.integral;
        if (parseInt(coupon.integral) > parseInt(integral)) {
            page.setData({
                showModel: true,
                content: '当前积分不足',
                status: 1,
            });
        } else {
            if (parseFloat(coupon.price) > 0) {
                var content = '需要' + coupon.integral + '积分' + '+￥' + parseFloat(coupon.price)
            } else {
                var content = '需要' + coupon.integral + '积分'
            }
            if (parseInt(coupon.total_num) <= 0) {
                page.setData({
                    showModel: true,
                    content: '已领完,来晚一步',
                    status: 1,
                });
                return
            }
            if (parseInt(coupon.num) >= parseInt(coupon.user_num)) {
                coupon.type = 1;
                page.setData({
                    showModel: true,
                    content: '兑换次数已达上限',
                    status: 1,
                });
                return
            }
            wx.showModal({
                title: '确认兑换',
                content: content,
                success: function (e) {
                    if (e.confirm) {
                        if (parseFloat(coupon.price) > 0) {
                            wx.showLoading({
                                title: '提交中',
                            });
                            app.request({
                                url: api.integral.exchange_coupon,
                                data: {
                                    id: coupon.id,
                                    type: 2
                                },
                                success: function (res) {
                                    if (res.code == 0) {
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
                                                    coupon.num = parseInt(coupon.num)
                                                    coupon.num += 1;
                                                    coupon.total_num = parseInt(coupon.total_num)
                                                    coupon.total_num -= 1;
                                                    integral = parseInt(integral)
                                                    integral -= parseInt(coupon.integral)
                                                    page.setData({
                                                        showModel: true,
                                                        status: 4,
                                                        content: res.msg,
                                                        coupon: coupon,
                                                    });
                                                }
                                            },
                                        });
                                    }else{
                                        page.setData({
                                            showModel: true,
                                            content: res.msg,
                                            status: 1,
                                        });
                                    }
                                },
                                complete: function () {
                                    wx.hideLoading();
                                }
                            });
                        } else {
                            wx.showLoading({
                                title: '提交中',
                            });
                            app.request({
                                url: api.integral.exchange_coupon,
                                data: {
                                    id: coupon.id,
                                    type: 1
                                },
                                success: function (res) {
                                    if (res.code == 0) {
                                        coupon.num = parseInt(coupon.num)
                                        coupon.num += 1;
                                        coupon.total_num = parseInt(coupon.total_num)
                                        coupon.total_num -= 1;
                                        integral = parseInt(integral)
                                        integral -= parseInt(coupon.integral)
                                        page.setData({
                                            showModel: true,
                                            status: 4,
                                            content: res.msg,
                                            coupon: coupon,
                                        });
                                    }else{
                                        page.setData({
                                            showModel: true,
                                            content: res.msg,
                                            status: 1,
                                        });
                                    }
                                },
                                complete: function () {
                                    wx.hideLoading();
                                }
                            });
                        }
                    }
                }
            })
        }
    },
    hideModal: function () {
        this.setData({
            showModel: false
        });
    },
})
if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/index/index.js
var api = require('../../../api.js');
var app = getApp();
var integral_catId = 0;
var integral_index = -1;
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
        app.pageOnLoad(this, options);
        wx.showLoading({
            title: '加载中',
        })
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
        getApp().pageOnShow(this);
        var page = this;
        app.request({ 
            url: api.integral.index,
            data: {
                page:1
            },
            success: function (res) {
                if(res.code == 0){
                    var index_goods = [];
                    var goods_list = res.data.goods_list;
                    var goods_lists = [];
                    if (goods_list){
                        for (var i in goods_list) {
                            if (goods_list[i].goods.length > 0) {
                                goods_lists.push(goods_list[i])
                            }
                        }
                    }
                    if (goods_lists.length > 0) {
                        for (var x in goods_lists){
                            var goods = goods_lists[x].goods;
                            for (var z in goods) {
                                if (goods[z].is_index == 1) {
                                    index_goods.push(goods[z])
                                }
                            }
                        }
                    }
                    if (res.data.today) {
                        page.setData({
                            register_day: 1,
                        });
                    }
                    page.setData({
                        banner_list: res.data.banner_list,
                        coupon_list: res.data.coupon_list,
                        goods_list: goods_lists,
                        index_goods: index_goods,
                        integral: res.data.user.integral,
                    });

                    if(integral_index != -1){
                        var data = [];
                        data['index'] = integral_index;
                        data['catId'] = integral_catId;
                        page.catGoods({'currentTarget':{'dataset':data}});                        
                    }
                }
            },
            complete:function(e){
                wx.hideLoading();
            }
        });
    },

    exchangeCoupon:function(e){
        var page = this;
        var coupon_list = page.data.coupon_list;
        var index = e.currentTarget.dataset.index;
        var coupon = coupon_list[index];
        var integral = page.data.integral;
        if (parseInt(coupon.integral) > parseInt(integral)){
            page.setData({
                showModel:true,
                content: '当前积分不足',
                status:1,
            });
        }else{
            if (parseFloat(coupon.price) > 0) {
                var content = '需要' + coupon.integral + '积分' + '+￥' + parseFloat(coupon.price)
            } else {
                var content = '需要' + coupon.integral + '积分'
            }
            if (parseInt(coupon.total_num) <= 0){
                page.setData({
                    showModel: true,
                    content: '已领完,来晚一步',
                    status: 1,
                });
                return 
            }
            if (parseInt(coupon.num) >= parseInt(coupon.user_num)){
                coupon.type = 1;
                page.setData({
                    showModel: true,
                    content:'兑换次数已达上限',
                    status: 1,
                    coupon_list: coupon_list
                });
                return 
            }
            wx.showModal({
                title: '确认兑换',
                content: content,
                success: function (e) {
                    if (e.confirm) {
                        if (parseFloat(coupon.price) > 0){
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
                                                        coupon_list: coupon_list,
                                                        integral: integral
                                                    });
                                                }
                                            },
                                        });
                                    }
                                },
                                complete: function () {
                                    wx.hideLoading();
                                }
                            });
                        }else{
                            wx.showLoading({
                                title: '提交中',
                            });
                            app.request({
                                url: api.integral.exchange_coupon,
                                data: {
                                    id: coupon.id,
                                    type:1
                                },
                                success: function (res) {
                                    if(res.code == 0){
                                        coupon.num = parseInt(coupon.num)
                                        coupon.num += 1;
                                        coupon.total_num = parseInt(coupon.total_num)
                                        coupon.total_num -= 1;
                                        integral = parseInt(integral)
                                        integral -= parseInt(coupon.integral)
                                        page.setData({
                                            showModel: true,
                                            status: 4,
                                            content:res.msg,
                                            coupon_list: coupon_list,
                                            integral: integral
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
    couponInfo: function (e) {
        var data = e.currentTarget.dataset;
        wx.navigateTo({
            url: '/pages/integral-mall/coupon-info/index?coupon_id=' + data.id
        })
    },

    goodsAll:function(){
        var page = this;
        var goods_list = page.data.goods_list;
        var goodsAll = [];
        for (var i in goods_list){
            var goods = goods_list[i].goods;
            goods_list[i].cat_checked = false;
            for (var x in goods) {
                goodsAll.push(goods[x])
            }
        }
        page.setData({
            index_goods: goodsAll,
            cat_checked: true,
            goods_list: goods_list
        });
    },
    catGoods:function(e){
        var data = e.currentTarget.dataset;
        var page = this;
        var goods_list = page.data.goods_list;
        var cat_goods = goods_list.find(function (v) {
            return v.id == data.catId
        })
        integral_catId = data.catId;
        integral_index = data.index;
        var index = data.index;
        for (var i in goods_list) {
            if (goods_list[i]['id'] == goods_list[index]['id']) {
                goods_list[i]['cat_checked'] = true;
            } else {
                goods_list[i]['cat_checked'] = false;
            }
        }
        page.setData({
            index_goods: cat_goods.goods,
            goods_list: goods_list,
            cat_checked: false
        });
    },

    goodsInfo:function(e){
        var goods_id = e.currentTarget.dataset.goodsId;
        var page = this;
        wx.navigateTo({
            url: '/pages/integral-mall/goods-info/index?goods_id=' + goods_id + '&integral='+page.data.integral
        })
    },

    // exchangeGoods:function(e){
    //     var page = this;
    //     var index = e.currentTarget.dataset.index;
    //     var goods_list = page.data.index_goods;
    //     var goods = goods_list[index];
    //     var integral = page.data.integral;

    //     if (parseInt(goods.integral) > parseInt(integral)) {
    //         page.setData({
    //             showModel: true,
    //             content: '当前积分不足',
    //             status: 1,
    //         });
    //     } else {
    //         if (goods.num >= goods.user_num) {
    //             goods.type = 1;
    //             page.setData({
    //                 showModel: true,
    //                 content: '兑换次数已达上限',
    //                 status: 1,
    //             });
    //             return
    //         }
    //     }
    // },

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
    shuoming: function () {
        wx.navigateTo({
            url: '/pages/integral-mall/shuoming/index',
        })
    },
    detail: function () {
        wx.navigateTo({
            url: '/pages/integral-mall/detail/index',
        })
    },
    exchange: function () {
        wx.navigateTo({
            url: '/pages/integral-mall/exchange/index',
        })
    },
    register: function () {
        wx.navigateTo({
            url: '/pages/integral-mall/register/index',
        })
    },
})
if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/coupon/coupon.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        this.setData({
            status: options.status || 0,
        });
        this.loadData(options);
    },

    loadData: function (options) {
        var page = this;
        wx.showLoading({
            title: "加载中",
        });
        app.request({
            url: api.coupon.index,
            data: {
                status: page.data.status,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        list: res.data.list,
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    goodsList: function (e) {
        var self = this;
        var goods_id = e.currentTarget.dataset.goods_id;
        var id = e.currentTarget.dataset.id;
        var list = self.data.list;
        for (var i in list) {
            if (parseInt(list[i].user_coupon_id) === parseInt(id)) {
                // 指定商品的优惠券才能跳转
                if (list[i].appoint_type == 2 && list[i].goods.length > 0) {
                    wx: wx.navigateTo({
                        url: '/pages/list/list?goods_id=' + goods_id
                    })
                }
                return
            }
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    xia:function(e){
        var index = e.target.dataset.index;
        this.setData({
            check: index,
        });
    },
    shou: function () {
        this.setData({
            check: -1,
        });
    },
    
});
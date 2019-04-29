if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/balance/detail.js
var api = require('../../api.js');
var app = getApp();
var is_more = false;
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
        var page = this;
        page.setData(options);
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.recharge.detail,
            method: 'GET',
            data: {
                order_type: options.order_type,
                id: options.id
            },
            success:function(res){
                wx.hideLoading();
                if(res.code == 0){
                    page.setData({
                        list: res.data
                    });
                }else{
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                    })
                }
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
})
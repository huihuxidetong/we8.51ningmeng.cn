if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/express-detail/express-detail.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        if (options.inId){
            var data = {
                order_id:options.inId,
                type:'IN'
            }
        }else{
            var data = {
                order_id: options.id,
                type: 'mall'
            }
        }
        this.loadData(data);
    },
    /**
     * 加载页面数据
     */
    loadData: function (data) {
        var page = this;
        wx.showLoading({
            title: "正在加载",
        });
        app.request({
            url: api.order.express_detail,
            data: data,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    page.setData({
                        data: res.data,
                    })
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }
            }
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
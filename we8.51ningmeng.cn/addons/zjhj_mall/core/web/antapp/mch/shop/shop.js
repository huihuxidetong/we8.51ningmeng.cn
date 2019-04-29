if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var utils = require('../../utils.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tab: 1,
        sort: 1,
        coupon_list: [],
        copy:false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        if (typeof my === 'undefined') {
            if (options.scene) {
                var scene = decodeURIComponent(options.scene);
                if (scene) {
                    scene = utils.scene_decode(scene);
                    if (scene.mch_id) {
                        options.mch_id = scene.mch_id;
                    }
                }
            }
        }else{
            if (app.query !== null) {
                var query = app.query;
                app.query = null;
                options.mch_id = query.mch_id;
            }
        }

        page.setData({
            tab: options.tab || 1,
            sort: options.sort || 1,
            mch_id: options.mch_id || false,
            cat_id: options.cat_id || '',
        });
        if (!page.data.mch_id) {
            wx.showModal({
                title: '提示',
                content: '店铺不存在！店铺id为空'
            });
        }
        setInterval(function () {
            page.onScroll();
        }, 40);
        this.getShopData();
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
        var page = this;
        page.getGoodsList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        return {
            title: page.data.shop ? page.data.shop.name : '商城首页',
        };
    },
    kfuStart:function(){
        this.setData({
            copy:true,
        })
    },
    kfuEnd:function(){
        this.setData({
            copy:false,
        })
    },
    copyinfo: function (e) {
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
    callPhone:function(e){
        wx.makePhoneCall({
          phoneNumber: e.target.dataset.info
        })
    },
    onScroll: function (e) {
        var page = this;
        wx.createSelectorQuery().selectViewport('.after-navber').scrollOffset(function (res) {
            var limit = page.data.tab == 2 ? 136.5333 : 85.3333;
            if (res.scrollTop >= limit) {
                page.setData({
                    fixed: true,
                });
            } else {
                page.setData({
                    fixed: false,
                });
            }
        }).exec();
    },

    getShopData: function () {
        var page = this;
        var current_page = page.data.current_page || 0;
        var target_page = current_page + 1;
        var cache_key = 'shop_data_mch_id_' + page.data.mch_id;
        var cache_data = wx.getStorageSync(cache_key);
        if (cache_data) {
            page.setData({
                shop: cache_data.shop,
            });
        }
        wx.showNavigationBarLoading();
        page.setData({
            loading: true,
        });
        app.request({
            url: api.mch.shop,
            data: {
                mch_id: page.data.mch_id,
                tab: page.data.tab,
                sort: page.data.sort,
                page: target_page,
                cat_id: page.data.cat_id,
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.redirectTo({
                                    url: '/pages/index/index',
                                });
                            }
                        }
                    });
                    return;
                }
                if (res.code == 0) {
                    page.setData({
                        shop: res.data.shop,
                        coupon_list: res.data.coupon_list,
                        hot_list: res.data.goods_list,
                        goods_list: res.data.goods_list,
                        new_list: res.data.new_list,
                        current_page: target_page,
                        cs_icon:res.data.shop.cs_icon,
                    });
                    wx.setStorageSync(cache_key, res.data);
                }
            },
            complete: function () {
                wx.hideNavigationBarLoading();
                page.setData({
                    loading: false,
                });
            }
        });
    },

    getGoodsList: function () {
        var page = this;
        if (page.data.tab == 3) {
            return;
        }
        if (page.data.loading) {
            return;
        }
        if (page.data.no_more) {
            return;
        }
        page.setData({
            loading: true,
        });
        var current_page = page.data.current_page || 0;
        var target_page = current_page + 1;
        app.request({
            url: api.mch.shop,
            data: {
                mch_id: page.data.mch_id,
                tab: page.data.tab,
                sort: page.data.sort,
                page: target_page,
                cat_id: page.data.cat_id,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (page.data.tab == 1) {
                        if (res.data.goods_list && res.data.goods_list.length) {
                            page.data.hot_list = page.data.hot_list.concat(res.data.goods_list);
                            page.setData({
                                hot_list: page.data.hot_list,
                                current_page: target_page,
                            });
                        } else {
                            page.setData({
                                no_more: true,
                            });
                        }
                    }
                    if (page.data.tab == 2) {
                        if (res.data.goods_list && res.data.goods_list.length) {
                            page.data.goods_list = page.data.goods_list.concat(res.data.goods_list);
                            page.setData({
                                goods_list: page.data.goods_list,
                                current_page: target_page,
                            });
                        } else {
                            page.setData({
                                no_more: true,
                            });
                        }
                    }
                }
            },
            complete: function () {
                page.setData({
                    loading: false,
                });
            }
        });
    },


});
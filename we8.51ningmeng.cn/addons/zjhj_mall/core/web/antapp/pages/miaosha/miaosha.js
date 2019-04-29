if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/miaosha/miaosha.js
var api = require('../../api.js');
var app = getApp();

//秒转成时分秒的时间
function secondToTimeStr(second) {
    if (second < 60) {
        var _s = second;
        return "00:00:" + (_s < 10 ? "0" + _s : _s);
    }
    if (second < 3600) {
        var _m = parseInt(second / 60);
        var _s = second % 60;
        return "00:" + (_m < 10 ? "0" + _m : _m) + ":" + (_s < 10 ? "0" + _s : _s);
    }
    if (second >= 3600) {
        var _h = parseInt(second / 3600);
        var _m = parseInt((second % 3600) / 60);
        var _s = second % 60;
        return (_h < 10 ? "0" + _h : _h) + ":" + (_m < 10 ? "0" + _m : _m) + ":" + (_s < 10 ? "0" + _s : _s);
    }
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        time_list: null,
        goods_list: null,
        page: 1, 
        loading_more: false,
        status:true,
        quick_icon:true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        this.loadData(options);
    },
    quickNavigation:function(){
        var status = 0;
        this.setData({
            quick_icon:!this.data.quick_icon
        })  
        var store = this.data.store;
        var animationPlus = wx.createAnimation({
          duration: 300,
          timingFunction: 'ease-out',
        });

        var x = -55;
        if (!this.data.quick_icon) {
            animationPlus.translateY(x).opacity(1).step();
        } else {
            animationPlus.opacity(0).step();
        }
        this.setData({
           animationPlus: animationPlus.export(),
        });
    },
    //加载秒杀时间段
    loadData: function (options) {
        var page = this;
        app.request({
            url: api.miaosha.list,
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.list.length == 0) {
                        if(res.data.next_list.length == 0){
                            wx.showModal({
                                content: "暂无秒杀活动",
                                showCancel: false,
                                confirmText: "返回首页",
                                success: function (e) {
                                    if (e.confirm) {
                                        wx.navigateBack({
                                            url: "/pages/index/index",
                                        });
                                    }
                                }
                            });
                            return; 
                        }
                        page.setData({
                            goods_list:res.data.next_list.list,
                            ms_active:true,
                            time_list: res.data.list,
                            next_list:res.data.next_list.list,
                            next_time:res.data.next_list.time,
                        })
                    }else{
                        page.setData({
                            time_list: res.data.list,
                            next_list:res.data.next_list==''?[]:res.data.next_list.list,
                            next_time:res.data.next_list==''?[]:res.data.next_list.time,
                            ms_active:false,
                        });

                        page.topBarScrollCenter();
                        page.setTimeOver();
                        page.loadGoodsList(false);
                    }

                    
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        success: function () {
                            wx.navigateBack({
                                url: '/pages/index/index',
                            });
                        },
                        showCancel: false,
                    });
                }
            }
        });
    },

    //设置倒计时
    setTimeOver: function () {
        var page = this;

        function _init() {
            for (var i in page.data.time_list) {
                var begin_time_over = page.data.time_list[i].begin_time - page.data.time_list[i].now_time;
                var end_time_over = page.data.time_list[i].end_time - page.data.time_list[i].now_time;
                begin_time_over = begin_time_over > 0 ? begin_time_over : 0;
                end_time_over = end_time_over > 0 ? end_time_over : 0;

                page.data.time_list[i]['begin_time_over'] = secondToTimeStr(begin_time_over);
                page.data.time_list[i]['end_time_over'] = secondToTimeStr(end_time_over);
                page.data.time_list[i].now_time = page.data.time_list[i].now_time + 1;
            }
            page.setData({
                time_list: page.data.time_list,
            });
        }

        _init();
        setInterval(function () {
            _init();
        }, 1000);
    },
    miaosha_next:function(){
        var page = this;
        var time_list = page.data.time_list;
            time_list.forEach(function(item,index,array){
                time_list[index]['active'] = false;
        });
        page.setData({
            goods_list:null,
            ms_active:true,
            time_list:time_list,
        });
        setTimeout(function(){
            page.setData({
                goods_list:page.data.next_list,
            })
        },500);
    },
    //顶部滚动条自动滚到当前时间段
    topBarScrollCenter: function () {
        var page = this;
        var index = 0;
        for (var i in page.data.time_list) {
            if (page.data.time_list[i].active) {
                index = i;
                break;
            }
        }
        page.setData({
            top_bar_scroll: (index - 2) * 64,
        });
    },

    //顶部秒杀时间段点击
    topBarItemClick: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        for (var i in page.data.time_list) {
            if (index == i) {
                page.data.time_list[i].active = true;
            } else {
                page.data.time_list[i].active = false;
            }
        }
        page.setData({
            time_list: page.data.time_list,
            loading_more: false,
            page: 1,
            ms_active:false,
        });
        page.topBarScrollCenter();
        page.loadGoodsList(false);
    },

    loadGoodsList: function (load_more) {
        var page = this;
        var time = false;
        for (var i in page.data.time_list) {
            if (page.data.time_list[i].active) {
                time = page.data.time_list[i].start_time;
                break;
            }
            if(page.data.time_list.length == parseInt(i)+1 && time==false){
                time = page.data.time_list[0].start_time;
                page.data.time_list[0].active = true;
            }
        }
        if (!load_more) {
            page.setData({
                goods_list: null,
            });
        } else {
            page.setData({
                loading_more: true,
            });
        }
        app.request({
            url: api.miaosha.goods_list,
            data: {
                time: time,
                page: page.data.page,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (load_more) {
                        page.data.goods_list = page.data.goods_list.concat(res.data.list)
                    } else {
                        page.data.goods_list = res.data.list;
                    }
                    page.setData({
                        loading_more: false,
                        goods_list: page.data.goods_list,
                        page: (!res.data.list || res.data.list.length == 0) ? -1 : (page.data.page + 1),
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
        app.pageOnShow(this);
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
        var page = this;
        if (page.data.page == -1)
            return;
        page.loadGoodsList(true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
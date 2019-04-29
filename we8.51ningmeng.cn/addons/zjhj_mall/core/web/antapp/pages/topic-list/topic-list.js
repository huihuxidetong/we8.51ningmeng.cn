if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/topic-list/topic-list.js
var api = require('../../api.js');
var app = getApp();
Page({
    data: {
        backgrop:['navbar-item-active'],
        navbarArray: [],
        navbarShowIndexArray: 0,
        navigation:false,
        windowWidth: 375,
        scrollNavbarLeft: 0,
        currentChannelIndex: 0,
        articlesHide: false,
    },
    onLoad: function(options) {
        var type = options.type;
        if(type!==undefined && type){
            this.setData({
                typeid:type,
            });
        };

        this.systemInfo = wx.getSystemInfoSync()
        app.pageOnLoad(this, options);
        var page = this;
        page.loadTopicList({
            page: 1,
            reload: true,
        });

        let that = this;
        wx.getSystemInfo({
            success: (res) => {
                that.setData({
                    windowWidth: res.windowWidth
                });
            }
        });
        let navbarArray = this.data.navbarArray;
        let navbarShowIndexArray = this.data.navbarShowIndexArray;
    },

    loadTopicList: function (args) {
        var page = this;
        if (page.data.is_loading)
            return;
        if (args.loadmore && !page.data.is_more)
            return;
        page.setData({
            is_loading: true,
        });
        app.request({
            url: api.default.topic_type,
            data: {},
            success: function (res) {
                if (res.code == 0) {
                        page.setData({
                            navbarArray: res.data.list,
                            navbarShowIndexArray:Array.from(Array(res.data.list.length).keys()),
                            navigation: res.data.list=='' ?false: true,
                        });
                };

                app.request({
                    url: api.default.topic_list,
                    data: {
                        page: args.page,
                    },
                    success: function (res) {
                        if (res.code == 0) {
                            if(page.data.typeid!==undefined){
                                var offsetLeft = 0;
                                for(var i=0;i<page.data.navbarArray.length;i++){
                                    offsetLeft +=66;
                                    if(page.data.navbarArray[i].id==page.data.typeid){
                                        break;
                                    }
                                }
                                page.setData({
                                    scrollNavbarLeft:offsetLeft
                                });
                                page.switchChannel(parseInt(page.data.typeid));
                                page.sortTopic({
                                    page: 1,
                                    type: page.data.typeid,
                                    reload: true,
                                });

                            }else{
                                if (args.reload) {
                                    page.setData({
                                        list: res.data.list,
                                        page: args.page,
                                        is_more: res.data.list.length > 0
                                    });
                                }
                                if (args.loadmore) {
                                    page.setData({
                                        list: page.data.list.concat(res.data.list),
                                        page: args.page,
                                        is_more: res.data.list.length > 0
                                    });
                                }

                            }
                        }
                    },
                    complete: function () {
                        page.setData({
                            is_loading: false,
                        });
                    }
                });
            },
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let currentChannelIndex = this.data.currentChannelIndex;
        this.switchChannel(parseInt(currentChannelIndex));
        this.sortTopic({
            page: 1,
            type: parseInt(currentChannelIndex),
            reload: true,
        });
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let currentChannelIndex = this.data.currentChannelIndex;
        this.switchChannel(parseInt(currentChannelIndex));
        this.sortTopic({
            page: this.data.page + 1,
            type: parseInt(currentChannelIndex),
            loadmore: true,
        });
    },

    /**
     *菜单切换事件的处理函数
     */
    onTapNavbar: function(e) {
        if (typeof my === 'undefined'){
		    var offsetLeft = e.currentTarget.offsetLeft;
			    this.setData({
			        scrollNavbarLeft:offsetLeft -85
			    });
        }else{
            var nav = this.data.navbarArray;
            var page = this;
            var st = true;
            nav.forEach(function (item, index, array) {
                if (e.currentTarget.id == item.id) {
                    st = false;
                    if (index >= 1) { 
                        page.setData({
                            toView: nav[index - 1].id
                        })
                    } else {
                        page.setData({
                            toView: -1
                        })
                    }
                }
            });
            if (st) {
                page.setData({
                    toView: '0'
                })
            }
        }
        
        wx.showLoading({
          title: "正在加载",
          mask: true,
        });

        //样式
        this.switchChannel(parseInt(e.currentTarget.id));

        this.sortTopic({
            page: 1,
            type: e.currentTarget.id,
            reload: true,
        });

    },
    /*
     * 查询专题分类下专题
     */
    sortTopic: function(args){
        var _this=this;
        app.request({
            url: api.default.topic_list,
            data: args,
            success: function (res) {
                if (res.code == 0) {
                    if (args.reload) {
                         _this.setData({
                             list: res.data.list,
                             page: args.page,
                             is_more: res.data.list.length > 0
                         });
                    }
                    if (args.loadmore) {
                        _this.setData({
                            list: _this.data.list.concat(res.data.list),
                            page: args.page,
                            is_more: res.data.list.length > 0
                        });
                    }
                    wx.hideLoading();
                }
            },
        });
        
    },

    switchChannel: function(targetChannelIndex) {
        let navbarArray = this.data.navbarArray;
        var backgrop = new Array();
        if(targetChannelIndex==-1){
            backgrop[1] = 'navbar-item-active';
        }else if(targetChannelIndex==0){
            backgrop[0] = 'navbar-item-active';
        }
     
        navbarArray.forEach((item, index, array) => {
            item.type = '';
            if (item['id'] == targetChannelIndex) {
                item.type = 'navbar-item-active';
            }
        }); 
        this.setData({
            navbarArray: navbarArray,
            currentChannelIndex: targetChannelIndex,
            backgrop:backgrop,
        });
    },
});
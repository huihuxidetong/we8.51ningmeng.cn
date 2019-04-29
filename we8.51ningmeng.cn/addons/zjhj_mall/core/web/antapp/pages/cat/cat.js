if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/cat/cat.js
var api = require('../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading_more = false;
Page({

    /**
     * 页面的初始数据d
     */
    data: {
        cat_list: [],
        sub_cat_list_scroll_top: 0,
        scrollLeft: 0,
        page: 1,
        cat_style:0,
        height:0,
        catheight:120,
    }, 

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);

        var store = wx.getStorageSync("store");
        var cat_id = options.cat_id;

        if(cat_id!==undefined && cat_id){
            this.data.cat_style = store.cat_style = -1;        
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            this.childrenCat(cat_id);                    
        };
        this.setData({
            store: store,
        });
    },

    onShow: function () { 
        wx.hideLoading();
        app.pageOnShow(this);
        if(this.data.cat_style!==-1){
            this.loadData();
        }
    },

    loadData: function (options) {
        // 返回上一步  5 4
        var page = this;
        if(page.data.cat_list !='' && (wx.getStorageSync("store").cat_style==5 || wx.getStorageSync("store").cat_style==4 ||wx.getStorageSync("store").cat_style==2) ){
            page.setData({
                cat_list: page.data.cat_list,
                current_cat: page.data.current_cat,
            });
            return;
        }

        var cat_list = wx.getStorageSync("cat_list");
        if (cat_list) {
            page.setData({
                cat_list: cat_list,
                current_cat: null,
            });
        }
        app.request({
            url: api.default.cat_list,
            success: function (res) {
                if(res.code == 0){
                    page.data.cat_list = res.data.list;
                    //初始化 5
                    if(wx.getStorageSync("store").cat_style===5){
                        page.goodsAll({'currentTarget':{'dataset':{'index':0}}});
                    };

                    if(wx.getStorageSync("store").cat_style===4  || wx.getStorageSync("store").cat_style===2){
                        page.catItemClick({'currentTarget':{'dataset':{'index':0}}});   
                    };

                    if(wx.getStorageSync("store").cat_style===1  || wx.getStorageSync("store").cat_style===3){
                        page.setData({
                            cat_list: res.data.list,
                            current_cat: null,
                        });
                        wx.setStorageSync("cat_list", res.data.list);
                    };
                };
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });
    },

    childrenCat:function(cat_id){
        var page = this;

        is_no_more = false;
        var p = page.data.page || 2
        app.request({
            url: api.default.cat_list,
            success: function (res) {
                if (res.code == 0) {
                    var index = true;
                    for(var i in res.data.list){

                        if(res.data.list[i].id==cat_id){
                            index = false;
                            page.data.current_cat = res.data.list[i];
                            if(res.data.list[i].list.length>0){
                                page.setData({
                                    catheight:100,
                                })
                                page.firstcat({'currentTarget':{'dataset':{'index':0}}});
                            }else{
                                page.firstcat({'currentTarget':{'dataset':{'index':0}}},false);
                            }
                        };
                        for(var c in res.data.list[i].list){
                            if(res.data.list[i].list[c].id==cat_id){
                                index = false;
                                page.data.current_cat = res.data.list[i]; 
                                page.goodsItem({'currentTarget':{'dataset':{'index':c}}},false);
                            }
                        }
                    };

                    if(index){
                        page.setData({
                            show_no_data_tip:true,
                        });
                    };
                };
            },
            complete: function () {
                wx.stopPullDownRefresh();
                wx.createSelectorQuery().select('#cat').boundingClientRect().exec((ret) => {
                    page.setData({
                        height:ret[0].height,
                    })
                });
            }
        });
        return;
    },

    catItemClick: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var cat_list = page.data.cat_list;
        var scroll_top = 0;
        var add_scroll_top = true;
        var current_cat = null;
        for (var i in cat_list) {
            if (i == index) {
                cat_list[i].active = true;
                add_scroll_top = false;
                current_cat = cat_list[i];
            } else {
                cat_list[i].active = false;
                if (add_scroll_top) {
                    //scroll_top += 62;
                    //scroll_top += 45;
                    //var row_count = Math.ceil(cat_list[i].list.length / 3);
                    //scroll_top += row_count * (79 + 2);

                    //scroll_top += cat_list[i].list.length * 76;
                }
            }
        }
        page.setData({
            cat_list: cat_list,
            sub_cat_list_scroll_top: scroll_top,
            current_cat: current_cat,
        });
    },
    firstcat:function(e,a=true){
        var page = this;
        var current_cat = page.data.current_cat;
        this.setData({
            page: 1,
            goods_list: [],
            show_no_data_tip: false,
            current_cat: a?current_cat:[],
        });
        this.list(current_cat.id,2);
    },
    goodsItem:function(e,a=true){
        var page = this;
        var index = e.currentTarget.dataset.index;

        var current_cat = page.data.current_cat;
        var t = 0;
        for(var i in current_cat.list){
            if(index == i){
              current_cat.list[i].active = true;
              t= current_cat.list[i].id;
            }else{
              current_cat.list[i].active = false;
            }
        };

        page.setData({
            page: 1,
            goods_list: [],
            show_no_data_tip: false,
            current_cat: a?current_cat:[],
        });
        this.list(t,2);
    },

    goodsAll: function(e) {
        var page = this;
        //初始化 
        var index = e.currentTarget.dataset.index;
       
        var cat_list = page.data.cat_list;
        var current_cat = null;

        for (var i in cat_list) 
        {
            if (i == index) {
                cat_list[i].active = true;
                current_cat = cat_list[i];
            } else {
                cat_list[i].active = false;
            }
        }

        page.setData({
            page: 1,
            goods_list: [],
            show_no_data_tip: false,
            cat_list: cat_list,
            current_cat: current_cat,             
        });

        if( typeof my === undefined){
            //移动效果
            var offsetLeft = e.currentTarget.offsetLeft
            var scrollLeft = page.data.scrollLeft;
                scrollLeft = offsetLeft -80;
                page.setData({
                scrollLeft:scrollLeft
            });
        }else{
           cat_list.forEach(function(item,index,array){
               if(item.id==e.currentTarget.id){
                   if(index>=1){
                    page.setData({
                        toView:cat_list[index-1].id
                    })
                   }else{
                       page.setData({
                           toView:cat_list[index].id
                       })
                   }
               }
           });
        }

        //调用方法
        this.list(current_cat['id'],1);

        //防抖动
        wx.createSelectorQuery().select('#catall').boundingClientRect().exec((ret) => {
          page.setData({
            height: ret[0].height,
          })
        });
    },

    list: function(cat_id,type){
        var page = this;
        wx.showLoading({
          title: "正在加载",
          mask: true,
        });
        
        is_no_more = false;
        var p = page.data.page || 2
        app.request({
            url: api.default.goods_list, 
            data: { 
                cat_id: cat_id,
                page: p,
            },
            success: function (res) {
                if (res.code == 0) {
                    wx.hideLoading();
                    if (res.data.list.length == 0)
                       is_no_more = true;
                   page.setData({page: (p + 1)});
                   page.setData({goods_list: res.data.list});
                   page.setData({cat_id:cat_id});
               }
               page.setData({
                show_no_data_tip: (page.data.goods_list.length == 0),
            });
            },
            complete: function () {
                if(type==1){
                    wx.createSelectorQuery().select('#catall').boundingClientRect().exec((ret) => {
                        page.setData({
                            height:ret[0].height,
                        })
                    });
                }
            }
       });

    },

    onReachBottom: function () {
        var page = this;
        if (is_no_more)
            return;
        if(wx.getStorageSync("store").cat_style==5 || page.data.cat_style==-1){
            page.loadMoreGoodsList();
        }
    },
    loadMoreGoodsList: function () {
        var page = this;
        if (is_loading_more)
            return;
        page.setData({
            show_loading_bar: true,
        });
        is_loading_more = true;
        var cat_id = page.data.cat_id || "";
        var p = page.data.page || 2;

        app.request({
            url: api.default.goods_list,
            data: {
                page: p,
                cat_id: cat_id,
            },
            success: function (res) {
                if (res.data.list.length == 0)
                    is_no_more = true;
                var goods_list = page.data.goods_list.concat(res.data.list);
                page.setData({
                    goods_list: goods_list,
                    page: (p + 1),
                });
            },
            complete: function () {
                is_loading_more = false;
                page.setData({
                    show_loading_bar: false,
                });
            }
        });
    },
});
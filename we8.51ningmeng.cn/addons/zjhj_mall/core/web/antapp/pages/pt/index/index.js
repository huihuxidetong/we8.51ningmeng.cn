if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/pt/index.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
  data: {
    cid: 0,
    scrollLeft: 600,
    scrollTop: 0,
    emptyGoods: 0,
    page_count: 0,
    pt_url: false,
    page: 1,
    is_show: 0,
    quick_icon:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.systemInfo = wx.getSystemInfoSync()
      app.pageOnLoad(this, options);
      var store = wx.getStorageSync("store");
      this.setData({
          store: store,
      });
      var page = this;
      if(options.cid){
          var cid = options.cid;
          console.log('cid=>'+cid);
          this.setData({
              pt_url:false
          })
          wx.showLoading({
            title: "正在加载",
            mask: true,
          });
          app.request({
              url: api.group.index,
              method: "get",
              success: function (res) {
                 page.switchNav({'currentTarget':{'dataset':{'id':options.cid}}});
                  if (res.code == 0) {
                      page.setData({
                          banner: res.data.banner,
                          ad: res.data.ad,
                          page: res.data.goods.page,
                          page_count: res.data.goods.page_count,
                      });
                  }
              }
          });
          return;
      }else{
        this.setData({
          pt_url: true
        })
      }
      this.loadIndexInfo(this);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
      })
      var animationPic = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
      });
      var animationcollect = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
      });
      var animationTranspond = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
      });
      var animationInput = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
      });

    var x = -55;
       if(!this.data.quick_icon){
          if(store['option'] && store['option']['wxapp'] && store['option']['wxapp']['pic_url']){
            animationInput.translateY(x).opacity(1).step();
            x = x-55;
          }
          if(store['show_customer_service'] && store['show_customer_service']==1 && store['service']){
            animationTranspond.translateY(x).opacity(1).step();
            x = x-55;
          }          
          if(store['option'] && store['option']['web_service']){
            animationcollect.translateY(x).opacity(1).step();
            x = x-55;
          }

          if(store['dial'] == 1 && store['dial_pic']){
            animationPic.translateY(x).opacity(1).step();
            x = x-55;
          }

        animationPlus.translateY(x).opacity(1).step();
       }else{
        animationPlus.opacity(0).step();
        animationcollect.opacity(0).step();
        animationPic.opacity(0).step();
        animationTranspond.opacity(0).step();
        animationInput.opacity(0).step();
       }
    this.setData({
      animationPlus: animationPlus.export(),
      animationPic: animationPic.export(),
      animationcollect: animationcollect.export(),
      animationTranspond: animationTranspond.export(),
      animationInput: animationInput.export(),
    });
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
    var self = this
    self.setData({
        show_loading_bar: 1
    });
    
    if (self.data.page < self.data.page_count) {
        self.setData({
            page: self.data.page + 1
        })
        self.getGoods(self);
    } else {
        self.setData({
            is_show: 1,
            emptyGoods: 1,
            show_loading_bar: 0
        })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
     * 拼团首页加载
     */
  loadIndexInfo: function (e) {
      var page = e;
      wx.showLoading({
          title: "正在加载",
          mask: true,
      });
      app.request({
          url: api.group.index,
          method: "get",
          data: {
            page: page.data.page,
          },
          success: function (res) {
              if (res.code == 0) {
                  wx.hideLoading();
                  page.setData({
                      cat: res.data.cat,
                      banner: res.data.banner,
                      ad: res.data.ad,
                      goods: res.data.goods.list,
                      page: res.data.goods.page,
                      page_count: res.data.goods.page_count,
                  });
                  if (res.data.goods.row_count<=0){
                      page.setData({
                          emptyGoods:1,
                      })
                  }
              }
          }
      });
  },
  getGoods(e) {
    var self = e;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });

    app.request({
      url: api.group.list,
      method: "get",
      data: {
        page: self.data.page,
      },
      success: function (res) {
        if (res.code == 0) {
          wx.hideLoading();
          self.data.goods = self.data.goods.concat(res.data.list);
          self.setData({
            goods: self.data.goods,
            page: res.data.page,
            page_count: res.data.page_count,
            show_loading_bar: 0
          });
        }
      }
    });
  },
  /**
   * 顶部导航事件
   */
  switchNav: function (e) {
    var page = this;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    var cid = e.currentTarget.id;
    if (typeof my === 'undefined') {
      var windowWidth = this.systemInfo.windowWidth
      var offsetLeft = e.currentTarget.offsetLeft
      var scrollLeft = this.data.scrollLeft;
      if (offsetLeft > windowWidth / 2) {
        scrollLeft = offsetLeft
      } else {
        scrollLeft = 0
      }
      page.setData({
        scrollLeft: scrollLeft,
      })
    } else {
      var cat = page.data.cat;
      var st = true;
      for (var i = 0; i < cat.length; ++i) {
        if (cat[i].id === e.currentTarget.id) {
          st = false;
          if (i >= 1) {
            page.setData({
              toView: cat[i - 1].id
            })
          } else {
            page.setData({
              toView: '0'
            })
          }
          break;
        }
      }
      if (st) {
        page.setData({
          toView: '0'
        })
      }
    }

     page.setData({
         cid: cid,
         page:1,
         scrollTop: 0,
         emptyGoods:0,
         goods:[],
         show_loading_bar: 1,
         is_show: 0
     })
      app.request({
          url: api.group.list,
          method: "get",
          data: {cid:cid},
          success: function (res) {
              if (res.code == 0) {
                  setTimeout(function () {
                     // 延长一秒取消加载动画
                    wx.hideLoading();
                  }, 1000);
                  var goods = res.data.list;
                  if (res.data.page_count >= res.data.page) {
                      page.setData({
                          goods: goods,
                          page: res.data.page,
                          page_count: res.data.page_count,
                          row_count: res.data.row_count,
                          show_loading_bar: 0,
                      });
                  } else {
                      page.setData({
                          emptyGoods: 1,
                      });
                  }
              }
          }
      });
  },
  /**
   * 下拉加载
   */
    pullDownLoading:function(e)
    {
        var page = this;
        if (page.data.emptyGoods == 1 || page.data.show_loading_bar == 1){
            return;
        }
        page.setData({
            show_loading_bar: 1
        });
        var pageNum = parseInt(page.data.page + 1);
        var cid = page.data.cid;
        app.request({
            url: api.group.list,
            method: "get",
            data: { page: pageNum, cid: cid},
            success: function (res) {
                if (res.code == 0) {
                    var goods = page.data.goods;
                    if (res.data.page > page.data.page){
                        Array.prototype.push.apply(goods, res.data.list);
                    }
                    if (res.data.page_count >= res.data.page){
                        page.setData({
                            goods: goods,
                            page: res.data.page,
                            page_count: res.data.page_count,
                            row_count: res.data.row_count,
                            show_loading_bar: 0,
                        });
                    }else{
                        page.setData({
                            emptyGoods:1,
                        });
                    }
                }
            }
        });
  },
//   /**
//    * 前往商品详情
//    */
//     goDetails:function (e) {
//         var gid = e.currentTarget.dataset.gid;
//         var page = this;
//     }

    /**
     * 广告图片链接点击事件，处理跳转小程序
     * */
    navigatorClick: function (e) {
        var page = this;
        var open_type = e.currentTarget.dataset.open_type;
        var url = e.currentTarget.dataset.url;
        if (open_type != 'wxapp')
            return true;
        url = parseQueryString(url);
        url.path = url.path ? decodeURIComponent(url.path) : "";
        wx.navigateToMiniProgram({
            appId: url.appId,
            path: url.path,
            complete: function (e) {
            }
        });
        return false;

        function parseQueryString(url) {
            var reg_url = /^[^\?]+\?([\w\W]+)$/,
                reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                arr_url = reg_url.exec(url),
                ret = {};
            if (arr_url && arr_url[1]) {
                var str_para = arr_url[1], result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    },
    to_dial: function () {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },
})
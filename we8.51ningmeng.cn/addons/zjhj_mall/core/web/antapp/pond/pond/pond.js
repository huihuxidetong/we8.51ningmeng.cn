if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
//获取应用实例
var app = getApp()
var p_animation;
var bout;
var animation;
Page({
  data: {
    circleList: [],//圆点数组
    awardList: [],//奖品数组
    colorCircleFirst: '#F12416',//圆点颜色1
    colorCircleSecond: '#FFFFFF',//圆点颜色2
    colorAwardDefault: '#F5F0FC',//奖品默认颜色
    colorAwardSelect: '#ffe400',//奖品选中颜色
    indexSelect: 0,//被选中的奖品index
    isRunning: false,//是否正在抽奖
    prize:false,
    close:false,
    lottert:0,
    animationData:'',
    time:false,
    title:'',
  },
  onLoad: function (options) {
      var page = this;
      app.pageOnLoad(this, options);
      app.request({
          url: api.pond.setting,
          success: function (res) {
            if(res.code==0){
              var title = res.data.title;
              if(title){
                wx.setNavigationBarTitle({
                  title:title,
                })
                page.setData({
                  title:title
                })
              }
            }
          },
      });
  },
  onShow: function () {
      var page = this;
      wx.showLoading({
        title: '加载中',
      })
      app.request({
          url: api.pond.index,
          success: function (res) {
            var list = res.data.list;

            list.forEach(function(item,index,array){
              switch(item.type)
              {
                case 1:
                  list[index].name = item.price+'元红包';
                  break;
                case 2:
                  list[index].name = item.coupon;
                  break;
                case 3:
                  list[index].name = item.num+'积分';
                  if(!list[index].image_url){
                    list[index].image_url = '/pond/images/pond-jf.png';
                  }
                  break;
                case 4:
                  list[index].name = item.gift;
                  break;
                case 5:
                  list[index].name ='谢谢参与';
                  if (!list[index].image_url) {
                    list[index].image_url = '/pond/images/pond-xx.png';
                  }
                  break;
                default:
              }

            })
            page.setData({
              list:list,
              oppty:res.data.oppty,
              time:res.data.time,
              register:res.data.register,
              integral:res.data.integral,
            });


            var awardList = [];
            var topAward = 18;
            var leftAward = 18;
            for (var j = 0; j < 8; j++) {
              if (j == 0) {
                topAward = 18;
                leftAward = 18;
              } else if (j < 3) {
                topAward = topAward;
                //166.6666是宽.8是间距.下同
                leftAward = leftAward + 196 + 8;
              } else if (j < 5) {
                leftAward = leftAward;
                //150是高,15是间距,下同
                topAward = topAward + 158 + 8;
              } else if (j < 7) {
                leftAward = leftAward - 196 - 8;
                topAward = topAward;
              } else if (j < 8) {
                leftAward = leftAward;
                topAward = topAward - 158 - 8;
              }
             list[j].topAward=topAward;
             list[j].leftAward=leftAward;
            }
            page.setData({
              awardList: list
            })

          },
          complete: function (res) {
              wx.hideLoading();

            //圆点设置
            var leftCircle = 4;
            var topCircle = 4;
            var circleList = [];
            for (var i = 0; i < 24; i++) {
              if (i == 0) {
                topCircle = 8;
                leftCircle = 8;
              } else if (i < 6) {
                topCircle = 4;
                leftCircle = leftCircle + 110;
              } else if (i == 6) {
                topCircle = 8
                leftCircle = 660;
              } else if (i < 12) {
                topCircle = topCircle + 92;
                leftCircle = 663;
              } else if (i == 12) {
                topCircle = 545;
                leftCircle = 660;
              } else if (i < 18) {
                topCircle = 550;
                leftCircle = leftCircle - 110;
              } else if (i == 18) {
                topCircle = 545;
                leftCircle = 10;
              } else if (i < 24) {
                topCircle = topCircle - 92;
                leftCircle = 5;
              } else {
                return
              }
              circleList.push({ topCircle: topCircle, leftCircle: leftCircle });
            }
            page.setData({
              circleList: circleList
            })  
            //圆点闪烁
            bout = setInterval(function () {
              if (page.data.colorCircleFirst == '#FFFFFF') {
                page.setData({
                  colorCircleFirst: '#F12416',
                  colorCircleSecond: '#FFFFFF',
                })
              } else {
                page.setData({
                  colorCircleFirst: '#FFFFFF',
                  colorCircleSecond: '#F12416',
                })
              }
            }, 900)  //设置圆点闪烁的效果
            page.pond_animation();




          }
      });
  },

  //开始抽奖
  startGame: function () { 
    var _this = this;
    if (_this.data.isRunning) return
    if(_this.data.oppty==0){
      wx.showModal({
        title: '很抱歉',
        content: '抽奖机会不足',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            _this.setData({
              isRunning: false
            })
          }
        }
      })
      return;
    }
    if(!_this.data.integral){
      wx.showModal({
        title: '很抱歉',
        content: '积分不足',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            _this.setData({
              isRunning: false
            })
          }
        }
      })
      return;
    }

    if(!_this.data.time){
      wx.showModal({
        title: '很抱歉',
        content: '活动未开始或已经结束',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            _this.setData({
              isRunning: false
            })
          }
        }
      })
      return;
    }

        clearInterval(p_animation);

        animation.translate(0,0).step();     

        _this.setData({
          animationData: animation.export(),
        })

    _this.setData({
      isRunning: true,
      lottert:0,
    })

    var indexSelect = _this.data.indexSelect;
    var i = 0;
    var list = _this.data.awardList;

    var timer = setInterval(function () {
      indexSelect++;
      indexSelect = indexSelect % 8;
      i += 30;

      _this.setData({
        indexSelect: indexSelect
      })

      if(_this.data.lottert>0 && indexSelect +1 ==_this.data.lottert){
        clearInterval(timer);
        _this.pond_animation();
        if(list[indexSelect].type==5){
          var prize = 1;
        }else{
          var prize = 2;
        }
          _this.setData({
              isRunning: false,
              name:list[indexSelect].name,
              num:list[indexSelect].id,
              prize:prize
          })       
      }
    }, (200 + i))

      app.request({
          url: api.pond.lottery,
          success: function (res) {

            if(res.code==1){
              clearInterval(timer);
                wx.showModal({
                  title: '很抱歉',
                  content: res.msg?res.msg:'网络错误',
                  showCancel: false,//去掉取消按钮
                  success: function (res) {
                    if (res.confirm) {
                      _this.setData({
                        isRunning: false
                      })
                    }
                  }
                })
                _this.pond_animation();
                return;
            }

            if (res.msg =='积分不足'){
              _this.setData({
                integral:false
              })
            }

            var id = res.data.id;      
            list.forEach(function(item,index,array){
                if(item.id==id){
                  setTimeout(function(){
                    _this.setData({
                      lottert:index +1,
                      oppty:res.data.oppty
                    })
                  },2000);
                }
            });

          }
      });
  },
  
  pondClose:function(){
    this.setData({
      prize:false,
    })
  },
  pond_animation:function(){
    var page = this;

      animation = wx.createAnimation({
          duration: 500,
          timingFunction: "step-start",
          delay: 0,
          transformOrigin: "50% 50%",
      });

      let sentinel = true;
      p_animation = setInterval(function () {
        if(sentinel){
          animation.translate(0,0).step();
          sentinel = false;       
        }else{
          animation.translate(0,-3).step();
          sentinel = true;
        }
        page.setData({
          animationData: animation.export(),
        })
      }, 900)
  },


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      clearInterval(bout);
      clearInterval(p_animation);
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var user_info = wx.getStorageSync("user_info");
        var res = {
            path: "/pond/pond/pond?user_id=" + user_info.id,
            title: this.data.title?this.data.title:'九宫格抽奖',
        };
        return res;
    },

    showShareModal:function(){
      this.setData({
        share_modal_active: "active",
      });
    },
    shareModalClose:function(){
      this.setData({
        share_modal_active:'',
      })
    },
    /**
     *  海报
     */
    getGoodsQrcode: function() {
        var page = this;
        page.setData({
            qrcode_active: "active",
            share_modal_active: "",
        });
        if (page.data.goods_qrcode)
            return true;
        app.request({
            url: api.pond.qrcode,
            success: function(res) {
                if (res.code == 0) {
                    page.setData({
                        goods_qrcode: res.data.pic_url,
                    });
                }
                if (res.code == 1) {
                    page.goodsQrcodeClose();
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {

                            }
                        }
                    });
                }
            },
        });
    },  
    qrcodeClick: function(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src],
        });
    },
    qrcodeClose: function() {
        var page = this; 
        page.setData({
            qrcode_active: "",
        });
    },
    saveQrcode: function() {
        var page = this;
        if (!wx.saveImageToPhotosAlbum) {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前版本过低，无法使用该功能，请升级到最新版本后重试。',
                showCancel: false,
            });
            return;
        }

        wx.showLoading({
            title: "正在保存图片",
            mask: false,
        });

        wx.downloadFile({
            url: page.data.goods_qrcode,
            success: function(e) {
                wx.showLoading({
                    title: "正在保存图片",
                    mask: false,
                });
                wx.saveImageToPhotosAlbum({
                    filePath: e.tempFilePath,
                    success: function() {
                        wx.showModal({
                            title: '提示',
                            content: '商品海报保存成功',
                            showCancel: false,
                        });
                    },
                    fail: function(e) {
                        wx.showModal({
                            title: '图片保存失败',
                            content: e.errMsg,
                            showCancel: false,
                        });
                    },
                    complete: function(e) {
                        wx.hideLoading();
                    }
                });
            },
            fail: function(e) {
                wx.showModal({
                    title: '图片下载失败',
                    content: e.errMsg + ";" + page.data.goods_qrcode,
                    showCancel: false,
                });
            },
            complete: function(e) {
                wx.hideLoading();
            }
        });
    },
})

if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp()
var interval;
Page({
  ctx:null,
  data: {
    isStart: true,
    name:'',
    monitor:'',
    detect:true,
    type:5,
    error:'',
    oppty:0,
    log:[],
    register:true,
    award_name:false,
  },
  onShow(){
    wx.showLoading({
      title: '加载中',
    })

    var page = this;
    app.request({ 
        url: api.scratch.setting,
        success: function (res) {
          var setting = res.data.setting;
          if(setting.title){
            wx.setNavigationBarTitle({
              title:setting.title,
            })
          }

          page.setData({
            'title':setting.title,
            'deplete_register':setting.deplete_register,
            'register':setting.deplete_register==null || setting.deplete_register==0
          })

        app.request({
        url: api.scratch.index,
        success: function (res) {
          if(res.code==0){
            var form = res.data.list;
            var name = page.setName(form);
            console.log('name=>'+name);

            page.setData({
              'name':name,
              'oppty':res.data.oppty,
              'id':form.id,
              'type':form['type'],
            })
          }else{
            page.setData({
              'error':res.msg,
              'isStart':true,
              'oppty':res.data.oppty,
            })           
          }
          },
          complete: function (res) {
              wx.hideLoading();
          }
        });
      }
    });

    app.request({
        url: api.scratch.log,
        success: function (res) {
          if(res.code==0){
            var log = res.data;
            for(var i in log){
              log[i]['name'] = page.setName(log[i]);
            }
            page.setData({
              'log':log
            })
          }
        },
      });
    this.init();

    interval = setInterval(function () {
    // console.log('interval_10'); 
      app.request({
          url: api.scratch.log,
          success: function (res) {
            if(res.code==0){
              var log = res.data;
              for(var i in log){
                log[i]['name'] = page.setName(log[i]);
              }
              page.setData({
                'log':log,
              })
            }
          },
      });
    }, 10000);

  },
  onLoad (options) {
    app.pageOnLoad(this, options);
  },
  register(){
    if(this.data.error){
        wx.showModal({
            title: '提示',
            content: this.data.error,
            showCancel:false,
        })
      return;
    };
    this.setData({
      register:true,
    });

    this.init();
  },
  init(){
    var query = wx.createSelectorQuery();
    var page = this;
    page.setData({
      'award_name':false,
    })
    query.select('#frame').boundingClientRect()
    query.exec(function (res) {
      var canvasWidth = res[0].width;
      var canvasHeight = res[0].height;
      var imageResource = '/scratch/images/scratch_hide_2.png';
      page.setData({
        'r':16,
        'lastX':'',
        'lastY':'',
        'minX':'',
        'minY':'',
        'maxX':'',
        'maxY':'',
        'canvasWidth':canvasWidth,
        'canvasHeight':canvasHeight
      });

      var ctx = wx.createCanvasContext('scratch');
      ctx.drawImage(imageResource, 0, 0, canvasWidth, canvasHeight)



      page.ctx = ctx;    
      if(typeof my === 'undefined'){
        ctx.draw(false, function (e) {
          page.setData({
            'award_name':true,
          })
        })
      }else{
        ctx.draw(true);
      }

      page.setData({
        'isStart': true,
        "isScroll": true,
      });
    })
  },

  onReady: function () {
      if(typeof my !== 'undefined'){
          this.init();
      }
  },
  onStart () {
    this.setData({
      'register':this.data.deplete_register==null || this.data.deplete_register==0,
      'name':this.data.monitor,
      'isStart':true,
      'award':false,
      'award_name':false,
    })
    this.init(); 
  },

  // 范围
  drawRect (x, y) {
    var r = this.data.r/2;
    let x1 = x - r > 0 ? x - r : 0
    let y1 = y - r > 0 ? y - r : 0
    if('' !== this.data.minX){
      this.setData({
        'minX':this.data.minX>x1 ? x1:this.data.minX,
        'minY':this.data.minY>y1 ? y1:this.data.minY,
        'maxX':this.data.maxX>x1 ? this.data.maxX:x1,
        'maxY':this.data.maxY>y1 ? this.data.maxY:y1,
      })
    }else{
      this.setData({
        'minX':x1,
        'minY':y1,
        'maxX':x1,
        'maxY':y1
      })
    }
    this.setData({
        'lastX' : x1,
        'lastY' : y1 
    })
    return [x1, y1, 2*r]
  },
  // 绘图
  clearArc(x,y,stepClear){
      let r = this.data.r;
      var ctx = this.ctx;
      var calcWidth = r-stepClear;
      var calcHeight = Math.sqrt(r*r-calcWidth*calcWidth);
      var posX = x-calcWidth;
      var posY = y-calcHeight;
      var widthX = 2*calcWidth;
      var heightY = 2*calcHeight;
      if(stepClear <= r){
        ctx.clearRect(posX,posY,widthX,heightY);
        stepClear += 1;
        this.clearArc(x,y,stepClear);
      }
  },

  touchStart (e) {
    this.setData({
        'award_name':true,
    })
    if(!this.data.isStart) return;
    if(this.data.error){
        wx.showModal({
            title: '提示',
            content: this.data.error,
            showCancel:false,
        })
      return;
    };

    var stepClear = 1;
    //this.drawRect(e.touches[0].x, e.touches[0].y)
    //this.clearArc(e.touches[0].x, e.touches[0].y,stepClear)
    //this.data.ctx.draw(true)
  },

  touchMove (e) {
    if(!this.data.isStart || this.data.error) return;
    var stepClear = 1; 
    this.drawRect(e.touches[0].x, e.touches[0].y)
    this.clearArc(e.touches[0].x, e.touches[0].y,stepClear);
    this.ctx.draw(true) 
  },

  touchEnd (e) {
    if(!this.data.isStart || this.data.error) return;
    var page =this;
    //自动清楚采用点范围值方式判断
    var canvasWidth = this.data.canvasWidth;
    var canvasHeight = this.data.canvasHeight;
    var minX = this.data.minX;
    var minY = this.data.minY;
    var maxX = this.data.maxX;
    var maxY = this.data.maxY;
    if(maxX - minX > .4 * canvasWidth && maxY - minY > .4 * canvasHeight && this.data.detect){

      page.setData({
        'detect':false,
      })

      console.log('LOGID',page.data.id);

      app.request({
        url: api.scratch.receive,
        data:{
          id:page.data.id
        },
        success: function (res) {

          if(res.code==0){
            page.setData({
              'award': page.data.type==5?false:true,
              'isStart':false,
              'isScroll': true,
            });

            page.ctx.draw();

            var form = res.data.list;
            if(res.data.oppty<=0 || form==''){
              page.setData({
                'monitor':'谢谢参与',
                'error':res.msg?res.msg:'机会已用完',
                'detect':true,
                'type':5,
                'oppty':res.data.oppty
              })
            }else{
              page.setData({
                'monitor':page.setName(form),
                'id':form.id,
                'detect':true,
                'type':form.type,
                'oppty':res.data.oppty
              })              
            }

          }else{

            page.setData({
              'monitor':'谢谢参与',
              'detect':true,
            })
            wx.showModal({
              title: '提示',
              content: res.msg?res.msg:'网络异常，请稍后重试',
              showCancel:false,
            })
            page.onStart();
          }
        },
      });
    }
  },

    setName:function (form){
        var name = '';
        switch(form['type'])
        {
            case 1:
                name = form['price']+'元红包';
            break;
            case 2:
                name = form['coupon'];
            break;
            case 3:
                name = form['num']+'积分';
            break;
            case 4:
                name = form['gift'];
            break;
            default:
                name ='谢谢参与';
        }
        return name;
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var user_info = wx.getStorageSync("user_info");
        var res = {
            path: "/scratch/index/index?user_id=" + user_info.id,
            title: this.data.title?this.data.title:'刮刮卡',
        };
        return res;
    },
    onHide: function () {
        clearInterval(interval);
    },
    onUnload: function () {
        clearInterval(interval);
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
            url: api.scratch.qrcode,
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

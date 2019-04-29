if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/member/member.js
var api = require('../../api.js');
var app = getApp();

function setOnShowScene(scene) {
    if (!app.onShowData)
        app.onShowData = {};
    app.onShowData['scene'] = scene;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(typeof my === 'undefined'){
      this.setData({
        my:false,
      })
    }else{
      this.setData({
        my:true
      })
    };
    app.pageOnLoad(this, options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  showDialogBtn: function() {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { 
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var page = this;
    wx.showLoading({
      title: '加载中',
    })
    app.request({
      url: api.user.member,
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.code == 0) {
          page.setData(res.data);
          page.setData({current_key:0});
          if(res.data.next_level){
            page.setData({buy_price:res.data.next_level.price});
          }
        }
      }
    });
  
  },
 
  pay: function(e){
    var key = e.currentTarget.dataset.key;
    var level_id = this.data.list[key].id;
    var pay_type = e.currentTarget.dataset.payment;

    this.hideModal();
    app.request({
      url: api.user.submit_member,
      data:{level_id:level_id,pay_type:pay_type},
      method: 'POST',
      success: function (res) {
          if (res.code == 0) {
              setTimeout(function () {
                  wx.hideLoading();
              }, 1000);

              if(pay_type == "WECHAT_PAY"){
                  setOnShowScene('pay');
                  wx.requestPayment({
                    _res: res,
                    timeStamp: res.data.timeStamp,
                    nonceStr: res.data.nonceStr,
                    package: res.data.package,
                    signType: res.data.signType,
                    paySign: res.data.paySign,
                    complete: function (e) {
                        if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {
                            wx.showModal({
                                title: "提示",
                                content: "订单尚未支付",
                                showCancel: false,
                                confirmText: "确认",
                            });
                            return;
                        }
                        if (e.errMsg == "requestPayment:ok") {
                            wx.showModal({
                                title: "提示",
                                content: "充值成功",
                                showCancel: false,
                                confirmText: "确认",
                                success: function (res) {
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            });
                        }
                    },
                });
                return;
              }

              if (pay_type == 'BALANCE_PAY') {
                  wx.showModal({
                      title: "提示",
                      content: "充值成功",
                      showCancel: false,
                      confirmText: "确认",
                      success: function (res) {
                          wx.navigateBack({
                              delta: 1
                          })
                      }
                  });
              }

          } else {
              wx.showModal({
                  title: '提示',
                  content: res.msg,
                  showCancel: false
              });
              wx.hideLoading();
          }
      }
    });
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
  /**
   * 
   */
  changeTabs:function(e){
    if(typeof my === 'undefined'){
        // weixin
        var current_id = e.detail.currentItemId;
    }else{
        // zhifubao
        var current_id = this.data.list[e.detail.current].id;
    }
    var current_key = e.detail.current;
 
    var buy_price = parseFloat(this.data.next_level.price);

    var list = this.data.list;
    for(var i = 0;i<current_key;i++){
      buy_price += parseFloat(list[i+1].price);
    }

    this.setData({
      current_id:current_id,
      current_key:current_key,
      buy_price: parseFloat(buy_price),
    })
  }
})
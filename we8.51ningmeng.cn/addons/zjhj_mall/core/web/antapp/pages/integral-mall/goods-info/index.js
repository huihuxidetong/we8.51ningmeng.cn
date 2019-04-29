if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/goods-info/index.js

var api = require('../../../api.js');
var app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      tab_detail: "active",
      tab_comment: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      getApp().pageOnLoad(this, options);
      var page = this;
      if (options.integral){
          page.setData({
              user_integral: options.integral,
          });
      }
      if (options.goods_id){
          page.setData({
              id: options.goods_id,
          });
          page.getGoods();
      }
  },

  getGoods:function(){
      var page = this;
      wx.showLoading({
          title: "正在加载",
          mask: true,
      });
      app.request({
          url: api.integral.goods_info,
          data: {
              id:page.data.id
          },
          success: function (res) {
              if(res.code == 0){
                var detail = res.data.goods.detail;
                WxParse.wxParse("detail", "html", detail, page);
                wx.setNavigationBarTitle({
                    title: res.data.goods.name,
                })
                page.setData({
                    goods: res.data.goods,
                    attr_group_list: res.data.attr_group_list, 
                });  
              }else{
                  wx.showModal({
                      title: '提示',
                      content: res.msg,
                      showCancel: false,
                      success: function (res) {
                          if (res.confirm) {
                              wx.navigateTo({
                                  url: '/pages/integral-mall/index/index',
                              });
                          }
                      }
                  });
              }
          },
          complete: function (res) {
              setTimeout(function () {
                  wx.hideLoading();
              }, 500);
          }
      });
  },


  showAttrPicker: function () {
      var page = this;
      page.setData({
          show_attr_picker: true,
      });
  },
  hideAttrPicker: function () {
      var page = this;
      page.setData({
          show_attr_picker: false,
      });
  },
  attrClick: function (e) {
      var page = this;
      var attr_group_id = e.target.dataset.groupId;
      var attr_id = e.target.dataset.id;
      var attr_group_list = page.data.attr_group_list;
      for (var i in attr_group_list) {
          if (attr_group_list[i].attr_group_id != attr_group_id)
              continue;
          for (var j in attr_group_list[i].attr_list) {
              if (attr_group_list[i].attr_list[j].attr_id == attr_id) {
                  attr_group_list[i].attr_list[j].checked = true;
              } else {
                  attr_group_list[i].attr_list[j].checked = false;
              }
          }
      }
      page.setData({
          attr_group_list: attr_group_list,
      });
      var check_attr_list = [];
      var check_all = true;
      for (var i in attr_group_list) {
          var group_checked = false;
          for (var j in attr_group_list[i].attr_list) {
              if (attr_group_list[i].attr_list[j].checked) {
                  var attrs = {
                      'attr_id': attr_group_list[i].attr_list[j].attr_id,
                      'attr_name': attr_group_list[i].attr_list[j].attr_name
                  }
                  check_attr_list.push(attrs);
              }
          }
      }
        var goods = page.data.goods;
        var inattr = goods.attr;
        var inattr_id = [];
        var price = 0;
        var integral = 0;
        for (var x in inattr){
            if (JSON.stringify(inattr[x].attr_list) == JSON.stringify(check_attr_list)){
                if (parseFloat(inattr[x].price) > 0){
                    price = inattr[x].price;     
                }else{
                    price = goods.price;
                }
                if (parseInt(inattr[x].integral) > 0){
                    integral = inattr[x].integral
                }else{
                    integral = goods.integral
                }
                page.setData({
                    attr_integral: integral,
                    attr_num: inattr[x].num,
                    attr_price: price,
                    status:'attr',
                });
            }
        }
  },

  showShareModal: function () {
      var page = this;
      page.setData({
          share_modal_active: "active",
          no_scroll: true,
      });
  },
  shareModalClose: function () {
      var page = this;
      page.setData({
          share_modal_active: "",
          no_scroll: false,
      });
  },

  exchangeGoods:function(){
      var page = this;
      if (!page.data.show_attr_picker) {
          page.setData({
              show_attr_picker: true,
          });
          return true;
      }
      var attr_group_list = page.data.attr_group_list;
      var checked_attr_list = [];
      for (var i in attr_group_list) {
          var attr = false;
          for (var j in attr_group_list[i].attr_list) {
              if (attr_group_list[i].attr_list[j].checked) {
                  attr = {
                      attr_id: attr_group_list[i].attr_list[j].attr_id,
                      attr_name: attr_group_list[i].attr_list[j].attr_name,
                  };
                  break;
              }
          }
          if (!attr) {
              wx.showToast({
                  title: "请选择" + attr_group_list[i].attr_group_name,
                  image: "/images/icon-warning.png",
              });
              return true;
          } else {
              checked_attr_list.push({
                  attr_group_id: attr_group_list[i].attr_group_id,
                  attr_group_name: attr_group_list[i].attr_group_name,
                  attr_id: attr.attr_id,
                  attr_name: attr.attr_name,
              });
          }
      }
      var user_integral = page.data.user_integral;
      var attr_integral = page.data.attr_integral;
      var attr_num = page.data.attr_num
      if (parseInt(user_integral) < parseInt(attr_integral)){
          wx.showToast({
              title: "积分不足!",
              image: "/images/icon-warning.png",
          });
          return true;
      }
      if (attr_num <= 0){
          wx.showToast({
              title: "商品库存不足!",
              image: "/images/icon-warning.png",
          });
          return true;
      }
        var goods = page.data.goods;
        var attr_price = page.data.attr_price;
        var attr_integral = page.data.attr_integral;
        page.setData({
            show_attr_picker: false,
        });
        wx.navigateTo({
            url: '/pages/integral-mall/order-submit/index?goods_info=' + JSON.stringify({
                goods_id: goods.id,
                attr: checked_attr_list,
                attr_price: attr_price,
                attr_integral: attr_integral
            }),
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
})
if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      args:false,
      page:1,
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.pageOnLoad(this, options);
  },
  onShow:function(){
      var page = this;
      wx.showLoading({
        title: '加载中',
      })
      app.request({
          url: api.scratch.prize,
          data:{page:1},
          success: function (res) {
            if(res.code==0){
              page.setData({
                list:page.setName(res.data)
              })
              return;
            }

          },          
          complete: function (res) {
              wx.hideLoading();
          }
      });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var _this=this;
    if (_this.data.args) return;
    var page = _this.data.page + 1;

    app.request({
        url: api.scratch.prize,
        data: {page:page},
        success: function (res) {
            if (res.code == 0) {
              var list = _this.setName(res.data);
              _this.setData({
                list: _this.data.list.concat(list),
                page:page
              })
            }else{
              _this.data.args = true;
            }
        },
    });


  },
  setName:function (list){
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
            break;
          case 4:
            list[index].name = item.gift;
            break;
          case 5:
            list[index].name ='谢谢参与';
            break;
          default:
        }
      })
      return list;
  },

  submit:function(e){
    var gift = e.currentTarget.dataset.gift;
    var attr = JSON.parse(e.currentTarget.dataset.attr);
    var id = e.currentTarget.dataset.id;
      wx.navigateTo({
          url: "/pages/order-submit/order-submit?scratch_id="+id+"&goods_info=" + JSON.stringify({
              goods_id: gift,
              attr: attr,
              num: 1,
          }),
      });
  },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        var res = {
            path: "/pond/pond/pond?parent_id=" + user_info.id,
            title: '九宫格抽奖',
        };
        return res;
    },
})
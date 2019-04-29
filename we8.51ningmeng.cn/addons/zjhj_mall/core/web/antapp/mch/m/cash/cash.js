if (typeof wx === 'undefined') var wx = getApp().hj;
// mch/m/cash/cash.js
var api = require('../../../api.js');
var app = getApp();

function min(var1, var2) {
    var1 = parseFloat(var1);
    var2 = parseFloat(var2);
    return var1 > var2 ? var2 : var1;
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        price: 0.00,
        cash_max_day: -1,
        selected: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
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
        var page = this;
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.mch.user.cash_preview,
            success: function (res) {
                if (res.code == 0) {
                    var data = {};
                    data.price = res.data.money;
                    data.type_list = res.data.type_list
                    page.setData(data);
                }
            },
            complete:function(res){
                wx.hideLoading();
            }
        })
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

    showCashMaxDetail: function () {
        wx.showModal({
            title: "提示",
            content: "今日剩余提现金额=平台每日可提现金额-今日所有用户提现金额"
        });
    },
    select: function (e) {
        var index = e.currentTarget.dataset.index;
        var check = this.data.check;
        if (index != check) {
            this.setData({
                name: '',
                mobile: '',
                bank_name: '',
            });
        }
        this.setData({
            selected: index
        });
    },
    formSubmit: function (e) {
        var page = this;
        var cash = parseFloat(parseFloat(e.detail.value.cash).toFixed(2));
        var cash_max = page.data.price;
        if (!cash) {
            wx.showToast({
                title: "请输入提现金额",
                image: "/images/icon-warning.png",
            });
            return;
        }
        if (cash > cash_max) {
            wx.showToast({
                title: "提现金额不能超过" + cash_max + "元",
                image: "/images/icon-warning.png",
            });
            return;
        }
        if (cash < 1){
            wx.showToast({
                title: "提现金额不能低于1元",
                image: "/images/icon-warning.png",
            });
            return;
        }
        var selected = page.data.selected;
        if (selected != 0 && selected != 1 && selected != 2 && selected != 3 && selected != 4) {
            wx.showToast({
                title: '请选择提现方式',
                image: "/images/icon-warning.png",
            });
            return;
        }
        if(page.data.__platform=='my' && selected==0){
            selected = 2;
        }

        if (selected == 1 || selected == 2 || selected == 3) {
            var name = e.detail.value.name;
            if (!name || name == undefined) {
                wx.showToast({
                    title: '姓名不能为空',
                    image: "/images/icon-warning.png",
                });
                return;
            }
            var mobile = e.detail.value.mobile;
            if (!mobile || mobile == undefined) {
                wx.showToast({
                    title: '账号不能为空',
                    image: "/images/icon-warning.png",
                });
                return;
            }
        }
        if (selected == 3) {
            var bank_name = e.detail.value.bank_name;
            if (!bank_name || bank_name == undefined) {
                wx.showToast({
                    title: '开户行不能为空',
                    image: "/images/icon-warning.png",
                });
                return;
            }
        } else {
            var bank_name = '';
        }
        if (selected == 4 || selected == 0) {
            var bank_name = '';
            var mobile = '';
            var name = '';
        }
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.mch.user.cash,
            method: 'POST',
            data: {
                cash_val: cash,
                nickname: name,
                account: mobile,
                bank_name: bank_name,
                type: selected,
                scene: 'CASH',
                form_id: e.detail.formId,
            },
            success: function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: "提示",
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (e.confirm) {
                            if (res.code == 0) {
                                wx.redirectTo({
                                    url: '/mch/m/cash-log/cash-log',
                                })
                            }
                        }
                    }
                });
            }
        });
    }
    ,
})
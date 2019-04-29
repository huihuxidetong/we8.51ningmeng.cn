if (typeof wx === 'undefined') var wx = getApp().hj;
// cart.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_price: 0.00,
        cart_check_all: false,
        cart_list: [],
        mch_list: [],
        loading: true,
        check_all_self: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        app.pageOnShow(this);
        var page = this;
        page.setData({
            cart_check_all: false,
            show_cart_edit: false,
            check_all_self: false,
        });
        page.getCartList();
    },

    getCartList: function() {
        var page = this;
        wx.showNavigationBarLoading();
        page.setData({
            show_no_data_tip: false,
            loading: true,
        });
        app.request({
            url: api.cart.list,
            success: function(res) {
                if (res.code == 0) {
                    page.setData({
                        cart_list: res.data.list,
                        mch_list: res.data.mch_list,
                        total_price: 0.00,
                        cart_check_all: false,
                        show_cart_edit: false,
                    });
                }
                page.setData({
                    show_no_data_tip: (page.data.cart_list.length == 0),
                });
            },
            complete: function() {
                wx.hideNavigationBarLoading();
                page.setData({
                    loading: false,
                });
            }
        });
    },

    //购物车减少
    cartLess: function(index) {
        var page = this;
        if (index.currentTarget.dataset.type && index.currentTarget.dataset.type == 'mch') {
            var mch_index = index.currentTarget.dataset.mchIndex;
            var item_index = index.currentTarget.dataset.index;
            page.data.mch_list[mch_index].list[item_index].num = page.data.mch_list[mch_index].list[item_index].num - 1;
            page.data.mch_list[mch_index].list[item_index].price = page.data.mch_list[mch_index].list[item_index].num * page.data.mch_list[mch_index].list[item_index].unitPrice;
            page.setData({
                mch_list: page.data.mch_list,
            });
        } else {
            var cart_list = page.data.cart_list;
            for (var i in cart_list) {
                if (index.currentTarget.id == cart_list[i]['cart_id']) {
                    cart_list[i]['num'] = page.data.cart_list[i]['num'] - 1;
                    cart_list[i]['price'] = page.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];
                    page.setData({
                        cart_list: cart_list,
                    });
                }
            }
        }
        page.updateTotalPrice();

    },
    //购物车添加
    cartAdd: function(index) {
        var page = this;
        if (index.currentTarget.dataset.type && index.currentTarget.dataset.type == 'mch') {
            var mch_index = index.currentTarget.dataset.mchIndex;
            var item_index = index.currentTarget.dataset.index;
            page.data.mch_list[mch_index].list[item_index].num = page.data.mch_list[mch_index].list[item_index].num + 1;
            page.data.mch_list[mch_index].list[item_index].price = page.data.mch_list[mch_index].list[item_index].num * page.data.mch_list[mch_index].list[item_index].unitPrice;
            page.setData({
                mch_list: page.data.mch_list,
            });
        } else {
            var cart_list = page.data.cart_list;
            for (var i in cart_list) {
                if (index.currentTarget.id == cart_list[i]['cart_id']) {
                    cart_list[i]['num'] = page.data.cart_list[i]['num'] + 1;
                    cart_list[i]['price'] = page.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];
                    page.setData({
                        cart_list: cart_list,
                    });
                }
            }
        }
        page.updateTotalPrice();
    },
    cartCheck: function(e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var type = e.currentTarget.dataset.type;
        var mch_index = e.currentTarget.dataset.mchIndex;
        if (type == 'self') {
            page.data.cart_list[index].checked = page.data.cart_list[index].checked ? false : true;
            page.setData({
                cart_list: page.data.cart_list,
            });
        }
        if (type == 'mch') {
            page.data.mch_list[mch_index].list[index].checked = page.data.mch_list[mch_index].list[index].checked ? false : true;
            page.setData({
                mch_list: page.data.mch_list,
            });
        }
        page.updateTotalPrice();
    },

    cartCheckAll: function() {
        var page = this;
        var cart_list = page.data.cart_list;
        var checked = false;
        if (page.data.cart_check_all) {
            checked = false;
        } else {
            checked = true;
        }
        for (var i in cart_list) {
            if (!cart_list[i].disabled || page.data.show_cart_edit)
                cart_list[i].checked = checked;
        }

        if (page.data.mch_list && page.data.mch_list.length) {
            for (var i in page.data.mch_list) {
                for (var j in page.data.mch_list[i].list) {
                    page.data.mch_list[i].list[j].checked = checked;
                }
            }
        }

        page.setData({
            cart_check_all: checked,
            cart_list: cart_list,
            mch_list: page.data.mch_list,
        });
        page.updateTotalPrice();

    },

    updateTotalPrice: function() {
        var page = this;
        var total_price = 0.00;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            if (cart_list[i].checked)
                total_price += cart_list[i].price;
        }
        for (var i in page.data.mch_list) {
            for (var j in page.data.mch_list[i].list) {
                if (page.data.mch_list[i].list[j].checked)
                    total_price += page.data.mch_list[i].list[j].price;
            }
        }
        page.setData({
            total_price: total_price.toFixed(2),
        });
    },

    /**
     * 提交
     *
     */
    cartSubmit: function() {
        var page = this;
        var cart_list = page.data.cart_list;
        var mch_list = page.data.mch_list;
        var cart_id_list = [];
        var mch_id_list = [];
        var _mch_list = [];
        var goods_list = [];
        for (var i in cart_list) {
            if (cart_list[i].checked) {
                cart_id_list.push(cart_list[i].cart_id);
                goods_list.push({
                    cart_id: cart_list[i].cart_id
                });
            }
        }
        if (cart_id_list.length > 0) {
            _mch_list.push({
                mch_id: 0,
                goods_list: goods_list
            });
        }
        for (var i in mch_list) {
            var id_list = [];
            var _goods_list = [];
            if (mch_list[i].list && mch_list[i].list.length) {
                for (var j in mch_list[i].list) {
                    if (mch_list[i].list[j].checked) {
                        id_list.push(mch_list[i].list[j].cart_id);
                        _goods_list.push({
                            cart_id: mch_list[i].list[j].cart_id
                        });
                    }
                }
            }
            if (id_list.length) {
                mch_id_list.push({
                    id: mch_list[i].id,
                    cart_id_list: id_list
                });
                _mch_list.push({
                    mch_id: mch_list[i].id,
                    goods_list: _goods_list
                });
            }
        }
        if (cart_id_list.length == 0 && mch_id_list.length == 0) {
            return true;
        }
        wx.showLoading({
            title: '正在提交',
            mask: true,
        });
        page.saveCart(function() {
            wx.navigateTo({
                url: '/pages/new-order-submit/new-order-submit?mch_list=' + JSON.stringify(_mch_list)
            });
        });
        wx.hideLoading();
    },

    cartEdit: function() {
        var page = this;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            cart_list[i].checked = false;
        }
        page.setData({
            cart_list: cart_list,
            show_cart_edit: true,
            cart_check_all: false,
        });
        page.updateTotalPrice();
    },

    cartDone: function() {
        var page = this;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            cart_list[i].checked = false;
        }
        page.setData({
            cart_list: cart_list,
            show_cart_edit: false,
            cart_check_all: false,
        });
        page.updateTotalPrice();
    },

    cartDelete: function() {
        var page = this;
        var cart_list = page.data.cart_list;
        var cart_id_list = [];
        for (var i in cart_list) {
            if (cart_list[i].checked)
                cart_id_list.push(cart_list[i].cart_id);
        }
        if (page.data.mch_list && page.data.mch_list.length) {
            for (var i in page.data.mch_list) {
                for (var j in page.data.mch_list[i].list) {
                    if (page.data.mch_list[i].list[j].checked) {
                        cart_id_list.push(page.data.mch_list[i].list[j].cart_id);
                    }
                }
            }
        }
        if (cart_id_list.length == 0) {
            return true;
        }
        wx.showModal({
            title: "提示",
            content: "确认删除" + cart_id_list.length + "项内容？",
            success: function(res) {
                if (res.cancel)
                    return true;
                wx.showLoading({
                    title: "正在删除",
                    mask: true,
                });
                app.request({
                    url: api.cart.delete,
                    data: {
                        cart_id_list: JSON.stringify(cart_id_list),
                    },
                    success: function(res) {
                        wx.hideLoading();
                        wx.showToast({
                            title: res.msg,
                        });
                        if (res.code == 0) {
                            //page.cartDone();
                            page.getCartList();
                        }
                        if (res.code == 1) {}
                    }
                });
            }
        });
    },
    onHide: function() {
        var page = this;
        page.saveCart();
    },
    onUnload: function() {
        var page = this;
        page.saveCart();
    },

    saveCart: function(callback) {
        var page = this;
        var cart = JSON.stringify(page.data.cart_list);
        app.request({
            url: api.cart.cart_edit,
            method: 'post',
            data: {
                list: cart,
                mch_list: JSON.stringify(page.data.mch_list),
            },
            success: function(res) {
                if (res.code == 0) {}
            },
            complete: function() {
                if (typeof callback == 'function')
                    callback();
            }
        });
    },

    checkGroup: function(e) {
        var page = this;
        var type = e.currentTarget.dataset.type;
        var index = e.currentTarget.dataset.index;
        if (type == 'self') {
            for (var i in page.data.cart_list) {
                page.data.cart_list[i].checked = !page.data.check_all_self;
            }
            page.setData({
                check_all_self: !page.data.check_all_self,
                cart_list: page.data.cart_list,
            });
        }
        if (type == 'mch') {
            for (var i in page.data.mch_list[index].list) {
                page.data.mch_list[index].list[i].checked = page.data.mch_list[index].checked_all ? false : true;
            }
            page.data.mch_list[index].checked_all = page.data.mch_list[index].checked_all ? false : true;
            page.setData({
                mch_list: page.data.mch_list,
            });
        }
        page.updateTotalPrice();
    }

});
if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/miaosha/order-submit/order-submit.js
// order-submit.js
var api = require('../../../api.js');
var app = getApp();
var longitude = "";
var latitude = "";
var util = require('../../../utils/utils.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_price: 0,
        address: null,
        express_price: 0.00,
        content: '',
        offline: 0,
        express_price_1: 0.00,
        name: "",
        mobile: "",
        integral_radio: 1,
        new_total_price: 0,
        show_card: false,
        payment: -1,
        show_payment: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        var time = util.formatData(new Date());
        wx.removeStorageSync('input_data');
        page.setData({
            options: options,
            store: wx.getStorageSync("store"),
            time: time
        });
    },
    bindkeyinput: function (e) {
        this.setData({
            content: e.detail.value
        });
    },
    KeyName: function (e) {
        this.setData({
            name: e.detail.value
        });
    },
    KeyMobile: function (e) {
        this.setData({
            mobile: e.detail.value
        });
    },
    getOffline: function (e) {
        var page = this;
        var express = this.data.express_price;
        var express_1 = this.data.express_price_1;
        var offline = e.target.dataset.index;
        if (offline == 1) {
            this.setData({
                offline: 1,
                express_price: 0,
                express_price_1: express,
            });
        } else {
            this.setData({
                offline: 0,
                express_price: express_1
            });
        }
        page.getPrice();
    },
    dingwei: function () {
        var page = this;
        wx.chooseLocation({
            success: function (e) {
                longitude = e.longitude;
                latitude = e.latitude;
                page.setData({
                    location: e.address,
                });
            },
            fail: function (res) {
                app.getauth({
                    content: "需要获取您的地理位置授权，请到小程序设置中打开授权",
                    success: function (e) {
                        if (e) {
                            if (e.authSetting["scope.userLocation"]) {
                                page.dingwei();
                            } else {
                                wx.showToast({
                                    title: '您取消了授权',
                                    image: "/images/icon-warning.png",
                                })
                            }
                        }
                    }
                });
            }
        })
    },

    orderSubmit: function (e) {
        var page = this;
        var offline = page.data.offline;
        var data = {};

        if (offline == 0) {
            if (!page.data.address || !page.data.address.id) {
                wx.showToast({
                    title: "请选择收货地址",
                    image: "/images/icon-warning.png",
                });
                return;
            }
            data.address_id = page.data.address.id;
        } else {
            data.address_name = page.data.name;
            data.address_mobile = page.data.mobile;
            if (page.data.shop.id) {
                data.shop_id = page.data.shop.id;
            } else {
                wx.showModal({
                    title: '警告',
                    content: '请选择门店',
                    showCancel: false
                });
                return;
            }
            if (!data.address_name || data.address_name == undefined) {
                page.showToast({
                    title: "请填写收货人",
                    image: "/images/icon-warning.png",
                });
                return;
            }
            if (!data.address_mobile || data.address_mobile == undefined) {
                page.showToast({
                    title: "请填写联系方式",
                    image: "/images/icon-warning.png",
                });
                return;
            } else {
                var check_mobile = /^\+?\d[\d -]{8,12}\d/;
                if (!check_mobile.test(data.address_mobile)) {
                    wx.showModal({
                        title: '提示',
                        content: '手机号格式不正确',
                        showCancel: false
                    });
                    return;
                }
            }
        }
        data.offline = offline;

        if (page.data.payment == -1) {
            page.setData({
                show_payment: true
            });
            return false;
        }

        if (page.data.cart_id_list) {
            data.cart_id_list = JSON.stringify(page.data.cart_id_list);
        }
        if (page.data.goods_info) {
            data.goods_info = JSON.stringify(page.data.goods_info);
        }
        if (page.data.picker_coupon) {
            data.user_coupon_id = page.data.picker_coupon.user_coupon_id;
        }
        if (page.data.content) {
            data.content = page.data.content
        }
        page.data.integral_radio == 1 ? data.use_integral = 1 : data.use_integral = 2;
        data.payment = page.data.payment;
        data.formId = e.detail.formId;

        page.order_submit(data, 'ms');
        return;

        //已废弃，新接口在/commons/order-pay/order-pay.js;
        //提交订单
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.miaosha.submit,
            method: "post",
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    setTimeout(function () {
                        page.setData({
                            options: {},
                        });
                    }, 1);
                    var order_id = res.data.order_id;

                    //获取支付数据
                    if (data.payment == 0) {
                        setTimeout(function () {
                            wx.hideLoading();
                        }, 1000);
                        app.request({
                            url: api.miaosha.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'WECHAT_PAY',
                            },
                            success: function (res) {
                                if (res.code == 0) {
                                    //发起支付
                                    wx.requestPayment({
                                        _res: res,
                                        timeStamp: res.data.timeStamp,
                                        nonceStr: res.data.nonceStr,
                                        package: res.data.package,
                                        signType: res.data.signType,
                                        paySign: res.data.paySign,
                                        success: function (e) {
                                            wx.redirectTo({
                                                url: "/pages/miaosha/order/order?status=1",
                                            });
                                        },
                                        fail: function (e) {
                                        },
                                        complete: function (e) {
                                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                                                wx.showModal({
                                                    title: "提示",
                                                    content: "订单尚未支付",
                                                    showCancel: false,
                                                    confirmText: "确认",
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            wx.redirectTo({
                                                                url: "/pages/miaosha/order/order?status=0",
                                                            });
                                                        }
                                                    }
                                                });
                                                return;
                                            }
                                            if (e.errMsg == "requestPayment:ok") {
                                                if (page.data.goods_card_list.length > 0) {
                                                    page.setData({
                                                        show_card: true
                                                    });
                                                } else {
                                                    wx.redirectTo({
                                                        url: "/pages/miaosha/order/order?status=-1",
                                                    });
                                                }
                                                return;
                                            }
                                            wx.redirectTo({
                                                url: "/pages/miaosha/order/order?status=-1",
                                            });
                                        },
                                    });
                                    return;
                                }
                                if (res.code == 1) {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    return;
                                }
                            }
                        });
                    }
                    if (data.payment == 2) {
                        app.request({
                            url: api.miaosha.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'HUODAO_PAY',
                                form_id: e.detail.formId
                            },
                            success: function (res) {
                                wx.hideLoading();
                                if (res.code == 0) {
                                    wx.redirectTo({
                                        url: "/pages/miaosha/order/order?status=-1",
                                    });
                                } else {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    return;
                                }
                            }

                        });
                    }
                    if (data.payment == 3) {
                        app.request({
                            url: api.miaosha.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'BALANCE_PAY',
                                form_id: e.detail.formId
                            },
                            success: function (res) {
                                wx.hideLoading();
                                if (res.code == 0) {
                                    wx.redirectTo({
                                        url: "/pages/miaosha/order/order?status=-1",
                                    });
                                } else {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    setTimeout(function () {
                                        wx.redirectTo({
                                            url: "/pages/miaosha/order/order?status=-1",
                                        });
                                    }, 1000)
                                    return;
                                }
                            }

                        });
                    }
                }
                if (res.code == 1) {
                    wx.hideLoading();
                    page.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                    return;
                }
            }
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
        app.pageOnShow(this);
        var page = this;
        var address = wx.getStorageSync("picker_address");
        if (address) {
            page.setData({
                address: address,
                name: address.name,
                mobile: address.mobile
            });
            wx.removeStorageSync("picker_address");
            page.getInputData();
        }
        page.getOrderData(page.data.options);
    },

    getOrderData: function (options) {
        var page = this;
        var address_id = "";
        if (page.data.address && page.data.address.id)
            address_id = page.data.address.id;
        if (options.goods_info) {
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            app.request({
                url: api.miaosha.submit_preview,
                data: {
                    goods_info: options.goods_info,
                    address_id: address_id,
                    longitude: longitude,
                    latitude: latitude
                },
                success: function (res) {
                    wx.hideLoading();
                    if (res.code == 0) {
                        var shop_list = res.data.shop_list;
                        var shop = {};
                        if (shop_list.length == 1) {
                            shop = shop_list[0];
                        }
                        var input_data = wx.getStorageSync('input_data');
                        if (!input_data) {
                            input_data = {
                                address: res.data.address,
                                name: res.data.address ? res.data.address.name : '',
                                mobile: res.data.address ? res.data.address.mobile : '',
                                shop: shop,
                            }
                            if (res.data.pay_type_list.length > 0) {
                                input_data.payment = res.data.pay_type_list[0].payment;
                                if (res.data.pay_type_list.length > 1) {
                                    input_data.payment = -1;
                                }
                            }
                        }
                        input_data.total_price = res.data.total_price;
                        input_data.goods_list = res.data.list;
                        input_data.goods_info = res.data.goods_info;
                        input_data.express_price = parseFloat(res.data.express_price);
                        input_data.coupon_list = res.data.coupon_list;
                        input_data.shop_list = res.data.shop_list;
                        input_data.send_type = res.data.send_type;
                        input_data.level = res.data.level;
                        input_data.integral = res.data.integral;
                        input_data.new_total_price = res.data.total_price;
                        input_data.is_payment = res.data.is_payment;
                        input_data.is_coupon = res.data.list[0].coupon;
                        input_data.is_discount = res.data.list[0].is_discount;
                        input_data.is_area = res.data.is_area;
                        input_data.pay_type_list = res.data.pay_type_list;
                        page.setData(input_data);
                        page.getInputData();
                        if (res.data.send_type == 1) {//仅快递
                            page.setData({
                                offline: 0,
                            });
                        }
                        if (res.data.send_type == 2) {//仅自提
                            page.setData({
                                offline: 1,
                            });
                        }
                        page.getPrice();
                    }
                    if (res.code == 1) {
                        wx.showModal({
                            title: "提示",
                            content: res.msg,
                            showCancel: false,
                            confirmText: "返回",
                            success: function (res) {
                                if (res.confirm) {
                                    var pages = getCurrentPages();
                                    if (pages.length == 1) {
                                        wx.redirectTo({
                                            url: '/pages/index/index',
                                        });
                                    } else {
                                        wx.navigateBack({
                                            delta: 1,
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    },

    copyText: function (e) {
        var text = e.currentTarget.dataset.text;
        if (!text)
            return;
        wx.setClipboardData({
            data: text,
            success: function () {
                page.showToast({
                    title: "已复制内容",
                });
            },
            fail: function () {
                page.showToast({
                    title: "复制失败",
                    image: "/images/icon-warning.png",
                });
            },
        });
    },

    showCouponPicker: function () {
        var page = this;
        page.getInputData();
        if (page.data.coupon_list && page.data.coupon_list.length > 0) {
            page.setData({
                show_coupon_picker: true,
            });
        }
    },

    pickCoupon: function (e) {
        var page = this;
        var input_data = wx.getStorageSync('input_data');
        wx.removeStorageSync('input_data');
        var index = e.currentTarget.dataset.index;
        input_data.show_coupon_picker = false;
        if (index == '-1' || index == -1) {
            input_data.picker_coupon = false;
        } else {
            input_data.picker_coupon = page.data.coupon_list[index]
        }
        page.setData(input_data);
        page.getPrice();
    },

    numSub: function (num1, num2, length) {
        return 100;
    },
    showShop: function (e) {
        var page = this;
        page.getInputData();
        page.dingwei();
        if (page.data.shop_list && page.data.shop_list.length >= 1) {
            page.setData({
                show_shop: true,
            });
        }
    },
    pickShop: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var input_data = wx.getStorageSync('input_data');
        wx.removeStorageSync('input_data');
        input_data.show_shop = false;
        if (index == '-1' || index == -1) {
            input_data.shop = false;
        } else {
            input_data.shop = page.data.shop_list[index];
        }
        page.setData(input_data);
        page.getPrice();
    },
    integralSwitchChange: function (e) {
        var page = this;
        if (e.detail.value != false) {
            page.setData({
                integral_radio: 1,
            });
        } else {
            page.setData({
                integral_radio: 2,
            });
        }
        page.getPrice();
    },
    integration: function (e) {
        var page = this;
        var integration = page.data.integral.integration;
        wx.showModal({
            title: '积分使用规则',
            content: integration,
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#ff4544',
            success: function (res) {
                if (res.confirm) {
                }
            }
        });
    },
    /**
     * 计算总价
     */
    getPrice: function () {
        var page = this;
        var total_price = page.data.total_price;
        var new_total_price = total_price;
        var express_price = page.data.express_price;
        var picker_coupon = page.data.picker_coupon;
        var integral = page.data.integral;
        var integral_radio = page.data.integral_radio;
        var level = page.data.level;
        var offline = page.data.offline;

        if (picker_coupon) {
            new_total_price = new_total_price - picker_coupon.sub_price;
        }

        if (integral && integral_radio == 1) {
            new_total_price = new_total_price - parseFloat(integral.forehead);
        }

        if (level) {
            new_total_price = new_total_price * level.discount / 10;
        }

        if (new_total_price <= 0.01) {
            new_total_price = 0.01;
        }

        if (offline == 0) {
            new_total_price = new_total_price + express_price;
        }
        page.setData({
            new_total_price: parseFloat(new_total_price.toFixed(2))
        });

    },
    cardDel: function () {
        var page = this;
        page.setData({
            show_card: false
        });
        wx.redirectTo({
            url: '/pages/order/order?status=1',
        })
    },
    cardTo: function () {
        var page = this;
        page.setData({
            show_card: false
        });
        wx.redirectTo({
            url: '/pages/card/card'
        })
    },
    formInput: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var form = page.data.form;
        var form_list = form.list;
        form_list[index].default = e.detail.value;
        form.list = form_list;
        page.setData({
            form: form
        });
    },
    selectForm: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var k = e.currentTarget.dataset.k;
        var form = page.data.form;
        var form_list = form.list;
        if (form_list[index].type == 'radio') {
            var default_list = form_list[index].default_list;
            for (var i in default_list) {
                if (i == k) {
                    default_list[k].is_selected = 1;
                } else {
                    default_list[i].is_selected = 0;
                }
            }
            form_list[index].default_list = default_list;
        }
        if (form_list[index].type == 'checkbox') {
            var default_list = form_list[index].default_list;
            if (default_list[k].is_selected == 1) {
                default_list[k].is_selected = 0;
            } else {
                default_list[k].is_selected = 1;
            }
            form_list[index].default_list = default_list;
        }
        form.list = form_list;
        page.setData({
            form: form
        });
    },
    showPayment: function () {
        this.setData({
            show_payment: true
        });
    },
    payPicker: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            payment: index,
            show_payment: false
        });
    },
    payClose: function () {
        this.setData({
            show_payment: false
        });
    },

    getInputData: function () {
        var page = this;
        var data = {
            address: page.data.address,
            name: page.data.name,
            mobile: page.data.mobile,
            content: page.data.content,
            payment: page.data.payment,
            shop: page.data.shop,
        };
        wx.setStorageSync('input_data', data);
    },

    onHide: function () {
        app.pageOnHide(this);
        this.getInputData();
    },

    onUnLoad: function () {
        app.pageOnUnLoad(this);
        wx.removeStorageSync('input_data');
    }
});
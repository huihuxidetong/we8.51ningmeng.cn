if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var app = getApp();
var share_count = 0;
var width = 260;
var int = 1;
var interval = 0;
var page_first_init = true;
var timer = 1;
var msgHistory = '';
var fullScreen = false;
Page({
    data: {
        x: wx.getSystemInfoSync().windowWidth,
        y: wx.getSystemInfoSync().windowHeight,
        left: 0,
        show_notice: false,
        animationData: {},
        play: -1,
        time: 0,
        buy_user: '',
        buy_address: '',
        buy_time: 0,
        buy_type: '',
        opendate: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        this.loadData(options);
        var page = this;
        var parent_id = 0;
        var user_id = options.user_id;
        var scene = decodeURIComponent(options.scene);
        if (user_id !== undefined) {
            parent_id = user_id;
        } else if (scene !== undefined) {
            parent_id = scene;
        } else if (app.query !== null) {
            var query = app.query;
            app.query = null;
            parent_id = query.uid;
            options.id = query.gid;
        }
        app.loginBindParent({
            parent_id: parent_id
        });

    },

    /**
     * 购买记录
     */
    suspension: function () {
        var page = this;

        interval = setInterval(function () {
            app.request({
                url: api.default.buy_data,
                data: {
                    'time': page.data.time
                },
                method: 'POST',
                success: function (res) {
                    if (res.code == 0) {
                        var inArray = false;

                        if (msgHistory == res.md5) {
                            inArray = true;
                        }
                        var cha_time = '';
                        var s = res.cha_time;
                        var m = Math.floor(s / 60 - Math.floor(s / 3600) * 60);
                        if (m == 0) {
                            cha_time = s % 60 + '秒';
                        } else {
                            cha_time = m + '分' + s % 60 + '秒';
                        }


                        var buy_type = '购买了';
                        var buy_url = '/pages/goods/goods?id=' + res.data.goods;
                        if (res.data.type === 2) {
                            buy_type = '预约了';
                            buy_url = '/pages/book/details/details?id=' + res.data.goods;
                        } else if (res.data.type === 3) {
                            buy_type = '秒杀了';
                            buy_url = '/pages/miaosha/details/details?id=' + res.data.goods;
                        } else if (res.data.type === 4) {
                            buy_type = '拼团了';
                            buy_url = '/pages/pt/details/details?gid=' + res.data.goods;
                        }

                        if (!inArray && res.cha_time <= 300) {
                            page.setData({
                                buy_time: cha_time,
                                buy_type: buy_type,
                                buy_url: buy_url,
                                buy_user: (res.data.user.length >= 5) ? res.data.user.slice(0, 4) + "..." : res.data.user,
                                buy_avatar_url: res.data.avatar_url,
                                buy_address: (res.data.address.length >= 8) ? res.data.address.slice(0, 7) + "..." : res.data.address,
                            });
                            msgHistory = res.md5;
                        } else {
                            page.setData({
                                buy_user: '',
                                buy_type: '',
                                buy_url: buy_url,
                                buy_address: '',
                                buy_avatar_url: '',
                                buy_time: '',
                            });
                        }

                    }
                }
            });
        }, 10000);
    },

    /**
     * 加载页面数据
     */
    loadData: function (options) {
        var page = this;
        var pages_index_index = wx.getStorageSync('pages_index_index');
        if (pages_index_index) {
            pages_index_index.act_modal_list = [];
            page.setData(pages_index_index);
        }
        app.request({
            url: api.default.index,
            success: function (res) {
                if (res.code == 0) {
                    if (!page_first_init) {
                        res.data.act_modal_list = [];
                    } else {
                        page_first_init = false;
                    }
                    var topic_list = res.data.topic_list;
                    var topic_new = new Array();
                    if (topic_list && res.data.update_list.topic.count != 1) {
                        if (topic_list.length == 1) {
                            topic_new[0] = new Array();
                            topic_new[0] = topic_list;
                        } else {
                            for (var i = 0, k = 0; i < topic_list.length; i += 2, k++) {
                                if (topic_list[i + 1] != undefined) {
                                    topic_new[k] = new Array();
                                    topic_new[k][0] = topic_list[i];
                                    topic_new[k][1] = topic_list[i + 1];
                                }
                            }
                        }
                        res.data.topic_list = topic_new;
                    }

                    page.setData(res.data);
                    wx.setStorageSync('store', res.data.store);
                    wx.setStorageSync('pages_index_index', res.data);
                    var _user_info = wx.getStorageSync('user_info');
                    if (_user_info) {
                        page.setData({
                            _user_info: _user_info,
                        });
                    }
                    page.miaoshaTimer();
                }
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
        share_count = 0;
        var store = wx.getStorageSync("store");
        if (store && store.name) {
            wx.setNavigationBarTitle({
                title: store.name,
            });
        }
        if (store && store.purchase_frame === 1) {
            this.suspension(this.data.time);
        } else {
            this.setData({
                buy_user: '',
            })
        }
        clearInterval(int);
        this.notice();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        clearInterval(timer);
        this.loadData();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        return {
            path: "/pages/index/index?user_id=" + user_info.id,
            success: function (e) {
                share_count++;
                if (share_count == 1)
                    app.shareSendCoupon(page);
            },
            title: page.data.store.name
        };
    },

    showshop: function (e) {

        var page = this;
        var goods_id = e.currentTarget.dataset.id;
        var data = e.currentTarget.dataset;
        app.request({
            url: api.default.goods,
            data: {
                id: goods_id
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        data: data,
                        attr_group_list: res.data.attr_group_list,
                        goods: res.data,
                        showModal: true
                    });
                }
            }
        });
    },
    close_box: function (e) {
        this.setData({
            showModal: false,
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
        var attr_group_list_length = attr_group_list.length;

        for (var a = 0; a < attr_group_list_length; a++) {
            var attr_group_list_check = attr_group_list[a]['attr_list'];
            var attr_group_list_check_length = attr_group_list_check.length;
        }

        var check_attr_list = [];
        for (var a = 0; a < attr_group_list_length; a++) {
            var attr_group_list_check = attr_group_list[a]['attr_list'];
            var attr_group_list_check_length = attr_group_list_check.length;
            for (var i = 0; i < attr_group_list_check_length; i++) {
                if (attr_group_list_check[i]['checked'] == true) {
                    var attrs_list = {
                        'attr_id': attr_group_list_check[i]['attr_id'],
                        'attr_name': attr_group_list_check[i]['attr_name']
                    }
                    check_attr_list.push(attrs_list)
                }
            }
        }

        var attr = JSON.parse(page.data.goods.attr);
        var attr_length = attr.length;
        for (var x = 0; x < attr_length; x++) {
            if (JSON.stringify(attr[x]['attr_list']) == JSON.stringify(check_attr_list)) {
                var check_goods_price = attr[x]['price'];
            }
        }

        page.setData({
            attr_group_list: attr_group_list,
            check_goods_price: check_goods_price,
            check_attr_list: check_attr_list
        });

        page.setData({
            attr_group_list: attr_group_list,
        });
    },


    onConfirm: function (e) {
        var page = this;
        //var attr_group = page.data.attr_group;
        var attr_group_lists = page.data.attr_group_list;
        var attr = JSON.parse(page.data.goods.attr);

        var checked_attr_list = [];
        for (var i in attr_group_lists) {
            var attr = false;
            for (var j in attr_group_lists[i].attr_list) {
                if (attr_group_lists[i].attr_list[j].checked) {
                    attr = {
                        attr_id: attr_group_lists[i].attr_list[j].attr_id,
                        attr_name: attr_group_lists[i].attr_list[j].attr_name,
                    };
                    break;
                }
            }
            if (!attr) {
                wx.showToast({
                    title: "请选择" + attr_group_lists[i].attr_group_name,
                    image: "/images/icon-warning.png",
                });
                return true;
            } else {
                checked_attr_list.push({
                    attr_group_id: attr_group_lists[i].attr_group_id,
                    attr_group_name: attr_group_lists[i].attr_group_name,
                    attr_id: attr.attr_id,
                    attr_name: attr.attr_name,
                });
            }
        }
        page.setData({
            attr_group_list: attr_group_lists
        });

        var check_attr_list = page.data.check_attr_list;
        var attr_length = attr.length;
        for (var x = 0; x < attr_length; x++) {
            if (JSON.stringify(attr[x]['attr_list']) == JSON.stringify(check_attr_list)) {
                var check_goods_num = attr[x]['num'];
            }
        }

        var item = wx.getStorageSync('item');
        var quick_list = item.quick_list;

        // 数量+
        var data = page.data.goods;

        var length = quick_list.length;
        var goods_all = [];
        for (var i = 0; i < length; i++) {
            var goods_cat_all = quick_list[i]['goods'];
            var goods_length = goods_cat_all.length;
            for (var a = 0; a < goods_length; a++) {
                goods_all.push(goods_cat_all[a])
            }
        }
        var goods_all_length = goods_all.length;
        var quickgoods = [];
        for (var x = 0; x < goods_all_length; x++) {
            if (goods_all[x]['id'] == data.id) {
                quickgoods.push(goods_all[x]);
            }
        }
        page.setData({
            checked_attr_list: checked_attr_list,
        });

        var attr_length = checked_attr_list.length;
        var attr_id = [];
        for (var a = 0; a < attr_length; a++) {
            attr_id.push(checked_attr_list[a]['attr_id']);
        }

        var carGoods = page.data.carGoods;
        var check_goods_price = page.data.check_goods_price;

        if (check_goods_price == 0) {
            var monery = parseFloat(quickgoods[0].price);
        } else {
            var monery = parseFloat(check_goods_price);
        }
        var good = {
            'goods_id': quickgoods[0].id,
            'num': 1,
            'goods_name': quickgoods[0].name,
            'attr': checked_attr_list,
            'goods_price': monery,
            'price': monery,
        };

        var flag = true;
        var check_num = 0;

        if (check_num > check_goods_num) {
            wx.showToast({
                title: "商品库存不足",
                image: "/images/icon-warning.png",
            });
            check_num = check_goods_num;


            var goods_length = quickgoods.length;
            for (var b = 0; b < goods_length; b++) {
                quickgoods[b].num += 1;
            }
            var total = page.data.total;
            total.total_num += 1;

            total.total_price = parseFloat(total.total_price)
            total.total_price += monery;
            total.total_price = total.total_price.toFixed(2)

            var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
            var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
                return v.id == data.id
            })

            page.setData({
                quick_hot_goods_lists: quick_hot_goods_lists,
                quick_list: quick_list,
                carGoods: carGoods,
                total: total,
                check_num: check_num
            });
        }
    },

    receive: function (e) {
        var page = this;
        var id = e.currentTarget.dataset.index;
        wx.showLoading({
            title: '领取中',
            mask: true,
        })
        if (!page.hideGetCoupon) {
            page.hideGetCoupon = function (e) {
                var url = e.currentTarget.dataset.url || false;
                page.setData({
                    get_coupon_list: null,
                });
                wx.navigateTo({
                    url: url || '/pages/list/list',
                });
            };
        }
        app.request({
            url: api.coupon.receive,
            data: {
                id: id
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    page.setData({
                        get_coupon_list: res.data.list,
                        coupon_list: res.data.coupon_list
                    });
                } else {
                    wx.showToast({
                        title: res.msg,
                        duration: 2000
                    })
                    page.setData({
                        coupon_list: res.data.coupon_list
                    });
                }
            },
            // complete: function () {
            //   wx.hideLoading();
            // }
        });
    },

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
                var str_para = arr_url[1],
                    result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    },
    closeCouponBox: function (e) {
        this.setData({
            get_coupon_list: ""
        });
    },

    notice: function () {
        var page = this;
        var notice = page.data.notice;
        if (notice === undefined) {
            return;
        }
        var length = notice.length * 14;
        return;
    },
    miaoshaTimer: function () {
        var page = this;
        if (page.data.miaosha.ms_next) {
            if (!page.data.miaosha)
                return;

            page.setData({
                opendate: page.data.miaosha.date,
                miaosha: page.data.miaosha,
                ms_next: page.data.miaosha.ms_next,
            });
        } else {
            if (!page.data.miaosha || !page.data.miaosha.rest_time)
                return;
            timer = setInterval(function () {
                if (page.data.miaosha.rest_time > 0) {
                    page.data.miaosha.rest_time = page.data.miaosha.rest_time - 1;
                } else {
                    clearInterval(timer);
                    return;
                }
                page.data.miaosha.times = page.getTimesBySecond(page.data.miaosha.rest_time);
                page.setData({
                    opendate: page.data.miaosha.date,
                    miaosha: page.data.miaosha,
                    ms_next: page.data.miaosha.ms_next,
                });
            }, 1000);
        }
    },

    onHide: function () {
        app.pageOnHide(this);
        this.setData({
            play: -1
        });
        clearInterval(int);
        clearInterval(interval);
    },
    onUnload: function () {
        app.pageOnUnload(this);
        this.setData({
            play: -1
        });
        clearInterval(timer);
        clearInterval(int);
        clearInterval(interval);
    },
    showNotice: function () {
        this.setData({
            show_notice: true
        });
    },
    closeNotice: function () {
        this.setData({
            show_notice: false
        });
    },

    getTimesBySecond: function (s) {
        s = parseInt(s);
        if (isNaN(s))
            return {
                h: '00',
                m: '00',
                s: '00',
            };
        var _h = parseInt(s / 3600);
        var _m = parseInt((s % 3600) / 60);
        var _s = s % 60;
        var type = 0;
        if (_h >= 1) {
            _h -= 1;
        }
        return {
            h: _h < 10 ? ('0' + _h) : ('' + _h),
            m: _m < 10 ? ('0' + _m) : ('' + _m),
            s: _s < 10 ? ('0' + _s) : ('' + _s),
        };

    },
    to_dial: function () {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },

    closeActModal: function () {
        var page = this;
        var act_modal_list = page.data.act_modal_list;
        var show_next = true;
        var next_i;
        for (var i in act_modal_list) {
            var index = parseInt(i);
            if (act_modal_list[index].show) {
                act_modal_list[index].show = false;
                next_i = index + 1;
                if (typeof act_modal_list[next_i] != 'undefined' && show_next) {
                    show_next = false;
                    setTimeout(function () {
                        page.data.act_modal_list[next_i].show = true;
                        page.setData({
                            act_modal_list: page.data.act_modal_list
                        });
                    }, 500);
                }
            }
        }
        page.setData({
            act_modal_list: act_modal_list,
        });
    },
    naveClick: function (e) {
        var page = this;
        app.navigatorClick(e, page);
    },
    play: function (e) {
        this.setData({
            play: e.currentTarget.dataset.index
        });
    },
    onPageScroll: function (e) {
        var page = this;
        if (fullScreen) {
            return;
        }
        if (page.data.play != -1) {
            var max = wx.getSystemInfoSync().windowHeight;
            if (typeof my === 'undefined') {
                wx.createSelectorQuery().select('.video').fields({
                    rect: true
                }, function (res) {
                    if (res.top <= -200 || res.top >= max - 57) {
                        page.setData({
                            play: -1
                        });
                    }
                }).exec();
            } else {
                wx.createSelectorQuery().select('.video').boundingClientRect().scrollOffset().exec((res) => {
                    if (res[0].top <= -200 || res[0].top >= max - 57) {
                        page.setData({
                            play: -1
                        });
                    }
                });
            }
        }
    },
    fullscreenchange: function (e) {
        if (e.detail.fullScreen) {
            fullScreen = true;
        } else {
            fullScreen = false;
        }
    }
});
if (typeof wx === 'undefined') var wx = getApp().hj;
// goods.js
var api = require('../../api.js');
var utils = require('../../utils.js');
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var p = 1;
var is_loading_comment = false;
var is_more_comment = true;
var share_count = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: null,
        goods: {},
        show_attr_picker: false,
        form: {
            number: 1,
        },
        tab_detail: "active",
        tab_comment: "",
        comment_list: [],
        comment_count: {
            score_all: 0,
            score_3: 0,
            score_2: 0,
            score_1: 0,
        },
        autoplay: false,
        hide: "hide",
        show: false,
        x: wx.getSystemInfoSync().windowWidth,
        y: wx.getSystemInfoSync().windowHeight - 20,
        miaosha_end_time_over: {
            h: "--",
            m: "--",
            s: "--",
        },
        page: 1,
        drop: false,
        goodsModel: false,
        goods_num: 0,
        temporaryGood: {
            price: 0.00, // 对应规格的价格
            num: 0,
            use_attr: 1
        },
        goodNumCount: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var page = this;
        app.pageOnLoad(this, options);
        share_count = 0;
        p = 1;
        is_loading_comment = false;
        is_more_comment = true;
        var quick = options.quick;
        if (quick) {
            var item = wx.getStorageSync('item')
            if (item) {
                var total = item.total;
                var carGoods = item.carGoods;
            } else {
                var total = {
                    total_price: 0.00,
                    total_num: 0
                }
                var carGoods = [];
            }
            page.setData({
                quick: quick,
                quick_list: item.quick_list,
                total: total,
                carGoods: carGoods,
                quick_hot_goods_lists: item.quick_hot_goods_lists,
            });
        }
        this.setData({
            store: wx.getStorageSync('store'),
        });
        var parent_id = 0;
        var user_id = options.user_id;
        if (typeof user_id != 'undefined') {
            parent_id = user_id;
        } else{
            if (typeof my === 'undefined') {
                var scene = decodeURIComponent(options.scene);
                if (typeof scene !== 'undefined') {
                    var scene_obj = utils.scene_decode(scene);
                    if (scene_obj.uid && scene_obj.gid) {
                        parent_id = scene_obj.uid;
                        options.id = scene_obj.gid;
                    } else {
                        parent_id = scene;
                    }
                }
            } else {
                if (app.query !== null) {
                    var query = app.query;
                    app.query = null;
                    options.id = query.gid;
                    parent_id = query.uid;
                }
            }
        }
        app.loginBindParent({
            parent_id: parent_id
        });

        page.setData({
            id: options.id,
        });
        page.getGoods();
        page.getCommentList();
    },
    /**
     * 从缓存中取出购物车商品记录
     */
    getCacheData: function () {
        var item = wx.getStorageSync('item')
        var total = {
            total_num: 0,
            total_price: 0.00
        }
        page.setData({
            total: item.total ? item.total : total,
            carGoods: item.carGoods ? item.carGoods : [],
            quick_hot_goods_lists: item.quick_hot_goods_lists ? item.quick_hot_goods_lists : [],
            quick_list: item.quick_list ? item.quick_list : [],
            checked_attr: item.checked_attr
        })
    },
    getGoods: function() {
        var page = this;
        var quick = page.data.quick;
        if (quick) {
            var carGoods = page.data.carGoods;
            if (carGoods) {
                var length = carGoods.length;
                var goods_num = 0;
                for (var i = 0; i < length; i++) {
                    if (carGoods[i].goods_id == page.data.id) {
                        goods_num += parseInt(carGoods[i].num);
                    }
                }
                page.setData({
                    goods_num: goods_num
                });
            }
        }
        app.request({
            url: api.default.goods,
            data: {
                id: page.data.id
            },
            success: function(res) {
                if (res.code == 0) {
                    var detail = res.data.detail;
                    WxParse.wxParse("detail", "html", detail, page);
                    page.setData({
                        goods: res.data,
                        attr_group_list: res.data.attr_group_list,
                    });

                    page.goods_recommend({
                        'goods_id': res.data.id,
                        'reload': true,
                    });
                    if (page.data.goods.miaosha)
                        page.setMiaoshaTimeOver();
                    page.selectDefaultAttr();
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: "/pages/index/index"
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    goodsModel: function(e) {
        var page = this;
        var carGoods = page.data.carGoods;
        var goodsModel = page.data.goodsModel;
        if (!goodsModel) {
            page.setData({
                goodsModel: true
            });
        } else {
            page.setData({
                goodsModel: false
            });
        }
    },
    hideGoodsModel: function() {
        this.setData({
            goodsModel: false
        });
    },
    close_box: function(e) {
        this.setData({
            showModal: false,
        });
    },
    hideModal: function() {
        this.setData({
            showModal: false
        });
    },
    // +购物车
    jia: function (e) {
        var self = this
        var current_good = self.data.goods;
        var quick_list = self.data.quick_list;
        for (var i in quick_list) {
            for (var i2 in quick_list[i].goods) {
                if (parseInt(quick_list[i].goods[i2].id) === parseInt(current_good.id)) {
                    //记录商品添加数量
                    var num = quick_list[i].goods[i2].num ? quick_list[i].goods[i2].num + 1 : 1;
                    var goods_num = JSON.parse(quick_list[i].goods[i2].attr);
                    if (num > goods_num[0].num) {
                        wx.showToast({
                            title: "商品库存不足",
                            image: "/images/icon-warning.png",
                        });
                        --num;
                        return
                    }
                    quick_list[i].goods[i2].num = num;
                    //商品基本数据
                    var carGoods = self.data.carGoods;
                    var sign = 1
                    var gPrice = current_good.price ? current_good.price : quick_list[i].goods[i2].price;
                    for (var j in carGoods) {
                        // 如果商品已存在则不需要重复添加
                        if (parseInt(carGoods[j].goods_id) === parseInt(current_good.id) && carGoods[j].attr.length === 1) {
                            sign = 0;
                            // 购物车列表 单规格商品增加
                            carGoods[j].num = num;
                            carGoods[j].goods_price = (carGoods[j].num * carGoods[j].price).toFixed(2);
                            break;
                        } else {
                            // 购物车列表 多规格商品增加
                            if (carGoods[j].price == parseFloat(e.currentTarget.dataset.price)) {
                                sign = 0;
                                carGoods[j].num = carGoods[j].num + 1;
                                carGoods[j].goods_price = (carGoods[j].num * carGoods[j].price).toFixed(2)
                                break
                            }
                        }
                    }
                    // 新商品则添加记录
                    if (sign === 1 || carGoods.length === 0) {
                        var attr = JSON.parse(quick_list[i].goods[i2].attr);
                        carGoods.push({
                            'goods_id': parseInt(quick_list[i].goods[i2].id),
                            'attr': attr[0]['attr_list'],
                            'goods_name': quick_list[i].goods[i2].name,
                            'goods_price': gPrice,
                            'num': 1,
                            'price': gPrice,
                        })
                    }
                }
            }
        }

        self.setData({
            carGoods: carGoods,
            quick_list: quick_list,
        })
        self.updateGoodNum();
        self.carStatistics();
        self.quickHotStatistics();
    },
    // -购物车
    jian: function (e) {
        var self = this
        var current_good = self.data.goods;
        var quick_list = self.data.quick_list;
        for (var i in quick_list) {
            for (var i2 in quick_list[i].goods) {
                if (parseInt(quick_list[i].goods[i2].id) === parseInt(current_good.id)) {
                    //记录商品减少数量
                    var num = quick_list[i].goods[i2].num > 0 ? quick_list[i].goods[i2].num - 1 : quick_list[i].goods[i2].num
                    quick_list[i].goods[i2].num = num

                    //商品基本数据
                    var carGoods = self.data.carGoods;
                    var sign = 1
                    for (var j in carGoods) {
                        var gPrice = current_good.price ? current_good.price : quick_list[i].goods[i2].price;
                        if (parseInt(carGoods[j].goods_id) === parseInt(current_good.id) && carGoods[j].attr.length === 1) {
                            sign = 0;
                            // 购物车列表 单规格商品减少
                            carGoods[j].num = num;
                            carGoods[j].goods_price = (carGoods[j].num * carGoods[j].price).toFixed(2);
                            break;
                        } else {
                            // 购物车列表 多规格商品减少
                            if (carGoods[j].price == parseFloat(e.currentTarget.dataset.price)) {
                                sign = 0;
                                if (carGoods[j].num > 0) {
                                    carGoods[j].num = carGoods[j].num - 1;
                                    carGoods[j].goods_price = (carGoods[j].num * carGoods[j].price).toFixed(2)
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        self.setData({
            carGoods: carGoods,
            quick_list: quick_list,
        })

        self.updateGoodNum();
        self.carStatistics();
        self.quickHotStatistics();
    },
    /**
     * 购物车总价及数量统计，根据购物车的商品总价及总数之和
     */
    carStatistics: function () {
        var self = this;
        var carGoods = self.data.carGoods;
        var total_num = 0
        var total_price = 0.00
        for (var n in carGoods) {
            total_num = total_num + carGoods[n].num;
            total_price = parseFloat(total_price) + parseFloat(carGoods[n].goods_price);
        }
        var total = {
            'total_num': total_num,
            'total_price': total_price
        };

        // 如果购物车为空，则将购物车列表隐藏
        if (total_num === 0) {
            self.hideGoodsModel();
        }

        self.setData({
            total: total,
        })
    },

    /**
     * 快速购买商品列表的商品数量同步到 热销商品列表
     */
    quickHotStatistics: function () {
        var self = this;
        var quickHot = self.data.quick_hot_goods_lists;
        var quickList = self.data.quick_list;
        for (var i in quickHot) {
            for (var j in quickList) {
                for (var j2 in quickList[j].goods) {
                    //根据商品ID进行判断
                    if (parseInt(quickList[j].goods[j2].id) === parseInt(quickHot[i].id)) {
                        quickHot[i].num = quickList[j].goods[j2].num;
                    }
                }
            }
        }
        self.setData({
            quick_hot_goods_lists: quickHot
        })
    },

    tianjia: function (e) {
        this.jia(e)
    },

    jianshao: function (e) {
        this.jian(e)
    },

    /**
     * 多规格弹框
     */
    showDialogBtn: function () {
        var self = this;
        var current_good = self.data.goods;
        app.request({
            url: api.default.goods,
            data: {
                id: current_good.id
            },
            success: function (res) {
                if (res.code == 0) {
                    self.setData({
                        currentGood: res.data,
                        goods_name: res.data.name,
                        attr_group_list: res.data.attr_group_list,
                        showModal: true,
                    });

                    self.resetData()
                    self.updateData()
                }
            }
        });
    },

    /**
     * 重置临时存储数据，用于多规格弹框数据回显
     */
    resetData: function () {
        this.setData({
            checked_attr: [],
            check_num: 0,
            check_goods_price: 0,
            temporaryGood: {
                price: '0.00',
            }
        })
    },

    // 多规格弹框数据回显，如有多条则回显第一条数据
    updateData: function () {
        var self = this;
        var currentGood = self.data.currentGood; //当前商品信息
        var carGoods = self.data.carGoods; //购物车数据
        var attr = JSON.parse(currentGood.attr); //商品规格信息
        var attrGroups = currentGood.attr_group_list;

        for (var i in attr) {
            var arr = []
            for (var i2 in attr[i].attr_list) {
                arr.push([
                    attr[i].attr_list[i2].attr_id,
                    currentGood.id
                ]);
            }

            for (var j in carGoods) {
                var arr2 = [];
                for (var j2 in carGoods[j].attr) {
                    arr2.push([
                        carGoods[j].attr[j2].attr_id,
                        carGoods[j].goods_id
                    ]);
                }
                if (arr.sort().join() === arr2.sort().join()) {
                    for (var k in attrGroups) {
                        for (var k2 in attrGroups[k].attr_list) {
                            for (var n in arr) {
                                if (parseInt(attrGroups[k].attr_list[k2].attr_id) === parseInt(arr[n])) {
                                    attrGroups[k].attr_list[k2].checked = true
                                    break;
                                } else {
                                    attrGroups[k].attr_list[k2].checked = false
                                }
                            }
                        }
                    }

                    var temporaryGood = {
                        price: carGoods[j].price
                    }

                    self.setData({
                        attr_group_list: attrGroups,
                        check_num: carGoods[j].num,
                        check_goods_price: carGoods[j].goods_price,
                        checked_attr: arr,
                        temporaryGood: temporaryGood
                    })
                    return
                }
            }
        }
    },

    /**
     * 多规格规格切换时 数据回显
     */
    checkUpdateData: function (checked_attr) {
        var self = this;
        var carGoods = self.data.carGoods; //购物车数据

        for (var j in carGoods) {
            var arr = [];
            for (var j2 in carGoods[j].attr) {
                arr.push([
                    carGoods[j].attr[j2].attr_id,
                    carGoods[j].goods_id
                ]);
            }
            // 根据商品ID 和规格ID进行判断
            if (arr.sort().join() === checked_attr.sort().join()) {
                self.setData({
                    check_num: carGoods[j].num,
                    check_goods_price: carGoods[j].goods_price
                })
            }
        }
    },

    /**
     * 选择规格
     */
    attrClick: function (e) {
        var page = this;
        var attr_group_id = e.target.dataset.groupId;
        var attr_id = e.target.dataset.id;
        var attr_group_list = page.data.attr_group_list;
        var currentGood = page.data.currentGood

        // 添加选择按钮样式
        for (var i in attr_group_list) {
            if (attr_group_list[i].attr_group_id != attr_group_id) {
                continue;
            }
            for (var j in attr_group_list[i].attr_list) {
                if (attr_group_list[i].attr_list[j].attr_id == attr_id) {
                    attr_group_list[i].attr_list[j].checked = true;
                } else {
                    attr_group_list[i].attr_list[j].checked = false;
                }
            }
        }

        //获取被选中的规格
        var checked_attr = [];
        for (var i in attr_group_list) {
            for (var j in attr_group_list[i].attr_list) {
                if (attr_group_list[i].attr_list[j].checked === true) {
                    checked_attr.push([
                        attr_group_list[i].attr_list[j].attr_id,
                        currentGood.id
                    ])
                }
            }
        }

        var attr = JSON.parse(page.data.currentGood.attr);
        var temporaryGood = page.data.temporaryGood;
        for (var k in attr) {
            var arr = [];
            for (var k2 in attr[k].attr_list) {
                arr.push([
                    attr[k].attr_list[k2].attr_id,
                    currentGood.id
                ])
            }
            // 根据当前选择的规格，获取对应规格商品价格
            if (arr.sort().join() === checked_attr.sort().join()) {
                // 判断商品库存
                if (parseInt(attr[k].num) === 0) {
                    wx.showToast({
                        title: "商品库存不足，请选择其它规格或数量",
                        image: "/images/icon-warning.png",
                    });
                    return
                }
                // 如果规格价格为0 则用商品自身价格
                if (!parseFloat(attr[k].price)) {
                    temporaryGood = {
                        price: currentGood.price.toFixed(2),
                    }
                } else {
                    temporaryGood = {
                        price: attr[k].price.toFixed(2)
                    }
                }
            }
        }
        page.resetData()
        page.checkUpdateData(checked_attr)
        page.setData({
            attr_group_list: attr_group_list,
            temporaryGood: temporaryGood,
            checked_attr: checked_attr,
        })
    },

    /**
     * 规格加购物车
     */
    onConfirm: function (e) {
        var self = this;
        var attrGroupList = self.data.attr_group_list;
        var checked_attr = self.data.checked_attr;
        var current_good = self.data.currentGood;
        if (checked_attr.length !== attrGroupList.length) {
            wx.showToast({
                title: "请选择规格",
                image: "/images/icon-warning.png",
            });
            return
        }

        var check_num = self.data.check_num ? self.data.check_num + 1 : 1;
        var attrs = JSON.parse(current_good.attr);
        for (var i in attrs) {
            var arr = [];
            for (var i2 in attrs[i].attr_list) {
                arr.push([
                    attrs[i].attr_list[i2].attr_id,
                    current_good.id
                ])

                if (arr.sort().join() === checked_attr.sort().join()) {
                    // 当前规格商品价格，没有则拿当前商品价格
                    var gPrice = attrs[i].price ? attrs[i].price : current_good.price;
                    var attr = attrs[i].attr_list;
                    if (check_num > attrs[i].num) {
                        wx.showToast({
                            title: "商品库存不足",
                            image: "/images/icon-warning.png",
                        });
                        return
                    }
                }
            }
        }
        //购物车商品基本数据
        var carGoods = self.data.carGoods;
        var sign = 1;
        var goodsPrice = (parseFloat(gPrice) * check_num).toFixed(2)
        for (var j in carGoods) {
            var cArr = [];
            for (var j2 in carGoods[j].attr) {
                cArr.push([
                    carGoods[j].attr[j2].attr_id,
                    carGoods[j].goods_id
                ]);
            }
            // 如果商品已存在则不需要重复添加
            if (cArr.sort().join() === checked_attr.sort().join()) {
                sign = 0;
                carGoods[j].num = carGoods[j].num + 1;
                carGoods[j].goods_price = (parseFloat(gPrice) * carGoods[j].num).toFixed(2);
                break;
            }
        }
        // 新商品则添加记录
        if (sign === 1 || carGoods.length === 0) {
            carGoods.push({
                'goods_id': current_good.id,
                'attr': attr,
                'goods_name': current_good.name,
                'goods_price': gPrice,
                'num': 1,
                'price': gPrice,
            })
        }

        self.setData({
            carGoods: carGoods,
            check_goods_price: goodsPrice,
            check_num: check_num,
        })

        self.carStatistics();
        self.attrGoodStatistics();
        self.updateGoodNum();
    },

    /**
     * 多规格减
     */
    guigejian: function (e) {
        var self = this
        var checked_attr = self.data.checked_attr;
        var carGoods = self.data.carGoods;
        var check_num = self.data.check_num ? --self.data.check_num : 1;
        var current_good = self.data.currentGood;

        for (var i in carGoods) {
            var arr = [];
            for (var i2 in carGoods[i].attr) {
                arr.push([
                    carGoods[i].attr[i2].attr_id,
                    carGoods[i].goods_id
                ]);
            }

            if (arr.sort().join() === checked_attr.sort().join()) {
                if (carGoods[i].num > 0) {
                    carGoods[i].num -= 1;
                    carGoods[i].goods_price = (carGoods[i].num * parseFloat(carGoods[i].price)).toFixed(2);
                }
                self.setData({
                    carGoods: carGoods,
                    check_goods_price: carGoods[i].goods_price,
                    check_num: check_num,
                })

                self.carStatistics();
                self.attrGoodStatistics();
                self.updateGoodNum();
                return
            }
        }
    },

    /**
     * 多规格商品总数统计
     */
    attrGoodStatistics: function () {
        var self = this
        var currentGood = self.data.currentGood; //当前点击的商品
        var carGoods = self.data.carGoods;
        var quickList = self.data.quick_list;
        var quickHot = self.data.quick_hot_goods_lists;

        var num = 0;
        for (var i in carGoods) {
            if (carGoods[i].goods_id === currentGood.id) {
                num += carGoods[i].num;
            }
        }
        // 普通商品总数统计
        for (var i in quickList) {
            for (var i2 in quickList[i].goods) {
                if (parseInt(quickList[i].goods[i2].id) === currentGood.id) {
                    quickList[i].goods[i2].num = num
                }
            }
        }

        // 热销商品总数统计
        for (var i in quickHot) {
            if (parseInt(quickHot[i].id) === currentGood.id) {
                quickHot[i].num = num
            }
        }
        self.setData({
            quick_list: quickList,
            quick_hot_goods_lists: quickHot
        })
    },
    
    /**
     * 更新单规格和多规格商品购买总数
     * 与快速购买页面有所不同，所以单独写个方法
     */
    updateGoodNum: function () {
        var self = this;
        var quickList = self.data.quick_list;
        var currentGood = self.data.goods;
        for (var i in quickList) {
            for (var i2 in quickList[i].goods) {
                if (parseInt(quickList[i].goods[i2].id) === parseInt(currentGood.id)) {
                    var goodNumCount = quickList[i].goods[i2].num;
                    var goods_num = quickList[i].goods[i2].num;

                    self.setData({
                        goods_num: goods_num,
                        goodNumCount: goodNumCount
                    })
                    break;
                }
            }
        }
    },
    

    /**
     * 清空购物车
     */
    clearCar: function (e) {
        var self = this;
        var quickHots = self.data.quick_hot_goods_lists;
        var quickList = self.data.quick_list;

        // 清除热销商品列表，商品的总数
        for (var i in quickHots) {
            for (var i2 in quickHots[i]) {
                quickHots[i].num = 0
            }
        }

        // 清除商品列表，商品的总数
        for (var j in quickList) {
            for (var j2 in quickList[j].goods) {
                quickList[j].goods[j2].num = 0
            }
        }
        self.setData({
            goodsModel: false,
            carGoods: [],
            total: {
                total_num: 0,
                total_price: 0.00
            },
            check_num: 0,
            quick_hot_goods_lists: quickHots,
            quick_list: quickList,
            currentGood: [],
            checked_attr: [],
            check_goods_price: 0.00,
            temporaryGood: {},
            goods_num: 0,
            goodNumCount: 0

        });
        wx.removeStorageSync('item')
    },

    buynow: function(e) {
        var page = this;
        var carGoods = page.data.carGoods;
        var goodsModel = page.data.goodsModel;
        page.setData({
            goodsModel: false
        });
        var length = carGoods.length;
        var cart_list = [];
        var cart_list_goods = [];
        for (var a = 0; a < length; a++) {
            if (carGoods[a].num != 0) {
                cart_list_goods = {
                    goods_id: carGoods[a].goods_id,
                    num: carGoods[a].num,
                    attr: carGoods[a].attr
                }
                cart_list.push(cart_list_goods)
            }
        }
        var mch_list = [];
        mch_list.push({
            mch_id: 0,
            goods_list: cart_list
        });
        wx.navigateTo({
            url: '/pages/new-order-submit/new-order-submit?mch_list=' + JSON.stringify(mch_list),
        });
    },

    selectDefaultAttr: function() {
        var page = this;
        if (!page.data.goods || page.data.goods.use_attr !== 0)
            return;
        for (var i in page.data.attr_group_list) {
            for (var j in page.data.attr_group_list[i].attr_list) {
                if (i == 0 && j == 0)
                    page.data.attr_group_list[i].attr_list[j]['checked'] = true;
            }
        }
        page.setData({
            attr_group_list: page.data.attr_group_list,
        });
    },
    getCommentList: function(more) {
        var page = this;
        if (more && page.data.tab_comment != "active")
            return;
        if (is_loading_comment)
            return;
        if (!is_more_comment)
            return;
        is_loading_comment = true;
        app.request({
            url: api.default.comment_list,
            data: {
                goods_id: page.data.id,
                page: p,
            },
            success: function(res) {
                if (res.code != 0)
                    return;
                is_loading_comment = false;
                p++;
                page.setData({
                    comment_count: res.data.comment_count,
                    comment_list: more ? page.data.comment_list.concat(res.data.list) : res.data.list,
                });
                if (res.data.list.length == 0)
                    is_more_comment = false;
            }
        });
    },

    onGoodsImageClick: function(e) {
        var page = this;
        var urls = [];
        var index = e.currentTarget.dataset.index;
        for (var i in page.data.goods.pic_list) {
            urls.push(page.data.goods.pic_list[i].pic_url);
        }
        wx.previewImage({
            urls: urls, // 需要预览的图片http链接列表
            current: urls[index],
        });
    },

    numberSub: function() {
        var page = this;
        var num = page.data.form.number;
        if (num <= 1)
            return true;
        num--;
        page.setData({
            form: {
                number: num,
            }
        });
    },

    numberAdd: function() {
        var page = this;
        var num = page.data.form.number;
        num++;
        page.setData({
            form: {
                number: num,
            }
        });
    },

    numberBlur: function(e) {
        var page = this;
        var num = e.detail.value;
        num = parseInt(num);
        if (isNaN(num))
            num = 1;
        if (num <= 0)
            num = 1;
        page.setData({
            form: {
                number: num,
            }
        });
    },

    addCart: function() {
        this.submit('ADD_CART');
    },

    buyNow: function() {
        this.submit('BUY_NOW');
    },

    submit: function(type) {
        var page = this;
        if (!page.data.show_attr_picker) {
            page.setData({
                show_attr_picker: true,
            });
            return true;
        }
        if (page.data.miaosha_data && page.data.miaosha_data.rest_num > 0 && page.data.form.number > page.data.miaosha_data.rest_num) {
            wx.showToast({
                title: "商品库存不足，请选择其它规格或数量",
                image: "/images/icon-warning.png",
            });
            return true;
        }

        if (page.data.form.number > page.data.goods.num) {
            wx.showToast({
                title: "商品库存不足，请选择其它规格或数量",
                image: "/images/icon-warning.png",
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
        if (type == 'ADD_CART') { //加入购物车
            wx.showLoading({
                title: "正在提交",
                mask: true,
            });
            app.request({
                url: api.cart.add_cart,
                method: "POST",
                data: {
                    goods_id: page.data.id,
                    attr: JSON.stringify(checked_attr_list),
                    num: page.data.form.number,
                },
                success: function(res) {
                    wx.hideLoading();
                    wx.showToast({
                        title: res.msg,
                        duration: 1500
                    });
                    page.setData({
                        show_attr_picker: false,
                    });

                }
            });
        }
        if (type == 'BUY_NOW') { //立即购买
            page.setData({
                show_attr_picker: false,
            });
            var goods_list = [];
            goods_list.push({
                goods_id: page.data.id,
                num: page.data.form.number,
                attr: checked_attr_list
            });
            var goods = page.data.goods;
            var mch_id = 0;
            if (goods.mch != null) {
                mch_id = goods.mch.id
            }
            var mch_list = [];
            mch_list.push({
                mch_id: mch_id,
                goods_list: goods_list
            });
            wx.redirectTo({
                url: "/pages/new-order-submit/new-order-submit?mch_list=" + JSON.stringify(mch_list),
            });
        }

    },

    hideAttrPicker: function() {
        var page = this;
        page.setData({
            show_attr_picker: false,
        });
    },
    showAttrPicker: function() {
        var page = this;
        page.setData({
            show_attr_picker: true,
        });
    },


    favoriteAdd: function() {
        var page = this;
        app.request({
            url: api.user.favorite_add,
            method: "post",
            data: {
                goods_id: page.data.goods.id,
            },
            success: function(res) {
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.is_favorite = 1;
                    page.setData({
                        goods: goods,
                    });
                }
            }
        });
    },

    favoriteRemove: function() {
        var page = this;
        app.request({
            url: api.user.favorite_remove,
            method: "post",
            data: {
                goods_id: page.data.goods.id,
            },
            success: function(res) {
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.is_favorite = 0;
                    page.setData({
                        goods: goods,
                    });
                }
            }
        });
    },

    tabSwitch: function(e) {
        var page = this;
        var tab = e.currentTarget.dataset.tab;
        if (tab == "detail") {
            page.setData({
                tab_detail: "active",
                tab_comment: "",
            });
        } else {
            page.setData({
                tab_detail: "",
                tab_comment: "active",
            });
        }
    },
    commentPicView: function(e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var pic_index = e.currentTarget.dataset.picIndex;
        wx.previewImage({
            current: page.data.comment_list[index].pic_list[pic_index],
            urls: page.data.comment_list[index].pic_list,
        });
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
        var page = this;
        var item = wx.getStorageSync('item')
        if (item) {
            var total = item.total;
            var carGoods = item.carGoods;
            var goods_num = page.data.goods_num;
        } else {
            var total = {
                total_price: 0.00,
                total_num: 0
            }
            var carGoods = [];
            var goods_num = 0;
        }
        page.setData({
            total: total,
            carGoods: carGoods,
            goods_num: goods_num
        });
    },

    /**
       * 生命周期函数--监听页面隐藏
       */
    onHide: function () {
        app.pageOnHide(this);
        var self = this
        var item = {
            'quick_list': self.data.quick_list,
            'carGoods': self.data.carGoods,
            'total': self.data.total,
            'quick_hot_goods_lists': [],
            'checked_attr': self.data.checked_attr
        }
        wx.setStorageSync('item', item)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        app.pageOnUnload(this);
        var self = this
        var item = {
            'quick_list': self.data.quick_list,
            'carGoods': self.data.carGoods,
            'total': self.data.total,
            'quick_hot_goods_lists': [],
            'checked_attr': self.data.checked_attr
        }
        wx.setStorageSync('item', item)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var page = this;

        if (page.data.tab_detail == 'active' && page.data.drop) {
            page.data.drop = false;
            page.goods_recommend({
                'goods_id': page.data.goods.id,
                'loadmore': true
            });

        } else if (page.data.tab_comment == 'active') {
            page.getCommentList(true);
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        var res = {
            path: "/pages/goods/goods?id=" + this.data.id + "&user_id=" + user_info.id,
            success: function(e) {
                share_count++;
                if (share_count == 1)
                    app.shareSendCoupon(page);
            },
            title: page.data.goods.name,
            imageUrl: page.data.goods.pic_list[0].pic_url,
        };
        return res;
    },
    play: function(e) {
        var url = e.target.dataset.url; //获取视频链接
        this.setData({
            url: url,
            hide: '',
            show: true,
        });
        var videoContext = wx.createVideoContext('video');
        videoContext.play();
    },

    close: function(e) {
        if (e.target.id == 'video') {
            return true;
        }
        this.setData({
            hide: "hide",
            show: false
        });
        var videoContext = wx.createVideoContext('video');
        videoContext.pause();
    },
    hide: function(e) {
        if (e.detail.current == 0) {
            this.setData({
                img_hide: ""
            });
        } else {
            this.setData({
                img_hide: "hide"
            });
        }
    },

    showShareModal: function() {
        var page = this;
        page.setData({
            share_modal_active: "active",
            no_scroll: true,
        });
    },

    shareModalClose: function() {
        var page = this;
        page.setData({
            share_modal_active: "",
            no_scroll: false,
        });
    },

    getGoodsQrcode: function() {
        var page = this;
        page.setData({
            goods_qrcode_active: "active",
            share_modal_active: "",
        });
        if (page.data.goods_qrcode)
            return true;
        app.request({
            url: api.default.goods_qrcode,
            data: {
                goods_id: page.data.id,
            },
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

    goodsQrcodeClose: function() {
        var page = this;
        page.setData({
            goods_qrcode_active: "",
            no_scroll: false,
        });
    },

    saveGoodsQrcode: function() {
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

    goodsQrcodeClick: function(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src],
        });
    },
    closeCouponBox: function(e) {
        this.setData({
            get_coupon_list: ""
        });
    },

    setMiaoshaTimeOver: function() {
        var page = this;

        function _init() {
            var time_over = page.data.goods.miaosha.end_time - page.data.goods.miaosha.now_time;
            time_over = time_over < 0 ? 0 : time_over;
            page.data.goods.miaosha.now_time++;
            page.setData({
                goods: page.data.goods,
                miaosha_end_time_over: secondToTime(time_over),
            });
        }

        _init();
        setInterval(function() {
            _init();
        }, 1000);

        function secondToTime(second) {
            var _h = parseInt(second / 3600);
            var _m = parseInt((second % 3600) / 60);
            var _s = second % 60;

            return {
                h: _h < 10 ? ("0" + _h) : ("" + _h),
                m: _m < 10 ? ("0" + _m) : ("" + _m),
                s: _s < 10 ? ("0" + _s) : ("" + _s),
            };
        }
    },
    to_dial: function(e) {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },

    goods_recommend: function(args) {
        var page = this;
        page.setData({
            is_loading: true,
        });

        var p = page.data.page || 2;
        app.request({
            url: api.default.goods_recommend,
            data: {
                goods_id: args.goods_id,
                page: p,
            },
            success: function(res) {

                if (res.code == 0) {
                    if (args.reload) {
                        var goods_list = res.data.list;
                    };
                    if (args.loadmore) {
                        var goods_list = page.data.goods_list.concat(res.data.list);
                    };
                    page.data.drop = true;
                    page.setData({
                        goods_list: goods_list
                    })
                    page.setData({
                        page: (p + 1)
                    });
                };

            },
            complete: function() {
                page.setData({
                    is_loading: false,
                });
            }
        });
    },

    // 商城商品选择规格
    attrGoodsClick: function (e) {
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
                    check_attr_list.push(attr_group_list[i].attr_list[j].attr_id);
                    group_checked = true;
                    break;
                }
            }
            if (!group_checked) {
                check_all = false;
                break;
            }
        }

        if (!check_all)
            return;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.default.goods_attr_info,
            data: {
                goods_id: page.data.goods.id,
                attr_list: JSON.stringify(check_attr_list),
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.price = res.data.price;
                    goods.num = res.data.num;
                    goods.attr_pic = res.data.pic;
                    page.setData({
                        goods: goods,
                    });
                }
            }
        });

    },

});
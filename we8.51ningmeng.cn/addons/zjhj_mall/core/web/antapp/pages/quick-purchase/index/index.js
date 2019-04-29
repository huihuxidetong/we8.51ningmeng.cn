if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/cat/cat.js
var api = require('../../../api.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        quick_list: [],
        goods_list: [],
        carGoods: [], // 购物车数据
        currentGood: {}, //当个商品信息
        checked_attr: [], //已选择的规格
        checkedGood: [], //多规格当前选择的商品
        attr_group_list: [],
        temporaryGood: {
            price: 0.00, // 对应规格的价格
            num: 0,
            use_attr: 1
        },
        check_goods_price: 0.00,
        showModal: false,
        checked: false,
        cat_checked: false,
        color: '',
        total: {
            total_price: 0.00,
            total_num: 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        this.setData({
            store: wx.getStorageSync("store"),
        });
    },

    onShow: function() {
        app.pageOnShow(this);
        this.loadData();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        app.pageOnHide(this);
        var self = this
        var item = {
            'quick_list': self.data.quick_list,
            'carGoods': self.data.carGoods,
            'total': self.data.total,
            'quick_hot_goods_lists': self.data.quick_hot_goods_lists,
            'checked_attr': self.data.checked_attr
        }
        wx.setStorageSync('item', item)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        app.pageOnUnload(this);
        var self = this
        var item = {
            'quick_list': self.data.quick_list,
            'carGoods': self.data.carGoods,
            'total': self.data.total,
            'quick_hot_goods_lists': self.data.quick_hot_goods_lists,
            'checked_attr': self.data.checked_attr
        }
        wx.setStorageSync('item', item)
    },

    loadData: function(options) {
        var page = this;
        var item = wx.getStorageSync('item')
        var total = {
            total_num: 0,
            total_price: 0.00
        }
        page.setData({
            total: item.total !== undefined ? item.total : total,
            carGoods: item.carGoods !== undefined ? item.carGoods : []
        })
        wx.showLoading({
            title: '加载中',
        })
        app.request({
            url: api.quick.quick,
            success: function(res) {
                wx.hideLoading()
                if (res.code == 0) {
                    var list = res.data.list;
                    var quick_hot_goods_lists = [];
                    var quick_list = [];
                    for (var i in list) {
                        // 判断该分类下是否有商品
                        if (list[i].goods.length > 0) {
                            quick_list.push(list[i])
                            for (var i2 in list[i].goods) {
                                //将商品已选择的数量 回存
                                var carGoods = page.data.carGoods;
                                for (var j in carGoods) {
                                    if (item.carGoods[j].goods_id === parseInt(list[i].goods[i2].id)) {
                                        list[i].goods[i2].num = list[i].goods[i2].num ? list[i].goods[i2].num : 0
                                        list[i].goods[i2].num += item.carGoods[j].num
                                    }
                                }
                                // 取出热销商品
                                if (parseInt(list[i].goods[i2].hot_cakes)) {
                                    quick_hot_goods_lists.push(list[i].goods[i2])
                                }
                            }
                        }
                    }
                    // return
                    page.setData({
                        quick_hot_goods_lists: quick_hot_goods_lists,
                        quick_list: quick_list,
                    });
                }
            }
        });
    },
    // 商品详情
    get_goods_info: function(e) {
        var page = this;
        var carGoods = page.data.carGoods;
        var total = page.data.total;
        var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
        var quick_list = page.data.quick_list;
        var check_num = page.data.check_num;
        var item = {
            "carGoods": carGoods,
            "total": total,
            "quick_hot_goods_lists": quick_hot_goods_lists,
            "check_num": check_num,
            "quick_list": quick_list
        };
        wx.setStorageSync("item", item);
        var data = e.currentTarget.dataset;
        var goods_id = data.id;
        wx.navigateTo({
            url: '/pages/goods/goods?id=' + goods_id + '&quick=1'
        })
    },

    // 商品定位
    selectMenu: function(event) {
        var data = event.currentTarget.dataset
        var quick_list = this.data.quick_list;
        if (data.tag == 'hot_cakes') {
            var cat_checked = true;
            var quick_list_length = quick_list.length;
            for (var a = 0; a < quick_list_length; a++) {
                quick_list[a]['cat_checked'] = false;
            }
        } else {
            var index = data.index;
            var quick_list_length = quick_list.length;
            for (var a = 0; a < quick_list_length; a++) {
                quick_list[a]['cat_checked'] = false;
                if (quick_list[a]['id'] == quick_list[index]['id']) {
                    quick_list[a]['cat_checked'] = true;
                }
            }
            cat_checked = false;
        }
        this.setData({
            toView: data.tag,
            selectedMenuId: data.id,
            quick_list: quick_list,
            cat_checked: cat_checked
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(options) {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        return {
            path: "/pages/quick-purchase/index/index?user_id=" + user_info.id,
            success: function(e) {
                share_count++;
                if (share_count == 1)
                    app.shareSendCoupon(page);
            }
        };
    },
    // +购物车
    jia: function(e) {
        var self = this
        var current_good = e.currentTarget.dataset;
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
        self.carStatistics();
        self.quickHotStatistics();
    },
    // -购物车
    jian: function(e) {
        var self = this
        var current_good = e.currentTarget.dataset;
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

        self.carStatistics();
        self.quickHotStatistics();
    },
    /**
     * 购物车总价及数量统计，根据购物车的商品总价及总数之和
     */
    carStatistics: function() {
        var self = this;
        var carGoods = self.data.carGoods;
        console.log(carGoods);
        var total_num = 0
        var total_price = 0.00
        for (var n in carGoods) {
            total_num = total_num + carGoods[n].num;
            total_price = parseFloat(total_price) + parseFloat(carGoods[n].goods_price);
        }
        var total = {
            'total_num': total_num,
            'total_price': total_price.toFixed(2)
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
    quickHotStatistics: function() {
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

    tianjia: function(e) {
        this.jia(e)
    },

    jianshao: function(e) {
        this.jian(e)
    },

    /**
     * 多规格弹框
     */
    showDialogBtn: function(e) {
        var self = this;
        var current_good = e.currentTarget.dataset;
        app.request({
            url: api.default.goods,
            data: {
                id: current_good.id
            },
            success: function(res) {
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
    resetData: function() {
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
    updateData: function() {
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
    checkUpdateData: function(checked_attr) {
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
    attrClick: function(e) {
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
    onConfirm: function(e) {
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
    },

    /**
     * 多规格减
     */
    guigejian: function(e) {
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
                return
            }
        }
    },

    /**
     * 多规格商品总数统计
     */
    attrGoodStatistics: function() {
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

    // 购物车弹窗
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
    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function() {

    },
    /**
     * 隐藏模态对话框
     */
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

    /**
     * 清空购物车
     */
    clearCar: function(e) {
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
                    'goods_id': carGoods[a].goods_id,
                    'num': carGoods[a].num,
                    'attr': carGoods[a].attr
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
        // 清除购物车
        page.clearCar();
    },
});
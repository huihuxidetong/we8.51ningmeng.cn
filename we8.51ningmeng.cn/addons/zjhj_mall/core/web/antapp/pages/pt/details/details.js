if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/pt/details/details.js
var api = require('../../../api.js');
var utils = require('../../../utils.js');
var app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        show_attr_picker: false,
        form: {
            number: 1,
            pt_detail:false,
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.pageOnLoad(this, options);
        var parent_id = 0;
        var user_id = options.user_id;
        var scene = decodeURIComponent(options.scene);
        if (typeof user_id !== 'undefined') {
            parent_id = user_id;
        } else if (typeof scene !== 'undefined') {
            var scene_obj = utils.scene_decode(scene);
            if (scene_obj.uid && scene_obj.gid) {
                parent_id = scene_obj.uid;
                options.gid = scene_obj.gid;
            } else {
                parent_id = scene;
            }
        } else {
            if (typeof my !== 'undefined') {
                if (app.query !== null) {
                    var query = app.query;
                    app.query = null;
                    options.id = query.gid;
                }
            }
        }
        app.loginBindParent({
            parent_id: parent_id
        });

        this.setData({
            id: options.gid,
            oid: options.oid,
            group_checked: options.group_id
        });
        this.getGoodsInfo(options);
        var store = wx.getStorageSync("store");
        this.setData({
            store: store,
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
        app.pageOnShow(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        wx.removeStorageSync('pt_group_detail');
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        var path = '/pages/pt/details/details?gid=' + page.data.goods.id + '&user_id=' + user_info.id;
        return {
            title: page.data.goods.name,
            path: path,
            imageUrl: page.data.goods.cover_pic,
            success: function(res) {
            }
        }
    },
    /**
     * 获取商品详情
     */
    getGoodsInfo: function(e) {
        var gid = e.gid;
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        wx.showNavigationBarLoading();
        app.request({
            url: api.group.details,
            method: "get",
            data: {
                gid: gid
            },
            success: function(res) {
                if (res.code == 0) {
                    page.countDownRun(res.data.info.limit_time_ms);
                    var detail = res.data.info.detail;
                    WxParse.wxParse("detail", "html", detail, page);
                    wx.setNavigationBarTitle({
                        title: res.data.info.name,
                    })
                    wx.hideNavigationBarLoading();
                    var reduce_price = (res.data.info.original_price - res.data.info.price).toFixed(2);
                    page.setData({
                        group_checked: page.data.group_checked ? page.data.group_checked : 0,
                        goods: res.data.info,
                        attr_group_list: res.data.attr_group_list,
                        attr_group_num: res.data.attr_group_num,
                        limit_time: res.data.limit_time_res,
                        group_list: res.data.groupList,
                        group_num: res.data.groupList.length,
                        group_rule_id: res.data.groupRuleId,
                        comment: res.data.comment,
                        comment_num: res.data.commentNum,
                        reduce_price: reduce_price < 0 ? 0 : reduce_price,
                    });
                    page.countDown();
                    page.selectDefaultAttr();
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/pt/index/index'
                                });
                            }
                        }
                    });
                }
            },
            complete: function(res) {
                setTimeout(function() {
                    // 延长一秒取消加载动画
                    wx.hideLoading();
                }, 1000);
            }
        });
    },
    more:function(){
        this.setData({
            'pt_detail':true
        })
    },
    end_more:function(){
        this.setData({
            'pt_detail':false
        })
    },
    previewImage:function(e){     
        var urls = e.currentTarget.dataset.url;
        wx.previewImage({
            urls: [urls]
        });
    },
    selectDefaultAttr: function() {
        var page = this;
        if (!page.data.goods || page.data.goods.use_attr === '0')
            for (var i in page.data.attr_group_list) {

                for (var j in page.data.attr_group_list[i].attr_list) {

                    if (i == 0 && j == 0) {
                        page.data.attr_group_list[i].attr_list[j]['checked'] = true;
                    }
                }
            }

        page.setData({
            attr_group_list: page.data.attr_group_list,
        });
    },
    /**
     * 限时拼团倒计时
     */
    countDown: function(limit_time_ms) {

    },
    /**
     * 执行倒计时
     */
    countDownRun: function(limit_time_ms) {
        var page = this;
        setInterval(function() {
            var leftTime = (new Date(limit_time_ms[0], limit_time_ms[1] - 1, limit_time_ms[2], limit_time_ms[3], limit_time_ms[4], limit_time_ms[5])) - (new Date()); //计算剩余的毫秒数 
            var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
            var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
            var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟 
            var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数 

            days = page.checkTime(days);
            hours = page.checkTime(hours);
            minutes = page.checkTime(minutes);
            seconds = page.checkTime(seconds);
            page.setData({
                limit_time: {
                    days: days < 0 ? '00' : days,
                    hours: hours < 0 ? '00' : hours,
                    mins: minutes < 0 ? '00' : minutes,
                    secs: seconds < 0 ? '00' : seconds,
                },
            });
        }, 1000);
    },
    /**
     * 时间补0
     */
    checkTime: function(i) { //将0-9的数字前面加上0，例1变为01
        if (i < 0) {
            return '00';
        }
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },
    /**
     * 返回首页
     */
    goHome: function(e) {
        wx.redirectTo({
            url: '/pages/pt/index/index'
        })
    },
    /**
     * 去参团
     */
    goToGroup: function(e) {
        wx.navigateTo({
            url: '/pages/pt/group/details?oid=' + e.target.dataset.id,
        })
    },
    /**
     * 评论列表页
     */
    goToComment: function(e) {
        wx.navigateTo({
            url: '/pages/pt/comment/comment?id=' + this.data.goods.id,
        })
    },
    /**
     * 拼团规则
     */
    goArticle: function(e) {
        if (this.data.group_rule_id) {
            wx.navigateTo({
                url: '/pages/article-detail/article-detail?id=' + this.data.group_rule_id,
            })
        }
    },
    /**
     * 隐藏规格选择框
     */
    hideAttrPicker: function() {
        var page = this;
        page.setData({
            show_attr_picker: false,
        });
    },
    /**
     * 显示规格选择框
     */
    showAttrPicker: function() {
        var page = this;
        page.setData({
            show_attr_picker: true,
        });
    },
    groupCheck: function() {
        var page = this;
        var attr_group_num = page.data.attr_group_num;
        var attr_list = page.data.attr_group_num.attr_list;
        for (var i in attr_list) {
            attr_list[i].checked = false;
        }
        attr_group_num.attr_list = attr_list;

        var goods = page.data.goods;
        page.setData({
            group_checked: 0,
            attr_group_num: attr_group_num,
        });

        var attr_group_list = page.data.attr_group_list;
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
            url: api.group.goods_attr_info,
            data: {
                goods_id: page.data.goods.id,
                group_id: page.data.group_checked,
                attr_list: JSON.stringify(check_attr_list),
            },
            success: function(res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.price = res.data.price;
                    goods.num = res.data.num;
                    goods.attr_pic = res.data.pic;
                    goods.original_price = res.data.single;

                    page.setData({
                        goods: goods,
                    });
                }
            }
        });
    },

    attrNumClick: function(e) {
        var page = this;
        var attr_id = e.target.dataset.id;

        var attr_group_num = page.data.attr_group_num;
        var attr_list = attr_group_num.attr_list;

        for (var i in attr_list) {
            if (attr_list[i].id == attr_id) {
                attr_list[i].checked = true;
            } else {
                attr_list[i].checked = false;
            }
        }
        attr_group_num.attr_list = attr_list;

        page.setData({
            attr_group_num: attr_group_num,
            group_checked: attr_id,
        });

        var attr_group_list = page.data.attr_group_list;
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
            url: api.group.goods_attr_info,
            data: {
                goods_id: page.data.goods.id,
                group_id: page.data.group_checked,
                attr_list: JSON.stringify(check_attr_list),
            },
            success: function(res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.price = res.data.price;
                    goods.num = res.data.num;
                    goods.attr_pic = res.data.pic;
                    goods.original_price = res.data.single;
                    page.setData({
                        goods: goods,
                    });
                }
            }
        });

    },
    attrClick: function(e) {
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
            url: api.group.goods_attr_info,
            data: {
                goods_id: page.data.goods.id,
                group_id: page.data.group_checked,
                attr_list: JSON.stringify(check_attr_list),
            },
            success: function(res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.price = res.data.price;
                    goods.num = res.data.num;
                    goods.attr_pic = res.data.pic;
                    goods.original_price = res.data.single;
                    page.setData({
                        goods: goods,
                        // miaosha_data: res.data.miaosha,
                    });
                }
            }
        });
    },
    /**
     * 团购
     */
    buyNow: function() {
        this.submit('GROUP_BUY', this.data.group_checked);
    },
    /**
     * 单独购买
     */
    onlyBuy: function() {
        var page = this;
        this.submit('ONLY_BUY', 0);
    },
    /**
     * 订单提交
     */
    submit: function(type, group_id) {
        var page = this;
        var groupNum = type == 'GROUP_BUY';
        if (!page.data.show_attr_picker || groupNum != page.data.groupNum) {
            page.setData({
                show_attr_picker: true,
                groupNum: groupNum,
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

        page.setData({
            show_attr_picker: false,
        });
        var parent_id = 0;
        if (page.data.oid) {
            type = "GROUP_BUY_C";
            parent_id = page.data.oid;
        }
        wx.redirectTo({
            url: "/pages/pt/order-submit/order-submit?goods_info=" + JSON.stringify({
                goods_id: page.data.goods.id,
                attr: checked_attr_list,
                num: page.data.form.number,
                type: type,
                deliver_type: page.data.goods.type,
                group_id: group_id,
                parent_id: parent_id
            }),
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
        if (num > page.data.goods.one_buy_limit && page.data.goods.one_buy_limit != 0) {
            wx.showModal({
                title: '提示',
                content: '数量超过最大限购数',
                showCancel: false,
                success: function(res) {}
            })
            return;
        }
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
        if (num > page.data.goods.one_buy_limit && page.data.goods.one_buy_limit != 0) {
            wx.showModal({
                title: '提示',
                content: '数量超过最大限购数',
                showCancel: false,
                success: function(res) {}
            });
            num = page.data.goods.one_buy_limit;
        }
        page.setData({
            form: {
                number: num,
            }
        });
    },
    /**
     * 拼团倒计时
     */
    countDown: function() {
        var page = this;
        setInterval(function() {
            var group_list = page.data.group_list;
            for (var i in group_list) {
                var leftTime = (new Date(group_list[i]['limit_time_ms'][0], group_list[i]['limit_time_ms'][1] - 1, group_list[i]['limit_time_ms'][2], group_list[i]['limit_time_ms'][3], group_list[i]['limit_time_ms'][4], group_list[i]['limit_time_ms'][5])) - (new Date()); //计算剩余的毫秒数  
                var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
                var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
                var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟
                var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数

                days = page.checkTime(days);
                hours = page.checkTime(hours);
                minutes = page.checkTime(minutes);
                seconds = page.checkTime(seconds);
                group_list[i].limit_time = {
                    days: days,
                    hours: hours > 0 ? hours : '00',
                    mins: minutes > 0 ? minutes : '00',
                    secs: seconds > 0 ? seconds : '00',
                };
                page.setData({
                    group_list: group_list,
                });
            }
        }, 1000);
    },
    /**
     * 图片放大
     */
    bigToImage: function(e) {
        var urls = this.data.comment[e.target.dataset.index]['pic_list'];
        wx.previewImage({
            current: e.target.dataset.url, // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
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
            url: api.group.goods_qrcode,
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
    to_dial: function() {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },
})
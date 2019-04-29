//app.js
//不要删这行注释，微擎版用的：siteInfo: require('siteinfo.js')
var hj = null;
var page = null;
var request = null;
var api = null;
var utils = null;
var order_pay = null;
var uploader = null;
var login = null;
if (typeof wx !== 'undefined') {
    //微信
    hj = require('./hj.js');
    page = require('./utils/page.js');
    request = require('./utils/request.js');
    api = require('./api.js');
    utils = require('./utils/utils.js');
    order_pay = require('./commons/order-pay/order-pay.js');
    uploader = require('./utils/uploader');
    login = require('./utils/login.js');
}
var _app = App({
    is_on_launch: true,
    onShowData: null,
    _version: '2.6.7',
    query: null,
    onLaunch: function (options) {
        this.setApi();
        api = this.api;
        this.getNavigationBarColor();
        this.getStoreData();
        this.getCatList();
    },

    onShow: function (e) {
        if (e.scene)
            this.onShowData = e;
        if (e && e.query) {
            this.query = e.query
        }
    },

    getStoreData: function () {
        var page = this;
        var app = this;
        this.request({
            url: api.default.store,
            success: function (res) {
                if (res.code == 0) {
                    app.hj.setStorageSync("store", res.data.store);
                    app.hj.setStorageSync("store_name", res.data.store_name);
                    app.hj.setStorageSync("show_customer_service", res.data.show_customer_service);
                    app.hj.setStorageSync("contact_tel", res.data.contact_tel);
                    app.hj.setStorageSync("share_setting", res.data.share_setting);
                    app.permission_list = res.data.permission_list;
                    app.hj.setStorageSync('wxapp_img', res.data.wxapp_img);
                    app.hj.setStorageSync('wx_bar_title', res.data.wx_bar_title);
                }
            },
            complete: function () {
                //page.login();
            }
        });
    },

    getCatList: function () {
        var app = this;
        this.request({
            url: api.default.cat_list,
            success: function (res) {
                if (res.code == 0) {
                    var cat_list = res.data.list || [];
                    app.hj.setStorageSync("cat_list", cat_list);
                }
            }
        });
    },
    saveFormId: function (form_id) {
        this.request({
            url: api.user.save_form_id,
            data: {
                form_id: form_id,
            }
        });
    },

    loginBindParent: function (object) {
        var app = this;
        var access_token = app.hj.getStorageSync("access_token");
        if (access_token == '') {
            return true;
        }
        app.bindParent(object);
    },
    bindParent: function (object) {
        var app = this;
        if (object.parent_id == "undefined" || object.parent_id == 0)
            return;
        var user_info = app.hj.getStorageSync("user_info");
        var share_setting = app.hj.getStorageSync("share_setting");
        if (share_setting.level > 0) {
            var parent_id = object.parent_id;
            if (parent_id != 0) {
                app.request({
                    url: api.share.bind_parent,
                    data: {parent_id: object.parent_id},
                    success: function (res) {
                        if (res.code == 0) {
                            user_info.parent = res.data
                            app.hj.setStorageSync('user_info', user_info);
                        }
                    }
                });
            }
        }
    },

    /**
     * 分享送优惠券
     * */
    shareSendCoupon: function (page) {
        var app = this;
        app.hj.showLoading({
            mask: true,
        });
        if (!page.hideGetCoupon) {
            page.hideGetCoupon = function (e) {
                var url = e.currentTarget.dataset.url || false;
                page.setData({
                    get_coupon_list: null,
                });
                if (url) {
                    app.hj.navigateTo({
                        url: url,
                    });
                }
            };
        }
        this.request({
            url: api.coupon.share_send,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        get_coupon_list: res.data.list
                    });
                }
            },
            complete: function () {
                app.hj.hideLoading();
            }
        });
    },
    getauth: function (object) {
        var app = this;
        app.hj.showModal({
            title: '是否打开设置页面重新授权',
            content: object.content,
            confirmText: '去设置',
            success: function (e) {
                if (e.confirm) {
                    app.hj.openSetting({
                        success: function (res) {
                            if (object.success) {
                                object.success(res);
                            }
                        },
                        fail: function (res) {
                            if (object.fail) {
                                object.fail(res);
                            }
                        },
                        complete: function (res) {
                            if (object.complete)
                                object.complete(res);
                        }
                    })
                } else {
                    if (object.cancel) {
                        app.getauth(object);
                    }
                }
            }
        })
    },
    setApi: function () {
        var siteroot = this.siteInfo.siteroot;
        siteroot = siteroot.replace('app/index.php', '');
        siteroot += 'addons/zjhj_mall/core/web/index.php?store_id=-1&r=api/';

        function getNewApiUri(api) {
            for (var i in api) {
                if (typeof api[i] === 'string') {
                    api[i] = api[i].replace('{$_api_root}', siteroot);
                } else {
                    api[i] = getNewApiUri(api[i]);
                }
            }
            return api;
        }

        this.api = getNewApiUri(this.api);
        var _index_api_url = this.api.default.index;
        var _web_root = _index_api_url.substr(0, _index_api_url.indexOf('/index.php'));
        this.webRoot = _web_root;
    },
    webRoot: null,
    siteInfo: require('./siteinfo.js'),
    currentPage: null,
    pageOnLoad: function (page, options) {
        this.page.onLoad(page, options);
    },
    pageOnReady: function (page) {
        this.page.onReady(page);
    },
    pageOnShow: function (page) {
        this.page.onShow(page);

    },
    pageOnHide: function (page) {
        this.page.onHide(page);

    },
    pageOnUnload: function (page) {
        this.page.onUnload(page);

    },

    getNavigationBarColor: function () {
        var app = this;
        app.request({
            url: api.default.navigation_bar_color,
            success: function (res) {
                if (res.code == 0) {
                    app.hj.setStorageSync('_navigation_bar_color', res.data);
                    app.setNavigationBarColor();
                }
            }
        });
    },

    setNavigationBarColor: function () {
        var navigation_bar_color = this.hj.getStorageSync('_navigation_bar_color');
        if (navigation_bar_color) {
            this.hj.setNavigationBarColor(navigation_bar_color);
        }
    },

    //登录成功后不刷新的页面
    loginNoRefreshPage: [
        'pages/index/index',
        'mch/shop/shop',
        //'pages/fxhb/open/open',
        //'pages/fxhb/detail/detail',
    ],
    navigatorClick: function (e, page) {
        var open_type = e.currentTarget.dataset.open_type;
        if (open_type == 'redirect') {
            return true;
        }
        if (open_type == 'wxapp') {
            var path = e.currentTarget.dataset.path;
            var str = path.substr(0, 1);
            if (str != '/') {
                path = '/' + path;
            }
            this.hj.navigateToMiniProgram({
                appId: e.currentTarget.dataset.appid,
                path: path,
                complete: function (e) {
                }
            });
        }
        if (open_type == 'tel') {
            var contact_tel = e.currentTarget.dataset.tel;
            this.hj.makePhoneCall({
                phoneNumber: contact_tel
            })
        }
        return false;

        function parseQueryString(url) {
            var reg_url = /^[^\?]+\?([\w\W]+)$/,
                reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                arr_url = reg_url.exec(url),
                ret = {};
            if (arr_url && arr_url[1]) {
                var str_para = arr_url[1], result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    },
    hj: hj,
    page: page,
    request: request,
    api: api,
    utils: utils,
    order_pay: order_pay,
    uploader: uploader,
    login: login,
    setRequire: function () {
        this.hj = require('./hj.js');
        this.request = require('./utils/request.js');
        this.page = require('./utils/page.js');
        this.api = require('./api.js');
        this.utils = require('./utils/utils.js');
        this.order_pay = require('./commons/order-pay/order-pay.js');
        this.uploader = require('./utils/uploader');
        this.login = require('./utils/login.js');
    },
    getPlatform: function () {
        if (typeof my !== 'undefined')
            return 'my';
        if (typeof wx !== 'undefined')
            return 'wx';
        return null;
    },
});
if (typeof my !== 'undefined') {
    _app.setRequire();
    _app.setApi();
}
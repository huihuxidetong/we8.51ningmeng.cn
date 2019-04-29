if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../api.js');
var area_picker = require('../../area-picker/area-picker.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        is_form_show: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this, options);
        var page = this;
        page.getDistrictData(function (data) {
            area_picker.init({
                page: page,
                data: data,
            });
        });
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.mch.apply,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    if (res.data.apply) {
                        res.data.show_result = true;
                    }
                    page.setData(res.data);
                    if (!res.data.apply) {
                        page.setData({
                            is_form_show: true
                        })
                    }
                }
            }
        });
    },

    getDistrictData: function (cb) {
        var district = wx.getStorageSync("district");
        if (!district) {
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            app.request({
                url: api.default.district,
                success: function (res) {
                    wx.hideLoading();
                    if (res.code == 0) {
                        district = res.data;
                        wx.setStorageSync("district", district);
                        cb(district);
                    }
                }
            });
            return;
        }
        cb(district);
    },

    onAreaPickerConfirm: function (e) {
        var page = this;
        page.setData({
            edit_district: {
                province: {
                    id: e[0].id,
                    name: e[0].name,
                },
                city: {
                    id: e[1].id,
                    name: e[1].name,
                },
                district: {
                    id: e[2].id,
                    name: e[2].name,
                }
            },
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        app.pageOnReady(this);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        app.pageOnHide(this);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        app.pageOnUnload(this);
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

    mchCommonCatChange: function (e) {
        var page = this;
        page.setData({
            mch_common_cat_index: e.detail.value
        });
    },


    applySubmit: function (e) {
        var page = this;
        if (page.data.entry_rules && !page.data.agree_entry_rules) {
            wx.showModal({
                title: '提示',
                content: '请先阅读并同意《入驻协议》。',
                showCancel: false,
            });
            return;
        }
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        if(page.data.mch_common_cat_index===0){
            page.data.mch_common_cat_index = '0';
        }
        app.request({
            url: api.mch.apply_submit,
            method: 'post',
            data: {
                realname: e.detail.value.realname,
                tel: e.detail.value.tel,
                name: e.detail.value.name,
                province_id: e.detail.value.province_id,
                city_id: e.detail.value.city_id,
                district_id: e.detail.value.district_id,
                address: e.detail.value.address,
                mch_common_cat_id: page.data.mch_common_cat_index ? (page.data.mch_common_cat_list[page.data.mch_common_cat_index].id) : ((page.data.apply && page.data.apply.mch_common_cat_id) ? page.data.apply.mch_common_cat_id : ''),
                service_tel: e.detail.value.service_tel,
                form_id: e.detail.formId,
                wechat_name: e.detail.value.wechat_name,
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.redirectTo({
                                    url: '/mch/apply/apply'
                                });
                            }
                        }
                    });
                }
                if (res.code == 1) {
                    page.showToast({
                        title: res.msg,
                    });
                }
            }
        });
    },

    hideApplyResult: function () {
        var page = this;
        page.setData({
            show_result: false,
            is_form_show: true
        });
    },

    showApplyResult: function () {
        var page = this;
        page.setData({
            show_result: true,
        });
    },

    showEntryRules: function () {
        this.setData({
            show_entry_rules: true,
        });
    },

    disagreeEntryRules: function () {
        this.setData({
            agree_entry_rules: false,
            show_entry_rules: false,
        });
    },

    agreeEntryRules: function () {
        this.setData({
            agree_entry_rules: true,
            show_entry_rules: false,
        });
    },

});
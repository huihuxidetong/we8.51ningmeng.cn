if (typeof wx === 'undefined') var wx = getApp().hj;
var api = require('../../../api.js');
var area_picker = require('../../../area-picker/area-picker.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {},

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
            title: "正在加载"
        });
        app.request({
            url: api.mch.user.setting,
            success: function (res) {
                wx.hideLoading();
                page.setData(res.data);
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

    mchCommonCatChange: function (e) {
        var page = this;
        page.setData({
            mch_common_cat_index: e.detail.value
        });
    },

    formSubmit: function (e) {
        var page = this;
        wx.showLoading({
            title: '正在提交',
            mask: true,
        });
        e.detail.value.form_id = e.detail.formId;
        e.detail.value.mch_common_cat_id = page.data.mch_common_cat_index ? (page.data.mch_common_cat_list[page.data.mch_common_cat_index].id) : ((page.data.mch && page.data.mch.mch_common_cat_id) ? page.data.mch.mch_common_cat_id : '');
        app.request({
            url: api.mch.user.setting_submit,
            method: 'post',
            data: e.detail.value,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.navigateBack({delta: 1});
                            }
                        }
                    });
                } else {
                    page.showToast({
                        title: res.msg,
                    });
                }
            }
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

    uploadLogo: function () {
        var page = this;
        app.uploader.upload({
            start: function (e) {
                wx.showLoading({
                    title: '正在上传',
                    mask: true,
                });
            },
            success: function (res) {
                if (res.code == 0) {
                    page.data.mch.logo = res.data.url;
                    page.setData({
                        mch: page.data.mch,
                    });
                } else {
                    page.showToast({
                        title: res.msg,
                    });
                }
            },
            error: function (e) {
                page.showToast({
                    title: e,
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

    uploadHeaderBg: function () {
        var page = this;
        app.uploader.upload({
            start: function (e) {
                wx.showLoading({
                    title: '正在上传',
                    mask: true,
                });
            },
            success: function (res) {
                if (res.code == 0) {
                    page.data.mch.header_bg = res.data.url;
                    page.setData({
                        mch: page.data.mch,
                    });
                } else {
                    page.showToast({
                        title: res.msg,
                    });
                }
            },
            error: function (e) {
                page.showToast({
                    title: e,
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

});
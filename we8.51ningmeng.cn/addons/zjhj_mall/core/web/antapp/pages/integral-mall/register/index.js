if (typeof wx === 'undefined') var wx = getApp().hj;
// pages/integral-mall/shuoming/index.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentDate: "",
        dayList: '',
        currentDayList: '',
        currentObj: '',
        currentDay: '',

        //日期初始化选中样式
        selectCSS: 'bk-color-day',
        weeks:[
            { day: '日' },
            { day: '一'},
            { day: '二'},
            { day: '三'},
            { day: '四'},
            { day: '五'},
            { day: '六'},
        ],
    },
    doDay: function (e) {
        var that = this;
        var currentObj = that.data.currentObj
        var Y = currentObj.getFullYear();
        var m = currentObj.getMonth() + 1;
        var d = currentObj.getDate();
        var str = ''
        if (e.currentTarget.dataset.key == 'left') {
            m -= 1
            if (m <= 0) {
                str = (Y - 1) + '/' + 12 + '/' + d
            } else {
                str = Y + '/' + m + '/' + d
            }
        } else {
            m += 1
            if (m <= 12) {
                str = Y + '/' + m + '/' + d
            } else {
                str = (Y + 1) + '/' + 1 + '/' + d
            }
        }
        currentObj = new Date(str)
        this.setData({
            currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
            currentObj: currentObj,
            /*  获取当前的年、月  */
            currentYear: currentObj.getFullYear(),
            currentMonth: (currentObj.getMonth() + 1),
        })
        var yearmonth = currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/'
        this.setSchedule(currentObj);
        var currentDayList = wx.getStorageSync('currentDayList')
        for (var i in currentDayList) {
        }
        var time = [];
        var registerTime = that.data.registerTime
        for (var i in currentDayList) {
            if (currentDayList[i])
                time.push(yearmonth + currentDayList[i]);
        }
        function arrayIntersection(a, b) {
            var ai = 0, bi = 0;
            var result = new Array();
            while (ai < a.length && bi < b.length) {
                var a_day = new Date(a[ai]).getTime();
                var b_day = new Date(b[bi]).getTime();
                if (a_day < b_day) { ai++; }
                else if (a_day > b_day) { bi++; }
                else /* they're equal */ {
                    result.push(b[bi]);
                    ai++;
                    bi++;
                }
            }
            return result;
        }
        var arr = arrayIntersection(time, registerTime);
        var strs = [];
        for (var i in currentDayList) {
            if (currentDayList[i]) {
                currentDayList[i] = {
                    'date': currentDayList[i],
                    'is_re': 0
                }
            }
        }
        for (var i in arr) {
            strs = arr[i].split("/");
            for (var i in currentDayList) {
                if (currentDayList[i].date == strs[2]) {
                    currentDayList[i].is_re = 1;
                }
            }
        }
        that.setData({
            currentDayList: currentDayList,
        }); 
    },

    setSchedule: function (currentObj) {
        var that = this
        var m = currentObj.getMonth() + 1
        var Y = currentObj.getFullYear()
        var d = currentObj.getDate();
        var dayString = Y + '/' + m + '/' + currentObj.getDate()
        var currentDayNum = new Date(Y, m, 0).getDate()
        var currentDayWeek = currentObj.getUTCDay() + 1
        var result = currentDayWeek - (d % 7 - 1);
        var firstKey = result <= 0 ? 7 + result : result;

        var currentDayList = [];
        var f = 0
        for (var i = 0; i < 42; i++) {
            var data = []
            if (i < firstKey) {
                currentDayList[i] = ''
            } else {
                if (f < currentDayNum) {
                    currentDayList[i] = f + 1;
                    f = currentDayList[i]
                } else if (f >= currentDayNum) {
                    currentDayList[i] = ''
                }
            }
        }
        wx.setStorageSync("currentDayList", currentDayList);
    },

    //选择具体日期方法--xzz1211
    selectDay: function (e) {
        var that = this;
        that.setData({
            currentDay: e.target.dataset.day,//选择的数据，非真实当前日期
            currentDa: e.target.dataset.day, //选择某月具体的一天
            currentDate: that.data.currentYear + '年' + that.data.currentMonth + '月',//真实选择数据
            checkDay: that.data.currentYear + '' + that.data.currentMonth + '' + e.target.dataset.day,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getApp().pageOnLoad(this, options);
        var that = this;
        var currentObj = this.getCurrentDayString()
        this.setData({
            currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
            today: currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate(),
            yearmonth: currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/',
            today_time: currentObj.getFullYear() + '' + (currentObj.getMonth() + 1) + '' + currentObj.getDate(),
            currentDay: currentObj.getDate(),
            currentObj: currentObj,
            /*  获取当前的年、月  */
            currentYear: currentObj.getFullYear(),
            currentMonth: (currentObj.getMonth() + 1),
        })
        this.setSchedule(currentObj);
              
    },
    getCurrentDayString: function () {
        var objDate = this.data.currentObj
        if (objDate != '') {
            return objDate
        } else {
            var c_obj = new Date()
            var a = c_obj.getFullYear() + '/' + (c_obj.getMonth() + 1) + '/' + c_obj.getDate()
            return new Date(a)
        }
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
        getApp().pageOnShow(this);
        var page = this;
        app.request({
            url: api.integral.explain,
            data: {
                today: page.data.today
            },
            success: function (res) {
                if (res.code == 0) {
                    if (!res.data.register){
                        var continuation = 0;
                    }else{
                        var continuation = res.data.register.continuation;
                    }
                    page.setData({
                        register: res.data.setting,
                        continuation: continuation,
                        registerTime: res.data.registerTime
                    });
                    if (res.data.today){
                        page.setData({
                            status: 1,
                        });             
                    }
                    var currentDayList = wx.getStorageSync('currentDayList')
                    var time = [];
                    for (var i in currentDayList) {
                        time.push(page.data.yearmonth + currentDayList[i]);
                    }
                    var registerTime = res.data.registerTime
                    function arrayIntersection(a, b) {
                        var ai = 0, bi = 0;
                        var result = new Array();
                        while (ai < a.length && bi < b.length) {
                            var a_day = new Date(a[ai]).getTime();
                            var b_day = new Date(b[bi]).getTime();
                            if (a_day < b_day) { ai++; }
                            else if (a_day > b_day) { bi++; }
                            else /* they're equal */ {
                                result.push(b[bi]);
                                ai++;
                                bi++;
                            }
                        }
                        return result;
                    }
                    var arr = arrayIntersection(time, registerTime);
                    var strs = []; 
                    for (var i in currentDayList) {
                        if (currentDayList[i]) {
                            currentDayList[i] = {
                                'date': currentDayList[i],
                                'is_re':0
                            }
                        }
                    }
                    for (var i in arr){
                        strs = arr[i].split("/"); 
                        for (var i in currentDayList) {
                            if (currentDayList[i].date == strs[2]){
                                currentDayList[i].is_re = 1;
                            }
                        }
                    }
                    page.setData({
                        currentDayList: currentDayList,
                    }); 
                }
            },
        });
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    register_rule: function () {
        this.setData({
            register_rule: true,
            status_show: 2,
        });
    },
    hideModal: function () {
        this.setData({
            register_rule: false
        });
    },
    calendarSign: function () {
        var page = this;
        var today_time = page.data.today_time;
        var today = page.data.today;
        var currentDay = page.data.currentDay;
        var checkDay = page.data.checkDay;

        if (checkDay){
            if (parseInt(today_time) != parseInt(checkDay)) {
                wx.showToast({
                    title: "日期不对哦",
                    image: "/images/icon-warning.png",
                });
                return
            }
        }
        var currentDayList = page.data.currentDayList;
        app.request({
            url: api.integral.register,
            data: {
                today: today
            },
            success: function (res) {
                if (res.code == 0) {
                    page.data.registerTime.push(today);
                    var continuation = res.data.continuation;
                    for (var i in currentDayList) {
                        if (currentDayList[i].date == currentDay) {
                            currentDayList[i].is_re = 1;
                        }
                    }
                    page.setData({
                        register_rule: true,
                        status_show: 1,
                        continuation: continuation,
                        status:1,
                        currentDayList: currentDayList,
                        registerTime: page.data.registerTime,
                    });
                    if (parseInt(continuation) >= parseInt(page.data.register.register_continuation)){
                        page.setData({
                            jiangli:1,
                        });    
                    }
                }else{
                    wx.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                }
            },
        });
    },
})
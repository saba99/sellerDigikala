<template>
  <div>
    <loading v-if="showLoading"></loading>
    <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
    <account-status :account_status="account_status"></account-status>
    <div class="panel">
      <div class="header">مدیریت پرداخت ها</div>
      <div class="panel_content">
        <div v-if="account_status=='active'">
          <div class="search_form order_search">
          
             <input type="date" class="form-control" v-model="date"  name="date" placeholder="تاریخ پرداخت">
            <button class="btn btn-primary" v-on:click="getList(1)" style="margin-right:10px" >جست و جو</button>
          </div>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>شناسه پرداخت</th>
                <th>مبلغ پرداخت شده</th>
                <th>زمان ثبت</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row,key) in list.data" :key="key">
                <td>{{ getRow(key) }}</td>
                <td>{{ replaceNumber(row.shenase) }}</td>
                <td>{{ replaceNumber(number_format(row.price)) }} ریال</td>
                <td>{{ getDate(row.time,true) }}</td>
              </tr>
              <tr v-if="list.data.length==0">
                <td colspan="4">رکوردی یافت نشد</td>
              </tr>
            </tbody>
          </table>

          <pagination :data="list" @pagination-change-page="getList"></pagination>
        </div>
        <div v-else>
          <p style="padding-top:100px;text-align:center;font-size:50px">
            <span class="fa fa-exclamation"></span>
          </p>
          <p
            style="text-align:center;padding-bottom:80px"
          >شما دسترسی لازم برای عملیات جاری را ندارید</p>
        </div>
      </div>
    </div>
    <server-error-message v-if="server_error"></server-error-message>
  </div>
</template>

<script>
import myMixin from "../assets/myMixin";
export default {
  mixins: [myMixin],
  data() {
    return {
      showLoading: false,
      server_error: false,
      account_status: "active",
      BreadcrumbList: [{ path: "/orders/payments", title: "مدیریت پرداخت ها" },],
      date: "",
      list: { data: [] },
      page: 1,
      monthName:[
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند'
      ]
    };
  },
  mounted() {
    this.account_status = localStorage.getItem("account_status");
    this.$emit("setSideBarItem", "report");
    this.getList(1);
  },
  methods: {
    getList: function(page = 1) {
      this.page = 1;
      this.showLoading = true;
      const url =this.$siteUrl + "/api/seller/payemnt?page=" +page +'&date='+this.date;
      this.axios
        .get(url, this.setHeader())
        .then(response => {
          this.showLoading = false;
          const result = this.setAccountStatus(response.data);
          if (result) {
            this.list = response.data;
          }
        })
        .catch(error => {
          this.setCatch(error);
        });
    },setHeader: function (image) {
            const token = localStorage.getItem('token');
            if (image) {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'multipart/form-data'
                    }
                };
            }
            else {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                };
            }
        },
        setCatch: function (error) {
            this.showLoading = false;
            if (error.response) {
                if (error.response.status == 401) {
                    this.logout();
                }
                else {
                    this.show_server_error();
                }
            }
            else {
                this.show_server_error();
            }
        },setAccountStatus: function (data) {
            if (data.error_access == 'ok') {
                this.account_status = data.account_status;
                localStorage.setItem('account_status', data.account_status);
                return false;
            }
            else {
                this.account_status = 'active';
                localStorage.setItem('account_status', 'active');
                return true;
            }
        },getRow: function (n, count) {
            count = count == undefined ? 10 : count;
            var row = n + 1;
            row = row + (this.page - 1) * count;
            return this.replaceNumber(row);
        }, 
    getDate: function (time, format) {
        time = time * 1000;
        const date = new Date(time);
        let r = '';
        const jalali = this.gregorian_to_jalali(date.getFullYear(), (date.getMonth() + 1), date.getDate());
        if (format == undefined) {
            r = this.replaceNumber(jalali[2]) + " " + this.monthName[(jalali[1] - 1)] + " " + this.replaceNumber(jalali[0]);
        }
        else {
            r = this.replaceNumber(jalali[0]) + "/" + this.replaceNumber(jalali[1]) + "/" + this.replaceNumber(jalali[2]);
        }
        return r;
    },
    gregorian_to_jalali: function (gy, gm, gd) {
        var g_d_m, jy, jm, jd, gy2, days;
        g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        if (gy > 1600) {
            jy = 979;
            gy -= 1600;
        } else {
            jy = 0;
            gy -= 621;
        }
        gy2 = (gm > 2) ? (gy + 1) : gy;
        days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
        jy += 33 * (parseInt(days / 12053));
        days %= 12053;
        jy += 4 * (parseInt(days / 1461));
        days %= 1461;
        if (days > 365) {
            jy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
        }
        jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
        jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
        return [jy, jm, jd];
    },
  }
};
</script>

<style>
</style>
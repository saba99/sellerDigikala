<template>
  <div>
    <loading v-if="showLoading"></loading>
    <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
    <account-status :account_status="account_status"></account-status>
    <div class="panel">
      <div class="header">مدیریت محموله ها</div>
      <div class="panel_content">
        <div v-if="account_status=='active'">
          <div class="search_form order_search">
            <input
              type="text"
              v-model="search_package_id"
              placeholder="شماره محموله"
              class="form-control"
              style="margin-left:10px"
            />
            <input type="date" class="form-control" v-model="date"  name="date">

            <button
              class="btn btn-primary"
              v-on:click="getPackage(1)"
              style="margin-right:10px"
            >جست و جو</button>
          </div>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>شناسه محموله</th>
                <th>زمان ارسال</th>
                <th>تعداد محصول</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row,key) in list.data" :key="key">
                <td>{{ getRow(key) }}</td>
                <td>{{ replaceNumber(row.package_id) }}</td>
                <td>{{ replaceNumber(row.send_date) }}</td>
                <td>{{ replaceNumber(row.product_count) }}</td>
                <td>{{ package_status(row.status) }}</td>
                <td>
                  <span
                    class="fa fa-eye"
                    v-on:click="$router.push({name:'PackageContent',params:{id:row.id}})"
                  ></span>
                </td>
              </tr>
              <tr v-if="list.data.length==0">
                <td colspan="6">رکوردی یافت نشد</td>
              </tr>
            </tbody>
          </table>

          <pagination :data="list" @pagination-change-page="getPackage"></pagination>
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
import myMinix from "../assets/myMixin";
export default {
  mixins: [myMinix],
  data() {
    return {
      showLoading: false,
      server_error: false,
      account_status: "active",
      BreadcrumbList: [{ path: "/package", title: "مدیریت محموله ها" }],
      date: "",
      search_package_id: "",
      list: { data: [] },
      page: 1
    };
  },
  mounted() {
    this.account_status = localStorage.getItem("account_status");
    this.$emit("setSideBarItem", "package");
    this.getPackage(1);
  },
  methods: {
    getPackage: function(page = 1) {
      this.page = 1;
      this.showLoading = true;
      const url =
        this.$siteUrl +
        "/api/seller/packages?page=" +
        page +
        "&package_id=" +
        this.search_package_id +
        "&date=" +
        this.date;
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
        },  package_status: function (status) {
            if (status == 0) {
                return 'آماده ارسال';
            }
            else if (status == 1) {
                return 'ارسال شده';
            }
            else if (status == -1) {
                return 'عدم ارسال';
            }
            else if (status == -2) {
                return 'ارسال ناقص';
            }
        },
  }
};
</script>

<style>
</style>
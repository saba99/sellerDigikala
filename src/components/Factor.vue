<template>
  <div>
    <loading v-if="showLoading"></loading>
    <div>
      <div
        v-if="showPrintButton"
        class="container"
        style="display:flex;justify-content: center;margin-top:20px"
      >
        <button class="btn btn-danger factor_btn" @click="print()">پرینت فاکتور</button>
      </div>
      <div class="container factor print_page" v-for="n in getPageCount" :key="n">
        <div class="line"></div>
        <div class="header_factor">
          <div>
            <p>
              <span>تاریخ ارسال : {{ replaceNumber(packageData.send_date )}}</span>
              <span>شماره محموله : {{ replaceNumber(packageData.package_id) }}</span>
              <span>تعداد محصول : {{ replaceNumber(packageData.product_count) }}</span>
              <span>برگه {{ replaceNumber(n) }} از {{ replaceNumber(getPageCount) }}</span>
            </p>
          </div>
          <div class="title">فاکتور ارسال کالا</div>
          <div></div>
        </div>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>ردیف</th>
              <th>تصویر محصول</th>
              <th>عنوان محصول</th>
              <th>گارانتی</th>
              <th>رنگ</th>
              <th>تعداد</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row,key) in list"
              :key="key"
              
            >
              <td>{{ getRow(key) }}</td>
              <td>
                <img
                  v-bind:src="$siteUrl+'/files/thumbnails/'+row.get_product_warranty.get_product.image_url"
                  class="product_pic stockroom_product"
                />
              </td>
              <td>
                <span>{{ row.get_product_warranty.get_product.title }}</span>
              </td>
              <td>{{ row.get_product_warranty.get_warranty.name }}</td>
              <td style="width:150px">
                <span
                  v-if="row.get_product_warranty.get_color.id>0"
                  :style="[{ background:'#'+row.get_product_warranty.get_color.code }]"
                  class="color_td"
                >
                  <span style="color:white">{{ row.get_product_warranty.get_color.name}}</span>
                </span>
              </td>
              <td>
                <span>{{ replaceNumber(row.product_count) }}</span>
                <div
                  style="color:red"
                  v-if="row.real_count!=null && row.real_count!=row.product_count"
                >
                  <span>تعداد دریافت شده توسط انباردار</span> :
                  <span>{{ replaceNumber(row.real_count) }}</span>
                </div>
              </td>
            </tr>
            <tr v-if="list.length==0">
              <td colspan="6">رکوردی یافت نشد</td>
            </tr>
          </tbody>
        </table>

        <div v-if="n==getPageCount">
          <div class="factor_tozihat">
            <span>کالا های فوق توسط</span>
            <span style="padding-right:2px">فروشگاه {{ packageData.get_seller.brand_name }}</span>
            <span style="padding-right:2px">به {{ packageData.get_stockroom.name}} ارسال شد</span>
          </div>

          <div class="factor_footer">
            <span>مهر و امضای تحویل گیرنده</span>

            <span>مهر و امضای تحویل دهنده</span>
          </div>
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
      list: [],
      count: 8,
      packageData: null,
      showPrintButton: true
    };
  },
  mounted() {
    this.account_status = localStorage.getItem("account_status");
    document.body.style.backgroundColor = "#FFF";
    this.getList();
    const app = this;
    window.onafterprint = function() {
      app.showPrintButton = true;
    };
  },
  methods: {
    getList: function(page = 1) {
      this.page = page;
      this.showLoading = true;
      const url =
        this.$siteUrl +
        "/api/seller/getPackageContent/factor/" +
        this.$route.params.id;
      this.axios
        .get(url, this.setHeader())
        .then(response => {
          this.showLoading = false;
          const result = this.setAccountStatus(response.data);
          if (result) {
            if (response.data != "error") {
              this.list = response.data.package_product;
              this.packageData = response.data.package;
            } else {
              this.show_server_error();
            }
          }
        })
        .catch(error => {
          this.setCatch(error);
        });
    },
    print: function() {
      this.showPrintButton = false;
      this.$nextTick(function() {
        window.print();
      });
    }
  },
  computed: {
    getPageCount() {
      return Math.ceil(this.list.length / this.count);
    }
  }
};
</script>
